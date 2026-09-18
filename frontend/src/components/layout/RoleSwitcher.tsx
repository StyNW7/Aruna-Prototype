import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDown, Check, UserCog, ArrowRight } from "lucide-react";
import { roleDefinitions } from "@/data/roles";
import { useAppContext } from "@/context/AppContext";
import type { RoleName } from "@/types";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const { role, setRole } = useAppContext();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function choose(next: RoleName) {
    setOpen(false);
    if (next === role) return;
    const def = roleDefinitions.find((r) => r.name === next);
    setRole(next);
    toast.success(
      (t) => (
        <span className="text-sm">
          Tampilan diubah ke <strong>{next}</strong>.{" "}
          {def && (
            <button
              className="ml-1 inline-flex items-center gap-1 font-medium text-aruna-primary hover:underline"
              onClick={() => {
                toast.dismiss(t.id);
                navigate(def.defaultRoute);
              }}
            >
              Buka {def.focusAreas[0]}
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </span>
      ),
      { duration: 5000 }
    );
  }

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-lg border border-aruna-border bg-white px-3 text-sm font-medium text-aruna-text transition-colors hover:border-aruna-medium hover:bg-aruna-light1"
      >
        <UserCog className="h-4 w-4 text-aruna-primary" />
        <span className="max-w-[9rem] truncate">{role}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-aruna-textSecondary transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-aruna-border bg-white shadow-elevated animate-scale-in"
          >
            <div className="border-b border-aruna-border bg-aruna-bg px-3.5 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-aruna-textSecondary">Lihat dashboard sebagai</p>
              <p className="mt-0.5 text-xs text-aruna-textSecondary">Sidebar menandai modul fokus (★) untuk setiap peran.</p>
            </div>
            <div className="max-h-[22rem] overflow-y-auto p-1.5">
              {roleDefinitions.map((r) => {
                const active = role === r.name;
                return (
                  <button
                    key={r.name}
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => choose(r.name)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-aruna-light1",
                      active && "bg-aruna-light1/70"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        active ? "border-aruna-primary bg-aruna-primary text-white" : "border-aruna-border bg-white"
                      )}
                    >
                      {active && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm", active ? "font-semibold text-aruna-primary" : "font-medium text-aruna-text")}>
                        {r.name}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-aruna-textSecondary">{r.description}</span>
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        {r.focusAreas.slice(0, 3).map((f) => (
                          <span key={f} className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-aruna-textSecondary ring-1 ring-aruna-border">
                            {f}
                          </span>
                        ))}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
