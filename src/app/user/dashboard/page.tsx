"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types/user";
import {
  UserPageHeader,
  StatCard,
  SectionCard,
  PlaceholderRow,
  QuickLink,
  RoleBadge,
  totalXpForLevel,
  xpForNextLevel,
  calculateLevel,
} from "@/components/user/userShell";
import { Modal } from "@/components/UI/Modal";
import { ProductForm } from "@/components/UI/ProductForm";
import { BarChartCard } from "@/components/ui/chart";
import { listMyProducts, type ProductResponse } from "@/lib/product-api";
import { listMyEnrollments, type EnrollmentResponse } from "@/lib/enrollment-api";
import { listMyAffiliations, type AffiliationResponse } from "@/lib/affiliation-api";
import { getCommissionStats, type CommissionStats } from "@/lib/commission-api";
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
  FiEye,
  FiEyeOff,
  FiShoppingCart,
} from "react-icons/fi";



function roleTone(role: Role): "blue" | "emerald" | "violet" | "amber" | "red" {
  if (role === "STUDENT") return "amber";
  if (role === "CREATOR") return "violet";
  if (role === "ADMIN") return "red";
  return "emerald";
}

function roleBadgeLabel(role: Role) {
  if (role === "STUDENT") return "Estudiante";
  if (role === "CREATOR") return "Creador";
  if (role === "ADMIN") return "Admin";
  return "Afiliado";
}

