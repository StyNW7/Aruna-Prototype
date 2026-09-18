import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { ErpState, Invoice, PurchaseOrder, SalesOrder } from "./types";
import { KURS_USD } from "./seed";

// ---------------------------------------------------------------------------
// Struktur dataset generik yang dipakai semua exporter
// ---------------------------------------------------------------------------
export interface ExportColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  /** Nilai numerik: dipakai untuk chart & format Excel */
  numeric?: boolean;
}

export interface ExportTable {
  title: string;
  columns: ExportColumn[];
  rows: (string | number)[][];
}

export interface ExportChart {
  title: string;
  /** label → nilai; digambar sebagai bar chart di PDF */
  data: { label: string; value: number }[];
  unit?: string;
}

export interface ExportDoc {
  name: string;
  subtitle?: string;
  period?: string;
  summary?: { label: string; value: string }[];
  tables: ExportTable[];
  charts?: ExportChart[];
  notes?: string[];
}

const BRAND = { primary: [1, 96, 151] as [number, number, number], dark: [1, 75, 119] as [number, number, number], text: [30, 41, 59] as [number, number, number], muted: [100, 116, 139] as [number, number, number], border: [227, 234, 240] as [number, number, number], bg: [247, 250, 252] as [number, number, number] };

function nowLabel(): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date());
}
function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}
function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
export const fmtNum = (n: number, d = 0) => new Intl.NumberFormat("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
export const fmtRpFull = (n: number) => `Rp${fmtNum(n)}`;

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------
function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportCsv(doc: ExportDoc) {
  const lines: string[] = [csvEscape(`Aruna ERP — ${doc.name}`), csvEscape(`Dibuat: ${nowLabel()}`)];
  if (doc.period) lines.push(csvEscape(`Periode: ${doc.period}`));
  lines.push("");
  if (doc.summary?.length) {
    lines.push("Ringkasan");
    doc.summary.forEach((s) => lines.push(`${csvEscape(s.label)},${csvEscape(s.value)}`));
    lines.push("");
  }
  doc.tables.forEach((t) => {
    lines.push(csvEscape(t.title));
    lines.push(t.columns.map((c) => csvEscape(c.label)).join(","));
    t.rows.forEach((r) => lines.push(r.map(csvEscape).join(",")));
    lines.push("");
  });
  download(new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" }), `aruna-erp-${slug(doc.name)}-${stamp()}.csv`);
}

// ---------------------------------------------------------------------------
// Excel (.xlsx) — satu sheet per tabel + sheet Ringkasan
// ---------------------------------------------------------------------------
export function exportXlsx(doc: ExportDoc) {
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();
  const sheetName = (t: string) => {
    let base = t.replace(/[\\/?*[\]:]/g, "").slice(0, 28) || "Sheet";
    let name = base;
    let i = 2;
    while (used.has(name)) name = `${base.slice(0, 25)} ${i++}`;
    used.add(name);
    return name;
  };

  const info: (string | number)[][] = [["Aruna ERP — " + doc.name], ["Dibuat", nowLabel()]];
  if (doc.period) info.push(["Periode", doc.period]);
  if (doc.subtitle) info.push(["Keterangan", doc.subtitle]);
  info.push([]);
  if (doc.summary?.length) {
    info.push(["Ringkasan"]);
    doc.summary.forEach((s) => info.push([s.label, s.value]));
  }
  if (doc.notes?.length) {
    info.push([], ["Catatan"]);
    doc.notes.forEach((n) => info.push([n]));
  }
  const wsInfo = XLSX.utils.aoa_to_sheet(info);
  wsInfo["!cols"] = [{ wch: 32 }, { wch: 48 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, sheetName("Ringkasan"));

  doc.tables.forEach((t) => {
    const aoa: (string | number)[][] = [[t.title], [], t.columns.map((c) => c.label), ...t.rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = t.columns.map((c, i) => ({ wch: Math.min(48, Math.max(c.label.length + 2, ...t.rows.map((r) => String(r[i] ?? "").length + 2))) }));
    ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 2, c: 0 }, e: { r: 2 + t.rows.length, c: Math.max(0, t.columns.length - 1) } }) };
    // Format angka untuk kolom numerik
    t.columns.forEach((c, ci) => {
      if (!c.numeric) return;
      t.rows.forEach((_, ri) => {
        const addr = XLSX.utils.encode_cell({ r: ri + 3, c: ci });
        const cell = ws[addr];
        if (cell && typeof cell.v === "number") cell.z = "#,##0.##";
      });
    });
    XLSX.utils.book_append_sheet(wb, ws, sheetName(t.title));
  });

  (doc.charts ?? []).forEach((ch) => {
    const ws = XLSX.utils.aoa_to_sheet([[ch.title], [], ["Label", ch.unit ? `Nilai (${ch.unit})` : "Nilai"], ...ch.data.map((d) => [d.label, d.value])]);
    ws["!cols"] = [{ wch: 28 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, sheetName(`Chart ${ch.title}`));
  });

  XLSX.writeFile(wb, `aruna-erp-${slug(doc.name)}-${stamp()}.xlsx`);
}

// ---------------------------------------------------------------------------
// PDF — header brand, ringkasan, bar chart tergambar, tabel autoTable
// ---------------------------------------------------------------------------
function pdfHeader(pdf: jsPDF, title: string, subtitle?: string, period?: string): number {
  pdf.setFillColor(...BRAND.primary);
  pdf.rect(0, 0, 595, 6, "F");
  pdf.setFillColor(...BRAND.dark);
  pdf.roundedRect(40, 22, 26, 26, 6, 6, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("A", 53, 40, { align: "center" });
  pdf.setTextColor(...BRAND.text);
  pdf.setFontSize(15);
  pdf.text("Aruna ERP — Extended Dashboard", 74, 34);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...BRAND.muted);
  pdf.text("PT Aruna Jaya Nuswantara · Hub Pelabuhan Bungus, Padang", 74, 46);
  let y = 72;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(...BRAND.text);
  pdf.text(title, 40, y);
  y += 16;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(...BRAND.muted);
  const meta = [subtitle, period ? `Periode: ${period}` : null, `Dibuat: ${nowLabel()}`].filter(Boolean).join("   |   ");
  pdf.text(meta, 40, y, { maxWidth: 515 });
  return y + 18;
}

function pdfFooter(pdf: jsPDF, label: string) {
  const n = pdf.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    pdf.setPage(i);
    pdf.setDrawColor(...BRAND.border);
    pdf.line(40, 806, 555, 806);
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`${label} — dokumen ilustratif (prototype) · Halaman ${i} dari ${n}`, 40, 818);
  }
}

