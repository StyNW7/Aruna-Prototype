import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-aruna-border bg-white px-3 py-2 text-sm text-aruna-text shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-colors placeholder:text-aruna-textSecondary/60 hover:border-aruna-medium/70 focus:border-aruna-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "aruna-select flex h-10 w-full rounded-lg border border-aruna-border bg-white px-3 py-2 text-sm text-aruna-text transition-colors hover:border-aruna-medium/70 focus:border-aruna-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium text-aruna-text", className)} {...props} />
  )
);
Label.displayName = "Label";

export const Slider = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, style, ...props }, ref) => {
    // Persentase isi track untuk gradien (dihitung dari value/min/max)
    const min = Number(props.min ?? 0);
    const max = Number(props.max ?? 100);
    const val = Number(props.value ?? props.defaultValue ?? min);
    const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
    return (
      <input
        ref={ref}
        type="range"
        className={cn("aruna-range w-full cursor-pointer", className)}
        style={{ ...style, ["--range-pct" as string]: `${Math.max(0, Math.min(100, pct))}%` }}
        {...props}
      />
    );
  }
);
Slider.displayName = "Slider";
