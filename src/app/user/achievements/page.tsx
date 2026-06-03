"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types/user";
import type { Achievement } from "@/types/user";
import {
  UserPageHeader,
  StatCard,
  SectionCard,
  QuickLink,
  RoleBadge,
  XpProgressPanel,
  AchievementBadgeCard,
  type InfoProductAccent,
} from "@/components/user/userShell";
import {
  FiAward,
  FiZap,
  FiClock,
  FiBarChart2,
  FiStar,
  FiLink,
  FiTarget,
  FiInbox,
} from "react-icons/fi";
import { getMyAchievements } from "@/lib/achievement-api";
import { achievementIcon } from "@/lib/achievement-icons";

const ACCENTS: InfoProductAccent[] = [
  "blue", "emerald", "violet", "amber", "rose", "cyan",
];

function roleTone(role: Role): "blue" | "emerald" | "violet" | "amber" | "red" {
  if (role === "STUDENT") return "amber";
  if (role === "CREATOR") return "violet";
  if (role === "ADMIN") return "red";
  return "emerald";
}

function roleLabel(role: Role) {
  if (role === "STUDENT") return "Estudiante";
  if (role === "CREATOR") return "Creador";
  if (role === "ADMIN") return "Admin";
  return "Afiliado";
}

function byStatus(items: Achievement[], status: string) {
  return items.filter((a) => a.status === status);
}

function AchievementGrid({ items }: { items: Achievement[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, i) => (
        <AchievementBadgeCard
          key={item.id}
          title={item.title}
          description={item.description}
          icon={achievementIcon(item.icon)}
          status={item.status as any}
          progress={item.progress}
          xpReward={item.xpReward}
          accent={ACCENTS[i % ACCENTS.length]}
          unlockedLabel={item.status === "unlocked" ? "Desbloqueado" : undefined}
        />
      ))}
    </div>
  );
}

export default function AchievementsPage() {
  const { user, loading: profileLoading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const tone = roleTone(role);
  const xp = user?.gamifications.xp ?? 0;
  const level = user?.gamifications.level ?? 1;

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileLoading) return;
    setLoading(true);
    getMyAchievements().then((res) => {
      if (res.ok && res.data) {
        setAchievements(res.data);
      } else {
        setAchievements([]);
      }
      setLoading(false);
    });
  }, [profileLoading]);

  const unlocked = byStatus(achievements, "unlocked");
  const inProgress = byStatus(achievements, "in_progress");
  const locked = byStatus(achievements, "locked");

  if (loading || profileLoading) {
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

      {achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background/60 py-16 text-center dark:bg-white/3">
          <FiInbox size={48} className="mb-4 text-gray-400 dark:text-white/25" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            No hay logros disponibles
          </p>
          <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-white/45">
            {role === "STUDENT"
              ? "Comienza a explorar cursos y completar lecciones para desbloquear tus primeros logros."
              : role === "CREATOR"
                ? "Publica tu primer producto y empieza a construir tu reputación como creador."
                : "Genera tu primer enlace de afiliado y comienza a promocionar."}
          </p>
          <QuickLink
            href="/user/explore"
            label="Explorar ahora"
            variant="primary"
          />
        </div>
      ) : (
        <>
          {role === "STUDENT" && (
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <StatCard
                icon={FiAward}
                label="Insignias"
                value={`${unlocked.length} / ${achievements.length}`}
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
                value={`${unlocked.length} / ${achievements.length}`}
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
                value={`${unlocked.length} / ${achievements.length}`}
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
        </>
      )}
    </motion.div>
  );
}
