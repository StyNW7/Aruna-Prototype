import { useState } from "react";
import { FileSpreadsheet, FileText, Sheet, Layers, Table2, BarChart3, Printer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { chartTooltipStyle, CHART_AXIS_COLOR, CHART_GRID_COLOR, CHART_COLORS } from "@/components/charts/chart-theme";
import { exportDoc, fmtNum, type ExportDoc, type ExportFormat } from "../export";
import { cn } from "@/lib/utils";

interface ReportPreviewProps {
  doc: ExportDoc | null;
  onClose: () => void;
  onExported?: (format: ExportFormat | "print", doc: ExportDoc) => void;
}

function printDoc(doc: ExportDoc): boolean {
  const win = window.open("", "_blank", "width=960,height=720");
  if (!win) return false;
  const esc = (v: string | number) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const summary = doc.summary?.length ? `<div class="summary">${doc.summary.map((s) => `<div class="tile"><div class="l">${esc(s.label)}</div><div class="v">${esc(s.value)}</div></div>`).join("")}</div>` : "";
  const tables = doc.tables
    .map(
      (t) => `<section><h2>${esc(t.title)}</h2><table><thead><tr>${t.columns.map((c) => `<th class="${c.numeric ? "r" : ""}">${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${t.rows
        .map((r) => `<tr>${r.map((v, i) => `<td class="${t.columns[i]?.numeric ? "r" : ""}">${typeof v === "number" ? fmtNum(v, Number.isInteger(v) ? 0 : 2) : esc(v)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table></section>`
    )
    .join("");
  win.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(doc.name)} — Aruna ERP</title>
<style>@page{margin:16mm}body{font-family:Inter,system-ui,sans-serif;color:#1e293b;margin:0;padding:28px;font-size:12px}.bar{height:6px;background:linear-gradient(90deg,#016097,#358ebd);border-radius:4px;margin-bottom:18px}h1{font-size:20px;margin:0 0 2px}.m{color:#64748b;font-size:11px;margin-bottom:16px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}.tile{border:1px solid #e3eaf0;background:#f7fafc;border-radius:8px;padding:10px 12px}.l{font-size:10px;color:#64748b}.v{font-size:14px;font-weight:700;color:#016097;margin-top:2px}section{margin-bottom:22px;page-break-inside:avoid}h2{font-size:13px;color:#014b77;margin:0 0 8px}table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border-bottom:1px solid #e3eaf0;font-size:11px;text-align:left}th{background:#016097;color:#fff}tr:nth-child(even) td{background:#f7fafc}.r{text-align:right;font-variant-numeric:tabular-nums}.f{margin-top:24px;color:#94a3b8;font-size:10px;border-top:1px solid #e3eaf0;padding-top:8px}</style></head>
<body><div class="bar"></div><h1>Aruna ERP — ${esc(doc.name)}</h1><p class="m">${doc.period ? `Periode: ${esc(doc.period)} · ` : ""}Dibuat: ${new Date().toLocaleString("id-ID")}</p>${summary}${tables}<p class="f">Dokumen ilustratif (prototype) — PT Aruna Jaya Nuswantara.</p><script>window.addEventListener("load",function(){setTimeout(function(){window.print()},150)})</script></body></html>`);
  win.document.close();
  win.focus();
  return true;
}

/** Modal preview laporan: ringkasan, chart (recharts), tabel, dan tombol export nyata. */
export function ReportPreview({ doc, onClose, onExported }: ReportPreviewProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const totalRows = doc?.tables.reduce((a, t) => a + t.rows.length, 0) ?? 0;

  async function run(format: ExportFormat) {
    if (!doc) return;
    setBusy(format);
    await new Promise((r) => setTimeout(r, 30));
    try {
      exportDoc(doc, format);
      onExported?.(format, doc);
      toast.success(`${format.toUpperCase()} "${doc.name}" berhasil diunduh.`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col gap-0 overflow-hidden p-0">
        {doc && (
          <>
            <div className="border-b border-aruna-border bg-aruna-bg px-6 py-5 pr-14">
              <DialogHeader className="mb-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md"><FileText className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <DialogTitle>{doc.name}</DialogTitle>
                    <DialogDescription>{doc.subtitle}{doc.period ? ` · Periode ${doc.period}` : ""}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-aruna-textSecondary">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 ring-1 ring-aruna-border"><Layers className="h-3 w-3" /> {doc.tables.length} tabel</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 ring-1 ring-aruna-border"><Table2 className="h-3 w-3" /> {totalRows} baris</span>
                {doc.charts?.length ? <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 ring-1 ring-aruna-border"><BarChart3 className="h-3 w-3" /> {doc.charts.length} chart</span> : null}
                <span className="inline-flex items-center gap-1 rounded-full bg-aruna-successBg px-2 py-0.5 text-aruna-success">Data live dari state ERP</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {doc.summary?.length ? (
                <div className="stagger mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {doc.summary.map((s) => (
                    <div key={s.label} className="rounded-lg border border-aruna-border bg-aruna-bg p-3">
                      <p className="text-[11px] text-aruna-textSecondary">{s.label}</p>
                      <p className="mt-0.5 font-display text-sm font-bold text-aruna-primary">{s.value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {doc.charts?.length ? (
                <div className={cn("mb-6 grid gap-4", doc.charts.length > 1 ? "lg:grid-cols-2" : "")}>
                  {doc.charts.map((ch) => (
                    <div key={ch.title} className="rounded-xl border border-aruna-border p-4">
                      <p className="text-sm font-semibold text-aruna-text">{ch.title}</p>
                      {ch.unit && <p className="text-[11px] text-aruna-textSecondary">Satuan: {ch.unit}</p>}
                      <div className="mt-2 h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ch.data} margin={{ left: -8, right: 8, top: 8 }}>
                            <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} interval={0} angle={ch.data.length > 6 ? -20 : 0} dy={ch.data.length > 6 ? 8 : 0} height={ch.data.length > 6 ? 44 : 30} />
                            <YAxis tick={{ fontSize: 10, fill: CHART_AXIS_COLOR }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1e9 ? `${(v / 1e9).toFixed(1)}M` : v >= 1e6 ? `${Math.round(v / 1e6)}jt` : v >= 1e3 ? `${Math.round(v / 1e3)}k` : String(v))} />
                            <Tooltip {...chartTooltipStyle} formatter={(v: number) => [fmtNum(v, Number.isInteger(v) ? 0 : 2), ch.unit ?? "Nilai"]} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                              {ch.data.map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="space-y-6">
                {doc.tables.map((t) => (
                  <div key={t.title}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-aruna-text">{t.title}</p>
                      <span className="text-[11px] text-aruna-textSecondary">{t.rows.length} baris</span>
                    </div>
                    <div className="max-h-80 overflow-auto rounded-lg border border-aruna-border">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-aruna-light1 text-aruna-dark">
                          <tr>
                            {t.columns.map((c) => (
                              <th key={c.key} className={cn("whitespace-nowrap px-3 py-2 font-semibold", c.numeric ? "text-right" : "text-left")}>{c.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-aruna-border">
                          {t.rows.map((row, ri) => (
                            <tr key={ri} className="odd:bg-white even:bg-aruna-bg/60 hover:bg-aruna-light1/40">
                              {row.map((cell, ci) => (
                                <td key={ci} className={cn("px-3 py-2 text-aruna-text", t.columns[ci]?.numeric ? "text-right tabular-nums" : "")}>
                                  {typeof cell === "number" ? fmtNum(cell, Number.isInteger(cell) ? 0 : 2) : cell}
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
              {doc.notes?.length ? (
                <ul className="mt-5 space-y-1 border-t border-aruna-border pt-4 text-xs text-aruna-textSecondary">
                  {doc.notes.map((n) => <li key={n}>• {n}</li>)}
                </ul>
              ) : null}
            </div>

            <DialogFooter className="mt-0 flex-wrap border-t border-aruna-border bg-aruna-bg px-6 py-4">
              <Button variant="outline" onClick={() => { if (printDoc(doc)) { onExported?.("print", doc); toast.success("Jendela cetak dibuka."); } else toast.error("Popup diblokir browser."); }}>
                <Printer className="h-3.5 w-3.5" /> Cetak
              </Button>
              <Button variant="outline" disabled={busy !== null} onClick={() => run("csv")}><Sheet className="h-3.5 w-3.5" /> CSV</Button>
              <Button variant="outline" disabled={busy !== null} onClick={() => run("xlsx")}><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</Button>
              <Button variant="gradient" disabled={busy !== null} onClick={() => run("pdf")}><FileText className="h-3.5 w-3.5" /> {busy === "pdf" ? "Menyiapkan..." : "Export PDF"}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
