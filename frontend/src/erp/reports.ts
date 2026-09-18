import type { ErpState, ErpTeam } from "./types";
import type { ExportDoc } from "./export";
import { fmtNum, fmtRpFull } from "./export";
import { effectiveInvoiceStatus, fmtRpShort, fmtUsd } from "./ErpContext";
import { KURS_USD } from "./seed";
import { skus } from "@/data/skus";

export interface ErpReportDefinition {
  key: string;
  name: string;
  description: string;
  team: ErpTeam | "Semua";
  category: "Keuangan" | "Operasional" | "Komersial" | "SDM";
  hasChart: boolean;
}

export const ERP_REPORTS: ErpReportDefinition[] = [
  { key: "finance-summary", name: "Ringkasan Keuangan", description: "Posisi kas, piutang, hutang, arus kas 6 bulan, dan invoice terbuka.", team: "Finance", category: "Keuangan", hasChart: true },
  { key: "aging", name: "Aging Piutang & Hutang", description: "Distribusi keterlambatan AR/AP per bucket hari beserta rincian invoice.", team: "Finance", category: "Keuangan", hasChart: true },
  { key: "journal", name: "Jurnal Umum", description: "Seluruh entri jurnal double-entry beserta sumber tim dan referensi transaksi.", team: "Finance", category: "Keuangan", hasChart: false },
  { key: "budget", name: "Anggaran vs Realisasi", description: "Realisasi anggaran per departemen dengan persentase penyerapan.", team: "Finance", category: "Keuangan", hasChart: true },
  { key: "inventory", name: "Persediaan & Valuasi", description: "Level stok, batas min/max, status, dan nilai persediaan per kategori.", team: "Warehouse", category: "Operasional", hasChart: true },
  { key: "movements", name: "Mutasi Stok", description: "Riwayat pergerakan stok dengan referensi PO/WO/SO dan penanggung jawab.", team: "Warehouse", category: "Operasional", hasChart: false },
  { key: "procurement", name: "Purchase Order & Supplier", description: "Daftar PO per status, nilai belanja per supplier, dan performa lead time.", team: "Procurement", category: "Operasional", hasChart: true },
  { key: "production", name: "Work Order & Yield", description: "Realisasi produksi per work order, yield terhadap plan, dan tiket maintenance.", team: "Operations", category: "Operasional", hasChart: true },
  { key: "sales", name: "Sales & Pipeline", description: "Sales order per tahap pipeline, nilai per customer, dan eksposur kredit.", team: "Sales", category: "Komersial", hasChart: true },
  { key: "hr", name: "Kehadiran & Cuti", description: "Kehadiran hari ini per tim, roster shift, dan pengajuan cuti.", team: "HR", category: "SDM", hasChart: true },
  { key: "activity", name: "Log Aktivitas Terintegrasi", description: "Jejak audit seluruh peristiwa lintas tim, terbaru di atas.", team: "Semua", category: "Operasional", hasChart: false },
];

const CASHFLOW = [
  { bulan: "Apr", masuk: 2.41, keluar: 1.98 },
  { bulan: "Mei", masuk: 2.63, keluar: 2.12 },
  { bulan: "Jun", masuk: 2.35, keluar: 2.04 },
  { bulan: "Jul", masuk: 2.88, keluar: 2.31 },
  { bulan: "Agu", masuk: 3.02, keluar: 2.44 },
  { bulan: "Sep", masuk: 3.19, keluar: 2.5 },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}
function daysDiff(a: string, b: string) {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
}
const skuName = (c: string) => skus.find((s) => s.code === c)?.name ?? c;

