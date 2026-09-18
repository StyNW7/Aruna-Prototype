import {
  LayoutGrid,
  Landmark,
  ShoppingCart,
  Warehouse,
  Factory,
  Handshake,
  Users,
  CheckSquare,
  Wrench,
  ShieldCheck,
  Network,
  type LucideIcon,
} from "lucide-react";
import type { ErpTeam } from "./types";

export interface TeamMeta {
  label: string;
  icon: LucideIcon;
  /** kelas warna Tailwind: chip lembut, teks, dan solid */
  soft: string;
  text: string;
  solid: string;
  hex: string;
  description: string;
}

export const TEAM_META: Record<ErpTeam, TeamMeta> = {
  Finance: { label: "Finance", icon: Landmark, soft: "bg-emerald-50 text-emerald-700 ring-emerald-100", text: "text-emerald-600", solid: "bg-emerald-600", hex: "#059669", description: "Piutang, hutang, jurnal, kas, dan anggaran." },
  Procurement: { label: "Procurement", icon: ShoppingCart, soft: "bg-amber-50 text-amber-700 ring-amber-100", text: "text-amber-600", solid: "bg-amber-500", hex: "#d97706", description: "Purchase order, supplier, dan approval pembelian." },
  Warehouse: { label: "Warehouse", icon: Warehouse, soft: "bg-violet-50 text-violet-700 ring-violet-100", text: "text-violet-600", solid: "bg-violet-600", hex: "#7c3aed", description: "Stok bahan baku, kemasan, finished goods, dan mutasi." },
  Operations: { label: "Operations", icon: Factory, soft: "bg-sky-50 text-sky-700 ring-sky-100", text: "text-sky-600", solid: "bg-sky-600", hex: "#0284c7", description: "Work order, lini produksi, dan shift." },
  Sales: { label: "Sales", icon: Handshake, soft: "bg-rose-50 text-rose-700 ring-rose-100", text: "text-rose-600", solid: "bg-rose-600", hex: "#e11d48", description: "Customer, sales order, dan pipeline ekspor/domestik." },
  HR: { label: "HR & People", icon: Users, soft: "bg-teal-50 text-teal-700 ring-teal-100", text: "text-teal-600", solid: "bg-teal-600", hex: "#0d9488", description: "Karyawan, kehadiran, cuti, dan roster shift." },
  Quality: { label: "Quality", icon: ShieldCheck, soft: "bg-lime-50 text-lime-700 ring-lime-100", text: "text-lime-600", solid: "bg-lime-600", hex: "#65a30d", description: "QC inspeksi dan kepatuhan mutu." },
  Engineering: { label: "Engineering", icon: Wrench, soft: "bg-orange-50 text-orange-700 ring-orange-100", text: "text-orange-600", solid: "bg-orange-600", hex: "#ea580c", description: "Maintenance mesin dan tiket perbaikan." },
};

export interface ErpNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  team?: ErpTeam;
  description: string;
}

export const ERP_NAV: ErpNavItem[] = [
  { label: "Beranda ERP", href: "/erp", icon: LayoutGrid, description: "Ringkasan lintas tim dan aktivitas terintegrasi" },
  { label: "Finance", href: "/erp/finance", icon: Landmark, team: "Finance", description: "Piutang, hutang, jurnal, dan anggaran" },
  { label: "Procurement", href: "/erp/procurement", icon: ShoppingCart, team: "Procurement", description: "Purchase order dan supplier" },
  { label: "Warehouse", href: "/erp/inventory", icon: Warehouse, team: "Warehouse", description: "Stok dan mutasi gudang" },
  { label: "Operations", href: "/erp/operations", icon: Factory, team: "Operations", description: "Work order dan maintenance" },
  { label: "Sales", href: "/erp/sales", icon: Handshake, team: "Sales", description: "Customer dan sales order" },
  { label: "HR & People", href: "/erp/hr", icon: Users, team: "HR", description: "Karyawan, kehadiran, dan cuti" },
  { label: "Approval Center", href: "/erp/approvals", icon: CheckSquare, description: "Semua persetujuan lintas tim" },
  { label: "Peta Integrasi", href: "/erp/integrations", icon: Network, description: "Alur data antar modul & FISH" },
];
