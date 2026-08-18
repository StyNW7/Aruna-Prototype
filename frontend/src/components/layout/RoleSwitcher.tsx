import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { roleDefinitions } from "@/data/roles";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const { role, setRole } = useAppContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-lg border border-aruna-border bg-white px-3 text-sm font-medium text-aruna-text hover:bg-aruna-light1"
      >
        {role}
        <ChevronDown className="h-3.5 w-3.5 text-aruna-textSecondary" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-aruna-border bg-white p-1.5 shadow-soft animate-fade-in">
            <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-aruna-textSecondary">
              Lihat sebagai role
            </p>
            {roleDefinitions.map((r) => (
              <button
                key={r.name}
                onClick={() => {
                  setRole(r.name);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-aruna-light1",
                  role === r.name ? "text-aruna-primary font-medium" : "text-aruna-text"
                )}
              >
                {r.name}
                {role === r.name && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
