import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FileText,
  Zap,
  DollarSign,
  Scale,
  Trash2,
  Ship,
  BarChart3,
  ClipboardList,
  Eye,
  FileDown,
  Sheet,
  CalendarRange,
  Printer,
  History,
  Search,
  Table2,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, Label, Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { buildReport, REPORT_DEFINITIONS, type ReportDefinition } from "@/utils/reportData";
import { exportReportCsv, exportReportPdf, printReport } from "@/utils/reportExport";
import { cn } from "@/lib/utils";

const REPORT_ICONS: Record<string, LucideIcon> = {
  "Production Summary": FileText,
  "Energy Efficiency": Zap,
  "SKU Profitability": DollarSign,
  "Yield Analysis": Scale,
  "Excess Report": Trash2,
  "Shipment Report": Ship,
  "Plan vs Actual": BarChart3,
  "Management Summary": ClipboardList,
};

const CATEGORY_TONE: Record<ReportDefinition["category"], "default" | "warning" | "success" | "primary" | "neutral"> = {
  Produksi: "default",
  Energi: "warning",
  Finansial: "success",
  Logistik: "primary",
  Manajemen: "neutral",
};

const PERIOD_PRESETS = ["7 Hari Terakhir", "30 Hari Terakhir", "Kuartal Ini", "Periode Kustom"];
const CATEGORIES: ("Semua" | ReportDefinition["category"])[] = ["Semua", "Produksi", "Energi", "Finansial", "Logistik", "Manajemen"];

