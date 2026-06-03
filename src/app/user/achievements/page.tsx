"use client";

import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types/user";
import {
  UserPageHeader,
  StatCard,
  SectionCard,
  QuickLink,
  RoleBadge,
  XpProgressPanel,
  AchievementBadgeCard,
  type AchievementStatus,
  type InfoProductAccent,
} from "@/components/user/userShell";
import type { IconType } from "react-icons";
import {
  FiAward,
  FiTarget,
  FiBookOpen,
  FiClock,
  FiZap,
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
  FiLink,
  FiStar,
  FiCheckCircle,
  FiLayers,
  FiBarChart2,
  FiMessageCircle,
  FiPackage,
  FiShoppingBag,
  FiShare2,
  FiPlayCircle,
} from "react-icons/fi";

function roleTone(role: Role): "blue" | "emerald" | "violet" | "amber" {
  if (role === "STUDENT") return "amber";
  if (role === "CREATOR") return "violet";
  return "emerald";
}

function roleLabel(role: Role) {
  if (role === "STUDENT") return "Estudiante";
  if (role === "CREATOR") return "Creador";
  return "Afiliado";
}

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  status: AchievementStatus;
  accent: InfoProductAccent;
  progress?: number;
  xpReward?: number;
  unlockedLabel?: string;
};

const STUDENT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-lesson",
    title: "Primera lección",
    description: "Completa tu primera lección en cualquier curso.",
    icon: FiPlayCircle,
    status: "unlocked",
    accent: "blue",
    xpReward: 50,
    unlockedLabel: "Desbloqueado",
  },
  {
    id: "streak-7",
    title: "Racha semanal",
    description: "Estudia al menos 15 minutos durante 7 días seguidos.",
    icon: FiZap,
    status: "in_progress",
    accent: "amber",
    progress: 57,
    xpReward: 200,
  },
  {
    id: "first-course",
    title: "Graduado",
    description: "Termina por completo tu primer curso de la plataforma.",
    icon: FiAward,
    status: "in_progress",
    accent: "violet",
    progress: 72,
    xpReward: 500,
  },
  {
    id: "community",
    title: "Voz en la comunidad",
    description: "Participa en 5 hilos del foro o grupos de estudio.",
    icon: FiMessageCircle,
    status: "locked",
    accent: "cyan",
    xpReward: 150,
  },
  {
    id: "certified",
    title: "Certificado oficial",
    description: "Obtén tu primer certificado verificable al completar un curso.",
    icon: FiCheckCircle,
    status: "unlocked",
    accent: "emerald",
    xpReward: 300,
    unlockedLabel: "Desbloqueado",
  },
  {
    id: "explorer",
    title: "Explorador",
    description: "Inscríbete en 3 cursos de categorías distintas.",
    icon: FiBookOpen,
    status: "locked",
    accent: "rose",
    xpReward: 100,
  },
];

  const CREATOR_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-product",
    title: "Primer lanzamiento",
    description: "Publica tu primer infoproducto en el catálogo.",
    icon: FiPackage,
    status: "unlocked",
    accent: "emerald",
    xpReward: 250,
    unlockedLabel: "Desbloqueado",
  },
  {
    id: "first-sale",
    title: "Primera venta",
    description: "Registra tu primera venta confirmada en la plataforma.",
    icon: FiShoppingBag,
    status: "in_progress",
    accent: "amber",
    progress: 40,
    xpReward: 400,
  },
  {
    id: "reviews",
    title: "Producto valorado",
    description: "Recibe 10 reseñas con 4 estrellas o más en un mismo producto.",
    icon: FiStar,
    status: "in_progress",
    accent: "violet",
    progress: 60,
    xpReward: 350,
  },
  {
    id: "affiliate-network",
    title: "Red de afiliados",
    description: "Activa un programa de afiliados con al menos 5 promotores.",
    icon: FiUsers,
    status: "locked",
    accent: "blue",
    xpReward: 500,
  },
  {
    id: "revenue-milestone",
    title: "Hito de ingresos",
    description: "Alcanza €1.000 en ventas acumuladas en un periodo de 30 días.",
    icon: FiDollarSign,
    status: "locked",
    accent: "cyan",
    xpReward: 600,
  },
  {
    id: "catalog-5",
    title: "Catálogo en expansión",
    description: "Mantén 5 productos activos publicados simultáneamente.",
    icon: FiLayers,
    status: "locked",
    accent: "rose",
    xpReward: 200,
  },
];

const AFFILIATE_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-link",
    title: "Primer enlace",
    description: "Genera y comparte tu primer enlace de afiliado con seguimiento.",
    icon: FiLink,
    status: "unlocked",
    accent: "violet",
    xpReward: 75,
    unlockedLabel: "Desbloqueado",
  },
  {
    id: "first-commission",
    title: "Primera comisión",
    description: "Recibe tu primera comisión liquidada por una venta atribuida.",
    icon: FiDollarSign,
    status: "in_progress",
    accent: "emerald",
    progress: 85,
    xpReward: 300,
  },
  {
    id: "clicks-100",
    title: "Tráfico constante",
    description: "Acumula 100 clics válidos en tus enlaces en un mes.",
    icon: FiTrendingUp,
    status: "in_progress",
    accent: "blue",
    progress: 34,
    xpReward: 150,
  },
  {
    id: "conversions-10",
    title: "Conversor nato",
    description: "Genera 10 conversiones confirmadas en un mismo programa.",
    icon: FiTarget,
    status: "locked",
    accent: "amber",
    xpReward: 400,
  },
  {
    id: "top-affiliate",
    title: "Top del mes",
    description: "Entra en el top 10 de afiliados de un creador verificado.",
    icon: FiAward,
    status: "locked",
    accent: "rose",
    xpReward: 500,
  },
  {
    id: "multi-program",
    title: "Cartera diversificada",
    description: "Promociona activamente 3 programas de nichos distintos.",
    icon: FiShare2,
    status: "locked",
    accent: "cyan",
    xpReward: 200,
  },
];

