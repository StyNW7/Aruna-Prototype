import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportDoc } from "@/utils/reportData";

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportReportCsv(report: ReportDoc) {
  const lines: string[] = [];
  lines.push(csvEscape(`Aruna FISH Operations — ${report.name}`));
  lines.push(csvEscape(`Periode: ${report.period}`));
  lines.push(csvEscape(`Dibuat: ${report.generatedAt}`));
  lines.push("");

  if (report.summary.length) {
    lines.push("Ringkasan");
    report.summary.forEach((s) => lines.push([csvEscape(s.label), csvEscape(s.value)].join(",")));
    lines.push("");
  }

  report.tables.forEach((table) => {
    lines.push(csvEscape(table.title));
    lines.push(table.columns.map((c) => csvEscape(c.label)).join(","));
    table.rows.forEach((row) => lines.push(row.map(csvEscape).join(",")));
    lines.push("");
  });

  if (report.notes?.length) {
    lines.push("Catatan");
    report.notes.forEach((n) => lines.push(csvEscape(n)));
  }

  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `aruna-${slug(report.name)}-${slug(report.period)}.csv`);
}

export function exportReportPdf(report: ReportDoc) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 48;

  doc.setFillColor(1, 96, 151);
  doc.rect(0, 0, 595, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("Aruna FISH Operations", marginX, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(report.name, marginX, y);
  y += 16;

  doc.setFontSize(9);
  doc.text(`Periode: ${report.period}    |    Dibuat: ${report.generatedAt}`, marginX, y);
  y += 18;

  if (report.summary.length) {
    doc.setDrawColor(227, 234, 240);
    doc.setFillColor(247, 250, 252);
    const boxH = 46;
    doc.roundedRect(marginX, y, 515, boxH, 6, 6, "FD");
    const colW = 515 / report.summary.length;
    report.summary.forEach((s, i) => {
      const x = marginX + i * colW + 10;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(s.label, x, y + 18, { maxWidth: colW - 16 });
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(1, 96, 151);
      doc.text(s.value, x, y + 34, { maxWidth: colW - 16 });
      doc.setFont("helvetica", "normal");
    });
    y += boxH + 20;
  }

  report.tables.forEach((table) => {
    if (y > 740) {
      doc.addPage();
      y = 48;
    }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(1, 75, 119);
    doc.text(table.title, marginX, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      margin: { left: marginX, right: 40 },
      head: [table.columns.map((c) => c.label)],
      body: table.rows,
      styles: { fontSize: 8, cellPadding: 5, textColor: [30, 41, 59] },
      headStyles: { fillColor: [1, 96, 151], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [247, 250, 252] },
      columnStyles: Object.fromEntries(
        table.columns.map((c, i) => [i, { halign: c.align ?? "left" }])
      ),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 24;
  });

  if (report.notes?.length) {
    if (y > 740) {
      doc.addPage();
      y = 48;
    }
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    report.notes.forEach((n) => {
      doc.text(`• ${n}`, marginX, y, { maxWidth: 515 });
      y += 14;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Aruna FISH Operations — Dokumen ilustratif (data mock) — Halaman ${i} dari ${pageCount}`,
      marginX,
      812
    );
  }

  doc.save(`aruna-${slug(report.name)}-${slug(report.period)}.pdf`);
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Membuka jendela cetak khusus yang hanya berisi laporan (tanpa sidebar/header dashboard),
 * lalu memanggil dialog print browser.
 */
export function printReport(report: ReportDoc): boolean {
  const win = window.open("", "_blank", "width=960,height=720");
  if (!win) return false;

  const summaryHtml = report.summary.length
    ? `<div class="summary">${report.summary
        .map((s) => `<div class="tile"><div class="label">${escapeHtml(s.label)}</div><div class="value">${escapeHtml(s.value)}</div></div>`)
        .join("")}</div>`
    : "";

  const tablesHtml = report.tables
    .map(
      (t) => `
      <section>
        <h2>${escapeHtml(t.title)}</h2>
        <table>
          <thead><tr>${t.columns.map((c) => `<th class="${c.align ?? "left"}">${escapeHtml(c.label)}</th>`).join("")}</tr></thead>
          <tbody>${t.rows
            .map(
              (row) =>
                `<tr>${row
                  .map((cell, i) => `<td class="${t.columns[i]?.align ?? "left"}">${escapeHtml(cell)}</td>`)
                  .join("")}</tr>`
            )
            .join("")}</tbody>
        </table>
      </section>`
    )
    .join("");

  const notesHtml = report.notes?.length
    ? `<ul class="notes">${report.notes.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>`
    : "";

  win.document.write(`<!doctype html>
<html lang="id"><head><meta charset="utf-8" />
<title>${escapeHtml(report.name)} — Aruna FISH</title>
<style>
  @page { margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Inter, "Segoe UI", system-ui, sans-serif; color: #1e293b; margin: 0; padding: 32px; font-size: 12px; }
  .bar { height: 6px; background: linear-gradient(90deg,#016097,#358ebd); border-radius: 4px; margin-bottom: 20px; }
  h1 { font-size: 20px; margin: 0 0 2px; }
  .sub { color: #64748b; font-size: 12px; margin: 0 0 4px; }
  .meta { color: #64748b; font-size: 11px; margin-bottom: 18px; }
  .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
  .tile { border: 1px solid #e3eaf0; background: #f7fafc; border-radius: 8px; padding: 10px 12px; }
  .tile .label { font-size: 10px; color: #64748b; }
  .tile .value { font-size: 14px; font-weight: 700; color: #016097; margin-top: 2px; }
  section { margin-bottom: 22px; page-break-inside: avoid; }
  h2 { font-size: 13px; color: #014b77; margin: 0 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 6px 8px; border-bottom: 1px solid #e3eaf0; font-size: 11px; }
  th { background: #016097; color: #fff; text-align: left; font-weight: 600; }
  tr:nth-child(even) td { background: #f7fafc; }
  .right { text-align: right; font-variant-numeric: tabular-nums; }
  .center { text-align: center; }
  .notes { color: #64748b; font-size: 10.5px; padding-left: 16px; margin-top: 8px; }
  .footer { margin-top: 28px; color: #94a3b8; font-size: 10px; border-top: 1px solid #e3eaf0; padding-top: 8px; }
</style></head>
<body>
  <div class="bar"></div>
  <h1>Aruna FISH Operations</h1>
  <p class="sub">${escapeHtml(report.name)}</p>
  <p class="meta">Periode: ${escapeHtml(report.period)} &nbsp;|&nbsp; Dibuat: ${escapeHtml(report.generatedAt)}</p>
  ${summaryHtml}
  ${tablesHtml}
  ${notesHtml}
  <p class="footer">Aruna FISH Operations — Dokumen ilustratif (data mock) untuk kebutuhan business case competition.</p>
  <script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 150); });</script>
</body></html>`);
  win.document.close();
  win.focus();
  return true;
}
