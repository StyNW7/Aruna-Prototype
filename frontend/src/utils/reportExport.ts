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
