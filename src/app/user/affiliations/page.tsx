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
} from "@/components/user/userShell";
import { listMyAffiliations, type AffiliationResponse } from "@/lib/affiliation-api";
import { getCommissionStats, type CommissionStats } from "@/lib/commission-api";
import {
  FiUsers,
  FiDollarSign,
  FiLink,
  FiExternalLink,
} from "react-icons/fi";

export default function AffiliationsPage() {
  const { user, loading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const [affiliations, setAffiliations] = useState<AffiliationResponse[]>([]);
  const [commissionStats, setCommissionStats] = useState<CommissionStats | null>(null);

  useEffect(() => {
    if (!loading && role === "AFFILIATE") {
      Promise.all([
        listMyAffiliations(1, 50),
        getCommissionStats(),
      ]).then(([affRes, statsRes]) => {
        if (affRes.ok && affRes.result.data?.affiliations) setAffiliations(affRes.result.data.affiliations);
        if (statsRes.ok && statsRes.data) setCommissionStats(statsRes.data);
      });
    }
  }, [loading, role]);

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

  const totalPending = commissionStats?.pending.total ?? 0;
  const totalPaid = commissionStats?.paid.total ?? 0;
  const pendingCount = commissionStats?.pending.count ?? 0;
  const paidCount = commissionStats?.paid.count ?? 0;

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
          label="Comisiones pendientes"
          value={pendingCount > 0 ? `$${totalPending.toFixed(2)}` : "$0"}
          hint={pendingCount > 0 ? `${pendingCount} comisión(es) por cobrar` : "Sin comisiones pendientes"}
          tone="emerald"
        />
        <StatCard
          icon={FiDollarSign}
          label="Comisiones pagadas"
          value={paidCount > 0 ? `$${totalPaid.toFixed(2)}` : "$0"}
          hint={paidCount > 0 ? `${paidCount} comisión(es) pagadas` : "Aún no has recibido pagos"}
          tone="emerald"
        />
        <StatCard
          icon={FiUsers}
          label="Programas activos"
          value={String(affiliations.length)}
          hint={affiliations.length > 0 ? "Creadores con los que colaboras" : "Explora productos para afiliarte"}
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
          {affiliations.length === 0 ? (
            <p className="text-sm text-foreground/55 text-center py-6">
              Aún no estás afiliado a ningún programa. <a href="/user/explore" className="text-primary underline">Explorar productos</a>
            </p>
          ) : (
            <div className="space-y-2">
              {affiliations.map((a) => (
                <PlaceholderRow
                  key={a.id}
                  title={a.product.title}
                  subtitle={`${a.product.commissionRate}% · cookie ${a.product.affiliateCookieDays} días · código: ${a.code}`}
                  meta="Activo"
                />
              ))}
            </div>
          )}
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
            {affiliations.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2.5 dark:bg-white/2">
                <div className="min-w-0 flex-1 truncate">
                  <p className="truncate text-xs font-medium text-gray-900 dark:text-white">{a.product.title}</p>
                  <span className="truncate text-xs text-gray-500 dark:text-white/40">monetra.io/ref/{a.code}</span>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-primary hover:underline text-xs font-medium ml-2 cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(`monetra.io/ref/${a.code}`)}
                >
                  Copiar
                </button>
              </div>
            ))}
            {affiliations.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-white/40 text-center py-3">
            Afíliate a un producto para obtener tu enlace de referido
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
}
