import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface HeroStat {
  value: ReactNode;
  label: string;
}

interface PageHeroProps {
  badge: string;
  badgeIcon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  /** Konten sisi kanan (kartu, ilustrasi, dsb.) */
  aside?: ReactNode;
  /** Statistik ringkas di bawah deskripsi */
  stats?: HeroStat[];
  actions?: ReactNode;
  className?: string;
}

/** Hero standar halaman publik: mesh gradient, dot grid, dan slot konten kanan. */
export function PageHero({ badge, badgeIcon: BadgeIcon, title, description, aside, stats, actions, className }: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden border-b border-aruna-border mesh-hero", className)}>
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-aruna-medium/25 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-aruna-light2 blur-3xl animate-float" />

      <div
        className={cn(
          "container relative py-16 lg:py-20",
          aside && "grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
        )}
      >
        <Reveal immediate>
          <Badge variant="primary" className="mb-4 shadow-sm">
            {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
            {badge}
          </Badge>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.12] tracking-tight text-aruna-text sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-aruna-textSecondary sm:text-lg">{description}</p>
          )}
          {actions && <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>}
          {stats && stats.length > 0 && (
            <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-aruna-textSecondary">{s.label}</dt>
                  <dd className="mt-0.5 font-display text-2xl font-bold text-aruna-text">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>
        {aside && (
          <Reveal immediate delay={0.12} from="left" className="relative">
            {aside}
          </Reveal>
        )}
      </div>
    </section>
  );
}
