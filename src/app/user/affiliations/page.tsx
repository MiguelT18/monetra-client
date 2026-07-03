"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";
import type { Role } from "@/types/user";
import {
  StatCard,
  SectionCard,
  QuickLink,
  RoleBadge,
} from "@/components/user/userShell";
import { BarChartCard, AreaChartCard } from "@/components/ui/chart";
import { AffiliationsHero } from "@/components/affiliations/AffiliationsHero";
import { CommissionBreakdown } from "@/components/affiliations/CommissionBreakdown";
import {
  listMyAffiliations,
  type AffiliationResponse,
} from "@/lib/affiliation-api";
import {
  getCommissionStats,
  type CommissionStats,
  fetchCommissionByProduct,
  type CommissionByProduct,
  fetchCommissionHistory,
  type CommissionHistory,
} from "@/lib/commission-api";
import {
  FiUsers,
  FiDollarSign,
  FiCopy,
  FiShoppingBag,
} from "react-icons/fi";

export default function AffiliationsPage() {
  const { user, loading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const [affiliations, setAffiliations] = useState<AffiliationResponse[]>([]);
  const [commissionStats, setCommissionStats] = useState<CommissionStats | null>(null);
  const [byProduct, setByProduct] = useState<CommissionByProduct[]>([]);
  const [history, setHistory] = useState<CommissionHistory[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && role === "AFFILIATE") {
      Promise.all([
        listMyAffiliations(1, 50),
        getCommissionStats(),
        fetchCommissionByProduct(),
        fetchCommissionHistory(6),
      ]).then(([affRes, statsRes, prodRes, histRes]) => {
        if (affRes.ok && affRes.result.data?.affiliations)
          setAffiliations(affRes.result.data.affiliations);
        if (statsRes.ok && statsRes.data) setCommissionStats(statsRes.data);
        if (prodRes.ok && prodRes.data) setByProduct(prodRes.data);
        if (histRes.ok && histRes.data) setHistory(histRes.data);
      });
    }
  }, [loading, role]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 rounded-2xl bg-gray-200 dark:bg-white/5" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200 dark:bg-white/5"
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 rounded-2xl bg-gray-200 dark:bg-white/5" />
          <div className="h-72 rounded-2xl bg-gray-200 dark:bg-white/5" />
        </div>
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-white/5" />
      </div>
    );
  }

  if (role !== "AFFILIATE") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg rounded-2xl border border-border bg-background/60 p-6 text-center dark:bg-white/3"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Las afiliaciones están disponibles para el rol Afiliado
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-white/55">
          Cambia de rol para ver comisiones, enlaces y programas.
        </p>
        <div className="mt-4 flex justify-center">
          <QuickLink href="/user/dashboard" label="Dashboard" variant="primary" />
        </div>
      </motion.div>
    );
  }

  const totalPending = commissionStats?.pending.total ?? 0;
  const totalPaid = commissionStats?.paid.total ?? 0;
  const pendingCount = commissionStats?.pending.count ?? 0;
  const paidCount = commissionStats?.paid.count ?? 0;
  const noData = byProduct.length === 0;
  const noHistory = history.length === 0 || history.every((h) => h.pending === 0 && h.paid === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto flex max-w-6xl flex-col"
    >
      <AffiliationsHero
        title="Mis afiliaciones"
        description="Programas aceptados, tasas de comisión, cookie days y enlaces listos para campañas."
        badge={<RoleBadge label="Afiliado" tone="emerald" />}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={FiDollarSign}
          label="Comisiones pendientes"
          value={pendingCount > 0 ? `$${totalPending.toFixed(2)}` : "$0"}
          hint={
            pendingCount > 0
              ? `${pendingCount} comisión(es) por cobrar`
              : "Sin comisiones pendientes"
          }
          tone="emerald"
        />
        <StatCard
          icon={FiDollarSign}
          label="Comisiones pagadas"
          value={paidCount > 0 ? `$${totalPaid.toFixed(2)}` : "$0"}
          hint={
            paidCount > 0
              ? `${paidCount} comisión(es) pagadas`
              : "Aún no has recibido pagos"
          }
          tone="emerald"
        />
        <StatCard
          icon={FiUsers}
          label="Programas activos"
          value={String(affiliations.length)}
          hint={
            affiliations.length > 0
              ? "Creadores con los que colaboras"
              : "Explora productos para afiliarte"
          }
          tone="neutral"
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CommissionBreakdown
            stats={
              commissionStats ?? {
                pending: { total: 0, count: 0 },
                paid: { total: 0, count: 0 },
                rejected: { total: 0, count: 0 },
              }
            }
          />
        </div>
        <div className="lg:col-span-2">
          <BarChartCard
            title="Comisiones por producto"
            subtitle={
              noData
                ? "Afíliate a productos para empezar a generar comisiones"
                : "Top productos por comisiones generadas"
            }
            data={
              noData
                ? [{ name: "Sin datos", total: 0 }]
                : byProduct.slice(0, 8).map((p) => ({
                    name: p.product.length > 18 ? p.product.slice(0, 16) + "…" : p.product,
                    total: p.total,
                  }))
            }
            categories={[
              { key: "total", name: "Comisiones", color: "#10B981" },
            ]}
            formatter={(v: number) => `$${v.toFixed(2)}`}
          />
        </div>
      </div>

      <div className="mb-6">
        <AreaChartCard
          title="Historial mensual"
          subtitle={
            noHistory
              ? "Aún no hay actividad de comisiones"
              : "Comisiones pendientes y pagadas por mes"
          }
          data={
            noHistory
              ? [{ name: "Sin datos", pending: 0, paid: 0 }]
              : history.map((h) => ({ name: h.month, pending: h.pending, paid: h.paid }))
          }
          categories={[
            { key: "pending", name: "Pendientes", color: "#F59E0B" },
            { key: "paid", name: "Pagadas", color: "#10B981" },
          ]}
          formatter={(v: number) => `$${v.toFixed(2)}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Tus programas"
          action={
            <QuickLink href="/user/explore" label="Buscar más" variant="outline" />
          }
        >
          {affiliations.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <FiShoppingBag size={20} />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Aún no estás afiliado a ningún programa
              </p>
              <Link
                href="/user/explore"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
              >
                <FiShoppingBag size={14} />
                Explorar productos
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {affiliations.map((a, idx) => {
                const accentColors = [
                  "border-emerald-500/30 hover:border-emerald-500/60",
                  "border-violet-500/30 hover:border-violet-500/60",
                  "border-amber-500/30 hover:border-amber-500/60",
                  "border-blue-500/30 hover:border-blue-500/60",
                  "border-rose-500/30 hover:border-rose-500/60",
                  "border-cyan-500/30 hover:border-cyan-500/60",
                ];
                const borderColor = accentColors[idx % accentColors.length];
                return (
                  <Link
                    key={a.id}
                    href={`/user/affiliations/${a.id}`}
                    className={`group flex items-center justify-between rounded-lg border-l-2 ${borderColor} bg-background/50 px-4 py-3 transition-all hover:bg-primary/5 hover:shadow-sm dark:bg-white/2 dark:hover:bg-primary/5`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {a.product.title}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                          {a.product.commissionRate}%
                        </span>
                        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                          {a.product.affiliateCookieDays} cookies
                        </span>
                        <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                          {a.code}
                        </span>
                      </div>
                    </div>
                    <span className="ml-3 shrink-0 inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                      Activo
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Enlaces rápidos">
          <p className="mb-3 text-sm text-gray-600 dark:text-white/55">
            Copia enlaces con UTM, descarga creatividades y revisa políticas de
            marca de cada creador.
          </p>
          {affiliations.length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-500 dark:text-white/40">
              Afíliate a un producto para obtener tu enlace de referido
            </p>
          ) : (
            <div className="space-y-2">
              {affiliations.slice(0, 5).map((a, idx) => {
                const refUrl = `https://monetra.io/ref/${a.code}`;
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2.5 transition-colors hover:border-primary/20 dark:bg-white/2"
                  >
                    <div className="min-w-0 flex-1 truncate">
                      <p className="truncate text-xs font-medium text-gray-900 dark:text-white">
                        {a.product.title}
                      </p>
                      <span className="truncate text-xs text-gray-500 dark:text-white/40">
                        monetra.io/ref/{a.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 ml-2 inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-gray-600 transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:text-white/60 dark:hover:border-emerald-500 dark:hover:text-emerald-400 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(refUrl);
                        setCopiedIndex(idx);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                    >
                      {copiedIndex === idx ? (
                        <span className="text-emerald-500">Copiado</span>
                      ) : (
                        <>
                          <FiCopy size={12} />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {affiliations.length > 0 && (
            <div className="mt-3">
              <QuickLink
                href="/user/explore"
                label="Ver todos los programas"
                variant="outline"
              />
            </div>
          )}
        </SectionCard>
      </div>
    </motion.div>
  );
}
