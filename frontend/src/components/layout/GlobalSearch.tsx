import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Fish, Ship, Truck, FileText, X, CornerDownLeft, Clock, type LucideIcon } from "lucide-react";
import { skus } from "@/data/skus";
import { supplyBatches } from "@/data/supply";
import { shipments } from "@/data/shipment";
import { navGroups } from "./nav-config";
import { REPORT_DEFINITIONS } from "@/utils/reportData";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: LucideIcon;
  group: "Modul" | "SKU" | "Batch" | "Shipment" | "Report";
}

const RECENT_KEY = "aruna_recent_search";
const MAX_RESULTS = 10;

const moduleIndex: SearchResult[] = navGroups.flatMap((g) =>
  g.items.map((i) => ({
    id: i.href,
    label: i.label,
    sublabel: `Modul · ${g.label}`,
    href: i.href,
    icon: i.icon,
    group: "Modul" as const,
  }))
);

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>(() => readRecent());
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const moduleResults = moduleIndex.filter((m) => m.label.toLowerCase().includes(q) || m.sublabel.toLowerCase().includes(q));
    const skuResults: SearchResult[] = skus
      .filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
      .map((s) => ({ id: s.code, label: s.name, sublabel: `SKU · ${s.category}`, href: "/app/value", icon: Fish, group: "SKU" }));
    const batchResults: SearchResult[] = supplyBatches
      .filter((b) => b.id.toLowerCase().includes(q) || b.vessel.toLowerCase().includes(q))
      .map((b) => ({ id: b.id, label: b.id, sublabel: `Batch · ${b.vessel} · ${b.sizeGrade}`, href: "/app/supply", icon: Ship, group: "Batch" }));
    const shipmentResults: SearchResult[] = shipments
      .filter((s) => s.containerNo.toLowerCase().includes(q) || s.buyer.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
      .map((s) => ({ id: s.id, label: s.containerNo, sublabel: `Shipment · ${s.buyer}`, href: "/app/shipment", icon: Truck, group: "Shipment" }));
    const reportResults: SearchResult[] = REPORT_DEFINITIONS.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)).map(
      (r) => ({ id: r.name, label: r.name, sublabel: "Report · Preview / PDF / CSV", href: `/app/reports?preview=${encodeURIComponent(r.name)}`, icon: FileText, group: "Report" })
    );
    return [...moduleResults, ...skuResults, ...batchResults, ...shipmentResults, ...reportResults].slice(0, MAX_RESULTS);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const go = useCallback(
    (r: SearchResult) => {
      const next = [r.label, ...recent.filter((x) => x !== r.label)].slice(0, 5);
      setRecent(next);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* abaikan jika storage tidak tersedia */
      }
      navigate(r.href);
      close();
    },
    [navigate, recent, close]
  );

  // Shortcut global: Ctrl/Cmd + K untuk membuka, Esc untuk menutup
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="group flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-aruna-border bg-aruna-light1/60 text-sm text-aruna-textSecondary transition-colors hover:border-aruna-medium hover:bg-aruna-light1 sm:w-64 sm:justify-start sm:px-3"
        aria-label="Buka pencarian (Ctrl+K)"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden min-w-0 flex-1 truncate text-left sm:inline">Cari modul, SKU, batch...</span>
        <kbd className="hidden rounded border border-aruna-border bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-aruna-textSecondary sm:inline">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
        >
          <div
            role="dialog"
            aria-label="Pencarian global"
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-aruna-border bg-white shadow-elevated animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-aruna-border px-4 py-3">
              <Search className="h-4 w-4 text-aruna-textSecondary" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Cari modul, SKU, batch, vessel, shipment, atau report..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-aruna-textSecondary/60"
                aria-activedescendant={results[active] ? `search-opt-${active}` : undefined}
              />
              <button onClick={close} className="rounded-md p-1 text-aruna-textSecondary hover:bg-aruna-light1 hover:text-aruna-text" aria-label="Tutup">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={listRef} className="max-h-[22rem] overflow-y-auto p-2">
              {query.trim() === "" && (
                <div className="px-2 py-2">
                  {recent.length > 0 && (
                    <>
                      <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-aruna-textSecondary">Pencarian terakhir</p>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {recent.map((r) => (
                          <button
                            key={r}
                            onClick={() => setQuery(r)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-aruna-border bg-white px-2.5 py-1 text-xs text-aruna-text hover:bg-aruna-light1"
                          >
                            <Clock className="h-3 w-3 text-aruna-textSecondary" />
                            {r}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-aruna-textSecondary">Modul populer</p>
                  <div className="grid grid-cols-2 gap-1">
                    {moduleIndex.slice(1, 7).map((m) => (
                      <button
                        key={m.href}
                        onClick={() => go(m)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-aruna-text hover:bg-aruna-light1"
                      >
                        <m.icon className="h-4 w-4 text-aruna-primary" />
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() !== "" && results.length === 0 && (
                <div className="px-3 py-10 text-center">
                  <p className="text-sm font-medium text-aruna-text">Tidak ada hasil untuk “{query}”.</p>
                  <p className="mt-1 text-xs text-aruna-textSecondary">Coba kata kunci lain: nama modul, kode SKU, ID batch, vessel, buyer, atau nama report.</p>
                </div>
              )}

              {results.map((r, i) => (
                <button
                  key={`${r.group}-${r.id}`}
                  id={`search-opt-${i}`}
                  data-index={i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    i === active ? "bg-aruna-light1" : "hover:bg-aruna-light1/60"
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-aruna-primary shadow-sm ring-1 ring-aruna-border">
                    <r.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-aruna-text">{r.label}</p>
                    <p className="truncate text-xs text-aruna-textSecondary">{r.sublabel}</p>
                  </div>
                  <span className="hidden rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-aruna-textSecondary ring-1 ring-aruna-border sm:inline">
                    {r.group}
                  </span>
                  {i === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-aruna-textSecondary" />}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-aruna-border bg-aruna-bg px-4 py-2 text-[11px] text-aruna-textSecondary">
              <span className="flex items-center gap-3">
                <span><kbd className="rounded border border-aruna-border bg-white px-1">↑</kbd> <kbd className="rounded border border-aruna-border bg-white px-1">↓</kbd> navigasi</span>
                <span><kbd className="rounded border border-aruna-border bg-white px-1">Enter</kbd> buka</span>
                <span><kbd className="rounded border border-aruna-border bg-white px-1">Esc</kbd> tutup</span>
              </span>
              <span>{results.length > 0 ? `${results.length} hasil` : ""}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
