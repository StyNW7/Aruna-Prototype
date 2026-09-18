import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Play, Waves, Database, RefreshCw, CheckCircle2, Link2, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useErp } from "../ErpContext";
import { TEAM_META } from "../config";
import { ErpPageHeader, SectionCard, TeamChip, ActivityFeed } from "../components/shared";
import type { ErpTeam } from "../types";
import { cn } from "@/lib/utils";

interface FlowStep {
  from: ErpTeam;
  to: ErpTeam;
  trigger: string;
  effect: string;
}

const FLOWS: FlowStep[] = [
  { from: "Procurement", to: "Finance", trigger: "PO diajukan", effect: "Masuk antrean approval Finance" },
  { from: "Finance", to: "Warehouse", trigger: "PO disetujui", effect: "Warehouse dapat menerima barang" },
  { from: "Warehouse", to: "Finance", trigger: "Barang diterima", effect: "Stok +, hutang (AP) & jurnal persediaan dibuat" },
  { from: "Operations", to: "Warehouse", trigger: "Work order dimulai", effect: "Fresh Loin dikonsumsi, jurnal WIP" },
  { from: "Operations", to: "Warehouse", trigger: "Work order selesai", effect: "Finished goods bertambah, jurnal barang jadi" },
  { from: "Sales", to: "Warehouse", trigger: "SO dikonfirmasi → dikirim", effect: "Validasi stok FG, stok keluar, jurnal HPP" },
  { from: "Sales", to: "Finance", trigger: "SO ditagih", effect: "Invoice piutang (AR) sesuai termin customer" },
  { from: "Finance", to: "Sales", trigger: "Pembayaran diterima", effect: "Kas bertambah, SO menjadi lunas" },
  { from: "HR", to: "Operations", trigger: "Cuti disetujui", effect: "Status kehadiran & roster shift diperbarui" },
  { from: "Operations", to: "Engineering", trigger: "Lapor kerusakan", effect: "Tiket maintenance dibuka & diprioritaskan" },
];

const FISH_LINKS = [
  { erp: "Work Order (Operations)", fish: "Production Plan", href: "/app/production", note: "WO merujuk PP-xxx; realisasi masuk Plan vs Actual" },
  { erp: "Sales Order (Sales)", fish: "Shipment Planner", href: "/app/shipment", note: "SO ekspor terhubung ke kontainer SH-xxx" },
  { erp: "Finished Goods (Warehouse)", fish: "Inventory", href: "/app/inventory", note: "Stok FG per SKU sama dengan cold storage FISH" },
  { erp: "Supplier & PO (Procurement)", fish: "Supply Intake", href: "/app/supply", note: "PO bahan baku menjadi batch supply saat diterima" },
  { erp: "Hutang PLN (Finance)", fish: "Factory Energy", href: "/app/energy", note: "Biaya energi aktual memvalidasi kWh per SKU" },
  { erp: "Harga SKU (Sales)", fish: "Pricing Advisor", href: "/app/pricing", note: "Quotation memakai harga rekomendasi FISH" },
];

