import { Link } from "react-router-dom";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CheckSquare,
  Factory,
  Users,
  ArrowRight,
  AlertTriangle,
  Activity as ActivityIcon,
  Sparkles,
  Waves,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ComposedChart, Area, Line, Legend } from "recharts";
import { KPICard } from "@/components/cards/KPICard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { chartTooltipStyle, CHART_AXIS_COLOR, CHART_GRID_COLOR } from "@/components/charts/chart-theme";
import { useErp, fmtRpShort, fmtUsd, effectiveInvoiceStatus } from "../ErpContext";
import { TEAM_META, ERP_NAV } from "../config";
import type { ErpTeam } from "../types";
import { ActivityFeed, SectionCard, TeamChip } from "../components/shared";
import { ExportMenu } from "../components/ExportMenu";
import { ReportPreview } from "../components/ReportPreview";
import { buildErpReport, ERP_REPORTS } from "../reports";
import type { ExportDoc } from "../export";
import { useState } from "react";
import { FileBarChart2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const FLOW: { team: ErpTeam; href: string }[] = [
  { team: "Procurement", href: "/erp/procurement" },
  { team: "Warehouse", href: "/erp/inventory" },
  { team: "Operations", href: "/erp/operations" },
  { team: "Sales", href: "/erp/sales" },
  { team: "Finance", href: "/erp/finance" },
];

const TREND = [
  { bulan: "Apr", penjualan: 2.41, hpp: 1.62, margin: 0.79 },
  { bulan: "Mei", penjualan: 2.63, hpp: 1.74, margin: 0.89 },
  { bulan: "Jun", penjualan: 2.35, hpp: 1.6, margin: 0.75 },
  { bulan: "Jul", penjualan: 2.88, hpp: 1.9, margin: 0.98 },
  { bulan: "Agu", penjualan: 3.02, hpp: 1.98, margin: 1.04 },
];

const QUICK_REPORTS = ["finance-summary", "inventory", "sales", "production"];

export default function ErpHome() {
  const { state, derived } = useErp();
  const [preview, setPreview] = useState<ExportDoc | null>(null);
  const trend = [...TREND, { bulan: "Sep", penjualan: +((derived.revenueMtdUsd * 16481) / 1e9).toFixed(2), hpp: +((derived.revenueMtdUsd * 16481 * 0.66) / 1e9).toFixed(2), margin: +((derived.revenueMtdUsd * 16481 * 0.34) / 1e9).toFixed(2) }];

  const flowStats: Record<string, { value: string; label: string; warn?: boolean }> = {
    Procurement: { value: String(state.purchaseOrders.filter((p) => p.status === "Menunggu Approval").length), label: "PO menunggu approval", warn: state.purchaseOrders.some((p) => p.status === "Menunggu Approval") },
    Warehouse: { value: String(derived.lowStockItems.length), label: "item di bawah minimum", warn: derived.lowStockItems.length > 0 },
    Operations: { value: String(state.workOrders.filter((w) => w.status === "Berjalan").length), label: "work order berjalan" },
    Sales: { value: fmtUsd(derived.pipelineUsd), label: "pipeline quotation & konfirmasi" },
    Finance: { value: String(derived.overdueCount), label: "invoice terlambat", warn: derived.overdueCount > 0 },
  };

  const teamCards = (Object.keys(TEAM_META) as ErpTeam[]).map((team) => {
    const members = state.employees.filter((e) => e.team === team);
    const present = members.filter((e) => e.status === "Hadir").length;
    const budget = state.budgets.find((b) => b.department === team);
    const pending =
      team === "Procurement"
        ? state.purchaseOrders.filter((p) => p.status === "Menunggu Approval" || p.status === "Draft").length
        : team === "Finance"
          ? state.invoices.filter((i) => effectiveInvoiceStatus(i) !== "Lunas").length
          : team === "Warehouse"
            ? derived.lowStockItems.length
            : team === "Operations"
              ? state.workOrders.filter((w) => w.status !== "Selesai").length
              : team === "Sales"
                ? state.salesOrders.filter((s) => s.status === "Quotation").length
                : team === "HR"
                  ? state.leaves.filter((l) => l.status === "Menunggu").length
                  : team === "Engineering"
                    ? state.tickets.filter((t) => t.status !== "Selesai").length
                    : state.workOrders.filter((w) => w.status === "Berjalan").length;
    const pendingLabel =
      team === "Procurement" ? "PO perlu tindakan" : team === "Finance" ? "invoice terbuka" : team === "Warehouse" ? "stok kritis" : team === "Operations" ? "WO aktif" : team === "Sales" ? "quotation" : team === "HR" ? "cuti menunggu" : team === "Engineering" ? "tiket terbuka" : "inspeksi berjalan";
    const href = ERP_NAV.find((n) => n.team === team)?.href ?? (team === "Engineering" ? "/erp/operations" : team === "Quality" ? "/erp/operations" : "/erp");
    return { team, members: members.length, present, budget, pending, pendingLabel, href };
  });

  const budgetData = state.budgets.map((b) => ({ name: b.department, pct: Math.round((b.actual / b.budget) * 100), actual: b.actual, budget: b.budget }));

  const actionItems = [
    ...state.purchaseOrders.filter((p) => p.status === "Menunggu Approval").map((p) => ({ id: p.id, text: `Approve ${p.id} (${fmtRpShort(p.total)})`, href: "/erp/approvals", tone: "warning" as const })),
    ...state.invoices.filter((i) => effectiveInvoiceStatus(i) === "Terlambat").map((i) => ({ id: i.id, text: `${i.kind === "AR" ? "Tagih" : "Bayar"} ${i.id} — ${i.counterparty}`, href: "/erp/finance", tone: "error" as const })),
    ...derived.lowStockItems.map((i) => ({ id: i.id, text: `Restock ${i.name} (${i.stock}/${i.minStock} ${i.unit})`, href: "/erp/inventory", tone: "warning" as const })),
    ...state.tickets.filter((t) => t.status === "Terbuka" && t.priority === "Tinggi").map((t) => ({ id: t.id, text: `Tangani ${t.id} ${t.machine}`, href: "/erp/operations", tone: "error" as const })),
    ...state.leaves.filter((l) => l.status === "Menunggu").map((l) => ({ id: l.id, text: `Tinjau pengajuan cuti ${l.id}`, href: "/erp/hr", tone: "info" as const })),
  ].slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-elevated sm:p-8">
        <div className="pointer-events-none absolute inset-0 line-grid-light opacity-40" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-aruna-secondary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80">
              <Sparkles className="h-3 w-3 text-aruna-medium" />
              Extended Dashboard · ERP
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Satu sumber data untuk seluruh tim Aruna.</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Procurement, Warehouse, Operations, Sales, Finance, dan HR bekerja di atas data yang sama. Setiap transaksi di satu tim
              otomatis mengalir ke tim lain — dari PO hingga jurnal, dari work order hingga stok cold storage.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild className="bg-white text-slate-900 shadow-md hover:bg-white/90">
              <Link to="/erp/approvals">
                <CheckSquare className="h-4 w-4" />
                {derived.pendingApprovals} approval menunggu
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/25 bg-white/10 text-white hover:border-white/50 hover:bg-white/15">
              <Link to="/app/overview">
                <Waves className="h-4 w-4" />
                FISH Operations
              </Link>
            </Button>
          </div>
        </div>

        {/* Integration flow */}
        <div className="relative mt-7 grid grid-cols-1 gap-2 sm:grid-cols-5">
          {FLOW.map((f, i) => {
            const m = TEAM_META[f.team];
            const st = flowStats[f.team];
            return (
              <Link
                key={f.team}
                to={f.href}
                className="group relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white", m.solid)}>
                  <m.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold">{m.label}</span>
                  <span className={cn("block truncate text-[11px]", st.warn ? "text-amber-300" : "text-white/65")}>
                    <strong className="font-semibold text-white">{st.value}</strong> {st.label}
                  </span>
                </span>
                {i < FLOW.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 text-white/40 sm:block" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* KPI */}
      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <KPICard label="Posisi Kas" value={fmtRpShort(state.cashRp)} icon={Wallet} accent="success" helperText="kas & bank" sparkline={[2.9, 3.0, 3.1, 3.05, 3.2, state.cashRp / 1e9]} />
        <KPICard label="Piutang (AR)" value={fmtRpShort(derived.arOutstanding)} icon={ArrowDownToLine} helperText={`${state.invoices.filter((i) => i.kind === "AR" && i.status !== "Lunas").length} invoice`} />
        <KPICard label="Hutang (AP)" value={fmtRpShort(derived.apOutstanding)} icon={ArrowUpFromLine} accent="warning" helperText={`${state.invoices.filter((i) => i.kind === "AP" && i.status !== "Lunas").length} tagihan`} />
        <KPICard label="Nilai Persediaan" value={fmtRpShort(derived.inventoryValue)} icon={Boxes} helperText={`${state.items.length} item`} />
        <KPICard label="Work Order Aktif" value={String(derived.openWorkOrders)} icon={Factory} helperText={`${state.workOrders.filter((w) => w.status === "Berjalan").length} berjalan`} />
        <KPICard label="Kehadiran Hari Ini" value={`${derived.presentToday}/${state.employees.length}`} icon={Users} accent="success" helperText="karyawan hadir" />
      </div>

      {/* Trend + quick reports */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Tren Penjualan, HPP & Margin" description="6 bulan terakhir (Rp miliar) — bulan berjalan dihitung dari sales order live" className="xl:col-span-2">
          <div className="h-64 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="erpSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#016097" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#016097" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => `Rp${v.toFixed(2).replace(".", ",")} M`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="penjualan" name="Penjualan" stroke="#016097" strokeWidth={2.5} fill="url(#erpSales)" />
                <Bar dataKey="hpp" name="HPP" fill="#B7DEEC" radius={[6, 6, 0, 0]} barSize={22} />
                <Line type="monotone" dataKey="margin" name="Margin kotor" stroke="#1E8E5A" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Laporan Cepat" description="Preview atau unduh Excel / PDF / CSV" icon={<FileBarChart2 className="mt-0.5 h-4 w-4 text-aruna-primary" />} action={<Link to="/erp/reports" className="text-xs font-medium text-aruna-primary hover:underline">Semua laporan →</Link>}>
          <ul className="divide-y divide-aruna-border">
            {QUICK_REPORTS.map((key) => {
              const r = ERP_REPORTS.find((x) => x.key === key)!;
              const m = r.team !== "Semua" ? TEAM_META[r.team] : null;
              return (
                <li key={key} className="flex items-center gap-3 px-5 py-3">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white", m?.solid ?? "bg-slate-900")}>{m ? <m.icon className="h-4 w-4" /> : <FileBarChart2 className="h-4 w-4" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-aruna-text">{r.name}</span>
                    <span className="block truncate text-[11px] text-aruna-textSecondary">{r.description}</span>
                  </span>
                  <button onClick={() => setPreview(buildErpReport(key, state, "Bulan berjalan"))} className="flex h-8 w-8 items-center justify-center rounded-lg text-aruna-textSecondary hover:bg-aruna-light1 hover:text-aruna-primary" title="Preview"><Eye className="h-4 w-4" /></button>
                  <ExportMenu getDoc={() => buildErpReport(key, state, "Bulan berjalan")} label="" />
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Team cards */}
        <div className="xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-aruna-text">Tim & Modul</h2>
            <span className="text-xs text-aruna-textSecondary">{state.employees.length} karyawan · 8 tim</span>
          </div>
          <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2">
            {teamCards.map((t) => {
              const m = TEAM_META[t.team];
              const pct = t.budget ? Math.round((t.budget.actual / t.budget.budget) * 100) : 0;
              return (
                <Link key={t.team} to={t.href} className="group">
                  <Card interactive className="h-full p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm", m.solid)}>
                          <m.icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-display text-sm font-semibold text-aruna-text">{m.label}</p>
                          <p className="text-xs text-aruna-textSecondary">{t.members} anggota · {t.present} hadir</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-aruna-textSecondary opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-aruna-textSecondary">{m.description}</p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="font-display text-xl font-bold text-aruna-text">{t.pending}</p>
                        <p className="text-[11px] text-aruna-textSecondary">{t.pendingLabel}</p>
                      </div>
                      {t.budget && (
                        <div className="w-28">
                          <div className="flex justify-between text-[10px] text-aruna-textSecondary">
                            <span>Anggaran</span>
                            <span className={cn("font-semibold", pct > 90 ? "text-aruna-error" : "text-aruna-text")}>{pct}%</span>
                          </div>
                          <Progress value={pct} variant={pct > 90 ? "error" : pct > 75 ? "warning" : "default"} className="mt-1 h-1.5" />
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <SectionCard
            title="Perlu Tindakan"
            description="Prioritas lintas tim hari ini"
            icon={<AlertTriangle className="mt-0.5 h-4 w-4 text-aruna-warning" />}
          >
            {actionItems.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-aruna-textSecondary">Semua beres — tidak ada tindakan tertunda.</p>
            ) : (
              <ul className="divide-y divide-aruna-border/70">
                {actionItems.map((a) => (
                  <li key={a.id}>
                    <Link to={a.href} className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors hover:bg-aruna-light1/50">
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", a.tone === "error" ? "bg-aruna-error" : a.tone === "warning" ? "bg-aruna-warning" : "bg-aruna-secondary")} />
                      <span className="min-w-0 flex-1 truncate text-aruna-text">{a.text}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-aruna-textSecondary" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Aktivitas Terintegrasi"
            description="Event lintas modul, terbaru di atas"
            icon={<ActivityIcon className="mt-0.5 h-4 w-4 text-aruna-primary" />}
          >
            <ActivityFeed activities={state.activities} limit={7} compact />
          </SectionCard>
        </div>
      </div>

      {/* Budget chart */}
      <SectionCard title="Realisasi Anggaran per Tim" description="Persentase realisasi terhadap anggaran bulan berjalan (Rp)">
        <div className="h-64 px-3 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid stroke={CHART_GRID_COLOR} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} />
              <Tooltip
                {...chartTooltipStyle}
                formatter={(v: number, _n, p) => [`${v}% · ${fmtRpShort(p.payload.actual)} dari ${fmtRpShort(p.payload.budget)}`, "Realisasi"]}
              />
              <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={14}>
                {budgetData.map((d) => (
                  <Cell key={d.name} fill={TEAM_META[d.name as ErpTeam]?.hex ?? "#016097"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-aruna-border px-5 py-3">
          {(Object.keys(TEAM_META) as ErpTeam[]).map((t) => (
            <TeamChip key={t} team={t} />
          ))}
        </div>
      </SectionCard>
      <ReportPreview doc={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
