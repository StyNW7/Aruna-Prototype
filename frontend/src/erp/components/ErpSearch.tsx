import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, CornerDownLeft, ShoppingCart, Handshake, Receipt, Boxes, Users, Building2, FileText, type LucideIcon } from "lucide-react";
import { useErp } from "../ErpContext";
import { ERP_NAV } from "../config";
import { ERP_REPORTS } from "../reports";
import { cn } from "@/lib/utils";

interface Hit {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: LucideIcon;
  group: string;
}

/** Pencarian global ERP (Ctrl/⌘+K): modul, PO, SO, invoice, item, karyawan, customer, supplier, laporan. */
export function ErpSearch() {
  const { state, supplierName, customerName, itemName } = useErp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const has = (...v: (string | undefined)[]) => v.some((x) => (x ?? "").toLowerCase().includes(s));
    const out: Hit[] = [];
    ERP_NAV.filter((n) => has(n.label, n.description)).forEach((n) => out.push({ id: n.href, label: n.label, sub: n.description, href: n.href, icon: n.icon, group: "Modul" }));
    ERP_REPORTS.filter((r) => has(r.name, r.description)).forEach((r) => out.push({ id: r.key, label: r.name, sub: "Laporan · preview / Excel / PDF", href: `/erp/reports?preview=${r.key}`, icon: FileText, group: "Laporan" }));
    state.purchaseOrders.filter((p) => has(p.id, supplierName(p.supplierId), p.status)).forEach((p) => out.push({ id: p.id, label: p.id, sub: `PO · ${supplierName(p.supplierId)} · ${p.status}`, href: "/erp/procurement", icon: ShoppingCart, group: "Procurement" }));
    state.salesOrders.filter((so) => has(so.id, customerName(so.customerId), so.status)).forEach((so) => out.push({ id: so.id, label: so.id, sub: `SO · ${customerName(so.customerId)} · ${so.status}`, href: "/erp/sales", icon: Handshake, group: "Sales" }));
    state.invoices.filter((i) => has(i.id, i.counterparty, i.refId)).forEach((i) => out.push({ id: i.id, label: i.id, sub: `${i.kind === "AR" ? "Piutang" : "Hutang"} · ${i.counterparty} · ${i.status}`, href: "/erp/finance", icon: Receipt, group: "Finance" }));
    state.items.filter((i) => has(i.id, i.name, i.location, i.category)).forEach((i) => out.push({ id: i.id, label: i.name, sub: `Stok ${i.stock.toLocaleString("id-ID")} ${i.unit} · ${i.location}`, href: "/erp/inventory", icon: Boxes, group: "Warehouse" }));
    state.employees.filter((e) => has(e.name, e.position, e.team)).forEach((e) => out.push({ id: e.id, label: e.name, sub: `${e.position} · ${e.team} · ${e.status}`, href: "/erp/hr", icon: Users, group: "HR" }));
    state.customers.filter((c) => has(c.name, c.country)).forEach((c) => out.push({ id: c.id, label: c.name, sub: `Customer · ${c.country} · ${c.segment}`, href: "/erp/sales", icon: Building2, group: "Sales" }));
    state.suppliers.filter((sp) => has(sp.name, sp.category, sp.city)).forEach((sp) => out.push({ id: sp.id, label: sp.name, sub: `Supplier · ${sp.category} · ${sp.city}`, href: "/erp/procurement", icon: Building2, group: "Procurement" }));
    state.workOrders.filter((w) => has(w.id, w.line, w.status)).forEach((w) => out.push({ id: w.id, label: w.id, sub: `WO · ${w.line} · ${w.status}`, href: "/erp/operations", icon: Boxes, group: "Operations" }));
    return out.slice(0, 12);
  }, [q, state, supplierName, customerName]);
  void itemName;

  const close = useCallback(() => { setOpen(false); setQ(""); setActive(0); }, []);
  const go = useCallback((h: Hit) => { navigate(h.href); close(); }, [navigate, close]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => !v); }
      else if (e.key === "Escape" && open) close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);
  useEffect(() => setActive(0), [q]);

  return (
    <div className="relative">
      <button onClick={() => setOpen(true)} aria-label="Cari di ERP (Ctrl+K)" className="flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-aruna-border bg-aruna-light1/60 text-sm text-aruna-textSecondary transition-colors hover:border-aruna-medium hover:bg-aruna-light1 md:w-56 md:justify-start md:px-3">
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden min-w-0 flex-1 truncate text-left md:inline">Cari PO, SO, invoice, item...</span>
        <kbd className="hidden rounded border border-aruna-border bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium md:inline">Ctrl K</kbd>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh] backdrop-blur-sm" onClick={close}>
          <div role="dialog" aria-label="Pencarian ERP" className="w-full max-w-xl overflow-hidden rounded-2xl border border-aruna-border bg-white shadow-elevated animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-aruna-border px-4 py-3">
              <Search className="h-4 w-4 text-aruna-textSecondary" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(hits.length - 1, i + 1)); }
                  else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
                  else if (e.key === "Enter" && hits[active]) { e.preventDefault(); go(hits[active]); }
                }}
                placeholder="Cari modul, laporan, PO, SO, invoice, item, karyawan, customer, supplier..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-aruna-textSecondary/60"
              />
              <button onClick={close} className="rounded-md p-1 text-aruna-textSecondary hover:bg-aruna-light1" aria-label="Tutup"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[22rem] overflow-y-auto p-2">
              {q.trim() === "" && (
                <div className="px-2 py-2">
                  <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-aruna-textSecondary">Modul ERP</p>
                  <div className="grid grid-cols-2 gap-1">
                    {ERP_NAV.slice(1, 9).map((m) => (
                      <button key={m.href} onClick={() => go({ id: m.href, label: m.label, sub: "", href: m.href, icon: m.icon, group: "Modul" })} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-aruna-text hover:bg-aruna-light1">
                        <m.icon className="h-4 w-4 text-aruna-primary" /> {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {q.trim() !== "" && hits.length === 0 && <p className="px-3 py-8 text-center text-sm text-aruna-textSecondary">Tidak ada hasil untuk “{q}”.</p>}
              {hits.map((h, i) => (
                <button key={`${h.group}-${h.id}`} onMouseEnter={() => setActive(i)} onClick={() => go(h)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors", i === active ? "bg-aruna-light1" : "hover:bg-aruna-light1/60")}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-aruna-primary shadow-sm ring-1 ring-aruna-border"><h.icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-aruna-text">{h.label}</span>
                    <span className="block truncate text-xs text-aruna-textSecondary">{h.sub}</span>
                  </span>
                  <span className="hidden rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-aruna-textSecondary ring-1 ring-aruna-border sm:inline">{h.group}</span>
                  {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-aruna-textSecondary" />}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-aruna-border bg-aruna-bg px-4 py-2 text-[11px] text-aruna-textSecondary">
              <span><kbd className="rounded border border-aruna-border bg-white px-1">↑↓</kbd> navigasi · <kbd className="rounded border border-aruna-border bg-white px-1">Enter</kbd> buka · <kbd className="rounded border border-aruna-border bg-white px-1">Esc</kbd> tutup</span>
              <span>{hits.length > 0 ? `${hits.length} hasil` : ""}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