export default function Integrations() {
  const { state, dispatch } = useErp();
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);

  const entities = [
    { label: "Karyawan", n: state.employees.length, team: "HR" as ErpTeam },
    { label: "Supplier", n: state.suppliers.length, team: "Procurement" as ErpTeam },
    { label: "Purchase Order", n: state.purchaseOrders.length, team: "Procurement" as ErpTeam },
    { label: "Item Stok", n: state.items.length, team: "Warehouse" as ErpTeam },
    { label: "Mutasi Stok", n: state.movements.length, team: "Warehouse" as ErpTeam },
    { label: "Work Order", n: state.workOrders.length, team: "Operations" as ErpTeam },
    { label: "Customer", n: state.customers.length, team: "Sales" as ErpTeam },
    { label: "Sales Order", n: state.salesOrders.length, team: "Sales" as ErpTeam },
    { label: "Invoice", n: state.invoices.length, team: "Finance" as ErpTeam },
    { label: "Jurnal", n: state.journal.length, team: "Finance" as ErpTeam },
  ];

  const DEMO_STEPS = 10;

  function runDemo() {
    if (running) return;
    setRunning(true);
    setStep(0);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const latestPo = () => stateRef.current.purchaseOrders[0];
    const latestWo = () => stateRef.current.workOrders[0];
    const latestSo = () => stateRef.current.salesOrders[0];

    (async () => {
      const s = async (n: number, text: string) => {
        setStep(n);
        toast(text, { icon: "🔄", duration: 1600 });
        await wait(900);
      };
      await s(1, "Procurement mengajukan PO bahan baku 1.000 kg");
      dispatch({ type: "CREATE_PO", payload: { supplierId: "SUP-001", lines: [{ itemId: "ITM-001", qty: 1000, unitPrice: 42000 }], requestedBy: "EMP-003", expectedDate: new Date().toISOString().slice(0, 10), note: "Simulasi alur end-to-end" } });
      await s(2, "Finance menyetujui PO");
      dispatch({ type: "SET_PO_STATUS", id: latestPo().id, status: "Disetujui" });
      await s(3, "Warehouse menerima barang → stok naik, hutang & jurnal dibuat");
      dispatch({ type: "RECEIVE_PO", id: latestPo().id, by: "Sari Dewi" });
      await s(4, "Operations menjadwalkan work order SAKU 16 OZ 500 kg");
      dispatch({ type: "CREATE_WO", payload: { skuCode: "SAKU-16OZ", plannedKg: 500, rawMaterialKg: 806, shift: "Shift 1", line: "Bandsaw Line 1", supervisorId: "EMP-005", date: new Date().toISOString().slice(0, 10) } });
      await s(5, "WO dimulai → Fresh Loin dikonsumsi");
      dispatch({ type: "START_WO", id: latestWo().id });
      await s(6, "WO selesai 488 kg → finished goods bertambah");
      dispatch({ type: "COMPLETE_WO", id: latestWo().id, actualKg: 488 });
      await s(7, "Sales membuat quotation Bluewave Foods 400 kg SAKU");
      dispatch({ type: "CREATE_SO", payload: { customerId: "CUS-002", lines: [{ skuCode: "SAKU-16OZ", qtyKg: 400, priceUsdPerKg: 14.88 }], salesRepId: "EMP-006", dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) } });
      await s(8, "SO dikonfirmasi & dikirim → stok FG keluar, HPP dijurnal");
      dispatch({ type: "SET_SO_STATUS", id: latestSo().id, status: "Dikonfirmasi" });
      await wait(300);
      dispatch({ type: "SHIP_SO", id: latestSo().id, by: "Sari Dewi" });
      await s(9, "Finance menerbitkan invoice piutang");
      dispatch({ type: "INVOICE_SO", id: latestSo().id });
      await s(10, "Pembayaran diterima → kas bertambah, SO lunas");
      const inv = stateRef.current.invoices.find((i) => i.refId === latestSo().id);
      if (inv) dispatch({ type: "PAY_INVOICE", id: inv.id });
      await wait(600);
      toast.success("Simulasi selesai — cek Aktivitas, Finance, Warehouse, dan Sales.", { duration: 5000 });
      setRunning(false);
    })();
  }

  return (
    <div>
      <ErpPageHeader
        title="Peta Integrasi Data"
        subtitle="Bagaimana satu transaksi mengalir antar tim, dan bagaimana ERP terhubung dengan modul FISH Operations."
        actions={
          <Button onClick={runDemo} disabled={running}>
            {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? `Menjalankan ${step}/${DEMO_STEPS}` : "Jalankan Simulasi End-to-End"}
          </Button>
        }
      />

      {running && (
        <div className="mb-6 rounded-xl border border-aruna-border bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-aruna-textSecondary">
            <span>Simulasi PO → Gudang → Produksi → Penjualan → Kas</span>
            <span className="font-semibold text-aruna-text">{Math.round((step / DEMO_STEPS) * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-aruna-light1">
            <div className="h-full rounded-full aruna-gradient transition-all duration-500" style={{ width: `${(step / DEMO_STEPS) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Team ring */}
      <Card className="relative mb-6 overflow-hidden bg-slate-900 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute inset-0 line-grid-light opacity-40" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80">
              <Database className="h-3 w-3 text-aruna-medium" /> Single source of truth
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold">Delapan tim, satu basis data.</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Setiap entitas memiliki ID yang dirujuk lintas modul (PO ↔ invoice ↔ jurnal, WO ↔ stok ↔ plan FISH). Tidak ada input ganda; tidak ada data yang tertinggal.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {entities.map((e) => (
                <span key={e.label} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px]">
                  <strong className="font-semibold">{e.n}</strong> {e.label}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(TEAM_META) as ErpTeam[]).map((t) => {
              const m = TEAM_META[t];
              return (
                <div key={t} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white", m.solid)}>
                    <m.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Alur Peristiwa Lintas Tim" description="Pemicu di satu modul dan efeknya di modul lain" className="xl:col-span-2" icon={<Link2 className="mt-0.5 h-4 w-4 text-aruna-primary" />}>
          <div className="divide-y divide-aruna-border">
            {FLOWS.map((f, i) => (
              <div key={i} className="grid grid-cols-1 items-center gap-3 px-5 py-3.5 sm:grid-cols-[150px_24px_150px_1fr]">
                <TeamChip team={f.from} className="w-fit" />
                <ArrowRight className="hidden h-4 w-4 text-aruna-textSecondary sm:block" />
                <TeamChip team={f.to} className="w-fit" />
                <div>
                  <p className="text-sm font-medium text-aruna-text">{f.trigger}</p>
                  <p className="text-xs text-aruna-textSecondary">{f.effect}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Aktivitas Terbaru" description="Bukti alur berjalan" icon={<CheckCircle2 className="mt-0.5 h-4 w-4 text-aruna-success" />}>
          <ActivityFeed activities={state.activities} limit={8} compact />
        </SectionCard>
      </div>

      <SectionCard
        title="Koneksi ke FISH Operations"
        description="Modul ERP yang berbagi data dengan Smart Operations Dashboard"
        className="mt-6"
        icon={<Waves className="mt-0.5 h-4 w-4 text-aruna-primary" />}
        action={<Badge variant="success">Tersinkron</Badge>}
      >
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {FISH_LINKS.map((l) => (
            <Link key={l.erp} to={l.href} className="group rounded-xl border border-aruna-border bg-aruna-bg p-4 transition-all hover:-translate-y-0.5 hover:border-aruna-medium hover:bg-white hover:shadow-soft">
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 font-semibold text-white"><Boxes className="h-3 w-3" /> ERP</span>
                <ArrowRight className="h-3.5 w-3.5 text-aruna-textSecondary" />
                <span className="inline-flex items-center gap-1 rounded-full aruna-gradient px-2 py-0.5 font-semibold text-white"><Waves className="h-3 w-3" /> FISH</span>
              </div>
              <p className="mt-2.5 text-sm font-semibold text-aruna-text">{l.erp}</p>
              <p className="text-xs font-medium text-aruna-primary">↔ {l.fish}</p>
              <p className="mt-1.5 text-xs text-aruna-textSecondary">{l.note}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
