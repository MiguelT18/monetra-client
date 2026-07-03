"use client";

import { FiDollarSign, FiClock, FiXCircle } from "react-icons/fi";
import type { CommissionStats } from "@/lib/commission-api";

const tiers = [
  {
    key: "pending" as const,
    label: "Pendientes",
    color: "amber",
    icon: FiClock,
    barClass: "bg-amber-500",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-700 dark:text-amber-300",
    dotClass: "bg-amber-500",
  },
  {
    key: "paid" as const,
    label: "Pagadas",
    color: "emerald",
    icon: FiDollarSign,
    barClass: "bg-emerald-500",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-700 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
  },
  {
    key: "rejected" as const,
    label: "Rechazadas",
    color: "red",
    icon: FiXCircle,
    barClass: "bg-red-500",
    bgClass: "bg-red-500/10",
    textClass: "text-red-700 dark:text-red-300",
    dotClass: "bg-red-500",
  },
];

export function CommissionBreakdown({
  stats,
}: {
  stats: CommissionStats;
}) {
  const total = stats.pending.total + stats.paid.total + stats.rejected.total;

  return (
    <section className="rounded-2xl border border-border bg-background/60 shadow-sm dark:bg-white/3">
      <div className="border-b border-border px-5 py-3.5 sm:px-6">
        <h2 className="text-base font-semibold text-foreground">
          Resumen de comisiones
        </h2>
        <p className="mt-0.5 text-sm text-foreground/50">
          {total > 0
            ? `$${total.toFixed(2)} total generado`
            : "Aún no has generado comisiones"}
        </p>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        {tiers.map((tier) => {
          const stat = stats[tier.key];
          const pct = total > 0 ? (stat.total / total) * 100 : 0;
          const Icon = tier.icon;
          return (
            <div key={tier.key}>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg ${tier.bgClass} ${tier.textClass}`}
                  >
                    <Icon size={13} />
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-white/80">
                    {tier.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${stat.total.toFixed(2)}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${tier.barClass}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <div className="mt-0.5 flex justify-between text-xs text-gray-400 dark:text-white/35">
                <span>{stat.count} comisión(es)</span>
                <span>{pct.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
