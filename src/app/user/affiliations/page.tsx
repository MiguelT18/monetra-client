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
  FiUsers,
  FiDollarSign,
  FiLink,
  FiExternalLink,
} from "react-icons/fi";

export default function AffiliationsPage() {
  const { user, loading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="grid gap-3 sm:grid-cols-3">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto flex max-w-6xl flex-col"
    >
      <UserPageHeader
        title="Mis afiliaciones"
        description="Programas aceptados, tasas de comisión, ventanas de cookie y enlaces listos para campañas."
        badge={<RoleBadge label="Afiliado" tone="emerald" />}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={FiDollarSign}
          label="Comisiones (mes)"
          value="—"
          hint="Liquidación según calendario"
          tone="emerald"
        />
        <StatCard
          icon={FiLink}
          label="Conversiones"
          value="—"
          hint="Ventas atribuidas a tus enlaces"
          tone="emerald"
        />
        <StatCard
          icon={FiUsers}
          label="Programas activos"
          value="—"
          hint="Creadores con los que colaboras"
          tone="neutral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Programas"
          action={
            <QuickLink href="/user/explore" label="Buscar más" variant="outline" />
          }
        >
          <div className="space-y-2">
            <PlaceholderRow
              title="Monetra · Curso base de finanzas"
              subtitle="15% · cookie 30 días · pago mensual"
              meta="Activo"
            />
            <PlaceholderRow
              title="Taller intensivo de copy"
              subtitle="20% · cupos limitados"
              meta="En revisión"
            />
            <PlaceholderRow
              title="Suscripción newsletter premium"
              subtitle="10% recurrente 6 meses"
              meta="Activo"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Enlaces y material"
          action={
            <QuickLink href="/user/settings" label="Configuración" variant="outline" />
          }
        >
          <p className="mb-3 text-sm text-gray-600 dark:text-white/55">
            Copia enlaces con UTM, descarga creatividades y revisa políticas de
            marca de cada creador.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2.5 dark:bg-white/2">
              <span className="truncate text-xs text-gray-600 dark:text-white/55">
                monetra.io/ref/<span className="font-mono text-gray-900 dark:text-white">tu-id</span>
              </span>
              <button
                type="button"
                className="shrink-0 text-primary hover:underline text-xs font-medium"
              >
                Copiar
              </button>
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-gray-600 transition hover:border-primary/40 hover:text-primary dark:text-white/55"
            >
              <FiExternalLink size={16} />
              Generar enlace con UTM
            </button>
          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
}
