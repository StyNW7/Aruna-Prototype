import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Eye, History, Search, BarChart3, CalendarRange, Sparkles, FileSpreadsheet } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useErp } from "../ErpContext";
import { TEAM_META } from "../config";
import { ERP_REPORTS, buildErpReport } from "../reports";
import type { ExportDoc, ExportFormat } from "../export";
import { ExportMenu } from "../components/ExportMenu";
import { ReportPreview } from "../components/ReportPreview";
import { ErpPageHeader, SectionCard, TeamChip } from "../components/shared";
import { cn } from "@/lib/utils";

const CATS = ["Semua", "Keuangan", "Operasional", "Komersial", "SDM"] as const;
const PERIODS = ["Bulan Berjalan", "7 Hari Terakhir", "30 Hari Terakhir", "Kuartal Ini", "Tahun Berjalan"];

interface ExportLog {
  id: number;
  name: string;
  format: string;
  at: string;
}

export default function ErpReports() {
  const { state } = useErp();
  const [params, setParams] = useSearchParams();
  const [cat, setCat] = useState<(typeof CATS)[number]>("Semua");
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState(PERIODS[0]);
  const [preview, setPreview] = useState<ExportDoc | null>(null);
  const [log, setLog] = useState<ExportLog[]>([]);

  const list = useMemo(
    () => ERP_REPORTS.filter((r) => (cat === "Semua" || r.category === cat) && (q === "" || r.name.toLowerCase().includes(q.toLowerCase()) || r.description.toLowerCase().includes(q.toLowerCase()))),
    [cat, q]
  );

  // Deep-link ?preview=key (mis. dari pencarian ERP)
  useEffect(() => {
    const target = params.get("preview");
    if (target && ERP_REPORTS.some((r) => r.key === target)) {
      setPreview(buildErpReport(target, state, period));
      params.delete("preview");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function record(format: ExportFormat | "print", doc: ExportDoc) {
    const at = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date());
    setLog((prev) => [{ id: Date.now(), name: doc.name, format: format.toUpperCase(), at }, ...prev].slice(0, 10));
  }

  return (
    <div>
      <ErpPageHeader
        title="Laporan ERP"
        subtitle="Semua laporan dibangun langsung dari data ERP saat ini — preview dengan chart & tabel, lalu unduh sebagai Excel (.xlsx), PDF, atau CSV."
        actions={
          <ExportMenu
            label="Export Semua (Excel)"
            variant="default"
            size="default"
            getDoc={() => {
              const docs = ERP_REPORTS.map((r) => buildErpReport(r.key, state, period));
              return {
                name: "Paket Laporan Lengkap",
                subtitle: `${docs.length} laporan dalam satu berkas`,
                period,
                summary: docs.flatMap((d) => (d.summary ?? []).slice(0, 1).map((s) => ({ label: `${d.name}: ${s.label}`, value: s.value }))).slice(0, 8),
                charts: docs.flatMap((d) => d.charts ?? []),
                tables: docs.flatMap((d) => d.tables.map((t) => ({ ...t, title: `${d.name} — ${t.title}` }))),
              };
            }}
            onExported={record}
          />
        }
      />

      <Card className="mb-6 p-4 animate-fade-up">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-aruna-primary">
            <CalendarRange className="h-4 w-4" />
            <span className="text-sm font-semibold text-aruna-text">Periode</span>
          </div>
          <div className="w-48">
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </div>
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aruna-textSecondary" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari laporan..." className="pl-9" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-aruna-border pt-4">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-all", cat === c ? "border-aruna-primary bg-aruna-primary text-white shadow-sm" : "border-aruna-border bg-white text-aruna-textSecondary hover:border-aruna-medium hover:text-aruna-primary")}>
              {c}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-aruna-textSecondary">{list.length} laporan</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          {list.length === 0 ? (
            <EmptyState icon={Search} title="Tidak ada laporan yang cocok" description="Ubah kata kunci atau kategori." />
          ) : (
            <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {list.map((r) => {
                const meta = r.team !== "Semua" ? TEAM_META[r.team] : null;
                const Icon = meta?.icon ?? FileText;
                const last = log.find((l) => l.name === r.name);
                return (
                  <Card key={r.key} interactive className="group flex flex-col p-5">
                    <div className="flex items-start justify-between">
                      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm", meta?.solid ?? "bg-slate-900")}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex items-center gap-1.5">
                        {r.hasChart && <Badge variant="outline"><BarChart3 className="h-3 w-3" /> Chart</Badge>}
                        <Badge variant="default">{r.category}</Badge>
                      </div>
                    </div>
                    <CardTitle className="mt-3 text-sm">{r.name}</CardTitle>
                    <CardDescription className="mt-1.5 flex-1">{r.description}</CardDescription>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-aruna-textSecondary">
                      {r.team !== "Semua" ? <TeamChip team={r.team} /> : <span className="rounded-full bg-aruna-bg px-2 py-0.5 ring-1 ring-aruna-border">Lintas tim</span>}
                      <span>{last ? `Terakhir ${last.format} · ${last.at}` : "Belum diekspor"}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreview(buildErpReport(r.key, state, period))}>
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </Button>
                      <ExportMenu getDoc={() => buildErpReport(r.key, state, period)} onExported={record} className="[&>button]:w-full" />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="relative overflow-hidden bg-slate-900 p-5 text-white animate-fade-up">
            <div className="pointer-events-none absolute inset-0 line-grid-light opacity-40" />
            <div className="relative">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80"><Sparkles className="h-3 w-3 text-aruna-medium" /> Format export</p>
              <ul className="mt-3 space-y-2 text-xs text-white/80">
                <li className="flex items-start gap-2"><FileSpreadsheet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" /> <span><strong className="text-white">Excel</strong> — satu sheet per tabel, sheet ringkasan, data chart, autofilter, format angka.</span></li>
                <li className="flex items-start gap-2"><FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" /> <span><strong className="text-white">PDF</strong> — header brand, ringkasan KPI, bar chart tergambar, tabel berhalaman.</span></li>
                <li className="flex items-start gap-2"><FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" /> <span><strong className="text-white">CSV</strong> — teks ringan; <strong className="text-white">Cetak</strong> — jendela print khusus laporan.</span></li>
              </ul>
            </div>
          </Card>

          <SectionCard title="Riwayat Export" description="Sesi ini" icon={<History className="mt-0.5 h-4 w-4 text-aruna-primary" />} action={log.length > 0 ? <button onClick={() => setLog([])} className="text-xs text-aruna-textSecondary hover:text-aruna-error">Bersihkan</button> : undefined}>
            {log.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-aruna-textSecondary">Belum ada export pada sesi ini.</p>
            ) : (
              <ul className="divide-y divide-aruna-border">
                {log.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 px-5 py-2.5 animate-fade-in">
                    <span className={cn("inline-flex h-6 min-w-[2.6rem] items-center justify-center rounded-md px-1.5 text-[10px] font-bold", l.format === "PDF" ? "bg-aruna-errorBg text-aruna-error" : l.format === "XLSX" ? "bg-aruna-successBg text-aruna-success" : "bg-aruna-light2 text-aruna-dark")}>{l.format}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-aruna-text">{l.name}</span>
                    <span className="text-[11px] text-aruna-textSecondary">{l.at}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      <ReportPreview doc={preview} onClose={() => setPreview(null)} onExported={record} />
    </div>
  );
}
