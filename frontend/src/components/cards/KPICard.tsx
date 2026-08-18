import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
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
}

export function KPICard({ label, value, icon: Icon, deltaLabel, deltaDirection, deltaTone = "positive", helperText }: KPICardProps) {
  const isGood = deltaTone === "positive";
  return (
    <Card className="p-5 transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-aruna-textSecondary">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aruna-light1 text-aruna-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-aruna-text">{value}</p>
      <div className="mt-2 flex items-center gap-1.5">
        {deltaLabel && deltaDirection && deltaDirection !== "neutral" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              isGood ? "text-aruna-success" : "text-aruna-error"
            )}
          >
            {deltaDirection === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {deltaLabel}
          </span>
        )}
        {helperText && <span className="text-xs text-aruna-textSecondary">{helperText}</span>}
      </div>
    </Card>
  );
}
