"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types/user";
import {
  StatCard,
  SectionCard,
  PlaceholderRow,
  QuickLink,
  RoleBadge,
  roleTone,
  roleLabel,
  totalXpForLevel,
  xpForNextLevel,
  calculateLevel,
  rankForLevel,
  AuroraBackdrop,
  AchievementsCard,
  BankGlassCard,
  InfoProductCard,
  type InfoProductAccent,
} from "@/components/user/userShell";
import { Modal } from "@/components/UI/Modal";
import { ProductForm } from "@/components/UI/ProductForm";
import { BarChartCard, AreaChartCard } from "@/components/ui/chart";
import { listMyProducts, type ProductResponse, listCatalog, getRecommendations, type RecommendationMode } from "@/lib/product-api";
import { RecommendedProductsCarousel } from "@/components/user/RecommendedProductsCarousel";
import { listMyEnrollments, type EnrollmentResponse } from "@/lib/enrollment-api";
import { listMyAffiliations, type AffiliationResponse } from "@/lib/affiliation-api";
import { getCommissionStats, type CommissionStats, fetchCommissionByProduct, type CommissionByProduct, fetchCommissionHistory, type CommissionHistory } from "@/lib/commission-api";
import { getMyAchievements } from "@/lib/achievement-api";
import { CATEGORIES } from "@/lib/categories";
import Link from "next/link";
import {
  FiBookOpen,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiTarget,
  FiLink,
  FiDollarSign,
  FiPlus,
  FiInbox,
  FiImage,
  FiShoppingCart,
  FiGrid,
  FiExternalLink,
  FiShoppingBag,
  FiBarChart2,
  FiZap,
  FiClock,
  FiEye,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type { Achievement } from "@/types/user";

const ACCENTS: InfoProductAccent[] = ["blue", "emerald", "violet", "amber", "rose", "cyan"];
const ICONS: IconType[] = [FiBookOpen, FiGrid, FiTrendingUp, FiUsers, FiTarget, FiDollarSign, FiAward, FiZap];

function categoryLabel(id?: string | null): string {
  if (!id) return "Producto digital";
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function DashboardHero({ firstName, role, tone, level, xp }: { firstName: string; role: Role; tone: "role"; level: number; xp: number }) {
  const currentLevelXp = totalXpForLevel(level);
  const xpInLevel = Math.max(0, xp - currentLevelXp);
  const neededXp = xpForNextLevel(level);
  const pct = Math.min(100, Math.round((xpInLevel / neededXp) * 100));
  const remaining = Math.max(0, neededXp - xpInLevel);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-role-accent/20 bg-gradient-to-br from-role-accent/[0.06] via-background to-role-accent/[0.02] p-5 shadow-sm sm:p-6">
      <AuroraBackdrop />
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                Dashboard
              </h1>
              <RoleBadge label={roleLabel(role)} tone={tone} />
            </div>
            <p className="max-w-2xl text-sm text-gray-500 dark:text-white/55 sm:text-base">
              Hola, {firstName} 👋
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {rankForLevel(level)}
              </p>
              <p className="text-xs text-gray-500 dark:text-white/45">
                Nivel {level}
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-role-accent/30 bg-background text-3xl font-extrabold text-role-accent shadow-sm">
              {level}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-gray-500 dark:text-white/45">
              Progreso al nivel {level + 1}
            </span>
            <span className="tabular-nums text-gray-600 dark:text-white/55">
              <span className="font-semibold text-gray-900 dark:text-white">
                {xpInLevel}
              </span>{" "}
              / {neededXp} XP
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-role-accent/15">
            <div
              className="h-full rounded-full bg-role-accent transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-white/40">
            {remaining === 0
              ? "Listo para subir de nivel."
              : `Faltan ${remaining} XP para el nivel ${level + 1}`}
            {" · "}
            {xp} XP en total
          </p>
        </div>
      </div>
    </div>
  );
}

function productToCardItem(product: ProductResponse, index: number, role?: Role) {
  const isAffiliate = role === "AFFILIATE";
  const highlights: { icon: IconType; label: string }[] = [];
  if (isAffiliate && product.affiliateEnabled && product.commissionRate) {
    highlights.push({ icon: FiTrendingUp, label: `${product.commissionRate}% comisión` });
  }
  const daysOld = Math.floor((Date.now() - new Date(product.createdAt).getTime()) / 86400000);
  highlights.push({ icon: daysOld < 14 ? FiZap : FiClock, label: daysOld < 14 ? "Nuevo" : `${daysOld} días` });

  return {
    title: product.title,
    category: categoryLabel(product.category),
    accent: ACCENTS[index % ACCENTS.length],
    icon: ICONS[index % ICONS.length],
    thumbnail: product.thumbnail,
    highlights,
    actionLabel: "Ver detalle",
    productId: product.id,
    priceDisplay: `$${Number(product.price).toFixed(2)}`,
    isEnrolled: false,
  };
}

function StudentRecommendations({ role }: { role: Role }) {
  const [items, setItems] = useState<ProductResponse[]>([]);
  const [mode, setMode] = useState<RecommendationMode>("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    setLoadingMore(true);
     const { ok, result } = await getRecommendations(page + 1, 10);
     if (ok && result) {
       setItems((prev) => [...prev, ...(result.products ?? [])]);
       setTotalPages(result.totalPages);
       setPage(result.page);
     }
    setLoadingMore(false);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const { ok, result } = await getRecommendations(1, 10);
      if (!active) return;
      if (ok && result) {
        setItems(result.products ?? []);
        setMode(result.mode);
        setTotalPages(result.totalPages);
        setPage(1);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const meta =
    {
      interests: {
        title: "Recomendado para ti",
        subtitle: "Elegido según tus intereses y los cursos que has tomado",
      },
      best_sellers: {
        title: "Más vendidos",
        subtitle: "Los productos con más ventas de la comunidad",
      },
      recent: {
        title: "Novedades",
        subtitle: "Los últimos productos publicados en el mercado",
      },
    }[mode] ?? {
      title: "Recomendado para ti",
      subtitle: "Cargando recomendaciones para ti…",
    };

  return (
    <SectionCard
      aurora
      title={meta.title}
      action={
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-gray-500 dark:text-white/45 sm:inline">
            {meta.subtitle}
          </span>
          <QuickLink href="/user/explore" label="Ir al mercado" variant="outline" />
        </div>
      }
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-gray-200 dark:bg-white/10" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
            <FiInbox size={20} className="text-gray-400 dark:text-white/40" />
          </div>
          <p className="text-sm text-gray-500 dark:text-white/45">
            Aún no hay productos publicados. Explora el mercado más adelante.
          </p>
          <QuickLink href="/user/explore" label="Ir al mercado" variant="primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p, i) => (
              <InfoProductCard key={p.id} {...productToCardItem(p, i, role)} />
            ))}
          </div>
          {page < totalPages && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => loadMore()}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer"
              >
                {loadingMore ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                ) : null}
                {loadingMore ? "Cargando..." : "Cargar más productos"}
              </button>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}

