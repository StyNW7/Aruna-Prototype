import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Boxes, Menu, X, ArrowLeft, RotateCcw, Bell, Waves, ChevronRight, Sparkles } from "lucide-react";
import { ErpProvider, useErp } from "../ErpContext";
import { ERP_NAV, TEAM_META } from "../config";
import { AppSwitcher } from "./AppSwitcher";
import { currentUser } from "@/data/roles";
import { cn } from "@/lib/utils";

function ErpSidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const { derived, reset } = useErp();

  function handleReset() {
    reset();
    toast.success("Data demo ERP dikembalikan ke kondisi awal.");
    onNavigate?.();
  }

  return (
    <>
      <div className="px-4 py-5">
        <Link to="/erp" onClick={onNavigate} className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-tight text-aruna-text">Aruna ERP</p>
            <p className="flex items-center gap-1 text-[11px] text-aruna-textSecondary">
              <Sparkles className="h-3 w-3 text-aruna-secondary" />
              Extended Dashboard
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-aruna-textSecondary">Modul</p>
        {ERP_NAV.map((item) => {
          const meta = item.team ? TEAM_META[item.team] : null;
          const badge = item.href === "/erp/approvals" && derived.pendingApprovals > 0 ? derived.pendingApprovals : null;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/erp"}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                  isActive ? "bg-aruna-light1 text-aruna-primary shadow-[inset_0_0_0_1px_rgba(109,182,216,0.5)]" : "text-aruna-text hover:bg-aruna-bg"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-105",
                      meta ? meta.soft : "bg-aruna-light1 text-aruna-primary ring-aruna-light2",
                      isActive && "shadow-sm"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {badge !== null && (
                    <span className="rounded-full bg-aruna-error px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-aruna-border p-3">
        <Link
          to="/app/overview"
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-xl border border-aruna-border bg-aruna-bg p-3 transition-colors hover:border-aruna-medium hover:bg-aruna-light1"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg aruna-gradient text-white shadow-sm">
            <Waves className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-aruna-text">FISH Operations</span>
            <span className="block truncate text-[11px] text-aruna-textSecondary">Kembali ke dashboard utama</span>
          </span>
          <ArrowLeft className="h-4 w-4 text-aruna-textSecondary transition-transform group-hover:-translate-x-0.5" />
        </Link>
        <button
          type="button"
          onClick={handleReset}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-aruna-textSecondary transition-colors hover:bg-aruna-bg hover:text-aruna-error"
        >
          <RotateCcw className="h-3 w-3" />
          Reset data demo
        </button>
      </div>
    </>
  );
}

function ErpHeader({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { pathname } = useLocation();
  const { derived } = useErp();
  const current = ERP_NAV.find((n) => (n.href === "/erp" ? pathname === "/erp" : pathname.startsWith(n.href)));
  const meta = current?.team ? TEAM_META[current.team] : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-aruna-border bg-white/85 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onOpenMobile} className="flex h-9 w-9 items-center justify-center rounded-lg text-aruna-text hover:bg-aruna-light1 lg:hidden" aria-label="Buka menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <nav className="hidden items-center gap-1.5 whitespace-nowrap text-xs text-aruna-textSecondary sm:flex" aria-label="Breadcrumb">
            <Link to="/erp" className="transition-colors hover:text-aruna-primary">Aruna ERP</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-aruna-text">{current?.label ?? "Modul"}</span>
            {meta && (
              <span className={cn("ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", meta.soft)}>Tim {meta.label}</span>
            )}
          </nav>
          <p className="hidden truncate text-[11px] text-aruna-textSecondary sm:block">{current?.description}</p>
          <h2 className="truncate font-display text-base font-semibold text-aruna-text sm:hidden">{current?.label ?? "Aruna ERP"}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-aruna-border bg-white px-2.5 py-1 text-[11px] font-medium text-aruna-text lg:inline-flex">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-aruna-success" />
          Sinkron dengan FISH · realtime
        </span>
        <AppSwitcher current="erp" />
        <Link
          to="/erp/approvals"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-aruna-textSecondary transition-colors hover:border-aruna-border hover:bg-aruna-light1 hover:text-aruna-primary"
          aria-label={`${derived.pendingApprovals} approval menunggu`}
          title="Approval menunggu"
        >
          <Bell className="h-4.5 w-4.5" />
          {derived.pendingApprovals > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-aruna-error px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {derived.pendingApprovals}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 rounded-lg border border-aruna-border bg-white py-1 pl-1 pr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full aruna-gradient text-[11px] font-semibold text-white">{currentUser.avatarInitials}</span>
          <span className="hidden text-xs font-medium text-aruna-text sm:inline">{currentUser.name.split(" ")[0]}</span>
        </div>
      </div>
    </header>
  );
}

function ErpShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-svh bg-aruna-bg">
      <aside className="sticky top-0 hidden h-svh w-[264px] shrink-0 flex-col border-r border-aruna-border bg-white lg:flex">
        <ErpSidebarInner />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-svh w-[272px] flex-col bg-white shadow-xl animate-slide-in-left">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 text-aruna-textSecondary hover:text-aruna-text" aria-label="Tutup menu">
              <X className="h-5 w-5" />
            </button>
            <ErpSidebarInner onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <ErpHeader onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div key={pathname} className="animate-fade-up">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-aruna-border px-4 py-3 text-center text-[11px] text-aruna-textSecondary sm:px-6 lg:px-8">
          Aruna ERP — Extended Dashboard · Data tersimpan lokal di browser (prototype), seluruh angka bersifat ilustratif
        </footer>
      </div>
    </div>
  );
}

export default function ErpLayout() {
  return (
    <ErpProvider>
      <ErpShell />
    </ErpProvider>
  );
}
