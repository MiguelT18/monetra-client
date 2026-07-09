"use client";

import { motion } from "motion/react";

export interface AuroraSpec {
  id: string;
  leftPct: number;
  topPct: number;
  sizeRem: number;
  duration: number;
  peak: number;
  driftX: number[];
  driftY: number[];
  morph: string[];
}

export function RoleAurora({
  leftPct,
  topPct,
  sizeRem,
  duration,
  peak,
  driftX,
  driftY,
  morph,
}: AuroraSpec) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full blur-3xl"
      style={{
        backgroundColor: "var(--role-accent, #7c3aed)",
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${sizeRem}rem`,
        height: `${sizeRem}rem`,
      }}
      aria-hidden="true"
      animate={{
        opacity: [0, peak * 0.6, peak, 0],
        x: driftX,
        y: driftY,
        scale: [1, 1.1, 0.92, 1.06, 1],
        borderRadius: morph,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "loop",
      }}
    />
  );
}