function ensure(pdf: jsPDF, y: number, need: number): number {
  if (y + need > 780) {
    pdf.addPage();
    return 48;
  }
  return y;
}

function drawBarChart(pdf: jsPDF, chart: ExportChart, y: number): number {
  const x0 = 40;
  const w = 515;
  const h = 150;
  y = ensure(pdf, y, h + 40);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...BRAND.dark);
  pdf.text(chart.title, x0, y);
  y += 10;
  pdf.setDrawColor(...BRAND.border);
  pdf.setFillColor(...BRAND.bg);
  pdf.roundedRect(x0, y, w, h, 6, 6, "FD");
  const data = chart.data.slice(0, 12);
  const max = Math.max(1, ...data.map((d) => d.value));
  const padL = 14;
  const padB = 28;
  const plotW = w - padL * 2;
  const plotH = h - padB - 18;
  const slot = plotW / Math.max(1, data.length);
  const barW = Math.min(46, slot * 0.6);
  // grid
  pdf.setDrawColor(227, 234, 240);
  for (let g = 0; g <= 4; g++) {
    const gy = y + 14 + plotH - (plotH * g) / 4;
    pdf.line(x0 + padL, gy, x0 + w - padL, gy);
    pdf.setFontSize(6.5);
    pdf.setTextColor(...BRAND.muted);
    pdf.text(fmtNum((max * g) / 4), x0 + padL - 2, gy + 2, { align: "right" });
  }
  data.forEach((d, i) => {
    const bh = (d.value / max) * plotH;
    const bx = x0 + padL + i * slot + (slot - barW) / 2;
    const by = y + 14 + plotH - bh;
    pdf.setFillColor(...(i % 2 === 0 ? BRAND.primary : ([53, 142, 189] as [number, number, number])));
    pdf.roundedRect(bx, by, barW, bh, 3, 3, "F");
    pdf.setFontSize(7);
    pdf.setTextColor(...BRAND.text);
    pdf.text(fmtNum(d.value), bx + barW / 2, by - 3, { align: "center" });
    pdf.setTextColor(...BRAND.muted);
    const label = d.label.length > 14 ? d.label.slice(0, 13) + "…" : d.label;
    pdf.text(label, bx + barW / 2, y + h - 10, { align: "center" });
  });
  if (chart.unit) {
    pdf.setFontSize(7);
    pdf.setTextColor(...BRAND.muted);
    pdf.text(`Satuan: ${chart.unit}`, x0 + w - 8, y + 12, { align: "right" });
  }
  return y + h + 22;
}

