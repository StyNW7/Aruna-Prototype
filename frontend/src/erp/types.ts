// Tipe data Aruna ERP (Extended Dashboard) — seluruh entitas saling terhubung lintas tim.

export type ErpTeam =
  | "Finance"
  | "Procurement"
  | "Warehouse"
  | "Operations"
  | "Sales"
  | "HR"
  | "Quality"
  | "Engineering";

export interface Employee {
  id: string;
  name: string;
  team: ErpTeam;
  position: string;
  email: string;
  shift: "Shift 1" | "Shift 2" | "Shift 3" | "Office";
  status: "Hadir" | "Cuti" | "Sakit" | "Izin" | "Belum Absen";
  joinDate: string;
  initials: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: "Bahan Baku" | "Kemasan" | "Energi & Utilitas" | "Consumable" | "Jasa";
  contact: string;
  leadTimeDays: number;
  rating: number; // 1-5
  city: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Bahan Baku" | "Kemasan" | "Finished Goods" | "Consumable";
  unit: "kg" | "pcs" | "roll" | "liter" | "karton";
  stock: number;
  minStock: number;
  maxStock: number;
  location: string;
  unitCost: number; // Rp per unit
  skuCode?: string; // untuk Finished Goods, relasi ke SKU FISH
}

export interface PurchaseOrderLine {
  itemId: string;
  qty: number;
  unitPrice: number;
}

export type PurchaseOrderStatus = "Draft" | "Menunggu Approval" | "Disetujui" | "Diterima" | "Ditolak";

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  lines: PurchaseOrderLine[];
  total: number;
  status: PurchaseOrderStatus;
  requestedBy: string; // employeeId
  date: string;
  expectedDate: string;
  note?: string;
}

export type StockMovementType = "Masuk" | "Keluar" | "Penyesuaian" | "Transfer";

export interface StockMovement {
  id: string;
  itemId: string;
  type: StockMovementType;
  qty: number; // positif = tambah, negatif = kurang
  date: string;
  ref: string; // PO-xxx / WO-xxx / SO-xxx / ADJ
  by: string; // nama
  note?: string;
}

export type WorkOrderStatus = "Terjadwal" | "Berjalan" | "Selesai" | "Tertunda";

export interface WorkOrder {
  id: string;
  skuCode: string;
  plannedKg: number;
  actualKg?: number;
  rawMaterialKg: number; // kebutuhan loin
  status: WorkOrderStatus;
  shift: "Shift 1" | "Shift 2" | "Shift 3";
  line: string;
  supervisorId: string;
  date: string;
  linkedPlanId?: string; // relasi ke Production Plan di FISH
}

export interface Customer {
  id: string;
  name: string;
  country: string;
  segment: "Ekspor" | "Domestik";
  creditLimitUsd: number;
  contact: string;
  paymentTermDays: number;
}

export interface SalesOrderLine {
  skuCode: string;
  qtyKg: number;
  priceUsdPerKg: number;
}

export type SalesOrderStatus = "Quotation" | "Dikonfirmasi" | "Dikirim" | "Ditagih" | "Lunas" | "Dibatalkan";

export interface SalesOrder {
  id: string;
  customerId: string;
  lines: SalesOrderLine[];
  totalUsd: number;
  status: SalesOrderStatus;
  date: string;
  dueDate: string;
  salesRepId: string;
  linkedShipmentId?: string;
}

export type InvoiceStatus = "Belum Jatuh Tempo" | "Jatuh Tempo" | "Terlambat" | "Lunas";

export interface Invoice {
  id: string;
  kind: "AR" | "AP"; // AR = piutang (customer), AP = hutang (supplier)
  counterparty: string;
  refId: string; // SO-xxx / PO-xxx
  amount: number; // dalam Rupiah
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paidDate?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debit: string; // nama akun
  credit: string;
  amount: number;
  ref: string;
  source: ErpTeam;
}

export interface Budget {
  department: ErpTeam;
  budget: number;
  actual: number;
}

export type LeaveStatus = "Menunggu" | "Disetujui" | "Ditolak";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "Cuti Tahunan" | "Sakit" | "Izin" | "Cuti Khusus";
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
}

export interface MaintenanceTicket {
  id: string;
  machine: string;
  issue: string;
  priority: "Rendah" | "Sedang" | "Tinggi";
  status: "Terbuka" | "Dikerjakan" | "Selesai";
  reportedBy: string;
  date: string;
}

export interface Activity {
  id: string;
  time: string; // ISO
  team: ErpTeam;
  text: string;
  ref?: string;
  tone: "info" | "success" | "warning" | "error";
}

export interface ErpState {
  employees: Employee[];
  suppliers: Supplier[];
  items: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  movements: StockMovement[];
  workOrders: WorkOrder[];
  customers: Customer[];
  salesOrders: SalesOrder[];
  invoices: Invoice[];
  journal: JournalEntry[];
  budgets: Budget[];
  leaves: LeaveRequest[];
  tickets: MaintenanceTicket[];
  activities: Activity[];
  cashRp: number;
}
