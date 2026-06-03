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
import { FiBookOpen, FiClock, FiAward, FiPlayCircle } from "react-icons/fi";

export default function UserCourses() {
  const { user, loading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const firstName =
    user?.fullname?.split(/\s+/)[0] ?? user?.username ?? "usuario";

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

  if (role !== "STUDENT") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg rounded-2xl border border-border bg-background/60 p-6 text-center dark:bg-white/3"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Esta sección es solo para estudiantes
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-white/55">
          Cambia al rol Estudiante o vuelve al panel principal.
        </p>
        <div className="mt-4 flex justify-center gap-2">
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
        title={`Mis cursos — ${firstName}`}
        description="Retoma donde lo dejaste, revisa el tiempo invertido y mantén tu racha de aprendizaje."
        badge={<RoleBadge label="Estudiante" tone="amber" />}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={FiBookOpen}
          label="Inscritos"
          value="5"
          hint="2 en progreso activo"
          tone="amber"
        />
        <StatCard
          icon={FiClock}
          label="Esta semana"
          value="3 h 20 m"
          hint="Tiempo de video + prácticas"
          tone="neutral"
        />
        <StatCard
          icon={FiAward}
          label="Insignias"
          value="8"
          hint="Desbloquea más completando módulos"
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Continuar"
            action={
              <QuickLink href="/user/explore" label="Explorar más" variant="outline" />
            }
          >
            <div className="space-y-2">
              <PlaceholderRow
                title="Fundamentos de UX research"
                subtitle="Lección 6 · Encuestas y entrevistas"
                meta="72%"
              />
              <PlaceholderRow
                title="TypeScript aplicado a React"
                subtitle="Proyecto · Lista de tareas tipada"
                meta="En curso"
              />
              <PlaceholderRow
                title="Accesibilidad WCAG 2.2"
                subtitle="Sin empezar · ~4 h"
                meta="Nuevo"
              />
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Atajos">
          <ul className="space-y-3 text-sm text-gray-600 dark:text-white/60">
            <li className="flex gap-2">
              <FiPlayCircle className="mt-0.5 shrink-0 text-primary" />
              Reproduce el siguiente vídeo marcado en tu calendario.
            </li>
            <li className="flex gap-2">
              <FiBookOpen className="mt-0.5 shrink-0 text-primary" />
              Descarga guías y checklists del instructor.
            </li>
          </ul>
          <div className="mt-4">
            <QuickLink href="/user/dashboard" label="Ver panel" variant="primary" />
          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
}