export function exportPdf(doc: ExportDoc) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  let y = pdfHeader(pdf, doc.name, doc.subtitle, doc.period);

  if (doc.summary?.length) {
    const cols = Math.min(4, doc.summary.length);
    const rowsN = Math.ceil(doc.summary.length / cols);
    const boxH = 46;
    const colW = 515 / cols;
    for (let r = 0; r < rowsN; r++) {
      y = ensure(pdf, y, boxH + 12);
      doc.summary.slice(r * cols, r * cols + cols).forEach((s, i) => {
        const x = 40 + i * colW;
        pdf.setDrawColor(...BRAND.border);
        pdf.setFillColor(...BRAND.bg);
        pdf.roundedRect(x + 2, y, colW - 4, boxH, 6, 6, "FD");
        pdf.setFontSize(7.5);
        pdf.setTextColor(...BRAND.muted);
        pdf.setFont("helvetica", "normal");
        pdf.text(s.label, x + 10, y + 16, { maxWidth: colW - 20 });
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...BRAND.primary);
        pdf.text(s.value, x + 10, y + 34, { maxWidth: colW - 20 });
      });
      y += boxH + 10;
    }
    y += 8;
  }

  (doc.charts ?? []).forEach((ch) => {
    y = drawBarChart(pdf, ch, y);
  });

  doc.tables.forEach((t) => {
    y = ensure(pdf, y, 60);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...BRAND.dark);
    pdf.text(t.title, 40, y);
    y += 8;
    autoTable(pdf, {
      startY: y,
      margin: { left: 40, right: 40 },
      head: [t.columns.map((c) => c.label)],
      body: t.rows.map((r) => r.map((v, i) => (typeof v === "number" && t.columns[i]?.numeric !== false ? fmtNum(v, Number.isInteger(v) ? 0 : 2) : String(v)))),
      styles: { fontSize: 8, cellPadding: 4.5, textColor: BRAND.text, lineColor: BRAND.border },
      headStyles: { fillColor: BRAND.primary, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: BRAND.bg },
      columnStyles: Object.fromEntries(t.columns.map((c, i) => [i, { halign: c.align ?? (c.numeric ? "right" : "left") }])),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (pdf as any).lastAutoTable.finalY + 22;
  });

  if (doc.notes?.length) {
    y = ensure(pdf, y, 20 + doc.notes.length * 13);
    pdf.setFontSize(8);
    pdf.setTextColor(...BRAND.muted);
    pdf.setFont("helvetica", "normal");
    doc.notes.forEach((n) => {
      pdf.text(`• ${n}`, 40, y, { maxWidth: 515 });
      y += 13;
    });
  }

  pdfFooter(pdf, `Aruna ERP — ${doc.name}`);
  pdf.save(`aruna-erp-${slug(doc.name)}-${stamp()}.pdf`);
}

export type ExportFormat = "csv" | "xlsx" | "pdf";
export function exportDoc(doc: ExportDoc, format: ExportFormat) {
  if (format === "csv") exportCsv(doc);
  else if (format === "xlsx") exportXlsx(doc);
  else exportPdf(doc);
}

// ---------------------------------------------------------------------------
// Dokumen transaksi: Invoice, Purchase Order, Quotation / Sales Order
// ---------------------------------------------------------------------------
function docShell(pdf: jsPDF, kind: string, number: string, meta: [string, string][]) {
  pdf.setFillColor(...BRAND.primary);
  pdf.rect(0, 0, 595, 6, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...BRAND.text);
  pdf.text("PT Aruna Jaya Nuswantara", 40, 44);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...BRAND.muted);
  pdf.text("Hub Pelabuhan Bungus, Kec. Bungus Teluk Kabung, Padang, Sumatera Barat", 40, 58);
  pdf.text("operasional@arunajaya.co.id · (0751) 123-456", 40, 70);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(...BRAND.primary);
  pdf.text(kind.toUpperCase(), 555, 44, { align: "right" });
  pdf.setFontSize(10);
  pdf.setTextColor(...BRAND.text);
  pdf.text(number, 555, 60, { align: "right" });

  pdf.setDrawColor(...BRAND.border);
  pdf.line(40, 84, 555, 84);

  let y = 104;
  pdf.setFontSize(9);
  meta.forEach(([k, v], i) => {
    const col = i % 2;
    const x = 40 + col * 260;
    if (i > 0 && col === 0) y += 26;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...BRAND.muted);
    pdf.text(k, x, y);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...BRAND.text);
    pdf.text(v, x, y + 12, { maxWidth: 240 });
  });
  return y + 40;
}

