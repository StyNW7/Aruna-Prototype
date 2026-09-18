import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type {
  Activity,
  Customer,
  Employee,
  ErpState,
  ErpTeam,
  Invoice,
  InventoryItem,
  JournalEntry,
  LeaveRequest,
  MaintenanceTicket,
  PurchaseOrder,
  PurchaseOrderLine,
  SalesOrder,
  SalesOrderLine,
  StockMovement,
  StockMovementType,
  WorkOrder,
} from "./types";
import { initialErpState, KURS_USD } from "./seed";
import { skus } from "@/data/skus";

const STORAGE_KEY = "aruna_erp_state_v1";

// ---------- util ----------
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
function nowIso(): string {
  return new Date().toISOString();
}
function addDays(dateIso: string, days: number): string {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function nextId(prefix: string, existing: { id: string }[]): string {
  const nums = existing
    .map((e) => e.id.match(/(\d+)$/)?.[1])
    .filter(Boolean)
    .map((n) => parseInt(n as string, 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}
function activity(team: ErpTeam, text: string, tone: Activity["tone"] = "info", ref?: string): Activity {
  return { id: `AC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time: nowIso(), team, text, ref, tone };
}
function journalEntry(state: ErpState, partial: Omit<JournalEntry, "id" | "date">): JournalEntry {
  return { id: nextId("JE-", state.journal), date: todayIso(), ...partial };
}
function movement(state: ErpState, partial: Omit<StockMovement, "id" | "date">): StockMovement {
  return { id: nextId("MV-", state.movements), date: nowIso(), ...partial };
}
function applyStock(items: InventoryItem[], itemId: string, delta: number): InventoryItem[] {
  return items.map((it) => (it.id === itemId ? { ...it, stock: Math.max(0, it.stock + delta) } : it));
}
export function fmtRp(n: number): string {
  return `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n)}`;
}
export function fmtRpShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(2).replace(".", ",")} M`;
  if (abs >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  return fmtRp(n);
}
export function fmtUsd(n: number): string {
  return `US$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)}`;
}
export function effectiveInvoiceStatus(inv: Invoice): Invoice["status"] {
  if (inv.status === "Lunas") return "Lunas";
  const today = todayIso();
  if (inv.dueDate < today) return "Terlambat";
  if (inv.dueDate === today) return "Jatuh Tempo";
  return "Belum Jatuh Tempo";
}

// ---------- actions ----------
type Action =
  | { type: "RESET" }
  | { type: "CREATE_PO"; payload: { supplierId: string; lines: PurchaseOrderLine[]; requestedBy: string; expectedDate: string; note?: string } }
  | { type: "SET_PO_STATUS"; id: string; status: "Disetujui" | "Ditolak" | "Menunggu Approval" }
  | { type: "RECEIVE_PO"; id: string; by: string }
  | { type: "ADJUST_STOCK"; itemId: string; qty: number; kind: StockMovementType; by: string; note?: string }
  | { type: "CREATE_WO"; payload: Omit<WorkOrder, "id" | "status"> }
  | { type: "START_WO"; id: string }
  | { type: "COMPLETE_WO"; id: string; actualKg: number }
  | { type: "SET_WO_STATUS"; id: string; status: "Tertunda" | "Terjadwal" }
  | { type: "CREATE_SO"; payload: { customerId: string; lines: SalesOrderLine[]; salesRepId: string; dueDate: string } }
  | { type: "SET_SO_STATUS"; id: string; status: "Dikonfirmasi" | "Dibatalkan" }
  | { type: "SHIP_SO"; id: string; by: string }
  | { type: "INVOICE_SO"; id: string }
  | { type: "PAY_INVOICE"; id: string }
  | { type: "SUBMIT_LEAVE"; payload: Omit<LeaveRequest, "id" | "status"> }
  | { type: "SET_LEAVE_STATUS"; id: string; status: "Disetujui" | "Ditolak" }
  | { type: "SET_ATTENDANCE"; employeeId: string; status: Employee["status"] }
  | { type: "CREATE_TICKET"; payload: Omit<MaintenanceTicket, "id" | "status" | "date"> }
  | { type: "SET_TICKET_STATUS"; id: string; status: MaintenanceTicket["status"] }
  | { type: "ADD_CUSTOMER"; payload: Omit<Customer, "id"> };

function reducer(state: ErpState, action: Action): ErpState {
  switch (action.type) {
    case "RESET":
      return initialErpState;

    case "CREATE_PO": {
      const total = action.payload.lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);
      const po: PurchaseOrder = {
        id: nextId("PO-2409-", state.purchaseOrders),
        supplierId: action.payload.supplierId,
        lines: action.payload.lines,
        total,
        status: "Menunggu Approval",
        requestedBy: action.payload.requestedBy,
        date: todayIso(),
        expectedDate: action.payload.expectedDate,
        note: action.payload.note,
      };
      const sup = state.suppliers.find((s) => s.id === po.supplierId)?.name ?? po.supplierId;
      return {
        ...state,
        purchaseOrders: [po, ...state.purchaseOrders],
        activities: [activity("Procurement", `${po.id} ke ${sup} (${fmtRpShort(total)}) diajukan, menunggu approval Finance.`, "info", po.id), ...state.activities],
      };
    }

    case "SET_PO_STATUS": {
      const po = state.purchaseOrders.find((p) => p.id === action.id);
      if (!po) return state;
      const tone = action.status === "Disetujui" ? "success" : action.status === "Ditolak" ? "error" : "info";
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map((p) => (p.id === action.id ? { ...p, status: action.status } : p)),
        activities: [activity("Finance", `${po.id} ${action.status.toLowerCase()} oleh Finance.`, tone, po.id), ...state.activities],
      };
    }

    case "RECEIVE_PO": {
      const po = state.purchaseOrders.find((p) => p.id === action.id);
      if (!po || po.status !== "Disetujui") return state;
      let items = state.items;
      let movements = state.movements;
      let s = state;
      po.lines.forEach((l) => {
        items = applyStock(items, l.itemId, l.qty);
        const mv = movement({ ...s, movements }, { itemId: l.itemId, type: "Masuk", qty: l.qty, ref: po.id, by: action.by });
        movements = [mv, ...movements];
      });
      const sup = state.suppliers.find((x) => x.id === po.supplierId)?.name ?? po.supplierId;
      const inv: Invoice = {
        id: nextId("INV-AP-2409-", state.invoices.filter((i) => i.kind === "AP")),
        kind: "AP",
        counterparty: sup,
        refId: po.id,
        amount: po.total,
        issuedDate: todayIso(),
        dueDate: addDays(todayIso(), 14),
        status: "Belum Jatuh Tempo",
      };
      const firstItem = state.items.find((i) => i.id === po.lines[0]?.itemId);
      const debitAcc = firstItem?.category === "Kemasan" ? "Persediaan Kemasan" : firstItem?.category === "Consumable" ? "Persediaan Consumable" : "Persediaan Bahan Baku";
      s = { ...state, items, movements };
      return {
        ...s,
        purchaseOrders: state.purchaseOrders.map((p) => (p.id === action.id ? { ...p, status: "Diterima" } : p)),
        invoices: [inv, ...state.invoices],
        journal: [journalEntry(state, { description: `Penerimaan barang ${po.id}`, debit: debitAcc, credit: "Hutang Usaha", amount: po.total, ref: po.id, source: "Warehouse" }), ...state.journal],
        activities: [
          activity("Warehouse", `${po.id} diterima gudang — stok diperbarui, hutang ${inv.id} (${fmtRpShort(po.total)}) dibuat di Finance.`, "success", po.id),
          ...state.activities,
        ],
      };
    }

    case "ADJUST_STOCK": {
      const item = state.items.find((i) => i.id === action.itemId);
      if (!item) return state;
      const delta = action.kind === "Keluar" ? -Math.abs(action.qty) : action.kind === "Masuk" ? Math.abs(action.qty) : action.qty;
      const items = applyStock(state.items, action.itemId, delta);
      const updated = items.find((i) => i.id === action.itemId)!;
      const acts: Activity[] = [activity("Warehouse", `${action.kind} stok ${item.name}: ${delta > 0 ? "+" : ""}${delta} ${item.unit} (${action.note || "tanpa catatan"}).`, "info", item.id)];
      if (updated.stock < updated.minStock) acts.unshift(activity("Warehouse", `Stok ${item.name} di bawah minimum (${updated.stock}/${updated.minStock} ${item.unit}) — Procurement diberi tahu.`, "warning", item.id));
      return {
        ...state,
        items,
        movements: [movement(state, { itemId: action.itemId, type: action.kind, qty: delta, ref: "ADJ", by: action.by, note: action.note }), ...state.movements],
        activities: [...acts, ...state.activities],
      };
    }

    case "CREATE_WO": {
      const wo: WorkOrder = { id: nextId("WO-2409-", state.workOrders), status: "Terjadwal", ...action.payload };
      const sku = skus.find((s) => s.code === wo.skuCode)?.name ?? wo.skuCode;
      return {
        ...state,
        workOrders: [wo, ...state.workOrders],
        activities: [activity("Operations", `${wo.id} ${sku} (${wo.plannedKg} kg) dijadwalkan di ${wo.line}, ${wo.shift}.`, "info", wo.id), ...state.activities],
      };
    }

    case "START_WO": {
      const wo = state.workOrders.find((w) => w.id === action.id);
      if (!wo || wo.status === "Berjalan" || wo.status === "Selesai") return state;
      const loin = state.items.find((i) => i.id === "ITM-003");
      const cost = (loin?.unitCost ?? 0) * wo.rawMaterialKg;
      const sku = skus.find((s) => s.code === wo.skuCode)?.name ?? wo.skuCode;
      return {
        ...state,
        items: applyStock(state.items, "ITM-003", -wo.rawMaterialKg),
        movements: [movement(state, { itemId: "ITM-003", type: "Keluar", qty: -wo.rawMaterialKg, ref: wo.id, by: "Operations" }), ...state.movements],
        workOrders: state.workOrders.map((w) => (w.id === action.id ? { ...w, status: "Berjalan" } : w)),
        journal: [journalEntry(state, { description: `Konsumsi Fresh Loin ${wo.id}`, debit: "Barang Dalam Proses", credit: "Persediaan Bahan Baku", amount: cost, ref: wo.id, source: "Operations" }), ...state.journal],
        activities: [activity("Operations", `${wo.id} ${sku} dimulai — ${wo.rawMaterialKg} kg Fresh Loin dikonsumsi dari Chiller B.`, "info", wo.id), ...state.activities],
      };
    }

    case "COMPLETE_WO": {
      const wo = state.workOrders.find((w) => w.id === action.id);
      if (!wo || wo.status !== "Berjalan") return state;
      const fg = state.items.find((i) => i.skuCode === wo.skuCode);
      const sku = skus.find((s) => s.code === wo.skuCode)?.name ?? wo.skuCode;
      const items = fg ? applyStock(state.items, fg.id, action.actualKg) : state.items;
      const movements = fg ? [movement(state, { itemId: fg.id, type: "Masuk", qty: action.actualKg, ref: wo.id, by: "Operations" }), ...state.movements] : state.movements;
      const value = (fg?.unitCost ?? 100000) * action.actualKg;
      const yieldPct = ((action.actualKg / wo.plannedKg) * 100).toFixed(1).replace(".", ",");
      return {
        ...state,
        items,
        movements,
        workOrders: state.workOrders.map((w) => (w.id === action.id ? { ...w, status: "Selesai", actualKg: action.actualKg } : w)),
        journal: [journalEntry(state, { description: `Hasil produksi ${sku} ${wo.id}`, debit: "Persediaan Barang Jadi", credit: "Barang Dalam Proses", amount: value, ref: wo.id, source: "Operations" }), ...state.journal],
        activities: [activity("Operations", `${wo.id} selesai — ${action.actualKg} kg ${sku} masuk Cold Storage (${yieldPct}% dari plan).`, "success", wo.id), ...state.activities],
      };
    }

    case "SET_WO_STATUS": {
      const wo = state.workOrders.find((w) => w.id === action.id);
      if (!wo) return state;
      return {
        ...state,
        workOrders: state.workOrders.map((w) => (w.id === action.id ? { ...w, status: action.status } : w)),
        activities: [activity("Operations", `${wo.id} diubah menjadi ${action.status.toLowerCase()}.`, action.status === "Tertunda" ? "warning" : "info", wo.id), ...state.activities],
      };
    }

    case "CREATE_SO": {
      const totalUsd = action.payload.lines.reduce((a, l) => a + l.qtyKg * l.priceUsdPerKg, 0);
      const so: SalesOrder = { id: nextId("SO-2409-", state.salesOrders), status: "Quotation", date: todayIso(), totalUsd, ...action.payload };
      const cus = state.customers.find((c) => c.id === so.customerId)?.name ?? so.customerId;
      return {
        ...state,
        salesOrders: [so, ...state.salesOrders],
        activities: [activity("Sales", `Quotation ${so.id} untuk ${cus} (${fmtUsd(totalUsd)}) dibuat.`, "info", so.id), ...state.activities],
      };
    }

    case "SET_SO_STATUS": {
      const so = state.salesOrders.find((s) => s.id === action.id);
      if (!so) return state;
      const cus = state.customers.find((c) => c.id === so.customerId)?.name ?? so.customerId;
      return {
        ...state,
        salesOrders: state.salesOrders.map((s) => (s.id === action.id ? { ...s, status: action.status } : s)),
        activities: [activity("Sales", `${so.id} ${cus} ${action.status === "Dikonfirmasi" ? "dikonfirmasi — Warehouse menyiapkan stok FG." : "dibatalkan."}`, action.status === "Dikonfirmasi" ? "success" : "warning", so.id), ...state.activities],
      };
    }

    case "SHIP_SO": {
      const so = state.salesOrders.find((s) => s.id === action.id);
      if (!so || so.status !== "Dikonfirmasi") return state;
      let items = state.items;
      let movements = state.movements;
      let cogs = 0;
      so.lines.forEach((l) => {
        const fg = state.items.find((i) => i.skuCode === l.skuCode);
        if (!fg) return;
        items = applyStock(items, fg.id, -l.qtyKg);
        movements = [movement({ ...state, movements }, { itemId: fg.id, type: "Keluar", qty: -l.qtyKg, ref: so.id, by: action.by }), ...movements];
        cogs += fg.unitCost * l.qtyKg;
      });
      const cus = state.customers.find((c) => c.id === so.customerId)?.name ?? so.customerId;
      const kg = so.lines.reduce((a, l) => a + l.qtyKg, 0);
      return {
        ...state,
        items,
        movements,
        salesOrders: state.salesOrders.map((s) => (s.id === action.id ? { ...s, status: "Dikirim" } : s)),
        journal: [journalEntry(state, { description: `Pengiriman ${so.id} (HPP)`, debit: "Harga Pokok Penjualan", credit: "Persediaan Barang Jadi", amount: cogs, ref: so.id, source: "Sales" }), ...state.journal],
        activities: [activity("Warehouse", `${so.id} ${cus} dikirim (${kg.toLocaleString("id-ID")} kg) — stok FG berkurang, siap ditagih Finance.`, "success", so.id), ...state.activities],
      };
    }

    case "INVOICE_SO": {
      const so = state.salesOrders.find((s) => s.id === action.id);
      if (!so || so.status !== "Dikirim") return state;
      const cus = state.customers.find((c) => c.id === so.customerId);
      const inv: Invoice = {
        id: nextId("INV-AR-2409-", state.invoices.filter((i) => i.kind === "AR")),
        kind: "AR",
        counterparty: cus?.name ?? so.customerId,
        refId: so.id,
        amount: so.totalUsd * KURS_USD,
        issuedDate: todayIso(),
        dueDate: addDays(todayIso(), cus?.paymentTermDays ?? 30),
        status: "Belum Jatuh Tempo",
      };
      return {
        ...state,
        salesOrders: state.salesOrders.map((s) => (s.id === action.id ? { ...s, status: "Ditagih" } : s)),
        invoices: [inv, ...state.invoices],
        journal: [journalEntry(state, { description: `Penjualan ${so.id} ${inv.counterparty}`, debit: "Piutang Usaha", credit: "Pendapatan Penjualan", amount: inv.amount, ref: so.id, source: "Finance" }), ...state.journal],
        activities: [activity("Finance", `Invoice ${inv.id} (${fmtRpShort(inv.amount)}) diterbitkan untuk ${inv.counterparty}, jatuh tempo ${inv.dueDate}.`, "info", inv.id), ...state.activities],
      };
    }

    case "PAY_INVOICE": {
      const inv = state.invoices.find((i) => i.id === action.id);
      if (!inv || inv.status === "Lunas") return state;
      const isAr = inv.kind === "AR";
      return {
        ...state,
        cashRp: state.cashRp + (isAr ? inv.amount : -inv.amount),
        invoices: state.invoices.map((i) => (i.id === action.id ? { ...i, status: "Lunas", paidDate: todayIso() } : i)),
        salesOrders: isAr ? state.salesOrders.map((s) => (s.id === inv.refId ? { ...s, status: "Lunas" } : s)) : state.salesOrders,
        journal: [
          journalEntry(state, {
            description: isAr ? `Pelunasan piutang ${inv.counterparty}` : `Pembayaran hutang ${inv.counterparty}`,
            debit: isAr ? "Kas & Bank" : "Hutang Usaha",
            credit: isAr ? "Piutang Usaha" : "Kas & Bank",
            amount: inv.amount,
            ref: inv.id,
            source: "Finance",
          }),
          ...state.journal,
        ],
        activities: [activity("Finance", `${inv.id} ${isAr ? "diterima pembayarannya dari" : "dibayarkan ke"} ${inv.counterparty} (${fmtRpShort(inv.amount)}).`, "success", inv.id), ...state.activities],
      };
    }

    case "SUBMIT_LEAVE": {
      const lv: LeaveRequest = { id: nextId("LV-", state.leaves), status: "Menunggu", ...action.payload };
      const emp = state.employees.find((e) => e.id === lv.employeeId)?.name ?? lv.employeeId;
      return {
        ...state,
        leaves: [lv, ...state.leaves],
        activities: [activity("HR", `${emp} mengajukan ${lv.type.toLowerCase()} ${lv.days} hari (${lv.from} s.d. ${lv.to}).`, "info", lv.id), ...state.activities],
      };
    }

    case "SET_LEAVE_STATUS": {
      const lv = state.leaves.find((l) => l.id === action.id);
      if (!lv) return state;
      const emp = state.employees.find((e) => e.id === lv.employeeId);
      const today = todayIso();
      const onLeaveNow = action.status === "Disetujui" && lv.from <= today && today <= lv.to;
      return {
        ...state,
        leaves: state.leaves.map((l) => (l.id === action.id ? { ...l, status: action.status } : l)),
        employees: onLeaveNow ? state.employees.map((e) => (e.id === lv.employeeId ? { ...e, status: lv.type === "Sakit" ? "Sakit" : lv.type === "Izin" ? "Izin" : "Cuti" } : e)) : state.employees,
        activities: [activity("HR", `Pengajuan ${lv.type.toLowerCase()} ${emp?.name ?? lv.employeeId} ${action.status.toLowerCase()}.`, action.status === "Disetujui" ? "success" : "error", lv.id), ...state.activities],
      };
    }

    case "SET_ATTENDANCE": {
      const emp = state.employees.find((e) => e.id === action.employeeId);
      if (!emp) return state;
      return {
        ...state,
        employees: state.employees.map((e) => (e.id === action.employeeId ? { ...e, status: action.status } : e)),
        activities: [activity("HR", `${emp.name} (${emp.team}) tercatat ${action.status.toLowerCase()}.`, "info", emp.id), ...state.activities],
      };
    }

    case "CREATE_TICKET": {
      const t: MaintenanceTicket = { id: nextId("MT-", state.tickets), status: "Terbuka", date: todayIso(), ...action.payload };
      return {
        ...state,
        tickets: [t, ...state.tickets],
        activities: [activity("Engineering", `Tiket ${t.id} ${t.machine} (${t.priority}) dibuka oleh ${t.reportedBy}.`, t.priority === "Tinggi" ? "error" : "warning", t.id), ...state.activities],
      };
    }

    case "SET_TICKET_STATUS": {
      const t = state.tickets.find((x) => x.id === action.id);
      if (!t) return state;
      return {
        ...state,
        tickets: state.tickets.map((x) => (x.id === action.id ? { ...x, status: action.status } : x)),
        activities: [activity("Engineering", `Tiket ${t.id} ${t.machine} → ${action.status.toLowerCase()}.`, action.status === "Selesai" ? "success" : "info", t.id), ...state.activities],
      };
    }

    case "ADD_CUSTOMER": {
      const c: Customer = { id: nextId("CUS-", state.customers), ...action.payload };
      return {
        ...state,
        customers: [c, ...state.customers],
        activities: [activity("Sales", `Customer baru ${c.name} (${c.segment}, ${c.country}) ditambahkan.`, "info", c.id), ...state.activities],
      };
    }

    default:
      return state;
  }
}

// ---------- context ----------
interface ErpContextValue {
  state: ErpState;
  dispatch: (a: Action) => void;
  reset: () => void;
  // helper lookup
  employeeName: (id: string) => string;
  supplierName: (id: string) => string;
  customerName: (id: string) => string;
  itemName: (id: string) => string;
  skuName: (code: string) => string;
  // derived
  derived: {
    arOutstanding: number;
    apOutstanding: number;
    overdueCount: number;
    lowStockItems: InventoryItem[];
    inventoryValue: number;
    pendingApprovals: number;
    openWorkOrders: number;
    presentToday: number;
    revenueMtdUsd: number;
    pipelineUsd: number;
  };
}

const ErpContext = createContext<ErpContextValue | undefined>(undefined);

function loadState(): ErpState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialErpState;
    const parsed = JSON.parse(raw) as Partial<ErpState>;
    // Validasi minimal — bila struktur tidak lengkap, kembali ke seed
    if (!parsed.employees || !parsed.items || !parsed.purchaseOrders) return initialErpState;
    return { ...initialErpState, ...parsed } as ErpState;
  } catch {
    return initialErpState;
  }
}

