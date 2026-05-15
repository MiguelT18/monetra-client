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
  FiPackage,
  FiDollarSign,
  FiUsers,
  FiPlus,
  FiEdit3,
} from "react-icons/fi";

export default function ProductsPage() {
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

  if (role !== "PRODUCER") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg rounded-xl border border-border bg-background/60 p-6 text-center dark:bg-white/3"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Solo productores gestionan el catálogo
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-white/55">
          Activa el rol Productor para crear y editar productos.
        </p>
        <div className="mt-4 flex justify-center">
          <QuickLink href="/user/dashboard" label="Ir al dashboard" variant="primary" />
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
        title="Mis productos"
        description="Publica, actualiza precios y conecta afiliados a tus lanzamientos. Vista previa orientada a catálogo."
        badge={<RoleBadge label="Productor" tone="emerald" />}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={FiPackage}
            label="Activos"
            value="—"
            hint="Visibles en la tienda"
            tone="emerald"
          />
          <StatCard
            icon={FiDollarSign}
            label="Ingresos (30 días)"
            value="—"
            hint="Conecta pagos para métricas"
            tone="neutral"
          />
          <StatCard
            icon={FiUsers}
            label="Afiliados"
            value="—"
            hint="Promotores con enlace propio"
            tone="violet"
          />
        </div>
      </div>

      <SectionCard
        title="Catálogo"
        action={
          <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-white/45">
            <FiPlus size={14} className="text-primary" />
            Alta próximamente
          </span>
        }
      >
        <div className="space-y-2">
          <PlaceholderRow
            title="Curso · React avanzado"
            subtitle="Última edición · hace 2 días · público"
            meta="Borrador"
          />
          <PlaceholderRow
            title="Pack · Plantillas Notion CRM"
            subtitle="Digital · descarga inmediata"
            meta="Activo"
          />
          <PlaceholderRow
            title="Membresía · Comunidad creativos"
            subtitle="Suscripción mensual"
            meta="Pausado"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white opacity-80"
            disabled
          >
            <FiPlus size={16} />
            Nuevo producto
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-white"
          >
            <FiEdit3 size={16} />
            Editar borradores
          </button>
          <QuickLink href="/user/explore" label="Ver mercado" variant="outline" />
        </div>
      </SectionCard>
    </motion.div>
  );
}
