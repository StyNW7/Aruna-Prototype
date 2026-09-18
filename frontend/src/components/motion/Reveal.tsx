import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Delay dalam detik */
  delay?: number;
  /** Arah masuk */
  from?: "up" | "down" | "left" | "right" | "none";
  /** Jarak pergeseran awal (px) */
  distance?: number;
  once?: boolean;
  /** Animasikan segera saat mount (untuk konten above-the-fold), tanpa menunggu viewport */
  immediate?: boolean;
}

const offset = (from: RevealProps["from"], distance: number) => {
  switch (from) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
};

/** Membungkus konten agar muncul halus saat masuk viewport. */
export function Reveal({
  children,
  delay = 0,
  from = "up",
  distance = 18,
  once = true,
  immediate = false,
  className,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  const target = { opacity: 1, x: 0, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset(from, distance) }}
      animate={immediate ? target : undefined}
      whileInView={immediate ? undefined : target}
      viewport={immediate ? undefined : { once, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Jeda antar anak dalam detik */
  gap?: number;
}

/** Container yang menganimasikan anak-anaknya secara bergiliran. Gunakan bersama <StaggerItem>. */
export function Stagger({ children, gap = 0.07, className, ...rest }: StaggerProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...rest
}: Omit<HTMLMotionProps<"div">, "children"> & { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
