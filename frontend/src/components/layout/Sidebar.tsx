import { NavLink } from "react-router-dom";
import { Waves, PanelLeftClose, PanelLeftOpen, LogOut, X } from "lucide-react";
import { navGroups } from "./nav-config";
import { useAppContext } from "@/context/AppContext";
import { currentUser } from "@/data/roles";
import { cn } from "@/lib/utils";

function SidebarInner({ collapsed }: { collapsed: boolean }) {
  return (
    <>
      <div className={cn("flex items-center gap-2.5 px-4 py-5", collapsed && "justify-center px-2")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg aruna-gradient text-white shadow-sm">
          <Waves className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-tight text-white">FISH Operations</p>
            <p className="truncate text-xs text-white/60">Hub Bungus</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 pb-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      collapsed && "justify-center",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )
                  }
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("border-t border-white/10 p-3", collapsed && "flex flex-col items-center")}>
        <div className={cn("flex items-center gap-2.5 rounded-lg px-2 py-2", !collapsed && "hover:bg-white/5")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">
            {currentUser.avatarInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
              <p className="truncate text-xs text-white/50">{currentUser.role}</p>
            </div>
          )}
          {!collapsed && (
            <button className="text-white/50 hover:text-white" title="Keluar">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
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
          sidebarCollapsed ? "w-[76px]" : "w-[272px]"
        )}
      >
        <SidebarInner collapsed={sidebarCollapsed} />
        <button
          onClick={toggleSidebarCollapsed}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-aruna-border bg-white text-aruna-primary shadow-sm hover:bg-aruna-light1"
          title={sidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-svh w-[272px] flex-col bg-aruna-dark shadow-xl animate-fade-in">
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute right-3 top-4 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarInner collapsed={false} />
          </aside>
        </div>
      )}
    </>
  );
}
