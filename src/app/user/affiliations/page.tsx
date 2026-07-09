"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/user";
import {
  SectionCard,
  QuickLink,
  RoleBadge,
} from "@/components/user/userShell";
import { BarChartCard, AreaChartCard } from "@/components/ui/chart";
import { AffiliationsHero } from "@/components/affiliations/AffiliationsHero";
import { CommissionBreakdown } from "@/components/affiliations/CommissionBreakdown";
import {
  listMyAffiliations,
  listMyAffiliationProducts,
  type AffiliationResponse,
  type AffiliationProductStat,
} from "@/lib/affiliation-api";
import {
  getCommissionStats,
  type CommissionStats,
  fetchCommissionByProduct,
  type CommissionByProduct,
  fetchCommissionHistory,
  type CommissionHistory,
  listMyCommissions,
  type CommissionResponse,
} from "@/lib/commission-api";
import {
  FiDollarSign,
  FiCopy,
  FiShoppingBag,
  FiRefreshCw,
  FiBarChart2,
  FiFileText,
  FiPieChart,
  FiBook,
  FiExternalLink,
  FiClock,
  FiCheckCircle,
  FiGrid,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  PAID: "#10B981",
  REJECTED: "#EF4444",
  CANCELED: "#6B7280",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  REJECTED: "Rechazada",
  CANCELED: "Cancelada",
};