export function buildErpReport(key: string, state: ErpState, period: string): ExportDoc {
  const def = ERP_REPORTS.find((r) => r.key === key);
  const name = def?.name ?? key;
  const emp = (id: string) => state.employees.find((e) => e.id === id)?.name ?? id;
  const sup = (id: string) => state.suppliers.find((s) => s.id === id)?.name ?? id;
  const cus = (id: string) => state.customers.find((c) => c.id === id)?.name ?? id;
  const item = (id: string) => state.items.find((i) => i.id === id)?.name ?? id;

  switch (key) {
    case "finance-summary": {
      const ar = state.invoices.filter((i) => i.kind === "AR" && i.status !== "Lunas");
      const ap = state.invoices.filter((i) => i.kind === "AP" && i.status !== "Lunas");
      const arSum = ar.reduce((a, i) => a + i.amount, 0);
      const apSum = ap.reduce((a, i) => a + i.amount, 0);
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Posisi kas & bank", value: fmtRpShort(state.cashRp) },
          { label: "Piutang outstanding", value: fmtRpShort(arSum) },
          { label: "Hutang outstanding", value: fmtRpShort(apSum) },
          { label: "Invoice terlambat", value: String(state.invoices.filter((i) => effectiveInvoiceStatus(i) === "Terlambat").length) },
        ],
        charts: [
          { title: "Arus kas bersih per bulan", unit: "Rp miliar", data: CASHFLOW.map((c) => ({ label: c.bulan, value: +(c.masuk - c.keluar).toFixed(2) })) },
        ],
        tables: [
          {
            title: "Arus kas 6 bulan (Rp miliar)",
            columns: [{ key: "b", label: "Bulan" }, { key: "m", label: "Pemasukan", numeric: true }, { key: "k", label: "Pengeluaran", numeric: true }, { key: "n", label: "Bersih", numeric: true }],
            rows: CASHFLOW.map((c) => [c.bulan, c.masuk, c.keluar, +(c.masuk - c.keluar).toFixed(2)]),
          },
          {
            title: "Invoice terbuka",
            columns: [{ key: "id", label: "Invoice" }, { key: "k", label: "Jenis" }, { key: "c", label: "Pihak" }, { key: "r", label: "Referensi" }, { key: "a", label: "Nilai (Rp)", numeric: true }, { key: "d", label: "Jatuh tempo" }, { key: "s", label: "Status" }],
            rows: [...ar, ...ap].map((i) => [i.id, i.kind === "AR" ? "Piutang" : "Hutang", i.counterparty, i.refId, i.amount, i.dueDate, effectiveInvoiceStatus(i)]),
          },
        ],
        notes: ["Arus kas bulanan bersifat ilustratif; invoice dan kas mencerminkan state ERP saat ini."],
      };
    }

    case "aging": {
      const buckets = ["Belum jatuh tempo", "1–30 hari", "31–60 hari", "> 60 hari"];
      const bucketOf = (due: string) => {
        const d = daysDiff(today(), due);
        return d <= 0 ? 0 : d <= 30 ? 1 : d <= 60 ? 2 : 3;
      };
      const agg = (kind: "AR" | "AP") => {
        const arr = [0, 0, 0, 0];
        state.invoices.filter((i) => i.kind === kind && i.status !== "Lunas").forEach((i) => (arr[bucketOf(i.dueDate)] += i.amount));
        return arr;
      };
      const arB = agg("AR");
      const apB = agg("AP");
      const open = state.invoices.filter((i) => i.status !== "Lunas");
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Piutang belum lunas", value: fmtRpShort(arB.reduce((a, b) => a + b, 0)) },
          { label: "Hutang belum lunas", value: fmtRpShort(apB.reduce((a, b) => a + b, 0)) },
          { label: "Invoice > 30 hari", value: String(open.filter((i) => bucketOf(i.dueDate) >= 2).length) },
          { label: "Total invoice terbuka", value: String(open.length) },
        ],
        charts: [
          { title: "Aging piutang (AR)", unit: "Rp", data: buckets.map((b, i) => ({ label: b, value: arB[i] })) },
          { title: "Aging hutang (AP)", unit: "Rp", data: buckets.map((b, i) => ({ label: b, value: apB[i] })) },
        ],
        tables: [
          {
            title: "Rincian invoice terbuka",
            columns: [{ key: "id", label: "Invoice" }, { key: "k", label: "Jenis" }, { key: "c", label: "Pihak" }, { key: "a", label: "Nilai (Rp)", numeric: true }, { key: "d", label: "Jatuh tempo" }, { key: "l", label: "Hari lewat", numeric: true }, { key: "b", label: "Bucket" }],
            rows: open.map((i) => [i.id, i.kind, i.counterparty, i.amount, i.dueDate, Math.max(0, daysDiff(today(), i.dueDate)), buckets[bucketOf(i.dueDate)]]),
          },
        ],
      };
    }

    case "journal": {
      const debit = state.journal.reduce((a, j) => a + j.amount, 0);
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Jumlah entri", value: String(state.journal.length) },
          { label: "Total debit", value: fmtRpShort(debit) },
          { label: "Total kredit", value: fmtRpShort(debit) },
          { label: "Selisih", value: "Rp0 (seimbang)" },
        ],
        tables: [
          {
            title: "Jurnal umum",
            columns: [{ key: "id", label: "No." }, { key: "d", label: "Tanggal" }, { key: "desc", label: "Deskripsi" }, { key: "db", label: "Debit" }, { key: "cr", label: "Kredit" }, { key: "a", label: "Nilai (Rp)", numeric: true }, { key: "ref", label: "Ref" }, { key: "s", label: "Sumber" }],
            rows: state.journal.map((j) => [j.id, j.date, j.description, j.debit, j.credit, j.amount, j.ref, j.source]),
          },
        ],
      };
    }

    case "budget": {
      const tot = state.budgets.reduce((a, b) => ({ b: a.b + b.budget, r: a.r + b.actual }), { b: 0, r: 0 });
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Total anggaran", value: fmtRpShort(tot.b) },
          { label: "Total realisasi", value: fmtRpShort(tot.r) },
          { label: "Penyerapan", value: `${Math.round((tot.r / tot.b) * 100)}%` },
          { label: "Departemen > 90%", value: String(state.budgets.filter((b) => b.actual / b.budget > 0.9).length) },
        ],
        charts: [{ title: "Penyerapan anggaran per departemen", unit: "%", data: state.budgets.map((b) => ({ label: b.department, value: Math.round((b.actual / b.budget) * 100) })) }],
        tables: [
          {
            title: "Anggaran vs realisasi",
            columns: [{ key: "d", label: "Departemen" }, { key: "b", label: "Anggaran (Rp)", numeric: true }, { key: "r", label: "Realisasi (Rp)", numeric: true }, { key: "s", label: "Sisa (Rp)", numeric: true }, { key: "p", label: "Penyerapan (%)", numeric: true }],
            rows: state.budgets.map((b) => [b.department, b.budget, b.actual, b.budget - b.actual, Math.round((b.actual / b.budget) * 100)]),
          },
        ],
      };
    }

    case "inventory": {
      const byCat = new Map<string, number>();
      state.items.forEach((i) => byCat.set(i.category, (byCat.get(i.category) ?? 0) + i.stock * i.unitCost));
      const value = state.items.reduce((a, i) => a + i.stock * i.unitCost, 0);
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Nilai persediaan", value: fmtRpShort(value) },
          { label: "Item aktif", value: String(state.items.length) },
          { label: "Item kritis (< min)", value: String(state.items.filter((i) => i.stock < i.minStock).length) },
          { label: "Finished goods", value: `${fmtNum(state.items.filter((i) => i.category === "Finished Goods").reduce((a, i) => a + i.stock, 0))} kg` },
        ],
        charts: [{ title: "Nilai persediaan per kategori", unit: "Rp", data: [...byCat.entries()].map(([label, value]) => ({ label, value })) }],
        tables: [
          {
            title: "Daftar stok",
            columns: [{ key: "id", label: "ID" }, { key: "n", label: "Item" }, { key: "c", label: "Kategori" }, { key: "l", label: "Lokasi" }, { key: "s", label: "Stok", numeric: true }, { key: "u", label: "Satuan" }, { key: "min", label: "Min", numeric: true }, { key: "max", label: "Max", numeric: true }, { key: "v", label: "Nilai (Rp)", numeric: true }, { key: "st", label: "Status" }],
            rows: state.items.map((i) => [i.id, i.name, i.category, i.location, i.stock, i.unit, i.minStock, i.maxStock, i.stock * i.unitCost, i.stock < i.minStock ? "Kritis" : i.stock < i.minStock * 1.25 ? "Rendah" : "Aman"]),
          },
        ],
      };
    }

    case "movements":
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Total mutasi", value: String(state.movements.length) },
          { label: "Masuk", value: String(state.movements.filter((m) => m.type === "Masuk").length) },
          { label: "Keluar", value: String(state.movements.filter((m) => m.type === "Keluar").length) },
          { label: "Penyesuaian / transfer", value: String(state.movements.filter((m) => m.type === "Penyesuaian" || m.type === "Transfer").length) },
        ],
        tables: [
          {
            title: "Riwayat mutasi stok",
            columns: [{ key: "id", label: "ID" }, { key: "t", label: "Waktu" }, { key: "i", label: "Item" }, { key: "k", label: "Jenis" }, { key: "q", label: "Qty", numeric: true }, { key: "r", label: "Referensi" }, { key: "b", label: "Oleh" }, { key: "n", label: "Catatan" }],
            rows: state.movements.map((m) => [m.id, m.date.replace("T", " ").slice(0, 16), item(m.itemId), m.type, m.qty, m.ref, m.by, m.note ?? ""]),
          },
        ],
      };

    case "procurement": {
      const spend = new Map<string, number>();
      state.purchaseOrders.filter((p) => p.status !== "Ditolak").forEach((p) => spend.set(sup(p.supplierId), (spend.get(sup(p.supplierId)) ?? 0) + p.total));
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Total PO", value: String(state.purchaseOrders.length) },
          { label: "Nilai PO (non-tolak)", value: fmtRpShort([...spend.values()].reduce((a, b) => a + b, 0)) },
          { label: "Menunggu approval", value: String(state.purchaseOrders.filter((p) => p.status === "Menunggu Approval").length) },
          { label: "Supplier aktif", value: String(state.suppliers.length) },
        ],
        charts: [{ title: "Nilai belanja per supplier", unit: "Rp", data: [...spend.entries()].map(([label, value]) => ({ label, value })) }],
        tables: [
          {
            title: "Purchase order",
            columns: [{ key: "id", label: "PO" }, { key: "s", label: "Supplier" }, { key: "i", label: "Item" }, { key: "t", label: "Total (Rp)", numeric: true }, { key: "d", label: "Tanggal" }, { key: "e", label: "Estimasi tiba" }, { key: "r", label: "Diminta" }, { key: "st", label: "Status" }],
            rows: state.purchaseOrders.map((p) => [p.id, sup(p.supplierId), p.lines.map((l) => `${item(l.itemId)} ×${l.qty}`).join("; "), p.total, p.date, p.expectedDate, emp(p.requestedBy), p.status]),
          },
          {
            title: "Supplier",
            columns: [{ key: "id", label: "ID" }, { key: "n", label: "Nama" }, { key: "c", label: "Kategori" }, { key: "k", label: "Kota" }, { key: "l", label: "Lead time (hari)", numeric: true }, { key: "r", label: "Rating", numeric: true }, { key: "s", label: "Spend (Rp)", numeric: true }],
            rows: state.suppliers.map((s) => [s.id, s.name, s.category, s.city, s.leadTimeDays, s.rating, spend.get(s.name) ?? 0]),
          },
        ],
      };
    }

    case "production": {
      const done = state.workOrders.filter((w) => w.status === "Selesai");
      const avg = done.length ? done.reduce((a, w) => a + (w.actualKg ?? 0) / w.plannedKg, 0) / done.length : 0;
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Work order", value: String(state.workOrders.length) },
          { label: "Berjalan", value: String(state.workOrders.filter((w) => w.status === "Berjalan").length) },
          { label: "Yield vs plan", value: `${(avg * 100).toFixed(1)}%` },
          { label: "Output selesai", value: `${fmtNum(done.reduce((a, w) => a + (w.actualKg ?? 0), 0))} kg` },
        ],
        charts: [{ title: "Yield vs plan per WO selesai", unit: "%", data: done.map((w) => ({ label: w.id.replace("WO-2409-", "WO-"), value: Math.round(((w.actualKg ?? 0) / w.plannedKg) * 100) })) }],
        tables: [
          {
            title: "Work order",
            columns: [{ key: "id", label: "WO" }, { key: "s", label: "SKU" }, { key: "p", label: "Plan (kg)", numeric: true }, { key: "a", label: "Aktual (kg)", numeric: true }, { key: "r", label: "Loin (kg)", numeric: true }, { key: "sh", label: "Shift" }, { key: "l", label: "Lini" }, { key: "pic", label: "Supervisor" }, { key: "d", label: "Tanggal" }, { key: "st", label: "Status" }],
            rows: state.workOrders.map((w) => [w.id, skuName(w.skuCode), w.plannedKg, w.actualKg ?? 0, w.rawMaterialKg, w.shift, w.line, emp(w.supervisorId), w.date, w.status]),
          },
          {
            title: "Tiket maintenance",
            columns: [{ key: "id", label: "Tiket" }, { key: "m", label: "Mesin" }, { key: "i", label: "Masalah" }, { key: "p", label: "Prioritas" }, { key: "s", label: "Status" }, { key: "b", label: "Pelapor" }, { key: "d", label: "Tanggal" }],
            rows: state.tickets.map((t) => [t.id, t.machine, t.issue, t.priority, t.status, t.reportedBy, t.date]),
          },
        ],
      };
    }

    case "sales": {
      const byCus = new Map<string, number>();
      state.salesOrders.filter((s) => s.status !== "Dibatalkan").forEach((s) => byCus.set(cus(s.customerId), (byCus.get(cus(s.customerId)) ?? 0) + s.totalUsd));
      const rev = state.salesOrders.filter((s) => ["Dikirim", "Ditagih", "Lunas"].includes(s.status)).reduce((a, s) => a + s.totalUsd, 0);
      const pipe = state.salesOrders.filter((s) => ["Quotation", "Dikonfirmasi"].includes(s.status)).reduce((a, s) => a + s.totalUsd, 0);
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Revenue (terkirim+)", value: fmtUsd(rev) },
          { label: "Pipeline", value: fmtUsd(pipe) },
          { label: "Sales order", value: String(state.salesOrders.length) },
          { label: "Customer", value: String(state.customers.length) },
        ],
        charts: [{ title: "Nilai order per customer", unit: "USD", data: [...byCus.entries()].map(([label, value]) => ({ label, value: Math.round(value) })) }],
        tables: [
          {
            title: "Sales order",
            columns: [{ key: "id", label: "SO" }, { key: "c", label: "Customer" }, { key: "i", label: "Item" }, { key: "u", label: "Total (USD)", numeric: true }, { key: "r", label: "Ekuivalen (Rp)", numeric: true }, { key: "d", label: "Tanggal" }, { key: "due", label: "Jatuh tempo" }, { key: "s", label: "Sales" }, { key: "st", label: "Status" }],
            rows: state.salesOrders.map((s) => [s.id, cus(s.customerId), s.lines.map((l) => `${skuName(l.skuCode)} ${l.qtyKg} kg`).join("; "), +s.totalUsd.toFixed(2), Math.round(s.totalUsd * KURS_USD), s.date, s.dueDate, emp(s.salesRepId), s.status]),
          },
          {
            title: "Customer & eksposur kredit",
            columns: [{ key: "id", label: "ID" }, { key: "n", label: "Nama" }, { key: "c", label: "Negara" }, { key: "s", label: "Segmen" }, { key: "t", label: "Termin (hari)", numeric: true }, { key: "l", label: "Credit limit (USD)", numeric: true }, { key: "e", label: "Eksposur (USD)", numeric: true }],
            rows: state.customers.map((c) => [c.id, c.name, c.country, c.segment, c.paymentTermDays, c.creditLimitUsd, Math.round(state.salesOrders.filter((s) => s.customerId === c.id && ["Dikonfirmasi", "Dikirim", "Ditagih"].includes(s.status)).reduce((a, s) => a + s.totalUsd, 0))]),
          },
        ],
        notes: [`Kurs acuan ${fmtRpFull(KURS_USD)} per USD.`],
      };
    }

    case "hr": {
      const teams = [...new Set(state.employees.map((e) => e.team))];
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Karyawan", value: String(state.employees.length) },
          { label: "Hadir hari ini", value: String(state.employees.filter((e) => e.status === "Hadir").length) },
          { label: "Cuti / sakit / izin", value: String(state.employees.filter((e) => ["Cuti", "Sakit", "Izin"].includes(e.status)).length) },
          { label: "Pengajuan menunggu", value: String(state.leaves.filter((l) => l.status === "Menunggu").length) },
        ],
        charts: [{ title: "Kehadiran per tim (hadir)", unit: "orang", data: teams.map((t) => ({ label: t, value: state.employees.filter((e) => e.team === t && e.status === "Hadir").length })) }],
        tables: [
          {
            title: "Direktori & kehadiran",
            columns: [{ key: "id", label: "ID" }, { key: "n", label: "Nama" }, { key: "t", label: "Tim" }, { key: "p", label: "Posisi" }, { key: "s", label: "Shift" }, { key: "st", label: "Status" }, { key: "j", label: "Bergabung" }],
            rows: state.employees.map((e) => [e.id, e.name, e.team, e.position, e.shift, e.status, e.joinDate]),
          },
          {
            title: "Pengajuan cuti",
            columns: [{ key: "id", label: "ID" }, { key: "n", label: "Karyawan" }, { key: "t", label: "Jenis" }, { key: "f", label: "Dari" }, { key: "to", label: "Sampai" }, { key: "d", label: "Hari", numeric: true }, { key: "r", label: "Alasan" }, { key: "s", label: "Status" }],
            rows: state.leaves.map((l) => [l.id, emp(l.employeeId), l.type, l.from, l.to, l.days, l.reason, l.status]),
          },
        ],
      };
    }

    case "activity":
    default:
      return {
        name,
        subtitle: def?.description,
        period,
        summary: [
          { label: "Total peristiwa", value: String(state.activities.length) },
          { label: "Peringatan", value: String(state.activities.filter((a) => a.tone === "warning" || a.tone === "error").length) },
          { label: "Tim terlibat", value: String(new Set(state.activities.map((a) => a.team)).size) },
        ],
        tables: [
          {
            title: "Log aktivitas",
            columns: [{ key: "t", label: "Waktu" }, { key: "team", label: "Tim" }, { key: "x", label: "Peristiwa" }, { key: "r", label: "Ref" }, { key: "tone", label: "Jenis" }],
            rows: state.activities.map((a) => [a.time.replace("T", " ").slice(0, 16), a.team, a.text, a.ref ?? "", a.tone]),
          },
        ],
      };
  }
}
