import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
  variant?: "default" | "warning" | "error" | "success";
}

const variantMap = {
  default: "aruna-gradient",
  warning: "bg-aruna-warning",
  error: "bg-aruna-error",
  success: "bg-aruna-success",
};

export function Progress({ value, className, barClassName, variant = "default" }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-aruna-light1", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-300", variantMap[variant], barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
