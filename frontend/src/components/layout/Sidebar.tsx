import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Waves, PanelLeftClose, PanelLeftOpen, LogOut, X, Home, Star } from "lucide-react";
import { navGroups } from "./nav-config";
import { useAppContext } from "@/context/AppContext";
import { currentUser, roleDefinitions } from "@/data/roles";
import { cn } from "@/lib/utils";

function SidebarInner({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { role } = useAppContext();
  const roleDef = roleDefinitions.find((r) => r.name === role);
  const focus = new Set(roleDef?.focusAreas ?? []);

  function handleLogout() {
    toast.success("Anda telah keluar dari FISH Operations.");
    navigate("/masuk");
  }

  return (
    <>
      <div className={cn("px-3 py-5", collapsed && "px-2")}>
        <Link
          to="/"
          title="Kembali ke Situs Utama Aruna FISH"
          className={cn(
            "group flex items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-white/5",
            collapsed && "justify-center"
          )}
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg aruna-gradient text-white shadow-glow">
            <Waves className="h-5 w-5 transition-opacity group-hover:opacity-0" />
            <Home className="absolute h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-sm font-bold leading-tight text-white">FISH Operations</p>
              <p className="truncate text-xs text-white/60">Hub Bungus</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 pb-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {group.label}
              </p>
            ) : (
              <div className="mx-auto mb-2 h-px w-6 bg-white/10" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isFocus = focus.has(item.label);
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group/item relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                        collapsed && "justify-center",
                        isActive
                          ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cn(
                            "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-aruna-medium transition-all",
                            isActive ? "opacity-100" : "opacity-0 group-hover/item:opacity-60"
                          )}
                        />
                        <item.icon
                          className={cn(
                            "h-4.5 w-4.5 shrink-0 transition-transform",
                            !isActive && "group-hover/item:scale-110"
                          )}
                        />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {!collapsed && isFocus && (
                          <Star
                            className="h-3 w-3 shrink-0 fill-aruna-medium text-aruna-medium"
                            aria-label={`Fokus ${role}`}
                          />
                        )}
                        {collapsed && isFocus && (
                          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-aruna-medium" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("border-t border-white/10 p-3", collapsed && "flex flex-col items-center gap-2")}>
        <div className={cn("flex items-center gap-2.5 rounded-lg px-2 py-2", !collapsed && "hover:bg-white/5")}>
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">
            {currentUser.avatarInitials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-aruna-dark bg-aruna-success" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
              <p className="truncate text-xs text-white/50">{role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapsed, mobileDrawerOpen, setMobileDrawerOpen } = useAppContext();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col bg-aruna-dark transition-all duration-200 lg:flex",
          "bg-[radial-gradient(circle_at_top,rgba(53,142,189,0.22),transparent_60%)]",
          sidebarCollapsed ? "w-[76px]" : "w-[272px]"
        )}
      >
        <SidebarInner collapsed={sidebarCollapsed} />
        <button
          onClick={toggleSidebarCollapsed}
          className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-aruna-border bg-white text-aruna-primary shadow-sm transition-colors hover:bg-aruna-light1"
          title={sidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
          aria-label={sidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-svh w-[272px] flex-col bg-aruna-dark shadow-xl animate-slide-in-left">
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute right-3 top-4 text-white/70 hover:text-white"
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarInner collapsed={false} onNavigate={() => setMobileDrawerOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
