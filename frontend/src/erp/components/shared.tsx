import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TEAM_META } from "../config";
import type { Activity, ErpTeam } from "../types";
import { cn } from "@/lib/utils";

export function TeamChip({ team, className }: { team: ErpTeam; className?: string }) {
  const m = TEAM_META[team];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", m.soft, className)}>
      <m.icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

const toneIcon = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle } as const;
const toneClass = {
  info: "bg-aruna-light1 text-aruna-secondary",
  success: "bg-aruna-successBg text-aruna-success",
  warning: "bg-aruna-warningBg text-aruna-warning",
  error: "bg-aruna-errorBg text-aruna-error",
} as const;

export function ActivityFeed({ activities, limit = 8, compact = false }: { activities: Activity[]; limit?: number; compact?: boolean }) {
  const list = activities.slice(0, limit);
  if (list.length === 0) return <p className="px-5 py-8 text-center text-sm text-aruna-textSecondary">Belum ada aktivitas.</p>;
  return (
    <ol className="relative">
      {list.map((a, i) => {
        const Icon = toneIcon[a.tone];
        return (
          <li key={a.id} className={cn("relative flex gap-3 px-5", compact ? "py-2.5" : "py-3", i < list.length - 1 && "border-b border-aruna-border/70")}>
            <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", toneClass[a.tone])}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-aruna-text">{a.text}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-aruna-textSecondary">
                <TeamChip team={a.team} />
                {a.ref && <span className="rounded bg-aruna-bg px-1.5 py-0.5 font-mono">{a.ref}</span>}
                <span>{relativeTime(a.time)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({ title, description, icon, action, children, className, bodyClassName }: SectionCardProps) {
  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-aruna-border px-5 py-4">
        <div className="flex min-w-0 items-start gap-2.5">
          {icon}
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-aruna-text">{title}</p>
            {description && <p className="mt-0.5 text-xs text-aruna-textSecondary">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className={cn("flex-1", bodyClassName)}>{children}</div>
    </Card>
  );
}

export function ModuleLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-xs font-medium text-aruna-primary hover:underline">
      {label}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-aruna-text">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-aruna-textSecondary">{hint}</p>}
    </div>
  );
}

export function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

export function ErpPageHeader({
  team,
  title,
  subtitle,
  actions,
}: {
  team?: ErpTeam;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  const meta = team ? TEAM_META[team] : null;
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        {meta && (
          <span className={cn("mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md", meta.solid)}>
            <meta.icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-aruna-text sm:text-[28px]">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-aruna-textSecondary">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
