import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, MapPin, CalendarDays } from "lucide-react";
import { navGroups } from "./nav-config";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationDrawer } from "./NotificationDrawer";
import { RoleSwitcher } from "./RoleSwitcher";
import { ProfileMenu } from "./ProfileMenu";
import { useAppContext } from "@/context/AppContext";
import { AppSwitcher } from "@/erp/components/AppSwitcher";

const allItems = navGroups.flatMap((g) => g.items);

function shiftLabel(h: number): string {
  if (h >= 6 && h < 14) return "Shift 1";
  if (h >= 14 && h < 22) return "Shift 2";
  return "Shift 3";
}

export function DashboardHeader() {
  const location = useLocation();
  const { setMobileDrawerOpen } = useAppContext();
  const current = allItems.find((i) => location.pathname.startsWith(i.href));
  const group = navGroups.find((g) => g.items.some((i) => i.href === current?.href));

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const dateLabel = new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "2-digit", month: "short" }).format(now);
  const timeLabel = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(now);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-aruna-border bg-white/85 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-aruna-text hover:bg-aruna-light1 lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <nav className="hidden items-center gap-1.5 whitespace-nowrap text-xs text-aruna-textSecondary sm:flex" aria-label="Breadcrumb">
            <Link to="/app/overview" className="transition-colors hover:text-aruna-primary">
              FISH Operations
            </Link>
            {group && (
              <span className="hidden items-center gap-1.5 2xl:flex">
                <span className="text-aruna-border">/</span>
                <span>{group.label}</span>
              </span>
            )}
            <span className="text-aruna-border">/</span>
            <span className="font-medium text-aruna-text">{current?.label ?? "Dashboard"}</span>
          </nav>
          <h2 className="truncate font-display text-base font-semibold text-aruna-text sm:hidden">
            {current?.label ?? "Dashboard"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 whitespace-nowrap xl:flex">
          <div className="hidden items-center gap-1.5 rounded-lg bg-aruna-light1 px-2.5 py-1.5 text-xs font-medium text-aruna-dark 2xl:flex">
            <MapPin className="h-3.5 w-3.5" />
            Hub Pelabuhan Bungus
          </div>
          <div
            className="flex items-center gap-1.5 rounded-lg border border-aruna-border bg-white px-2.5 py-1.5 text-xs font-medium text-aruna-text"
            title="Waktu lokal & shift aktif"
          >
            <CalendarDays className="h-3.5 w-3.5 text-aruna-primary" />
            {dateLabel} · {timeLabel}
            <span className="ml-1 rounded-full bg-aruna-successBg px-1.5 py-0.5 text-[10px] font-semibold text-aruna-success">
              {shiftLabel(now.getHours())}
            </span>
          </div>
        </div>
        <GlobalSearch />
        <AppSwitcher current="fish" />
        <NotificationDrawer />
        <RoleSwitcher />
        <ProfileMenu />
      </div>
    </header>
  );
}
