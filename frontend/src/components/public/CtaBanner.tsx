import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface CtaBannerProps {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  primary: { label: string; to: string };
  secondary?: { label: string; to: string };
  /** "gradient" (default) atau "dark" */
  tone?: "gradient" | "dark";
  className?: string;
}

/** Banner ajakan bertindak bergaya konsisten untuk semua halaman publik. */
export function CtaBanner({ icon: Icon, title, description, primary, secondary, tone = "gradient", className }: CtaBannerProps) {
  return (
    <Reveal className={className}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl px-8 py-14 text-center text-white shadow-elevated sm:px-16",
          tone === "gradient" ? "aruna-gradient" : "bg-slate-900"
        )}
      >
        <div className="pointer-events-none absolute inset-0 dot-grid-light opacity-60" />
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="relative mx-auto max-w-2xl">
          {Icon && (
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <Icon className="h-6 w-6" />
            </span>
          )}
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
          {description && <p className="mx-auto mt-3 max-w-xl text-sm text-white/85 sm:text-base">{description}</p>}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-aruna-primary shadow-lg hover:bg-white/90 hover:shadow-xl">
              <Link to={primary.to}>
                {primary.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {secondary && (
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10">
                <Link to={secondary.to}>{secondary.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