function CreatorDashboard({ products, level, xpInLevel, nextXp, onNewProduct }: {
  products: ProductResponse[];
  level: number;
  xpInLevel: number;
  nextXp: number;
  onNewProduct: () => void;
}) {
  const publishedCount = products.filter((p) => p.status === "PUBLISHED").length;
  const underReviewCount = products.filter((p) => p.status === "UNDER_REVIEW").length;
  const draftCount = products.filter((p) => p.status === "DRAFT").length;
  const rejectedCount = products.filter((p) => p.status === "REJECTED").length;
  const totalStudents = products.reduce((acc, p) => acc + (p._count?.enrollments ?? 0), 0);
  const totalAffiliates = products.reduce((acc, p) => acc + (p._count?.affiliations ?? 0), 0);
  const totalOrders = products.reduce((acc, p) => acc + (p._count?.orders ?? 0), 0);

  const totalRevenue = products.reduce((acc, p) => acc + (p._count?.orders ?? 0) * Number(p.price), 0);
  const saldoTotal = totalRevenue;
  const saldoDisponible = totalRevenue;
  const saldoCongelado = 0;

  return (
    <>
      <BankGlassCard
        label="Saldo total"
        amount={saldoTotal}
        icon={FiDollarSign}
        breakdown={[
          { label: "Disponible", value: saldoDisponible, color: "#8B5CF6" },
          { label: "Congelado", value: saldoCongelado, color: "#F59E0B" },
        ]}
        defaultHidden={false}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={FiBookOpen}
          label="Productos"
          value={String(products.length)}
          hint={`${publishedCount} activos · ${underReviewCount} en revisión`}
          tone="role"
          aurora
        />
        <StatCard
          icon={FiUsers}
          label="Estudiantes"
          value={String(totalStudents)}
          hint={`${totalAffiliates} afiliados · ${totalOrders} ventas`}
          tone="role"
          aurora
        />
        <StatCard
          icon={FiBarChart2}
          label="Estado"
          value={`${draftCount} borradores`}
          hint={`${rejectedCount} rechazados`}
          tone="neutral"
          aurora
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChartCard
          title="Rendimiento por producto"
          subtitle="Órdenes y estudiantes por curso"
          data={products.length > 0 ? products.slice(0, 8).map((p) => ({
            name: p.title.length > 18 ? p.title.slice(0, 16) + "…" : p.title,
            ventas: p._count?.orders ?? 0,
            estudiantes: p._count?.enrollments ?? 0,
          })) : [{ name: "Sin datos", ventas: 0, estudiantes: 0 }]}
          categories={[
            { key: "ventas", name: "Ventas", color: "#7C3AED" },
            { key: "estudiantes", name: "Estudiantes", color: "#A78BFA" },
          ]}
        />
        <BarChartCard
          title="Afiliados por producto"
          subtitle="Afiliaciones activas por curso"
          data={products.length > 0 ? products.slice(0, 8).map((p) => ({
            name: p.title.length > 18 ? p.title.slice(0, 16) + "…" : p.title,
            afiliados: p._count?.affiliations ?? 0,
          })) : [{ name: "Sin datos", afiliados: 0 }]}
          categories={[
            { key: "afiliados", name: "Afiliados", color: "#A78BFA" },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Tu catálogo"
          action={
            <div className="flex gap-2">
              <button
                onClick={onNewProduct}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
              >
                <FiPlus size={15} />
                Nuevo
              </button>
              <QuickLink href="/user/products" label="Gestionar" variant="outline" />
            </div>
          }
        >
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
                <FiInbox size={18} className="text-gray-400 dark:text-white/40" />
              </div>
              <p className="text-sm text-gray-500 dark:text-white/45">
                Aún no tienes productos. Crea tu primer producto para empezar.
              </p>
              <button
                onClick={onNewProduct}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
              >
                <FiPlus size={16} />
                Crear producto
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {products.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/user/products/${p.id}/edit`}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3.5 hover:bg-primary/3 hover:border-primary/20 cursor-pointer transition-all"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-200 to-gray-100 dark:from-white/10 dark:to-white/5">
                        <FiImage size={16} className="text-gray-400 dark:text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {p.title}
                    </p>
                    <p className="text-xs text-foreground/45">
                      ${Number(p.price).toFixed(2)} · {p._count?.enrollments ?? 0} estudiantes
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-foreground/45">
                      <FiEye size={12} />
                      {p._count?.orders ?? 0}
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "PUBLISHED"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : p.status === "DRAFT"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-gray-500/10 text-gray-500 dark:text-white/40"
                      }`}>
                      {p.status === "PUBLISHED"
                        ? "Activo"
                        : p.status === "DRAFT"
                          ? "Borrador"
                          : "Archivado"}
                    </span>
                  </div>
                </Link>
              ))}
              {products.length > 5 && (
                <p className="text-xs text-center text-foreground/35 pt-1">
                  +{products.length - 5} producto{products.length - 5 !== 1 ? "s" : ""} más
                </p>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Acceso rápido"
          action={
            <QuickLink href="/user/explore" label="Explorar" variant="outline" />
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onNewProduct}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background/40 p-4 transition-all hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FiPlus size={18} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground/70">Nuevo producto</span>
            </button>
            <Link
              href="/user/products"
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background/40 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FiShoppingCart size={18} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground/70">Mis productos</span>
            </Link>
          </div>
          <p className="mt-4 text-xs text-foreground/45 text-center leading-relaxed">
            Nivel {level} · {xpInLevel}/{nextXp} XP · {publishedCount} producto{publishedCount !== 1 ? "s" : ""} activo{publishedCount !== 1 ? "s" : ""}
          </p>
        </SectionCard>
      </div>
    </>
  );
}

export default function UserDashboard() {
  const { user, loading, refetch } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [affiliations, setAffiliations] = useState<AffiliationResponse[]>([]);
  const [commissionStats, setCommissionStats] = useState<CommissionStats | null>(null);
  const [byProduct, setByProduct] = useState<CommissionByProduct[]>([]);
  const [history, setHistory] = useState<CommissionHistory[]>([]);
  const [catalog, setCatalog] = useState<ProductResponse[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const tone = roleTone(role);

  const fetchData = async () => {
    setDataLoading(true);
    const [achRes] = await Promise.allSettled([getMyAchievements()]);
    if (achRes.status === "fulfilled" && achRes.value.ok && achRes.value.data) {
      setAchievements(achRes.value.data);
    }

    if (role === "CREATOR") {
      const { ok, result } = await listMyProducts(1, 100);
      if (ok && result.data?.products) setProducts(result.data.products);
    }
    if (role === "STUDENT") {
      const { ok, result } = await listMyEnrollments(1, 50);
      if (ok && result.data?.enrollments) setEnrollments(result.data.enrollments);
    }
    if (role === "AFFILIATE") {
      const [affRes, statsRes, prodRes, histRes, catRes] = await Promise.allSettled([
        listMyAffiliations(1, 50),
        getCommissionStats(),
        fetchCommissionByProduct(),
        fetchCommissionHistory(6),
        listCatalog(1, 20),
      ]);

      if (affRes.status === "fulfilled" && affRes.value.ok && affRes.value.result.data?.affiliations)
        setAffiliations(affRes.value.result.data.affiliations);
      if (statsRes.status === "fulfilled" && statsRes.value.data)
        setCommissionStats(statsRes.value.data);
      if (prodRes.status === "fulfilled" && prodRes.value.data)
        setByProduct(prodRes.value.data);
      if (histRes.status === "fulfilled" && histRes.value.data)
        setHistory(histRes.value.data);
      if (catRes.status === "fulfilled" && catRes.value.ok && catRes.value.result.data?.products)
        setCatalog(catRes.value.result.data.products);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (loading) return;
    let active = true;
    (async () => {
      await Promise.resolve();
      await fetchData();
      if (!active) return;
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, role]);
  const firstName =
    user?.fullname?.split(/\s+/)[0] ?? user?.username ?? "tu cuenta";
  const xp = user?.gamifications.xp ?? 0;
  const level = calculateLevel(xp);
  const currentLevelXp = totalXpForLevel(level);
  const xpInLevel = Math.max(0, xp - currentLevelXp);
  const nextXp = xpForNextLevel(level);
  const xpPct = Math.min(100, Math.round((xpInLevel / nextXp) * 100));

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-28 rounded-2xl bg-gray-200 dark:bg-white/10" />
        <div className="h-40 rounded-2xl bg-gray-200 dark:bg-white/10" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200 dark:bg-white/10"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto flex max-w-6xl flex-col gap-6"
    >
      <DashboardHero firstName={firstName} role={role} tone={tone} level={level} xp={xp} />

      {role === "STUDENT" && (
        dataLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-40 rounded-2xl bg-gray-200 dark:bg-white/10" />
            <div className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-white/10" />
              ))}
            </div>
            <div className="h-72 rounded-2xl bg-gray-200 dark:bg-white/10" />
          </div>
        ) : (
          <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={FiBookOpen}
              label="Cursos activos"
              value={String(enrollments.length)}
              hint={enrollments.length > 0 ? "Continúa tu aprendizaje" : "Explora el catálogo para empezar"}
              tone="role"
              aurora
            />
            <StatCard
              icon={FiAward}
              label="Nivel actual"
              value={`Nv. ${level}`}
              hint={`${xpInLevel} / ${nextXp} XP hacia el siguiente`}
              tone="neutral"
              aurora
            />
            <StatCard
              icon={FiTarget}
              label="Meta semanal"
              value={`${xpPct}%`}
              hint="Mantén el ritmo para desbloquear insignias"
              tone="role"
              aurora
            />
          </div>

          <div>
            <StudentRecommendations role={role} />
          </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard
                title="Continuar aprendiendo"
                action={
                  <QuickLink href="/user/courses" label="Ver cursos" variant="outline" />
                }
              >
                {enrollments.length === 0 ? (
                  <p className="text-sm text-foreground/55 text-center py-6">
                    Aún no tienes cursos. <Link href="/user/explore" className="text-primary underline">Explorar catálogo</Link>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {enrollments.slice(0, 5).map((e) => (
                      <Link
                        key={e.id}
                        href={`/user/courses/${e.id}`}
                        className="block"
                      >
                        <PlaceholderRow
                          title={e.product.title}
                          subtitle={`Progreso: ${e.progress}%`}
                          meta={e.progress >= 100 ? "Completado" : "En curso"}
                        />
                      </Link>
                    ))}
                    {enrollments.length > 5 && (
                      <p className="text-xs text-center text-foreground/35 pt-1">
                        +{enrollments.length - 5} curso{enrollments.length - 5 !== 1 ? "s" : ""} más
                      </p>
                    )}
                  </div>
                )}
              </SectionCard>
              <SectionCard
                title="Explorar"
                action={
                  <QuickLink href="/user/explore" label="Ir al mercado" variant="outline" />
                }
              >
                <p className="mb-3 text-sm text-foreground/55">
                  Descubre nuevos cursos alineados con tus intereses y nivel.
                </p>
                <QuickLink href="/user/explore" label="Explorar catálogo" variant="primary" />
              </SectionCard>
            </div>

            <AchievementsCard achievements={achievements} onViewAll="/user/achievements" />
          </>
        )
      )}

      {role === "CREATOR" && (
        dataLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-40 rounded-2xl bg-gray-200 dark:bg-white/10" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-white/10" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <CreatorDashboard
              products={products}
              level={level}
              xpInLevel={xpInLevel}
              nextXp={nextXp}
              onNewProduct={() => setProductModalOpen(true)}
            />
            <AchievementsCard achievements={achievements} onViewAll="/user/achievements" />
          </>
        )
      )}

      {role === "AFFILIATE" && (
        dataLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-40 rounded-2xl bg-gray-200 dark:bg-white/10" />
            <div className="h-32 rounded-2xl bg-gray-200 dark:bg-white/10" />
            <div className="grid gap-4 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-gray-200 dark:bg-white/10" />
              ))}
            </div>
            <div className="h-56 rounded-2xl bg-gray-200 dark:bg-white/10" />
          </div>
        ) : (
          <>
            <BankGlassCard
              label="Comisiones generadas"
              amount={(commissionStats?.pending.total ?? 0) + (commissionStats?.paid.total ?? 0)}
              icon={FiDollarSign}
              breakdown={[
                { label: "Pagadas", value: commissionStats?.paid.total ?? 0, color: "#10B981" },
                { label: "Pendientes", value: commissionStats?.pending.total ?? 0, color: "#F59E0B" },
                { label: "Rechazadas", value: commissionStats?.rejected.total ?? 0, color: "#EF4444" },
              ]}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <AreaChartCard
                title="Historial mensual"
                subtitle="Comisiones generadas en los últimos meses"
                data={history.length > 0 ? history.map((h) => ({
                  name: h.month,
                  pendientes: h.pending,
                  pagadas: h.paid,
                })) : [{ name: "Sin datos", pendientes: 0, pagadas: 0 }]}
                categories={[
                  { key: "pagadas", name: "Pagadas", color: "#10B981" },
                  { key: "pendientes", name: "Pendientes", color: "#F59E0B" },
                ]}
                formatter={(v) => `$${v.toFixed(2)}`}
              />
              <BarChartCard
                title="Comisiones por producto"
                subtitle="Top productos que más comisiones generan"
                data={byProduct.length > 0 ? byProduct.slice(0, 6).map((p) => ({
                  name: p.product.length > 16 ? p.product.slice(0, 14) + "…" : p.product,
                  comisiones: p.total,
                })) : [{ name: "Sin datos", comisiones: 0 }]}
                categories={[
                  { key: "comisiones", name: "Comisiones", color: "#7C3AED" },
                ]}
                formatter={(v) => `$${v.toFixed(2)}`}
              />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Recomendados para ti</h2>
                  <p className="text-xs text-muted-foreground">
                    Productos que podrías promocionar
                  </p>
                </div>
                <QuickLink href="/user/explore" label="Explorar todo" variant="outline" />
              </div>
              {(() => {
                const promotedIds = new Set(affiliations.map((a) => a.productId));
                const recommended = catalog.filter((p) => !promotedIds.has(p.id)).slice(0, 10);
                if (recommended.length === 0) {
                  return (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-10 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FiTrendingUp size={22} />
                      </div>
                      <p className="text-sm font-medium text-foreground/70">
                        {catalog.length > 0
                          ? "Ya estás promocionando todos los productos disponibles"
                          : "No hay productos disponibles para recomendar"}
                      </p>
                      <Link
                        href="/user/explore"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90"
                      >
                        <FiShoppingBag size={14} />
                        Ver catálogo
                      </Link>
                    </div>
                  );
                }
                return <RecommendedProductsCarousel products={recommended} />;
              })()}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard
                title="Tus programas"
                action={
                  <QuickLink href="/user/affiliations" label="Ver todos" variant="outline" />
                }
              >
                {affiliations.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FiLink size={18} />
                    </div>
                    <p className="text-sm text-foreground/55">
                      Aún no tienes afiliaciones activas
                    </p>
                    <Link
                      href="/user/explore"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90"
                    >
                      <FiShoppingBag size={14} />
                      Explorar productos
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {affiliations.slice(0, 5).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {a.product.title}
                          </p>
                          <p className="text-xs text-foreground/45">
                            {a.product.commissionRate}% · {a.product.affiliateCookieDays} cookie days
                          </p>
                        </div>
                        <Link
                          href={`/user/affiliations/${a.id}`}
                          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                        >
                          Promocionar
                          <FiExternalLink size={11} />
                        </Link>
                      </div>
                    ))}
                    {affiliations.length > 5 && (
                      <p className="text-xs text-center text-foreground/35 pt-1">
                        +{affiliations.length - 5} programa{affiliations.length - 5 !== 1 ? "s" : ""} más
                      </p>
                    )}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Resumen de comisiones">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-sm text-foreground/70">Pagadas</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ${(commissionStats?.paid.total ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="-mt-2 text-xs text-foreground/45 pl-6">
                    {commissionStats?.paid.count ?? 0} comisión(es)
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="text-sm text-foreground/70">Pendientes</span>
                    </div>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                      ${(commissionStats?.pending.total ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="-mt-2 text-xs text-foreground/45 pl-6">
                    {commissionStats?.pending.count ?? 0} comisión(es)
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="text-sm text-foreground/70">Rechazadas</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums">
                      ${(commissionStats?.rejected.total ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="-mt-2 text-xs text-foreground/45 pl-6">
                    {commissionStats?.rejected.count ?? 0} comisión(es)
                  </p>
                </div>
              </SectionCard>
            </div>

            <AchievementsCard achievements={achievements} onViewAll="/user/achievements" />
          </>
        )
      )}
      <Modal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)}>
        <ProductForm
          onClose={() => setProductModalOpen(false)}
          onSuccess={() => {
            setProductModalOpen(false);
            refetch();
            fetchData();
          }}
        />
      </Modal>
    </motion.div>
  );
}