function CreatorDashboard({ products, level, xpInLevel, nextXp, onNewProduct }: {
  products: ProductResponse[];
  level: number;
  xpInLevel: number;
  nextXp: number;
  onNewProduct: () => void;
}) {
  const [showBalance, setShowBalance] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("monetra_show_balance");
    return stored !== null ? stored === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("monetra_show_balance", String(showBalance));
  }, [showBalance]);
  const publishedCount = products.filter((p) => p.status === "PUBLISHED").length;
  const underReviewCount = products.filter((p) => p.status === "UNDER_REVIEW").length;
  const draftCount = products.filter((p) => p.status === "DRAFT").length;
  const rejectedCount = products.filter((p) => p.status === "REJECTED").length;
  const archivedCount = products.filter((p) => p.status === "ARCHIVED").length;
  const totalStudents = products.reduce((acc, p) => acc + (p._count?.enrollments ?? 0), 0);
  const totalAffiliates = products.reduce((acc, p) => acc + (p._count?.affiliations ?? 0), 0);
  const totalOrders = products.reduce((acc, p) => acc + (p._count?.orders ?? 0), 0);

  const totalRevenue = products.reduce((acc, p) => acc + (p._count?.orders ?? 0) * Number(p.price), 0);
  const saldoTotal = totalRevenue;
  const saldoDisponible = totalRevenue;
  const saldoCongelado = 0;

  function mask(val: number) {
    return showBalance ? `$${val.toLocaleString("es", { minimumFractionDigits: 2 })}` : "••••••";
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <section className="flex flex-col rounded-2xl border border-violet-200/80 bg-violet-500/[0.04] p-4 shadow-md dark:border-violet-500/20 dark:bg-violet-500/10 sm:p-5">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-white/45 sm:text-xs">
                  Saldo total
                </p>
                <button
                  onClick={() => setShowBalance((v) => !v)}
                  className="shrink-0 text-foreground/30 hover:text-foreground/70 transition-colors cursor-pointer"
                >
                  {showBalance ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                </button>
              </div>
              <p className="truncate text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
                {mask(saldoTotal)}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm text-violet-600 dark:text-violet-400 sm:h-12 sm:w-12">
              <FiDollarSign size={18} />
            </div>
          </div>
          <div className="mt-auto pt-3 sm:pt-4">
            <div className="h-px bg-violet-200/50 dark:bg-violet-500/15 mb-2 sm:mb-3" />
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between min-w-0 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                  <span className="text-[11px] text-gray-500 dark:text-white/40 sm:text-xs truncate">Disponible</span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                  {mask(saldoDisponible)}
                </span>
              </div>
              <div className="flex items-center justify-between min-w-0 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <span className="text-[11px] text-gray-500 dark:text-white/40 sm:text-xs truncate">Congelado</span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400 sm:text-sm">
                  {mask(saldoCongelado)}
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="flex flex-col rounded-2xl border border-border bg-background/60 p-4 shadow-md dark:bg-white/3 sm:p-5">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0 space-y-2 sm:space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-white/45 sm:text-xs">
                Productos
              </p>
              <p className="truncate text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
                {products.length}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm text-gray-500 dark:text-white/50 sm:h-12 sm:w-12">
              <FiBookOpen size={18} />
            </div>
          </div>
          <div className="mt-auto pt-3 sm:pt-4">
            <div className="h-px bg-border dark:bg-white/10 mb-2 sm:mb-3" />
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center justify-between text-[11px] sm:text-xs min-w-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span className="text-gray-500 dark:text-white/40 truncate">Activos</span>
                </div>
                <span className="shrink-0 font-medium text-emerald-600 dark:text-emerald-400">{publishedCount}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs min-w-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <span className="text-gray-500 dark:text-white/40 truncate">En revisión</span>
                </div>
                <span className="shrink-0 font-medium text-blue-600 dark:text-blue-400">{underReviewCount}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs min-w-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <span className="text-gray-500 dark:text-white/40 truncate">Borradores</span>
                </div>
                <span className="shrink-0 font-medium text-amber-600 dark:text-amber-400">{draftCount}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs min-w-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <span className="text-gray-500 dark:text-white/40 truncate">Rechazados</span>
                </div>
                <span className="shrink-0 font-medium text-red-600 dark:text-red-400">{rejectedCount}</span>
              </div>
            </div>
            {products.length > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10 flex sm:mt-3">
                {[
                  { count: publishedCount, color: "bg-emerald-500" },
                  { count: underReviewCount, color: "bg-blue-500" },
                  { count: draftCount, color: "bg-amber-500" },
                  { count: rejectedCount, color: "bg-red-500" },
                ].map((seg) =>
                  seg.count > 0 ? (
                    <div
                      key={seg.color}
                      className={`h-full ${seg.color} transition-all`}
                      style={{ width: `${(seg.count / products.length) * 100}%` }}
                    />
                  ) : null
                )}
              </div>
            )}
            {archivedCount > 0 && (
              <p className="mt-1 text-[11px] text-gray-400 dark:text-white/35 text-right sm:mt-1.5">
                +{archivedCount} archivado{archivedCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </section>
        <section className="flex flex-col rounded-2xl border border-violet-200/80 bg-violet-500/[0.04] p-4 shadow-md dark:border-violet-500/20 dark:bg-violet-500/10 sm:p-5">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0 space-y-2 sm:space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-white/45 sm:text-xs">
                Estudiantes
              </p>
              <p className="truncate text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
                {totalStudents}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm text-violet-600 dark:text-violet-400 sm:h-12 sm:w-12">
              <FiUsers size={18} />
            </div>
          </div>
          <div className="mt-auto pt-3 sm:pt-4">
            <div className="h-px bg-violet-200/50 dark:bg-violet-500/15 mb-2 sm:mb-3" />
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between min-w-0 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                  <span className="text-[11px] text-gray-500 dark:text-white/40 sm:text-xs truncate">Afiliados totales</span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                  {totalAffiliates}
                </span>
              </div>
              <div className="flex items-center justify-between min-w-0 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-violet-300" />
                  <span className="text-[11px] text-gray-500 dark:text-white/40 sm:text-xs truncate">Ventas completadas</span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                  {totalOrders}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
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

      <div className="grid gap-6 lg:grid-cols-2">
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
                <div
                  key={p.id}
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
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.status === "PUBLISHED"
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
                </div>
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
  const [dataLoading, setDataLoading] = useState(true);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const tone = roleTone(role);

  const fetchData = async () => {
    setDataLoading(true);
    if (role === "CREATOR") {
      const { ok, result } = await listMyProducts(1, 100);
      if (ok && result.data?.products) setProducts(result.data.products);
    }
    if (role === "STUDENT") {
      const { ok, result } = await listMyEnrollments(1, 50);
      if (ok && result.data?.enrollments) setEnrollments(result.data.enrollments);
    }
    if (role === "AFFILIATE") {
      const [affRes, statsRes] = await Promise.all([
        listMyAffiliations(1, 50),
        getCommissionStats(),
      ]);
      if (affRes.ok && affRes.result.data?.affiliations) setAffiliations(affRes.result.data.affiliations);
      if (statsRes.ok && statsRes.data) setCommissionStats(statsRes.data);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading) {
      fetchData();
    }
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
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="h-4 w-full max-w-lg rounded bg-gray-200 dark:bg-white/10" />
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
      className="mx-auto flex max-w-6xl flex-col"
    >
      <UserPageHeader
        title={`Hola, ${firstName}`}
        description={
          role === "STUDENT"
            ? "Resumen de tu aprendizaje, progreso y accesos rápidos a tus cursos."
            : role === "CREATOR"
              ? "Panel de control: ingresos, rendimiento y catálogo de productos."
              : "Seguimiento de tus promociones, enlaces y comisiones en un solo lugar."
        }
        badge={<RoleBadge label={roleBadgeLabel(role)} tone={tone} />}
      />

      {role === "STUDENT" && (
        dataLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-white/10" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-xl bg-gray-200 dark:bg-white/10" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={FiBookOpen}
                label="Cursos activos"
                value={String(enrollments.length)}
                hint={enrollments.length > 0 ? "Continúa tu aprendizaje" : "Explora el catálogo para empezar"}
                tone="amber"
              />
              <StatCard
                icon={FiAward}
                label="Nivel actual"
                value={`Nv. ${level}`}
                hint={`${xpInLevel} / ${nextXp} XP hacia el siguiente nivel`}
                tone="neutral"
              />
              <StatCard
                icon={FiTarget}
                label="Meta semanal"
                value={`${xpPct}%`}
                hint="Mantén el ritmo para desbloquear insignias"
                tone="amber"
              />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
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
                      <PlaceholderRow
                        key={e.id}
                        title={e.product.title}
                        subtitle={`Progreso: ${e.progress}%`}
                        meta={e.progress >= 100 ? "Completado" : "En curso"}
                      />
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
          </>
        )
      )}

      {role === "CREATOR" && (
        dataLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-gray-200 dark:bg-white/10" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-white/10" />
              ))}
            </div>
          </div>
        ) : (
          <CreatorDashboard
            products={products}
            level={level}
            xpInLevel={xpInLevel}
            nextXp={nextXp}
            onNewProduct={() => setProductModalOpen(true)}
          />
        )
      )}

      {role === "AFFILIATE" && (
        dataLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-white/10" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-xl bg-gray-200 dark:bg-white/10" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={FiDollarSign}
                label="Comisiones pendientes"
                value={commissionStats ? `$${commissionStats.pending.total.toFixed(2)}` : "—"}
                hint={commissionStats ? `${commissionStats.pending.count} comisión(es) por cobrar` : "Cargando..."}
                tone="emerald"
              />
              <StatCard
                icon={FiDollarSign}
                label="Comisiones pagadas"
                value={commissionStats ? `$${commissionStats.paid.total.toFixed(2)}` : "—"}
                hint={commissionStats ? `${commissionStats.paid.count} comisión(es) pagadas` : "Cargando..."}
                tone="neutral"
              />
              <StatCard
                icon={FiLink}
                label="Programas activos"
                value={String(affiliations.length)}
                hint="Productos a los que estás afiliado"
                tone="emerald"
              />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard
                title="Programas que promocionas"
                action={
                  <QuickLink
                    href="/user/affiliations"
                    label="Afiliaciones"
                    variant="outline"
                  />
                }
              >
                {affiliations.length === 0 ? (
                  <p className="text-sm text-foreground/55 text-center py-6">
                    Aún no tienes afiliaciones. <Link href="/user/explore" className="text-primary underline">Explorar productos</Link>
                  </p>
                ) : (
                  <div className="space-y-2">
                    {affiliations.slice(0, 5).map((a) => (
                      <PlaceholderRow
                        key={a.id}
                        title={a.product.title}
                        subtitle={`${a.product.commissionRate}% comisión · cookie ${a.product.affiliateCookieDays} días`}
                        meta="Activo"
                      />
                    ))}
                    {affiliations.length > 5 && (
                      <p className="text-xs text-center text-foreground/35 pt-1">
                        +{affiliations.length - 5} programa{affiliations.length - 5 !== 1 ? "s" : ""} más
                      </p>
                    )}
                  </div>
                )}
              </SectionCard>
              <SectionCard
                title="Próximos pasos"
                action={
                  <QuickLink href="/user/explore" label="Buscar ofertas" variant="outline" />
                }
              >
                <p className="text-sm text-foreground/55">
                  Explora productos con comisiones competitivas y pide acceso a
                  nuevos programas desde el mercado.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <QuickLink href="/user/explore" label="Explorar mercado" variant="primary" />
                  <QuickLink href="/user/settings" label="Datos de pago" variant="outline" />
                </div>
              </SectionCard>
            </div>
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