function DonutChartCard({
  stats,
}: {
  stats: CommissionStats;
}) {
  const data = [
    { name: "Pagadas", value: stats.paid.total, color: "#10B981" },
    { name: "Pendientes", value: stats.pending.total, color: "#F59E0B" },
    { name: "Rechazadas", value: stats.rejected.total, color: "#EF4444" },
    { name: "Canceladas", value: stats.canceled.total, color: "#6B7280" },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Distribución de comisiones</CardTitle>
          <CardDescription>Desglose por estado</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[200px] gap-3 flex-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <FiPieChart className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Aún no hay comisiones para mostrar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Distribución de comisiones</CardTitle>
        <CardDescription>Desglose por estado</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-center h-full">
        <div className="flex items-center gap-6">
          <div className="h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0];
                    return (
                      <div className="rounded-xl border border-border bg-background/95 px-4 py-3 shadow-xl backdrop-blur-md">
                        <p className="text-sm font-medium" style={{ color: d.color }}>
                          {d.name}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          ${Number(d.value).toFixed(2)}
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium text-foreground tabular-nums">
                  ${d.value.toFixed(2)} ({((d.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AffiliationsPage() {
  const { user, loading } = useProfile();
  const router = useRouter();
  const role = (user?.role ?? "STUDENT") as Role;
  const [affiliations, setAffiliations] = useState<AffiliationResponse[]>([]);
  const [affiliationProducts, setAffiliationProducts] = useState<AffiliationProductStat[]>([]);
  const [commissionStats, setCommissionStats] = useState<CommissionStats | null>(null);
  const [byProduct, setByProduct] = useState<CommissionByProduct[]>([]);
  const [history, setHistory] = useState<CommissionHistory[]>([]);
  const [commissions, setCommissions] = useState<CommissionResponse[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [commissionsPage, setCommissionsPage] = useState(1);
  const [commissionsTotal, setCommissionsTotal] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const PRODUCTS_PER_PAGE = 7;
  const [dataLoading, setDataLoading] = useState(false);
  const [affiliationsError, setAffiliationsError] = useState(false);
  const [showTotals, setShowTotals] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aff_show_totals");
      return stored !== null ? stored === "true" : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("aff_show_totals", String(showTotals));
  }, [showTotals]);

  useEffect(() => {
    if (!loading && role === "AFFILIATE") {
      let cancelled = false;
      setDataLoading(true);
      setAffiliationsError(false);

      Promise.allSettled([
        listMyAffiliations(1, 50),
        getCommissionStats(),
        fetchCommissionByProduct(),
        fetchCommissionHistory(6),
        listMyCommissions(1, 20),
        listMyAffiliationProducts(1, 50),
      ]).then(([affRes, statsRes, prodRes, histRes, commRes, prodStatsRes]) => {
        if (cancelled) return;

        if (affRes.status === "fulfilled" && affRes.value.ok && affRes.value.result.data?.affiliations) {
          setAffiliations(affRes.value.result.data.affiliations);
        } else if (affRes.status === "fulfilled" && !affRes.value.ok) {
          setAffiliationsError(true);
        } else if (affRes.status === "rejected") {
          setAffiliationsError(true);
        }

        if (statsRes.status === "fulfilled" && statsRes.value.data) {
          setCommissionStats(statsRes.value.data);
        }
        if (prodRes.status === "fulfilled" && prodRes.value.data) {
          setByProduct(prodRes.value.data);
        }
        if (histRes.status === "fulfilled" && histRes.value.data) {
          setHistory(histRes.value.data);
        }
        if (commRes.status === "fulfilled" && commRes.value.ok && commRes.value.result.data) {
          setCommissions(commRes.value.result.data.commissions ?? []);
          setCommissionsTotal(commRes.value.result.data.total ?? 0);
        }
        if (prodStatsRes.status === "fulfilled" && prodStatsRes.value.ok && prodStatsRes.value.result.data?.products) {
          setAffiliationProducts(prodStatsRes.value.result.data.products);
        }
      }).finally(() => {
        if (!cancelled) setDataLoading(false);
      });

      return () => { cancelled = true; };
    }
  }, [loading, role]);

  async function loadCommissionsPage(page: number) {
    const res = await listMyCommissions(page, 20);
    if (res.ok && res.result.data) {
      setCommissions(res.result.data.commissions ?? []);
      setCommissionsTotal(res.result.data.total ?? 0);
      setCommissionsPage(page);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 rounded-2xl bg-gray-200 dark:bg-white/5" />
        <div className="grid gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-white/5" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 rounded-2xl bg-gray-200 dark:bg-white/5" />
          <div className="h-72 rounded-2xl bg-gray-200 dark:bg-white/5" />
        </div>
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
  const totalEarned = totalPaid + totalPending;
  const pendingCount = commissionStats?.pending.count ?? 0;
  const paidCount = commissionStats?.paid.count ?? 0;
  const noData = byProduct.length === 0;
  const noHistory = history.length === 0 || history.every((h) => h.pending === 0 && h.paid === 0);

  const totalPages = Math.ceil(commissionsTotal / 20);

  const rankedProducts = [...affiliationProducts]
    .map((p) => ({
      ...p,
      totalGenerated: p.stats.paid + p.stats.pending,
    }))
    .sort((a, b) => b.totalGenerated - a.totalGenerated);

  const topProductsRanked = rankedProducts.slice(0, 3);

  const topProductsChart = rankedProducts
    .slice(0, 5)
    .map((p) => ({
      ...p,
      shortName:
        p.product.title.length > 14
          ? p.product.title.slice(0, 12) + "…"
          : p.product.title,
    }));

  const productTotalPages = Math.max(
    1,
    Math.ceil(affiliationProducts.length / PRODUCTS_PER_PAGE),
  );
  const pagedProducts = affiliationProducts.slice(
    (productPage - 1) * PRODUCTS_PER_PAGE,
    productPage * PRODUCTS_PER_PAGE,
  );


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

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <FiBarChart2 className="size-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="products">
            <FiShoppingBag className="size-4" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <FiFileText className="size-4" />
            Transacciones
          </TabsTrigger>
        </TabsList>

        {/* ─── OVERVIEW ─── */}
        <TabsContent value="overview">
          <div className="mb-4 rounded-2xl border border-border bg-card p-6 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Saldo total
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowTotals((v) => !v)}
                    className="text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                    title={showTotals ? "Ocultar monto" : "Mostrar monto"}
                  >
                    {showTotals ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                  </button>
                </div>
                <p className="text-3xl font-bold text-foreground tabular-nums tracking-tight">
                  {showTotals ? `$${totalEarned.toFixed(2)}` : "****"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paidCount > 0 ? `${paidCount} comisiones pagadas` : "Sin actividad"}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <FiDollarSign size={22} />
              </div>
            </div>

            <div className="my-5 h-px bg-border" />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <FiClock size={12} />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Pendientes</p>
                </div>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  ${totalPending.toFixed(2)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {pendingCount > 0 ? `${pendingCount} por cobrar` : "Sin pendientes"}
                </p>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FiCheckCircle size={12} />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Pagadas</p>
                </div>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ${totalPaid.toFixed(2)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {paidCount > 0 ? `${paidCount} comisiones` : "Aún sin pagos"}
                </p>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <FiGrid size={12} />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Programas</p>
                </div>
                <p className="text-lg font-bold text-foreground tabular-nums">
                  {affiliations.length}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {affiliations.length > 0 ? "Creadores activos" : "Sin programas"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 grid gap-4 lg:grid-cols-5 *:h-full">
            <div className="lg:col-span-3">
              <DonutChartCard
                stats={
                  commissionStats ?? {
                    pending: { total: 0, count: 0 },
                    paid: { total: 0, count: 0 },
                    rejected: { total: 0, count: 0 },
                    canceled: { total: 0, count: 0 },
                  }
                }
              />
            </div>
            <div className="lg:col-span-2">
              <CommissionBreakdown
                stats={
                  commissionStats ?? {
                    pending: { total: 0, count: 0 },
                    paid: { total: 0, count: 0 },
                    rejected: { total: 0, count: 0 },
                    canceled: { total: 0, count: 0 },
                  }
                }
              />
            </div>
          </div>

          <div className="mb-4 grid gap-4 lg:grid-cols-2">
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
                      name: p.product.length > 18 ? p.product.slice(0, 16) + "\u2026" : p.product,
                      total: p.total,
                    }))
              }
              categories={[
                { key: "total", name: "Comisiones", color: "#10B981" },
              ]}
              formatter={(v: number) => `$${v.toFixed(2)}`}
            />

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

          {/* Recent commissions */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Comisiones recientes</CardTitle>
              <CardDescription>Últimas transacciones registradas</CardDescription>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiDollarSign size={20} />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Aún no hay comisiones registradas
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Afíliate a productos y comparte tu enlace para empezar a generar
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.slice(0, 10).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">
                          {c.order.product.title.length > 30
                            ? c.order.product.title.slice(0, 28) + "\u2026"
                            : c.order.product.title}
                        </TableCell>
                        <TableCell className="tabular-nums font-medium">
                          ${c.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              c.status === "PAID"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                : c.status === "PENDING"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                                  : c.status === "REJECTED"
                                    ? "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
                                    : "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20"
                            }
                          >
                            {STATUS_LABELS[c.status] ?? c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDate(c.order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Tus programas"
              action={
                <QuickLink href="/user/explore" label="Buscar más" variant="outline" />
              }
            >
              {dataLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex animate-pulse items-center justify-between rounded-lg border-l-2 border-gray-200 dark:border-white/10 bg-background/50 px-4 py-3"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-40 rounded bg-gray-200 dark:bg-white/10" />
                        <div className="flex gap-2">
                          <div className="h-4 w-12 rounded bg-gray-200 dark:bg-white/10" />
                          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/10" />
                          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/10" />
                        </div>
                      </div>
                      <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : affiliationsError ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                    <FiRefreshCw size={20} />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No se pudieron cargar tus programas
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Revisa tu conexión e inténtalo de nuevo
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDataLoading(true);
                      setAffiliationsError(false);
                      listMyAffiliations(1, 50).then((affRes) => {
                        if (affRes.ok && affRes.result.data?.affiliations)
                          setAffiliations(affRes.result.data.affiliations);
                        else setAffiliationsError(true);
                      }).catch(() => setAffiliationsError(true))
                        .finally(() => setDataLoading(false));
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                  >
                    <FiRefreshCw size={14} />
                    Reintentar
                  </button>
                </div>
              ) : affiliations.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FiShoppingBag size={20} />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Aún no estás afiliado a ningún programa
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Explora productos y únete como afiliado para empezar a ganar comisiones
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
                      <div
                        key={a.id}
                        className={`flex items-center justify-between rounded-lg border-l-2 ${borderColor} bg-background/50 px-4 py-3 transition-all hover:bg-primary/5 hover:shadow-sm dark:bg-white/2 dark:hover:bg-primary/5`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {a.product.title}
                            </p>
                            <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                              Activo
                            </span>
                          </div>
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
                        <div className="ml-3 flex shrink-0 flex-col items-stretch gap-1.5">
                          <Link
                            href={`/user/affiliations/${a.id}`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                          >
                            <FiExternalLink size={12} />
                            Promocionar
                          </Link>
                          <Link
                            href={`/user/explore/${a.productId}`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            <FiBook size={12} />
                            Ver curso
                          </Link>
                        </div>
                      </div>
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
        </TabsContent>

        {/* ─── PRODUCTS ─── */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Productos afiliados</CardTitle>
              <CardDescription>
                Programas a los que estás afiliado y su rendimiento de ventas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {affiliationProducts.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FiShoppingBag size={20} />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Aún no estás afiliado a ningún producto
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Explora productos y únete como afiliado para empezar a ganar comisiones
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Desde</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Ventas</TableHead>
                      <TableHead className="text-right">Pagadas</TableHead>
                      <TableHead className="text-right">Pendientes</TableHead>
                      <TableHead className="text-right">Devoluciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedProducts.map((p) => (
                      <TableRow
                        key={p.id}
                        onClick={() => router.push(`/user/affiliations/${p.id}`)}
                        className="cursor-pointer transition-colors hover:bg-primary/5"
                      >
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(p.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                              {p.product.thumbnail ? (
                                <img
                                  src={p.product.thumbnail}
                                  alt={p.product.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <FiShoppingBag size={16} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {p.product.title}
                              </p>
                              <p className="line-clamp-1 text-xs text-muted-foreground">
                                {p.product.description || "Sin descripción"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {p.stats.sales}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                          ${p.stats.paid.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-amber-600 dark:text-amber-400">
                          ${p.stats.pending.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-gray-500 dark:text-gray-400">
                          ${p.stats.returns.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

                  {productTotalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Página {productPage} de {productTotalPages} ({affiliationProducts.length} productos)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={productPage <= 1}
                        onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={productPage >= productTotalPages}
                        onClick={() =>
                          setProductPage((p) => Math.min(productTotalPages, p + 1))
                        }
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}

              {affiliationProducts.length > 0 && (
                <>
                  <div className="my-6 h-px bg-border" />

                  <div className="grid gap-4 lg:grid-cols-2">
                    <BarChartCard
                      title="Ventas por producto"
                      subtitle="Cantidad de ventas generadas por programa"
                      data={topProductsChart.map((p) => ({
                        name: p.shortName,
                        ventas: p.stats.sales,
                      }))}
                      categories={[
                        { key: "ventas", name: "Ventas", color: "#3B82F6" },
                      ]}
                      formatter={(v: number) => String(v)}
                    />
                    <BarChartCard
                      title="Comisiones por producto"
                      subtitle="Pagadas, pendientes y devoluciones por programa"
                      data={topProductsChart.map((p) => ({
                        name: p.shortName,
                        pagadas: p.stats.paid,
                        pendientes: p.stats.pending,
                        devoluciones: p.stats.returns,
                      }))}
                      categories={[
                        { key: "pagadas", name: "Pagadas", color: "#10B981" },
                        { key: "pendientes", name: "Pendientes", color: "#F59E0B" },
                        { key: "devoluciones", name: "Devoluciones", color: "#6B7280" },
                      ]}
                      formatter={(v: number) => `$${v.toFixed(2)}`}
                    />
                  </div>

                  <div className="mb-6" />

                  <SectionCard title="Top 3 productos con mejor rendimiento">
                    <div className="space-y-3">
                      {topProductsRanked.map((p, i) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => router.push(`/user/affiliations/${p.id}`)}
                          className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border bg-background/50 px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 dark:bg-white/2"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {i + 1}
                          </div>
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            {p.product.thumbnail ? (
                              <img
                                src={p.product.thumbnail}
                                alt={p.product.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <FiShoppingBag size={14} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {p.product.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.stats.sales} ventas
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-foreground tabular-nums">
                              ${p.totalGenerated.toFixed(2)}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              generado
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TRANSACTIONS ─── */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Todas las transacciones</CardTitle>
              <CardDescription>
                Historial completo de comisiones generadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <FiRefreshCw size={20} />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No hay transacciones registradas
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Las comisiones aparecerán aquí cuando generes ventas
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Comisión</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.order.product.title.length > 28
                              ? c.order.product.title.slice(0, 26) + "\u2026"
                              : c.order.product.title}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            ${c.order.total.toFixed(2)}
                          </TableCell>
                          <TableCell className="tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                            ${c.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                c.status === "PAID"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                  : c.status === "PENDING"
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                                    : c.status === "REJECTED"
                                      ? "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
                                      : "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20"
                              }
                            >
                              {STATUS_LABELS[c.status] ?? c.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {c.affiliation.code}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(c.order.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Página {commissionsPage} de {totalPages} ({commissionsTotal} transacciones)
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={commissionsPage <= 1}
                          onClick={() => loadCommissionsPage(commissionsPage - 1)}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={commissionsPage >= totalPages}
                          onClick={() => loadCommissionsPage(commissionsPage + 1)}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
