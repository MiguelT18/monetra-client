"use client";

import type { ReactNode } from "react";
import { FiPercent } from "react-icons/fi";
import { RoleAurora } from "@/components/user/RoleAurora";

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
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-role-accent/[0.04] via-background to-role-accent/[0.02] p-6 sm:p-8 dark:from-role-accent/[0.06] dark:to-role-accent/[0.02]">
      <div className="pointer-events-none absolute inset-0">
        <RoleAurora position="top-left" intensity="soft" opacity={0.6} />
        <RoleAurora position="bottom-right" intensity="soft" opacity={0.4} />
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
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-role-accent/10 text-role-accent dark:bg-role-accent/20">
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
