"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  getPublicProfile,
  type PublicProfile,
} from "@/lib/user";
import { calculateLevel, abbreviateXP } from "@/components/user/userShell";
import {
  FiArrowLeft,
  FiUser,
  FiBookOpen,
  FiPackage,
  FiLink,
  FiCalendar,
  FiStar,
  FiShield,
  FiAward,
} from "react-icons/fi";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Estudiante",
  CREATOR: "Creador",
  AFFILIATE: "Afiliado",
  ADMIN: "Administrador",
};

const ROLE_COLORS: Record<string, string> = {
  STUDENT: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  CREATOR: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  AFFILIATE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  ADMIN: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { ok, result } = await getPublicProfile(username);
      if (ok && result.data?.profile) {
        setProfile(result.data.profile);
      } else {
        setError(result.message || "Usuario no encontrado");
      }
      setLoading(false);
    };

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
          <FiUser size={28} className="text-gray-300 dark:text-white/20" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            Usuario no encontrado
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/45">
            @{username} no existe o no está disponible
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary/40 hover:text-primary dark:text-white/70 cursor-pointer"
        >
          <FiArrowLeft size={14} />
          Volver
        </button>
      </div>
    );
  }

  const level = profile.gamifications
    ? calculateLevel(profile.gamifications.xp)
    : 1;
  const xp = profile.gamifications?.xp ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-white/45 dark:hover:text-white cursor-pointer"
      >
        <FiArrowLeft size={14} />
        Volver
      </button>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.fullname ?? profile.username ?? ""}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-background dark:ring-white/5"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 ring-4 ring-background dark:bg-white/5 dark:ring-white/5">
              <FiUser size={36} className="text-gray-300 dark:text-white/20" />
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.fullname || profile.username}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-gray-500 dark:text-white/45">
                  @{profile.username}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_COLORS[profile.role] || ROLE_COLORS.STUDENT}`}
                >
                  <FiShield size={10} />
                  {ROLE_LABELS[profile.role] || profile.role}
                </span>
              </div>
            </div>

            {profile.bio && (
              <p className="mt-3 text-sm text-gray-600 dark:text-white/60">
                {profile.bio}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-white/35">
              <span className="inline-flex items-center gap-1">
                <FiCalendar size={12} />
                Se unió{" "}
                {new Date(profile.createdAt).toLocaleDateString("es-MX", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <FiStar size={18} className="text-amber-500" />
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            Nv.{level}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-white/35">
            {abbreviateXP(xp)} XP
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <FiBookOpen size={18} className="text-blue-500" />
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {profile._count.enrollments}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-white/35">
            Cursos
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
            <FiPackage size={18} className="text-violet-500" />
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {profile._count.products}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-white/35">
            Productos
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <FiLink size={18} className="text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {profile._count.affiliations}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-white/35">
            Afiliaciones
          </p>
        </div>
      </div>

      {profile.role === "CREATOR" && profile._count.products > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FiAward size={16} className="text-violet-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Creador activo
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-white/45">
            Este usuario ha publicado{" "}
            <span className="font-semibold text-gray-700 dark:text-white/80">
              {profile._count.products}
            </span>{" "}
            {profile._count.products === 1 ? "producto" : "productos"} en la
            plataforma.
          </p>
        </div>
      )}
    </div>
  );
}
