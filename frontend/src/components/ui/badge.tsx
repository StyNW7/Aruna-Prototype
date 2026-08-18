import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-aruna-light2 text-aruna-dark",
        primary: "border-transparent bg-aruna-primary text-white",
        success: "border-transparent bg-aruna-successBg text-aruna-success",
        warning: "border-transparent bg-aruna-warningBg text-aruna-warning",
        error: "border-transparent bg-aruna-errorBg text-aruna-error",
        outline: "border-aruna-border bg-white text-aruna-textSecondary",
        neutral: "border-transparent bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
