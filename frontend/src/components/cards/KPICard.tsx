import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  deltaLabel?: string;
  deltaDirection?: "up" | "down" | "neutral";
  deltaTone?: "positive" | "negative"; // apakah delta ini hal baik atau buruk bagi bisnis
  helperText?: string;
  /** Deret nilai kecil untuk sparkline (opsional) */
  sparkline?: number[];
  /** Warna aksen ikon & sparkline */
  accent?: "primary" | "success" | "warning" | "error";
  className?: string;
}

const accentClass: Record<NonNullable<KPICardProps["accent"]>, { chip: string; stroke: string }> = {
  primary: { chip: "bg-aruna-light1 text-aruna-primary", stroke: "#358EBD" },
  success: { chip: "bg-aruna-successBg text-aruna-success", stroke: "#1E8E5A" },
  warning: { chip: "bg-aruna-warningBg text-aruna-warning", stroke: "#C2760A" },
  error: { chip: "bg-aruna-errorBg text-aruna-error", stroke: "#D8342A" },
};

function Sparkline({ data, stroke, id }: { data: number[]; stroke: string; id: string }) {
  if (data.length < 2) return null;
  const w = 96;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2] as const);
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const last = points[points.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-20 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2.2} fill={stroke} />
    </svg>
  );
}

export function KPICard({
  label,
  value,
  icon: Icon,
  deltaLabel,
  deltaDirection,
  deltaTone = "positive",
  helperText,
  sparkline,
  accent = "primary",
  className,
}: KPICardProps) {
  const isGood = deltaTone === "positive";
  const tone = accentClass[accent];
  const gradientId = `spark-${label.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;

  return (
    <Card className={cn("group relative overflow-hidden p-5 hover-lift", className)}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-aruna-light1/70 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-aruna-textSecondary">{label}</p>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tone.chip)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="relative mt-3 whitespace-nowrap font-display text-2xl font-bold tracking-tight text-aruna-text">{value}</p>
      <div className="relative mt-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {deltaLabel && deltaDirection && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                deltaDirection === "neutral"
                  ? "bg-slate-100 text-slate-600"
                  : isGood
                    ? "bg-aruna-successBg text-aruna-success"
                    : "bg-aruna-errorBg text-aruna-error"
              )}
            >
              {deltaDirection === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : deltaDirection === "down" ? (
                <ArrowDownRight className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {deltaLabel}
            </span>
          )}
          {helperText && <span className="text-xs text-aruna-textSecondary">{helperText}</span>}
        </div>
        {sparkline && <Sparkline data={sparkline} stroke={tone.stroke} id={gradientId} />}
      </div>
    </Card>
  );
}
