"use client";

import { FiDollarSign, FiClock, FiXCircle, FiMinusCircle } from "react-icons/fi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CommissionStats } from "@/lib/commission-api";

const tiers = [
  {
    key: "paid" as const,
    label: "Pagadas",
    icon: FiDollarSign,
    barClass: "bg-emerald-500",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  {
    key: "pending" as const,
    label: "Pendientes",
    icon: FiClock,
    barClass: "bg-amber-500",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  {
    key: "rejected" as const,
    label: "Rechazadas",
    icon: FiXCircle,
    barClass: "bg-red-500",
    bgClass: "bg-red-500/10",
    textClass: "text-red-600 dark:text-red-400",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  },
  {
    key: "canceled" as const,
    label: "Canceladas / Devueltas",
    icon: FiMinusCircle,
    barClass: "bg-gray-400 dark:bg-gray-600",
    bgClass: "bg-gray-500/10",
    textClass: "text-gray-500 dark:text-gray-400",
    badgeClass: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20",
  },
];

export function CommissionBreakdown({
  stats,
}: {
  stats: CommissionStats;
}) {
  const total = stats.pending.total + stats.paid.total + stats.rejected.total + stats.canceled.total;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Resumen de comisiones</CardTitle>
        <CardDescription>
          {total > 0
            ? `$${total.toFixed(2)} total generado`
            : "Aún no has generado comisiones"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {tiers.map((tier) => {
          const stat = stats[tier.key];
          const pct = total > 0 ? (stat.total / total) * 100 : 0;
          const Icon = tier.icon;
          return (
            <div key={tier.key}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg ${tier.bgClass} ${tier.textClass}`}
                  >
                    <Icon size={13} />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {tier.label}
                  </span>
                  <Badge variant="outline" className={tier.badgeClass}>
                    {stat.count}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  ${stat.total.toFixed(2)}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${tier.barClass}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{stat.count} comisión(es)</span>
                <span>{pct.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
