import { useState } from "react";
import { Bell, AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
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
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-aruna-textSecondary hover:bg-aruna-light1 hover:text-aruna-primary"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-aruna-error" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-aruna-border bg-white shadow-soft animate-fade-in sm:w-96">
            <div className="flex items-center justify-between border-b border-aruna-border px-4 py-3">
              <p className="font-display text-sm font-semibold text-aruna-text">Notifikasi</p>
              <button
                onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}
                className="text-xs font-medium text-aruna-primary hover:underline"
              >
                Tandai semua dibaca
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifs.map((n) => {
                const Icon = severityIcon[n.severity];
                return (
                  <div
                    key={n.id}
                    className={cn("flex gap-3 border-b border-aruna-border/70 px-4 py-3 last:border-0", !n.read && "bg-aruna-light1/40")}
                  >
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", severityColor[n.severity])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-aruna-text">{n.title}</p>
                      <p className="mt-0.5 text-xs text-aruna-textSecondary">{n.description}</p>
                      <p className="mt-1 text-[11px] text-aruna-textSecondary/70">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
