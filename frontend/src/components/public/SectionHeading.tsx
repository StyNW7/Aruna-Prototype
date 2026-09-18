import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <Reveal className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      {eyebrow && (
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-aruna-secondary">
          <span className="h-px w-6 bg-aruna-secondary/60" />
          {eyebrow}
          {align === "center" && <span className="h-px w-6 bg-aruna-secondary/60" />}
        </p>
      )}
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-aruna-text sm:text-[34px] sm:leading-[1.15]">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-aruna-textSecondary">{description}</p>}
    </Reveal>
  );
}
