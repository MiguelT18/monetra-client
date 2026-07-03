"use client";

import { FiShoppingCart, FiUsers, FiLink, FiThermometer, FiTrendingUp } from "react-icons/fi";
import { AreaChartCard } from "@/components/ui/chart";
import type { ProductAnalytics } from "@/lib/product-api";

interface CreatorMetricsProps {
  analytics: ProductAnalytics;
  temperature: number;
  temperatureLabel: string;
  recentSales: number;
  recentEnrollments: number;
}

export default function CreatorMetrics({ analytics, temperature, temperatureLabel, recentSales, recentEnrollments }: CreatorMetricsProps) {
  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-background/60 p-4 dark:bg-white/3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <FiShoppingCart size={16} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalOrders}</p>
          <p className="text-xs text-gray-500 dark:text-white/45">Órdenes totales</p>
          {recentSales > 0 && (
            <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">+{recentSales} en los últimos 7 días</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-4 dark:bg-white/3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <FiUsers size={16} className="text-violet-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalEnrollments}</p>
          <p className="text-xs text-gray-500 dark:text-white/45">Inscripciones totales</p>
          {recentEnrollments > 0 && (
            <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">+{recentEnrollments} en los últimos 30 días</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-4 dark:bg-white/3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <FiLink size={16} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalAffiliates}</p>
          <p className="text-xs text-gray-500 dark:text-white/45">Afiliados totales</p>
          <p className="mt-1 text-[11px] text-gray-400 dark:text-white/35">De por vida</p>
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-4 dark:bg-white/3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <FiThermometer size={16} className="text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{temperature}</p>
          <p className="text-xs text-gray-500 dark:text-white/45">{temperatureLabel}</p>
        </div>
      </div>

      {/* Activity chart */}
      <AreaChartCard
        title="Actividad del producto"
        subtitle="Órdenes e inscripciones diarias (últimos 30 días)"
        data={analytics.dailyActivity}
        categories={[
          { key: "orders", name: "Órdenes", color: "#7C3AED" },
          { key: "enrollments", name: "Inscripciones", color: "#A78BFA" },
        ]}
      />
    </div>
  );
}
