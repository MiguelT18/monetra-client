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
import { listMyEnrollments, type EnrollmentResponse } from "@/lib/enrollment-api";
import { FiBookOpen, FiClock, FiAward, FiPlayCircle } from "react-icons/fi";
import Link from "next/link";


export default function UserCourses() {
  const { user, loading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const firstName =
    user?.fullname?.split(/\s+/)[0] ?? user?.username ?? "usuario";

  useEffect(() => {
    if (!loading && role === "STUDENT") {
      listMyEnrollments(1, 50).then(({ ok, result }) => {
        if (ok && result.data?.enrollments) setEnrollments(result.data.enrollments);
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

  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const completed = enrollments.filter((e) => e.progress >= 100).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto flex max-w-6xl flex-col"
    >
      <UserPageHeader
        title={`Mis cursos — ${firstName}`}
        description="Retoma donde lo dejaste, revisa tu progreso y mantén tu racha de aprendizaje."
        badge={<RoleBadge label="Estudiante" tone="amber" />}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={FiBookOpen}
          label="Inscritos"
          value={String(enrollments.length)}
          hint={`${inProgress} en progreso, ${completed} completados`}
          tone="amber"
        />
        <StatCard
          icon={FiClock}
          label="Completados"
          value={String(completed)}
          hint={completed > 0 ? "Sigue así" : "Completa tu primer curso"}
          tone="neutral"
        />
        <StatCard
          icon={FiAward}
          label="En progreso"
          value={String(inProgress)}
          hint="Mantén el ritmo para desbloquear insignias"
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
                      subtitle={e.progress > 0 ? `Progreso: ${e.progress}%` : "Sin empezar"}
                      meta={e.progress >= 100 ? "Completado" : e.progress > 0 ? `${e.progress}%` : "Nuevo"}
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
