import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Waves, Boxes, Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const APPS = [
  { key: "fish", label: "FISH Operations", desc: "Smart Operations Dashboard", href: "/app/overview", icon: Waves, tone: "aruna-gradient text-white" },
  { key: "erp", label: "Aruna ERP", desc: "Extended — lintas tim terintegrasi", href: "/erp", icon: Boxes, tone: "bg-slate-900 text-white" },
  { key: "site", label: "Situs Publik", desc: "Landing & informasi FISH", href: "/", icon: Globe, tone: "bg-aruna-light2 text-aruna-dark" },
] as const;

/** Tombol grid untuk berpindah antar aplikasi Aruna (FISH Operations ↔ ERP ↔ Situs). */
export function AppSwitcher({ current }: { current: "fish" | "erp" | "site" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Pindah aplikasi"
        title="Pindah aplikasi"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
          open ? "border-aruna-medium bg-aruna-light1 text-aruna-primary" : "border-transparent text-aruna-textSecondary hover:border-aruna-border hover:bg-aruna-light1 hover:text-aruna-primary"
        )}
      >
        <LayoutGrid className="h-4.5 w-4.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-aruna-border bg-white shadow-elevated animate-scale-in">
            <p className="border-b border-aruna-border bg-aruna-bg px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-aruna-textSecondary">
              Aplikasi Aruna
            </p>
            <div className="p-1.5">
              {APPS.map((app) => {
                const active = app.key === current;
                return (
                  <Link
                    key={app.key}
                    to={app.href}
                    onClick={() => setOpen(false)}
                    className={cn("flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-aruna-light1", active && "bg-aruna-light1/70")}
                  >
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm", app.tone)}>
                      <app.icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-aruna-text">{app.label}</span>
                      <span className="block truncate text-xs text-aruna-textSecondary">{app.desc}</span>
                    </span>
                    {active && <Check className="h-4 w-4 text-aruna-primary" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