function docTotals(pdf: jsPDF, y: number, rows: [string, string][], highlightLast = true) {
  rows.forEach(([k, v], i) => {
    const last = highlightLast && i === rows.length - 1;
    if (last) {
      pdf.setFillColor(...BRAND.bg);
      pdf.roundedRect(335, y - 12, 220, 22, 4, 4, "F");
    }
    pdf.setFont("helvetica", last ? "bold" : "normal");
    pdf.setFontSize(last ? 11 : 9);
    pdf.setTextColor(...(last ? BRAND.primary : BRAND.muted));
    pdf.text(k, 345, y + 3);
    pdf.setTextColor(...(last ? BRAND.primary : BRAND.text));
    pdf.text(v, 545, y + 3, { align: "right" });
    y += 22;
  });
  return y;
}

function docSign(pdf: jsPDF, y: number, left: string, right: string) {
  y = Math.max(y + 30, 640);
  pdf.setFontSize(9);
  pdf.setTextColor(...BRAND.muted);
  pdf.setFont("helvetica", "normal");
  [left, right].forEach((t, i) => {
    const x = 40 + i * 300;
    pdf.text(t, x, y);
    pdf.setDrawColor(...BRAND.border);
    pdf.line(x, y + 50, x + 180, y + 50);
    pdf.setTextColor(...BRAND.text);
    pdf.text(i === 0 ? "Nama & tanda tangan" : "Nama & tanda tangan", x, y + 62);
    pdf.setTextColor(...BRAND.muted);
  });
}

