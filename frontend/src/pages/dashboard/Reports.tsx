import { useMemo, useState } from "react";
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
} from "lucide-react";
import { PageHeader } from "@/components/cards/PageHeader";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { buildReport } from "@/utils/reportData";
import { exportReportCsv, exportReportPdf } from "@/utils/reportExport";

const REPORTS = [
  { icon: FileText, name: "Production Summary", description: "Ringkasan rencana dan realisasi produksi per batch dan SKU." },
  { icon: Zap, name: "Energy Efficiency", description: "Konsumsi energi, intensitas kWh/kg, dan biaya energi per proses." },
  { icon: DollarSign, name: "SKU Profitability", description: "Margin dan profitabilitas setiap SKU berdasarkan harga dan biaya." },
  { icon: Scale, name: "Yield Analysis", description: "Analisis yield dari Whole Fish hingga Finished Goods per tahap." },
  { icon: Trash2, name: "Excess Report", description: "Rekap excess product, side product, dan loss beserta alokasinya." },
  { icon: Ship, name: "Shipment Report", description: "Detail pengiriman, utilisasi kontainer, dan nilai ekspor per buyer." },
  { icon: BarChart3, name: "Plan vs Actual", description: "Perbandingan KPI rencana terhadap realisasi lintas siklus produksi." },
  { icon: ClipboardList, name: "Management Summary", description: "Ringkasan eksekutif seluruh KPI operasional untuk manajemen." },
];

const PERIOD_PRESETS = ["7 Hari Terakhir", "30 Hari Terakhir", "Kuartal Ini", "Periode Kustom"];

export default function Reports() {
  const [period, setPeriod] = useState(PERIOD_PRESETS[1]);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [previewName, setPreviewName] = useState<string | null>(null);

  const effectivePeriod =
    period === "Periode Kustom" && customFrom && customTo ? `${customFrom} s.d. ${customTo}` : period;

  const previewDoc = useMemo(
    () => (previewName ? buildReport(previewName, effectivePeriod) : null),
    [previewName, effectivePeriod]
  );

  function handlePdf(name: string) {
    const doc = buildReport(name, effectivePeriod);
    exportReportPdf(doc);
    toast.success(`PDF "${name}" berhasil diunduh.`);
  }

  function handleCsv(name: string) {
    const doc = buildReport(name, effectivePeriod);
    exportReportCsv(doc);
    toast.success(`CSV "${name}" berhasil diunduh.`);
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Unduh dan tinjau laporan operasional lintas produksi, energi, profitabilitas, dan shipment."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Reports" }]}
      />

      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-aruna-primary">
            <CalendarRange className="h-4 w-4" />
            <span className="text-sm font-semibold text-aruna-text">Periode Laporan</span>
          </div>
          <div className="w-56 space-y-1.5">
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
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-aruna-border bg-white px-3 py-2 text-sm text-aruna-text focus:outline-none focus:ring-2 focus:ring-secondary/40"
                />
              </div>
              <div className="w-40 space-y-1.5">
                <Label className="text-xs">Sampai</Label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-aruna-border bg-white px-3 py-2 text-sm text-aruna-text focus:outline-none focus:ring-2 focus:ring-secondary/40"
                />
              </div>
            </>
          )}
          <p className="text-xs text-aruna-textSecondary">
            Periode aktif: <span className="font-medium text-aruna-text">{effectivePeriod}</span>
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.name} className="flex flex-col p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary">
              <r.icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-sm">{r.name}</CardTitle>
            <CardDescription className="mt-1.5 flex-1">{r.description}</CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setPreviewName(r.name)}>
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
              <Button size="sm" variant="outline" onClick={() => handlePdf(r.name)}>
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleCsv(r.name)}>
                <Sheet className="h-3.5 w-3.5" />
                CSV
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!previewName} onOpenChange={(open) => !open && setPreviewName(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          {previewDoc && (
            <>
              <DialogHeader>
                <DialogTitle>{previewDoc.name}</DialogTitle>
                <DialogDescription>
                  Periode {previewDoc.period} · Dibuat {previewDoc.generatedAt}
                </DialogDescription>
              </DialogHeader>

              {previewDoc.summary.length > 0 && (
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {previewDoc.summary.map((s) => (
                    <div key={s.label} className="rounded-lg border border-aruna-border bg-aruna-bg p-3">
                      <p className="text-[11px] text-aruna-textSecondary">{s.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-aruna-primary">{s.value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                {previewDoc.tables.map((table) => (
                  <div key={table.title}>
                    <p className="mb-2 text-sm font-semibold text-aruna-text">{table.title}</p>
                    <div className="overflow-x-auto rounded-lg border border-aruna-border">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-aruna-light1 text-aruna-dark">
                          <tr>
                            {table.columns.map((c) => (
                              <th
                                key={c.key}
                                className={`px-3 py-2 font-semibold ${c.align === "right" ? "text-right" : "text-left"}`}
                              >
                                {c.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-aruna-border">
                          {table.rows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-aruna-light1/40">
                              {row.map((cell, ci) => (
                                <td
                                  key={ci}
                                  className={`px-3 py-2 text-aruna-text ${
                                    table.columns[ci]?.align === "right" ? "text-right tabular-nums" : "text-left"
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

              <DialogFooter>
                <Button variant="outline" onClick={() => window.print()}>
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
