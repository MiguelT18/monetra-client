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
import { AreaChartCard, BarChartCard } from "@/components/ui/chart";
import { listMyProducts, type ProductResponse } from "@/lib/product-api";
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

const monthlyRevenue = [
  { name: "Ene", ingresos: 1200, visitas: 340 },
  { name: "Feb", ingresos: 1900, visitas: 520 },
  { name: "Mar", ingresos: 2800, visitas: 680 },
  { name: "Abr", ingresos: 2400, visitas: 590 },
  { name: "May", ingresos: 3200, visitas: 810 },
  { name: "Jun", ingresos: 4100, visitas: 940 },
  { name: "Jul", ingresos: 3800, visitas: 870 },
  { name: "Ago", ingresos: 4500, visitas: 1020 },
  { name: "Sep", ingresos: 4200, visitas: 960 },
  { name: "Oct", ingresos: 5100, visitas: 1100 },
  { name: "Nov", ingresos: 4800, visitas: 1050 },
  { name: "Dic", ingresos: 6200, visitas: 1280 },
];

const productPerformance = [
  { name: "Curso A", ventas: 45, estudiantes: 38 },
  { name: "Curso B", ventas: 32, estudiantes: 29 },
  { name: "Curso C", ventas: 28, estudiantes: 24 },
  { name: "Curso D", ventas: 18, estudiantes: 15 },
  { name: "Curso E", ventas: 12, estudiantes: 10 },
];

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

  const saldoDisponible = 3280.50;
  const saldoCongelado = 1240.00;
  const saldoTotal = saldoDisponible + saldoCongelado;

  function mask(val: number) {
    return showBalance ? `$${val.toLocaleString("es", { minimumFractionDigits: 2 })}` : "••••••";
  }

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <section className="flex flex-col rounded-2xl border border-violet-200/80 bg-violet-500/[0.04] p-5 shadow-md dark:border-violet-500/20 dark:bg-violet-500/10">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
                  Saldo total
                </p>
                <button
                  onClick={() => setShowBalance((v) => !v)}
                  className="text-foreground/30 hover:text-foreground/70 transition-colors"
                >
                  {showBalance ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              <p className="truncate text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {mask(saldoTotal)}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm text-violet-600 dark:text-violet-400">
              <FiDollarSign size={20} />
            </div>
          </div>
          <div className="mt-auto pt-4">
            <div className="h-px bg-violet-200/50 dark:bg-violet-500/15 mb-3" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
                  <span className="text-xs text-gray-500 dark:text-white/40">Disponible</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {mask(saldoDisponible)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-xs text-gray-500 dark:text-white/40">Congelado</span>
                </div>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {mask(saldoCongelado)}
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="flex flex-col rounded-2xl border border-border bg-background/60 p-5 shadow-md dark:bg-white/3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
                Productos
              </p>
              <p className="truncate text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {products.length}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm text-gray-500 dark:text-white/50">
              <FiBookOpen size={20} />
            </div>
          </div>
          <div className="mt-auto pt-4">
            <div className="h-px bg-border dark:bg-white/10 mb-3" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-500 dark:text-white/40">Activos</span>
                </div>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{publishedCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-gray-500 dark:text-white/40">En revisión</span>
                </div>
                <span className="font-medium text-blue-600 dark:text-blue-400">{underReviewCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-gray-500 dark:text-white/40">Borradores</span>
                </div>
                <span className="font-medium text-amber-600 dark:text-amber-400">{draftCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-gray-500 dark:text-white/40">Rechazados</span>
                </div>
                <span className="font-medium text-red-600 dark:text-red-400">{rejectedCount}</span>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10 flex">
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
            {archivedCount > 0 && (
              <p className="mt-1.5 text-[11px] text-gray-400 dark:text-white/35 text-right">
                +{archivedCount} archivado{archivedCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </section>
        <section className="flex flex-col rounded-2xl border border-violet-200/80 bg-violet-500/[0.04] p-5 shadow-md dark:border-violet-500/20 dark:bg-violet-500/10">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
                Estudiantes
              </p>
              <p className="truncate text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {totalStudents}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm text-violet-600 dark:text-violet-400">
              <FiUsers size={20} />
            </div>
          </div>
          <div className="mt-auto pt-4">
            <div className="h-px bg-violet-200/50 dark:bg-violet-500/15 mb-3" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
                  <span className="text-xs text-gray-500 dark:text-white/40">Afiliados totales</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {totalAffiliates}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-violet-300" />
                  <span className="text-xs text-gray-500 dark:text-white/40">Ventas completadas</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {totalOrders}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <AreaChartCard
          title="Ingresos"
          subtitle="Evolución mensual de ingresos y visitas"
          data={monthlyRevenue}
          categories={[
            { key: "ingresos", name: "Ingresos", color: "#7C3AED" },
            { key: "visitas", name: "Visitas", color: "#A78BFA" },
          ]}
          formatter={(v) => `$${v.toLocaleString()}`}
        />
        <BarChartCard
          title="Rendimiento por producto"
          subtitle="Ventas y estudiantes por curso"
          data={productPerformance}
          categories={[
            { key: "ventas", name: "Ventas", color: "#7C3AED" },
            { key: "estudiantes", name: "Estudiantes", color: "#A78BFA" },
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
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
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:opacity-90"
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
  const [productModalOpen, setProductModalOpen] = useState(false);
  const tone = roleTone(role);

  const fetchProducts = async () => {
    if (role !== "CREATOR") return;
    const { ok, result } = await listMyProducts();
    if (ok && result.data?.products) {
      setProducts(result.data.products);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchProducts();
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
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={FiBookOpen}
              label="Cursos activos"
              value="3"
              hint="Próxima entrega · Fundamentos de UX"
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
              <div className="space-y-2">
                <PlaceholderRow
                  title="Diseño de interfaces con Tailwind"
                  subtitle="Módulo 4 · Componentes reutilizables"
                  meta="En curso"
                />
                <PlaceholderRow
                  title="Introducción a Next.js"
                  subtitle="Módulo 2 · Rutas y layouts"
                  meta="65%"
                />
                <PlaceholderRow
                  title="Accesibilidad web práctica"
                  subtitle="Sin empezar"
                  meta="Nuevo"
                />
              </div>
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
      )}

      {role === "CREATOR" && (
        <CreatorDashboard
          products={products}
          level={level}
          xpInLevel={xpInLevel}
          nextXp={nextXp}
          onNewProduct={() => setProductModalOpen(true)}
        />
      )}

      {role === "AFFILIATE" && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={FiDollarSign}
              label="Comisiones pendientes"
              value="—"
              hint="Liquidación según calendario del creador"
              tone="emerald"
            />
            <StatCard
              icon={FiLink}
              label="Enlaces activos"
              value="—"
              hint="Campañas con seguimiento UTM"
              tone="neutral"
            />
            <StatCard
              icon={FiUsers}
              label="Clics (7 días)"
              value="—"
              hint="Tráfico atribuido a tus enlaces"
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
              <div className="space-y-2">
                <PlaceholderRow
                  title="Academia Monetra · Tier estándar"
                  subtitle="15% por venta · cookie 30 días"
                  meta="Activo"
                />
                <PlaceholderRow
                  title="Curso avanzado de datos"
                  subtitle="10% recurrente"
                  meta="Pendiente"
                />
              </div>
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
      )}
      <Modal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)}>
        <ProductForm
          onClose={() => setProductModalOpen(false)}
          onSuccess={() => {
            setProductModalOpen(false);
            refetch();
            fetchProducts();
          }}
        />
      </Modal>
    </motion.div>
  );
}
