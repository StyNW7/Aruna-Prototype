import { useState } from "react";
import { Bell, AlertTriangle, Info, CheckCircle2, XCircle, BellOff } from "lucide-react";
import { notifications as initialNotifications } from "@/data/notifications";
import { cn } from "@/lib/utils";

const severityIcon = {
  info: Info,
  warning: AlertTriangle,
  critical: XCircle,
  success: CheckCircle2,
};

const severityColor = {
  info: "text-aruna-secondary bg-aruna-light1",
  warning: "text-aruna-warning bg-aruna-warningBg",
  critical: "text-aruna-error bg-aruna-errorBg",
  success: "text-aruna-success bg-aruna-successBg",
};

export function NotificationDrawer() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(initialNotifications);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const unreadCount = notifs.filter((n) => !n.read).length;
  const visible = onlyUnread ? notifs.filter((n) => !n.read) : notifs;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifikasi, ${unreadCount} belum dibaca`}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-aruna-textSecondary transition-colors hover:border-aruna-border hover:bg-aruna-light1 hover:text-aruna-primary"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-aruna-error px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-aruna-border bg-white shadow-elevated animate-scale-in sm:w-96">
            <div className="flex items-center justify-between border-b border-aruna-border px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="font-display text-sm font-semibold text-aruna-text">Notifikasi</p>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-aruna-errorBg px-1.5 py-0.5 text-[10px] font-semibold text-aruna-error">{unreadCount} baru</span>
                )}
              </div>
              <button
                onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}
                disabled={unreadCount === 0}
                className="text-xs font-medium text-aruna-primary hover:underline disabled:text-aruna-textSecondary/60 disabled:no-underline"
              >
                Tandai semua dibaca
              </button>
            </div>
            <div className="flex gap-1 border-b border-aruna-border bg-aruna-bg px-3 py-2">
              {[
                { label: "Semua", value: false },
                { label: "Belum dibaca", value: true },
              ].map((f) => (
                <button
                  key={f.label}
                  onClick={() => setOnlyUnread(f.value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    onlyUnread === f.value ? "bg-aruna-primary text-white" : "text-aruna-textSecondary hover:bg-aruna-light1"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {visible.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <BellOff className="h-6 w-6 text-aruna-textSecondary/60" />
                  <p className="text-sm text-aruna-textSecondary">Semua notifikasi sudah dibaca.</p>
                </div>
              )}
              {visible.map((n) => {
                const Icon = severityIcon[n.severity];
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                    className={cn(
                      "flex w-full gap-3 border-b border-aruna-border/70 px-4 py-3 text-left last:border-0 hover:bg-aruna-light1/60",
                      !n.read && "bg-aruna-light1/40"
                    )}
                  >
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", severityColor[n.severity])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium text-aruna-text">
                        {n.title}
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-aruna-primary" />}
                      </p>
                      <p className="mt-0.5 text-xs text-aruna-textSecondary">{n.description}</p>
                      <p className="mt-1 text-[11px] text-aruna-textSecondary/70">{n.time}</p>
                    </div>
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
