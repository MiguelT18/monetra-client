"use client";

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
} from "@/components/user/userShell";
import {
  FiBookOpen,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiTarget,
  FiBarChart2,
  FiLink,
  FiDollarSign,
} from "react-icons/fi";

function roleTone(role: Role): "blue" | "emerald" | "violet" {
  if (role === "STUDENT") return "blue";
  if (role === "PRODUCER") return "emerald";
  return "violet";
}

function roleBadgeLabel(role: Role) {
  if (role === "STUDENT") return "Estudiante";
  if (role === "PRODUCER") return "Productor";
  return "Afiliado";
}

export default function UserDashboard() {
  const { user, loading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const tone = roleTone(role);
  const firstName =
    user?.fullname?.split(/\s+/)[0] ?? user?.username ?? "tu cuenta";
  const xp = user?.gamifications.xp ?? 0;
  const level = user?.gamifications.level ?? 1;
  const nextXp = Math.max(level * 500, 1);
  const xpPct = Math.min(100, Math.round((xp / nextXp) * 100));

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
            : role === "PRODUCER"
              ? "Visión general de tu catálogo, rendimiento y próximas acciones comerciales."
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
              tone="blue"
            />
            <StatCard
              icon={FiAward}
              label="Nivel actual"
              value={`Nv. ${level}`}
              hint={`${xp} / ${nextXp} XP hacia el siguiente nivel`}
              tone="neutral"
            />
            <StatCard
              icon={FiTarget}
              label="Meta semanal"
              value={`${xpPct}%`}
              hint="Mantén el ritmo para desbloquear insignias"
              tone="violet"
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
              <p className="mb-3 text-sm text-gray-600 dark:text-white/55">
                Descubre nuevos cursos alineados con tus intereses y nivel.
              </p>
              <QuickLink href="/user/explore" label="Explorar catálogo" variant="primary" />
            </SectionCard>
          </div>
        </>
      )}

      {role === "PRODUCER" && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={FiBarChart2}
              label="Ingresos (30 días)"
              value="—"
              hint="Conecta tu pasarela para ver datos reales"
              tone="emerald"
            />
            <StatCard
              icon={FiBookOpen}
              label="Productos publicados"
              value="—"
              hint="Cursos, packs y membresías"
              tone="neutral"
            />
            <StatCard
              icon={FiTrendingUp}
              label="Conversiones"
              value="—"
              hint="Visitas → compra (estimado)"
              tone="violet"
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard
              title="Tu catálogo"
              action={
                <QuickLink href="/user/products" label="Gestionar" variant="outline" />
              }
            >
              <div className="space-y-2">
                <PlaceholderRow
                  title="Bootcamp Full Stack"
                  subtitle="Curso principal · público"
                  meta="Borrador"
                />
                <PlaceholderRow
                  title="Pack plantillas Notion"
                  subtitle="Producto digital"
                  meta="Activo"
                />
              </div>
            </SectionCard>
            <SectionCard title="Resumen comercial">
              <p className="text-sm text-gray-600 dark:text-white/55">
                Cuando integres ventas, aquí verás tendencias, devoluciones y
                afiliados que impulsan tus lanzamientos.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <QuickLink href="/user/products" label="Nuevo producto" variant="primary" />
                <QuickLink href="/user/explore" label="Ver competencia" variant="outline" />
              </div>
            </SectionCard>
          </div>
        </>
      )}

      {role === "AFFILIATE" && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={FiDollarSign}
              label="Comisiones pendientes"
              value="—"
              hint="Liquidación según calendario del productor"
              tone="violet"
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
              tone="blue"
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
              <p className="text-sm text-gray-600 dark:text-white/55">
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
    </motion.div>
  );
}
