"use client";

import {
  FiCalendar,
  FiShield,
  FiUser,
  FiUserX,
  FiUserCheck,
} from "react-icons/fi";
import type { PublicProfile } from "@/lib/user";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Estudiante",
  CREATOR: "Creador",
  AFFILIATE: "Afiliado",
  ADMIN: "Administrador",
};

const ROLE_RING: Record<string, string> = {
  STUDENT: "ring-blue-400/50 dark:ring-blue-500/40",
  CREATOR: "ring-violet-400/50 dark:ring-violet-500/40",
  AFFILIATE: "ring-emerald-400/50 dark:ring-emerald-500/40",
  ADMIN: "ring-amber-400/50 dark:ring-amber-500/40",
};

const ROLE_GRADIENT: Record<string, string> = {
  STUDENT: "from-blue-500/10 via-background to-blue-500/5",
  CREATOR: "from-violet-500/10 via-background to-violet-500/5",
  AFFILIATE: "from-emerald-500/10 via-background to-emerald-500/5",
  ADMIN: "from-amber-500/10 via-background to-amber-500/5",
};

export default function ProfileHeader({
  profile,
  isOwner,
  isBlocked,
  blocking,
  onToggleBlock,
}: {
  profile: PublicProfile;
  isOwner: boolean;
  isBlocked: boolean;
  blocking: boolean;
  onToggleBlock: () => void;
}) {
  const ring = ROLE_RING[profile.role] || ROLE_RING.STUDENT;
  const gradient = ROLE_GRADIENT[profile.role] || ROLE_GRADIENT.STUDENT;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br shadow-sm dark:bg-white/3">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-500/10" />

      <div className="relative p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className={`shrink-0 rounded-full ring-4 ${ring}`}>
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.fullname ?? profile.username ?? ""}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                <FiUser size={36} className="text-gray-300 dark:text-white/30" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.fullname || profile.username}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-gray-500 dark:text-white/50">
                  @{profile.username}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  <FiShield size={10} />
                  {ROLE_LABELS[profile.role] || profile.role}
                </span>
              </div>
            </div>

            {profile.bio && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-white/60">
                {profile.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
                <FiCalendar size={12} />
                Miembro desde{" "}
                {new Date(profile.createdAt).toLocaleDateString("es-MX", {
                  month: "long",
                  year: "numeric",
                })}
              </span>

              {!isOwner && (
                <button
                  onClick={onToggleBlock}
                  disabled={blocking}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isBlocked
                      ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400"
                  }`}
                >
                  {blocking ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : isBlocked ? (
                    <FiUserCheck size={12} />
                  ) : (
                    <FiUserX size={12} />
                  )}
                  {isBlocked ? "Desbloquear" : "Bloquear"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
