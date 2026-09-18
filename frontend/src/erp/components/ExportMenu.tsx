import { useState } from "react";
import toast from "react-hot-toast";
import { Download, FileSpreadsheet, FileText, Sheet, ChevronDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportDoc, type ExportDoc, type ExportFormat } from "../export";
import { cn } from "@/lib/utils";

interface ExportMenuProps {
  /** Dokumen dibangun saat diklik agar selalu memakai data terbaru */
  getDoc: () => ExportDoc;
  label?: string;
  size?: "sm" | "default";
  variant?: "outline" | "default" | "ghost";
  onPreview?: () => void;
  onExported?: (format: ExportFormat, doc: ExportDoc) => void;
  align?: "left" | "right";
  className?: string;
}

const FORMATS: { key: ExportFormat; label: string; desc: string; icon: typeof Sheet }[] = [
  { key: "xlsx", label: "Excel (.xlsx)", desc: "Multi-sheet, autofilter, format angka", icon: FileSpreadsheet },
  { key: "pdf", label: "PDF (.pdf)", desc: "Header brand, ringkasan, chart & tabel", icon: FileText },
  { key: "csv", label: "CSV (.csv)", desc: "Teks ringan untuk sistem lain", icon: Sheet },
];

/** Tombol dropdown export yang benar-benar mengunduh file (Excel / PDF / CSV). */
export function ExportMenu({ getDoc, label = "Export", size = "sm", variant = "outline", onPreview, onExported, align = "right", className }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);

  async function run(format: ExportFormat) {
    setBusy(format);
    setOpen(false);
    try {
      const doc = getDoc();
      // beri kesempatan UI menampilkan status sebelum proses sinkron
      await new Promise((r) => setTimeout(r, 30));
      exportDoc(doc, format);
      onExported?.(format, doc);
      toast.success(`${FORMATS.find((f) => f.key === format)?.label} "${doc.name}" berhasil diunduh.`);
    } catch (e) {
      toast.error("Gagal membuat file export.");
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Button size={size} variant={variant} onClick={() => setOpen((v) => !v)} disabled={busy !== null} aria-haspopup="menu" aria-expanded={open}>
        {busy ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Download className="h-3.5 w-3.5" />}
        {busy ? "Menyiapkan..." : label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className={cn("absolute z-50 mt-2 w-64 overflow-hidden rounded-xl border border-aruna-border bg-white p-1.5 shadow-elevated animate-scale-in", align === "right" ? "right-0" : "left-0")}>
            {onPreview && (
              <>
                <button role="menuitem" onClick={() => { setOpen(false); onPreview(); }} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-aruna-light1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-aruna-light1 text-aruna-primary"><Eye className="h-4 w-4" /></span>
                  <span className="min-w-0"><span className="block text-sm font-medium text-aruna-text">Preview</span><span className="block text-[11px] text-aruna-textSecondary">Lihat ringkasan, chart, dan tabel</span></span>
                </button>
                <div className="my-1 border-t border-aruna-border" />
              </>
            )}
            {FORMATS.map((f) => (
              <button key={f.key} role="menuitem" onClick={() => run(f.key)} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-aruna-light1">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-aruna-light1 text-aruna-primary"><f.icon className="h-4 w-4" /></span>
                <span className="min-w-0"><span className="block text-sm font-medium text-aruna-text">{f.label}</span><span className="block text-[11px] text-aruna-textSecondary">{f.desc}</span></span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
