import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Fish, Ship, Truck, FileText, X } from "lucide-react";
import { skus } from "@/data/skus";
import { supplyBatches } from "@/data/supply";
import { shipments } from "@/data/shipment";

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: typeof Fish;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const skuResults: SearchResult[] = skus
      .filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
      .map((s) => ({ id: s.code, label: s.name, sublabel: `SKU · ${s.category}`, href: "/app/optimizer", icon: Fish }));
    const batchResults: SearchResult[] = supplyBatches
      .filter((b) => b.id.toLowerCase().includes(q) || b.vessel.toLowerCase().includes(q))
      .map((b) => ({ id: b.id, label: b.id, sublabel: `Batch · ${b.vessel}`, href: "/app/supply", icon: Ship }));
    const shipmentResults: SearchResult[] = shipments
      .filter((s) => s.containerNo.toLowerCase().includes(q) || s.buyer.toLowerCase().includes(q))
      .map((s) => ({ id: s.id, label: s.containerNo, sublabel: `Shipment · ${s.buyer}`, href: "/app/shipment", icon: Truck }));
    const reportResults: SearchResult[] = ["Production Summary", "Energy Efficiency", "SKU Profitability"]
      .filter((r) => r.toLowerCase().includes(q))
      .map((r) => ({ id: r, label: r, sublabel: "Report", href: "/app/reports", icon: FileText }));

    return [...skuResults, ...batchResults, ...shipmentResults, ...reportResults].slice(0, 8);
  }, [query]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-48 items-center gap-2 rounded-lg border border-aruna-border bg-aruna-light1/60 px-3 text-sm text-aruna-textSecondary hover:bg-aruna-light1 sm:w-64"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Cari SKU, batch, shipment...</span>
        <span className="sm:hidden">Cari...</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 pt-24" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg rounded-xl border border-aruna-border bg-white shadow-soft animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-aruna-border px-4 py-3">
              <Search className="h-4 w-4 text-aruna-textSecondary" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari SKU, batch, vessel, shipment, report..."
                className="flex-1 text-sm outline-none placeholder:text-aruna-textSecondary/60"
              />
              <button onClick={() => setOpen(false)} className="text-aruna-textSecondary hover:text-aruna-text">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {query.trim() === "" && (
                <p className="px-3 py-6 text-center text-sm text-aruna-textSecondary">
                  Ketik untuk mencari SKU, batch, vessel, shipment, atau report.
                </p>
              )}
              {query.trim() !== "" && results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-aruna-textSecondary">Tidak ada hasil ditemukan.</p>
              )}
              {results.map((r) => (
                <button
                  key={`${r.id}-${r.label}`}
                  onClick={() => {
                    navigate(r.href);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-aruna-light1"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-aruna-light1 text-aruna-primary">
                    <r.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-aruna-text">{r.label}</p>
                    <p className="truncate text-xs text-aruna-textSecondary">{r.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