interface ExportLog {
  id: number;
  name: string;
  format: "PDF" | "CSV" | "Cetak";
  period: string;
  at: string;
}

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [period, setPeriod] = useState(PERIOD_PRESETS[1]);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Semua");
  const [query, setQuery] = useState("");
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [exportLog, setExportLog] = useState<ExportLog[]>([]);

  // Deep-link: /app/reports?preview=Nama%20Laporan (mis. dari pencarian global)
  useEffect(() => {
    const target = searchParams.get("preview");
    if (target && REPORT_DEFINITIONS.some((r) => r.name === target)) {
      setPreviewName(target);
      searchParams.delete("preview");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const customValid = period !== "Periode Kustom" || (customFrom !== "" && customTo !== "" && customFrom <= customTo);
  const effectivePeriod =
    period === "Periode Kustom" && customFrom && customTo ? `${customFrom} s.d. ${customTo}` : period;

  const visibleReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REPORT_DEFINITIONS.filter(
      (r) =>
        (category === "Semua" || r.category === category) &&
        (q === "" || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    );
  }, [category, query]);

  const previewDoc = useMemo(
    () => (previewName ? buildReport(previewName, effectivePeriod) : null),
    [previewName, effectivePeriod]
  );

  function log(name: string, format: ExportLog["format"]) {
    const at = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date());
    setExportLog((prev) => [{ id: Date.now(), name, format, period: effectivePeriod, at }, ...prev].slice(0, 8));
  }

  function guardPeriod(): boolean {
    if (!customValid) {
      toast.error("Lengkapi tanggal periode kustom (tanggal mulai harus ≤ tanggal akhir).");
      return false;
    }
    return true;
  }

  function handlePdf(name: string) {
    if (!guardPeriod()) return;
    exportReportPdf(buildReport(name, effectivePeriod));
    log(name, "PDF");
    toast.success(`PDF "${name}" berhasil diunduh.`);
  }

  function handleCsv(name: string) {
    if (!guardPeriod()) return;
    exportReportCsv(buildReport(name, effectivePeriod));
    log(name, "CSV");
    toast.success(`CSV "${name}" berhasil diunduh.`);
  }

  function handlePrint(name: string) {
    if (!guardPeriod()) return;
    const ok = printReport(buildReport(name, effectivePeriod));
    if (ok) {
      log(name, "Cetak");
      toast.success("Jendela cetak dibuka.");
    } else {
      toast.error("Popup diblokir browser. Izinkan popup untuk mencetak laporan.");
    }
  }

  function openPreview(name: string) {
    if (!guardPeriod()) return;
    setPreviewName(name);
  }

  const totalRows = previewDoc?.tables.reduce((a, t) => a + t.rows.length, 0) ?? 0;

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Unduh dan tinjau laporan operasional lintas produksi, energi, profitabilitas, dan shipment."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Reports" }]}
        badge={<Badge variant="outline">{REPORT_DEFINITIONS.length} laporan tersedia</Badge>}
      />

      {/* Filter bar */}
      <Card className="mb-6 p-4 animate-fade-up">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-aruna-primary">
            <CalendarRange className="h-4 w-4" />
            <span className="text-sm font-semibold text-aruna-text">Periode Laporan</span>
          </div>
          <div className="w-52 space-y-1.5">
            <Label className="text-xs">Preset</Label>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIOD_PRESETS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
          {period === "Periode Kustom" && (
            <>
              <div className="w-40 space-y-1.5">
                <Label className="text-xs">Dari</Label>
                <Input type="date" value={customFrom} max={customTo || undefined} onChange={(e) => setCustomFrom(e.target.value)} />
              </div>
              <div className="w-40 space-y-1.5">
                <Label className="text-xs">Sampai</Label>
                <Input type="date" value={customTo} min={customFrom || undefined} onChange={(e) => setCustomTo(e.target.value)} />
              </div>
            </>
          )}
          <div className="relative min-w-[200px] flex-1 space-y-1.5">
            <Label className="text-xs">Cari laporan</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aruna-textSecondary" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nama atau deskripsi laporan..." className="pl-9" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-aruna-border pt-4">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  category === c
                    ? "border-aruna-primary bg-aruna-primary text-white shadow-sm"
                    : "border-aruna-border bg-white text-aruna-textSecondary hover:border-aruna-medium hover:text-aruna-primary"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="text-xs text-aruna-textSecondary">
            Periode aktif:{" "}
            <span className={cn("font-medium", customValid ? "text-aruna-text" : "text-aruna-error")}>
              {customValid ? effectivePeriod : "lengkapi tanggal kustom"}
            </span>
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Report catalog */}
        <div>
          {visibleReports.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Tidak ada laporan yang cocok"
              description="Coba ubah kata kunci atau pilih kategori lain."
              action={
                <Button variant="outline" size="sm" onClick={() => { setQuery(""); setCategory("Semua"); }}>
                  Reset filter
                </Button>
              }
            />
          ) : (
            <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {visibleReports.map((r) => {
                const Icon = REPORT_ICONS[r.name] ?? FileText;
                const lastExport = exportLog.find((l) => l.name === r.name);
                return (
                  <Card key={r.name} interactive className="group flex flex-col p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary transition-colors group-hover:bg-aruna-gradient group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant={CATEGORY_TONE[r.category]}>{r.category}</Badge>
                    </div>
                    <CardTitle className="mt-3 text-sm">{r.name}</CardTitle>
                    <CardDescription className="mt-1.5 flex-1">{r.description}</CardDescription>
                    <p className="mt-3 text-[11px] text-aruna-textSecondary">
                      {lastExport ? (
                        <>
                          Terakhir diekspor <span className="font-medium text-aruna-text">{lastExport.format}</span> · {lastExport.at}
                        </>
                      ) : (
                        "Belum pernah diekspor pada sesi ini"
                      )}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Button size="sm" variant="outline" className="px-2" onClick={() => openPreview(r.name)}>
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" className="px-2" onClick={() => handlePdf(r.name)}>
                        <FileDown className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" className="px-2" onClick={() => handleCsv(r.name)}>
                        <Sheet className="h-3.5 w-3.5" />
                        CSV
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Export history */}
        <Card className="h-fit animate-fade-up xl:sticky xl:top-24">
          <div className="flex items-center justify-between border-b border-aruna-border px-5 py-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-aruna-primary" />
              <p className="font-display text-sm font-semibold text-aruna-text">Riwayat Export</p>
            </div>
            {exportLog.length > 0 && (
              <button
                type="button"
                onClick={() => setExportLog([])}
                className="text-xs font-medium text-aruna-textSecondary hover:text-aruna-error"
              >
                Bersihkan
              </button>
            )}
          </div>
          {exportLog.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-aruna-light1 text-aruna-secondary">
                <FileDown className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-aruna-text">Belum ada export</p>
              <p className="mt-1 text-xs text-aruna-textSecondary">Export PDF, CSV, atau cetak akan tercatat di sini selama sesi berlangsung.</p>
            </div>
          ) : (
            <ul className="divide-y divide-aruna-border">
              {exportLog.map((l) => (
                <li key={l.id} className="flex items-start gap-3 px-5 py-3 animate-fade-in">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md px-1.5 text-[10px] font-bold",
                      l.format === "PDF" && "bg-aruna-errorBg text-aruna-error",
                      l.format === "CSV" && "bg-aruna-successBg text-aruna-success",
                      l.format === "Cetak" && "bg-aruna-light2 text-aruna-dark"
                    )}
                  >
                    {l.format}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-aruna-text">{l.name}</p>
                    <p className="truncate text-xs text-aruna-textSecondary">{l.period} · {l.at}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Preview modal */}
      <Dialog open={!!previewName} onOpenChange={(open) => !open && setPreviewName(null)}>
        <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
          {previewDoc && (
            <>
              <div className="border-b border-aruna-border bg-aruna-bg px-6 py-5 pr-14">
                <DialogHeader className="mb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg aruna-gradient text-white shadow-glow">
                      {(() => {
                        const Icon = REPORT_ICONS[previewDoc.name] ?? FileText;
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </div>
                    <div className="min-w-0">
                      <DialogTitle>{previewDoc.name}</DialogTitle>
                      <DialogDescription>
                        Periode {previewDoc.period} · Dibuat {previewDoc.generatedAt}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-aruna-textSecondary">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 ring-1 ring-aruna-border">
                    <Layers className="h-3 w-3" /> {previewDoc.tables.length} tabel
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 ring-1 ring-aruna-border">
                    <Table2 className="h-3 w-3" /> {totalRows} baris data
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 ring-1 ring-aruna-border">
                    Data ilustratif
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {previewDoc.summary.length > 0 && (
                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {previewDoc.summary.map((s) => (
                      <div key={s.label} className="rounded-lg border border-aruna-border bg-aruna-bg p-3">
                        <p className="text-[11px] text-aruna-textSecondary">{s.label}</p>
                        <p className="mt-0.5 font-display text-sm font-bold text-aruna-primary">{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-6">
                  {previewDoc.tables.map((table) => (
                    <div key={table.title}>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-aruna-text">{table.title}</p>
                        <span className="text-[11px] text-aruna-textSecondary">{table.rows.length} baris</span>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-aruna-border">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-aruna-light1 text-aruna-dark">
                            <tr>
                              {table.columns.map((c) => (
                                <th
                                  key={c.key}
                                  className={`whitespace-nowrap px-3 py-2 font-semibold ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"}`}
                                >
                                  {c.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-aruna-border">
                            {table.rows.map((row, ri) => (
                              <tr key={ri} className="odd:bg-white even:bg-aruna-bg/60 hover:bg-aruna-light1/40">
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className={`px-3 py-2 text-aruna-text ${
                                      table.columns[ci]?.align === "right"
                                        ? "text-right tabular-nums"
                                        : table.columns[ci]?.align === "center"
                                          ? "text-center"
                                          : "text-left"
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                {previewDoc.notes?.length ? (
                  <ul className="mt-5 space-y-1 border-t border-aruna-border pt-4 text-xs text-aruna-textSecondary">
                    {previewDoc.notes.map((n) => (
                      <li key={n}>• {n}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <DialogFooter className="mt-0 flex-wrap border-t border-aruna-border bg-aruna-bg px-6 py-4">
                <Button variant="outline" onClick={() => handlePrint(previewDoc.name)}>
                  <Printer className="h-3.5 w-3.5" />
                  Cetak
                </Button>
                <Button variant="outline" onClick={() => handleCsv(previewDoc.name)}>
                  <Sheet className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
                <Button variant="gradient" onClick={() => handlePdf(previewDoc.name)}>
                  <FileDown className="h-3.5 w-3.5" />
                  Export PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
