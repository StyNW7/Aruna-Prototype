import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  value: number;
  /** Durasi animasi (ms) */
  duration?: number;
  /** Formatter angka; default: locale id-ID tanpa desimal */
  format?: (n: number) => string;
  className?: string;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Angka yang berjalan naik dari 0 saat pertama terlihat di viewport. */
export function CountUp({ value, duration = 1200, format, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      setCurrent(value * easeOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  const fmt = format ?? ((n: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n));
  return (
    <span ref={ref} className={className}>
      {fmt(current)}
    </span>
  );
}