export function ErpProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage penuh / tidak tersedia — abaikan */
    }
  }, [state]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* abaikan */
    }
  }, []);

  const value = useMemo<ErpContextValue>(() => {
    const employeeName = (id: string) => state.employees.find((e) => e.id === id)?.name ?? id;
    const supplierName = (id: string) => state.suppliers.find((s) => s.id === id)?.name ?? id;
    const customerName = (id: string) => state.customers.find((c) => c.id === id)?.name ?? id;
    const itemName = (id: string) => state.items.find((i) => i.id === id)?.name ?? id;
    const skuName = (code: string) => skus.find((s) => s.code === code)?.name ?? code;

    const arOutstanding = state.invoices.filter((i) => i.kind === "AR" && i.status !== "Lunas").reduce((a, i) => a + i.amount, 0);
    const apOutstanding = state.invoices.filter((i) => i.kind === "AP" && i.status !== "Lunas").reduce((a, i) => a + i.amount, 0);
    const overdueCount = state.invoices.filter((i) => effectiveInvoiceStatus(i) === "Terlambat").length;
    const lowStockItems = state.items.filter((i) => i.stock < i.minStock);
    const inventoryValue = state.items.reduce((a, i) => a + i.stock * i.unitCost, 0);
    const pendingApprovals =
      state.purchaseOrders.filter((p) => p.status === "Menunggu Approval").length +
      state.leaves.filter((l) => l.status === "Menunggu").length +
      state.salesOrders.filter((s) => s.status === "Quotation").length;
    const openWorkOrders = state.workOrders.filter((w) => w.status === "Berjalan" || w.status === "Terjadwal").length;
    const presentToday = state.employees.filter((e) => e.status === "Hadir").length;
    const revenueMtdUsd = state.salesOrders.filter((s) => ["Dikirim", "Ditagih", "Lunas"].includes(s.status)).reduce((a, s) => a + s.totalUsd, 0);
    const pipelineUsd = state.salesOrders.filter((s) => ["Quotation", "Dikonfirmasi"].includes(s.status)).reduce((a, s) => a + s.totalUsd, 0);

    return {
      state,
      dispatch,
      reset,
      employeeName,
      supplierName,
      customerName,
      itemName,
      skuName,
      derived: { arOutstanding, apOutstanding, overdueCount, lowStockItems, inventoryValue, pendingApprovals, openWorkOrders, presentToday, revenueMtdUsd, pipelineUsd },
    };
  }, [state, reset]);

  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>;
}

export function useErp() {
  const ctx = useContext(ErpContext);
  if (!ctx) throw new Error("useErp must be used within ErpProvider");
  return ctx;
}
