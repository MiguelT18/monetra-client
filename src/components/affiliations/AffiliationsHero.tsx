"use client";

import type { ReactNode } from "react";
import { FiPercent } from "react-icons/fi";

export function AffiliationsHero({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: ReactNode;
}) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-500/[0.04] via-background to-emerald-500/[0.02] p-6 sm:p-8 dark:from-emerald-500/[0.06] dark:to-emerald-500/[0.02]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-teal-500/5 blur-3xl dark:bg-teal-500/10" />
        <div className="absolute right-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-teal-500/5 blur-3xl dark:bg-teal-500/10" />
        <div className="absolute -bottom-16 right-1/3 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-500/10" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <FiPercent size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  {title}
                </h1>
                {badge}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-white/55 sm:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