function achievementsForRole(role: Role): Achievement[] {
    if (role === "CREATOR") return CREATOR_ACHIEVEMENTS;
  if (role === "AFFILIATE") return AFFILIATE_ACHIEVEMENTS;
  return STUDENT_ACHIEVEMENTS;
}

function byStatus(items: Achievement[], status: AchievementStatus) {
  return items.filter((a) => a.status === status);
}

function AchievementGrid({ items }: { items: Achievement[] }) {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <AchievementBadgeCard key={item.id} {...item} />
      ))}
    </div>
  );
}

export default function AchievementsPage() {
  const { user, loading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const tone = roleTone(role);
  const xp = user?.gamifications.xp ?? 0;
  const level = user?.gamifications.level ?? 1;
  const all = achievementsForRole(role);
  const unlocked = byStatus(all, "unlocked");
  const inProgress = byStatus(all, "in_progress");
  const locked = byStatus(all, "locked");

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="h-24 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200 dark:bg-white/10"
            />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-gray-200 dark:bg-white/10"
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
        title="Logros e insignias"
        description={
          role === "STUDENT"
            ? "Gana XP estudiando, desbloquea insignias y sigue tu racha de aprendizaje."
            : role === "CREATOR"
              ? "Reconoce hitos de tu catálogo, ventas y comunidad de afiliados."
              : "Celebra tus conversiones, comisiones y constancia como promotor."
        }
        badge={<RoleBadge label={roleLabel(role)} tone={tone} />}
      />

      <XpProgressPanel level={level} xp={xp} tone={tone} />

      {role === "STUDENT" && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={FiAward}
            label="Insignias"
            value={`${unlocked.length} / ${all.length}`}
            hint="Desbloqueadas del catálogo visible"
            tone="amber"
          />
          <StatCard
            icon={FiZap}
            label="Racha actual"
            value="4 días"
            hint="Sigue estudiando para mantenerla"
            tone="amber"
          />
          <StatCard
            icon={FiClock}
            label="Tiempo total"
            value="18 h"
            hint="Video + prácticas registradas"
            tone="neutral"
          />
        </div>
      )}

      {role === "CREATOR" && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={FiAward}
            label="Hitos comerciales"
            value={`${unlocked.length} / ${all.length}`}
            hint="Logros de catálogo y ventas"
            tone="violet"
          />
          <StatCard
            icon={FiBarChart2}
            label="Productos activos"
            value="2"
            hint="Publicados en tu catálogo"
            tone="neutral"
          />
          <StatCard
            icon={FiStar}
            label="Valoración media"
            value="4.8 ★"
            hint="Promedio de reseñas recientes"
            tone="violet"
          />
        </div>
      )}

      {role === "AFFILIATE" && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={FiAward}
            label="Logros"
            value={`${unlocked.length} / ${all.length}`}
            hint="Desbloqueados en tu trayectoria"
            tone="emerald"
          />
          <StatCard
            icon={FiLink}
            label="Enlaces activos"
            value="6"
            hint="Campañas con seguimiento UTM"
            tone="neutral"
          />
          <StatCard
            icon={FiTarget}
            label="Conversiones"
            value="3"
            hint="Este mes · atribuidas a ti"
            tone="emerald"
          />
        </div>
      )}

      <div className="space-y-6">
        {unlocked.length > 0 && (
          <SectionCard
            title="Desbloqueados"
            action={
              role === "STUDENT" ? (
                <QuickLink href="/user/courses" label="Mis cursos" variant="outline" />
              ) : role === "CREATOR" ? (
                <QuickLink href="/user/products" label="Mi catálogo" variant="outline" />
              ) : (
                <QuickLink
                  href="/user/affiliations"
                  label="Mis programas"
                  variant="outline"
                />
              )
            }
          >
            <AchievementGrid items={unlocked} />
          </SectionCard>
        )}

        {inProgress.length > 0 && (
          <SectionCard title="En progreso">
            <p className="mb-4 text-sm text-gray-600 dark:text-white/55">
              {role === "STUDENT"
                ? "Completa estas metas para sumar XP y subir de nivel."
                : role === "CREATOR"
                  ? "Estás cerca de estos hitos de negocio y reputación."
                  : "Sigue promocionando para cerrar estos objetivos."}
            </p>
            <AchievementGrid items={inProgress} />
          </SectionCard>
        )}

        {locked.length > 0 && (
          <SectionCard
            title="Próximos desafíos"
            action={
              <QuickLink href="/user/explore" label="Explorar" variant="outline" />
            }
          >
            <p className="mb-4 text-sm text-gray-600 dark:text-white/55">
              {role === "STUDENT"
                ? "Insignias que podrás desbloquear al seguir aprendiendo."
                : role === "CREATOR"
                  ? "Objetivos avanzados para escalar tu catálogo y comunidad."
                  : "Metas para afiliados con mayor volumen y diversificación."}
            </p>
            <AchievementGrid items={locked} />
          </SectionCard>
        )}
      </div>
    </motion.div>
  );
}