export function exportInvoicePdf(inv: Invoice, state: ErpState) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const isAr = inv.kind === "AR";
  const so = isAr ? state.salesOrders.find((s) => s.id === inv.refId) : undefined;
  const po = !isAr ? state.purchaseOrders.find((p) => p.id === inv.refId) : undefined;
  let y = docShell(pdf, isAr ? "Invoice" : "Tagihan Supplier", inv.id, [
    [isAr ? "Ditagihkan kepada" : "Dari supplier", inv.counterparty],
    ["Referensi", inv.refId],
    ["Tanggal terbit", inv.issuedDate],
    ["Jatuh tempo", inv.dueDate],
    ["Status", inv.status],
    ["Mata uang", "IDR (Rupiah)"],
  ]);

  const body: (string | number)[][] = [];
  if (so) {
    so.lines.forEach((l) => body.push([`${l.skuCode}`, `${fmtNum(l.qtyKg)} kg`, `US$${l.priceUsdPerKg.toFixed(2)}/kg`, fmtRpFull(l.qtyKg * l.priceUsdPerKg * KURS_USD)]));
  } else if (po) {
    po.lines.forEach((l) => {
      const it = state.items.find((i) => i.id === l.itemId);
      body.push([it?.name ?? l.itemId, `${fmtNum(l.qty)} ${it?.unit ?? ""}`, fmtRpFull(l.unitPrice), fmtRpFull(l.qty * l.unitPrice)]);
    });
  } else {
    body.push([`Tagihan ${inv.refId}`, "1", fmtRpFull(inv.amount), fmtRpFull(inv.amount)]);
  }
  autoTable(pdf, {
    startY: y,
    margin: { left: 40, right: 40 },
    head: [["Deskripsi", "Qty", "Harga", "Subtotal"]],
    body,
    styles: { fontSize: 9, cellPadding: 6, textColor: BRAND.text, lineColor: BRAND.border },
    headStyles: { fillColor: BRAND.primary, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: BRAND.bg },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (pdf as any).lastAutoTable.finalY + 24;
  const ppn = isAr && so && state.customers.find((c) => c.id === so.customerId)?.segment === "Domestik" ? Math.round(inv.amount * 0.11) : 0;
  y = docTotals(pdf, y, [
    ["Subtotal", fmtRpFull(inv.amount)],
    ["PPN 11%", ppn ? fmtRpFull(ppn) : "— (ekspor / tidak dikenakan)"],
    ["Total", fmtRpFull(inv.amount + ppn)],
  ]);
  pdf.setFontSize(8.5);
  pdf.setTextColor(...BRAND.muted);
  pdf.setFont("helvetica", "normal");
  pdf.text("Pembayaran ke: Bank Mandiri 123-00-4567890-1 a.n. PT Aruna Jaya Nuswantara. Cantumkan nomor invoice pada berita transfer.", 40, y + 8, { maxWidth: 515 });
  docSign(pdf, y, "Disiapkan oleh (Finance)", isAr ? "Diterima oleh (Customer)" : "Disetujui oleh (Finance Manager)");
  pdfFooter(pdf, `Aruna ERP — ${inv.id}`);
  pdf.save(`${slug(inv.id)}.pdf`);
}

export function exportPurchaseOrderPdf(po: PurchaseOrder, state: ErpState) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const sup = state.suppliers.find((s) => s.id === po.supplierId);
  const req = state.employees.find((e) => e.id === po.requestedBy);
  let y = docShell(pdf, "Purchase Order", po.id, [
    ["Supplier", sup?.name ?? po.supplierId],
    ["Kontak supplier", sup?.contact ?? "-"],
    ["Tanggal PO", po.date],
    ["Estimasi tiba", po.expectedDate],
    ["Diminta oleh", req ? `${req.name} (${req.position})` : po.requestedBy],
    ["Status", po.status],
  ]);
  autoTable(pdf, {
    startY: y,
    margin: { left: 40, right: 40 },
    head: [["Item", "Qty", "Harga satuan", "Subtotal"]],
    body: po.lines.map((l) => {
      const it = state.items.find((i) => i.id === l.itemId);
      return [it?.name ?? l.itemId, `${fmtNum(l.qty)} ${it?.unit ?? ""}`, fmtRpFull(l.unitPrice), fmtRpFull(l.qty * l.unitPrice)];
    }),
    styles: { fontSize: 9, cellPadding: 6, textColor: BRAND.text, lineColor: BRAND.border },
    headStyles: { fillColor: BRAND.primary, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: BRAND.bg },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (pdf as any).lastAutoTable.finalY + 24;
  y = docTotals(pdf, y, [["Total PO", fmtRpFull(po.total)]]);
  if (po.note) {
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND.muted);
    pdf.text(`Catatan: ${po.note}`, 40, y + 4, { maxWidth: 515 });
  }
  docSign(pdf, y, "Procurement", "Disetujui oleh (Finance)");
  pdfFooter(pdf, `Aruna ERP — ${po.id}`);
  pdf.save(`${slug(po.id)}.pdf`);
}

export function exportSalesOrderPdf(so: SalesOrder, state: ErpState, skuName: (c: string) => string) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const cus = state.customers.find((c) => c.id === so.customerId);
  const rep = state.employees.find((e) => e.id === so.salesRepId);
  const kind = so.status === "Quotation" ? "Quotation" : "Sales Order";
  let y = docShell(pdf, kind, so.id, [
    ["Customer", cus?.name ?? so.customerId],
    ["Negara / segmen", cus ? `${cus.country} · ${cus.segment}` : "-"],
    ["Tanggal", so.date],
    ["Jatuh tempo", so.dueDate],
    ["Sales", rep?.name ?? so.salesRepId],
    ["Termin", cus ? `${cus.paymentTermDays} hari` : "-"],
  ]);
  autoTable(pdf, {
    startY: y,
    margin: { left: 40, right: 40 },
    head: [["SKU", "Qty (kg)", "Harga (USD/kg)", "Subtotal (USD)"]],
    body: so.lines.map((l) => [skuName(l.skuCode), fmtNum(l.qtyKg), l.priceUsdPerKg.toFixed(2), fmtNum(l.qtyKg * l.priceUsdPerKg, 2)]),
    styles: { fontSize: 9, cellPadding: 6, textColor: BRAND.text, lineColor: BRAND.border },
    headStyles: { fillColor: BRAND.primary, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: BRAND.bg },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (pdf as any).lastAutoTable.finalY + 24;
  y = docTotals(pdf, y, [
    ["Total (USD)", `US$${fmtNum(so.totalUsd, 2)}`],
    [`Kurs acuan`, `Rp${fmtNum(KURS_USD)} / USD`],
    ["Ekuivalen (IDR)", fmtRpFull(so.totalUsd * KURS_USD)],
  ]);
  pdf.setFontSize(8.5);
  pdf.setTextColor(...BRAND.muted);
  pdf.text("Harga FOB Padang. Berlaku 14 hari sejak tanggal dokumen. Spesifikasi produk sesuai standar ekspor Aruna.", 40, y + 8, { maxWidth: 515 });
  docSign(pdf, y, "Sales (Aruna)", "Disetujui oleh (Customer)");
  pdfFooter(pdf, `Aruna ERP — ${so.id}`);
  pdf.save(`${slug(so.id)}.pdf`);
}
