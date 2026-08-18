import { Link, useLocation } from "react-router-dom";
import { Menu, MapPin } from "lucide-react";
import { navGroups } from "./nav-config";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationDrawer } from "./NotificationDrawer";
import { RoleSwitcher } from "./RoleSwitcher";
import { ProfileMenu } from "./ProfileMenu";
import { useAppContext } from "@/context/AppContext";

const allItems = navGroups.flatMap((g) => g.items);

export function DashboardHeader() {
  const location = useLocation();
  const { setMobileDrawerOpen } = useAppContext();
  const current = allItems.find((i) => location.pathname.startsWith(i.href));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-aruna-border bg-white/85 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-aruna-text hover:bg-aruna-light1 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <nav className="hidden items-center gap-1 text-xs text-aruna-textSecondary sm:flex">
            <Link to="/app/overview" className="transition-colors hover:text-aruna-primary">
              FISH Operations
            </Link>
            <span>/</span>
            <span className="text-aruna-text">{current?.label ?? "Dashboard"}</span>
          </nav>
          <h2 className="truncate font-display text-base font-semibold text-aruna-text sm:hidden">
            {current?.label ?? "Dashboard"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-1.5 rounded-lg bg-aruna-light1 px-2.5 py-1.5 text-xs font-medium text-aruna-dark md:flex">
          <MapPin className="h-3.5 w-3.5" />
          Hub Pelabuhan Bungus
        </div>
        <GlobalSearch />
        <NotificationDrawer />
        <RoleSwitcher />
        <ProfileMenu />
      </div>
    </header>
  );
}
