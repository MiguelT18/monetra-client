"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  getPublicProfile,
  type PublicProfile,
} from "@/lib/user";
import {
  calculateLevel,
  XpProgressPanel,
  AchievementBadgeCard,
} from "@/components/user/userShell";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileProducts from "@/components/profile/ProfileProducts";
import ProfileComments from "@/components/profile/ProfileComments";
import { useProfile } from "@/hooks/useProfile";
import {
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "@/lib/profile-comment-api";
import { useNotification } from "@/hooks/useNotification";
import { achievementIcon } from "@/lib/achievement-icons";
import {
  FiArrowLeft,
  FiUser,
  FiBookOpen,
  FiPackage,
  FiLink,
  FiStar,
  FiMessageSquare,
} from "react-icons/fi";

const ROLE_TONE: Record<string, "blue" | "emerald" | "violet" | "amber" | "red"> = {
  STUDENT: "blue",
  CREATOR: "violet",
  AFFILIATE: "emerald",
  ADMIN: "amber",
};

const ROLE_ACCENT: Record<string, "blue" | "emerald" | "violet" | "amber" | "rose" | "cyan"> = {
  STUDENT: "blue",
  CREATOR: "violet",
  AFFILIATE: "emerald",
  ADMIN: "amber",
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const { user } = useProfile();
  const { notify } = useNotification();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocking, setBlocking] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [profileCommentCount, setProfileCommentCount] = useState(0);

  const isOwner = !!user && user.id === profile?.id;

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

  useEffect(() => {
    if (!profile || !user) return;
    if (profile.id === user.id) return;

    getBlockedUsers(user.id).then(({ ok, data }) => {
      if (ok && data) {
        const blocked = data.blocked.some((b) => b.blocked.id === profile!.id);
        setIsBlocked(blocked);
      }
    });
  }, [profile, user]);

  const handleToggleBlock = async () => {
    if (!profile || !user) return;

    if (isBlocked) {
      setBlocking(true);
      const { ok } = await unblockUser(user.id, profile.id);
      if (ok) {
        setIsBlocked(false);
        notify("success", "Usuario desbloqueado");
      } else {
        notify("error", "Error al desbloquear usuario");
      }
      setBlocking(false);
    } else {
      if (!window.confirm(`¿Estás seguro de bloquear a @${profile.username}?`))
        return;
      setBlocking(true);
      const { ok } = await blockUser(user.id, profile.id);
      if (ok) {
        setIsBlocked(true);
        notify("success", "Usuario bloqueado");
      } else {
        notify("error", "Error al bloquear usuario");
      }
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse py-8">
        <div className="mb-6 h-4 w-16 rounded bg-gray-200 dark:bg-white/10" />
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-gray-200 p-6 dark:bg-white/10">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="h-20 w-20 shrink-0 rounded-full bg-gray-300 dark:bg-white/15 sm:h-24 sm:w-24" />
                <div className="min-w-0 flex-1 space-y-3 self-center sm:self-start">
                  <div className="mx-auto h-5 w-36 rounded bg-gray-300 dark:bg-white/15 sm:mx-0" />
                  <div className="mx-auto h-3.5 w-24 rounded bg-gray-300 dark:bg-white/15 sm:mx-0" />
                  <div className="mx-auto h-3 w-48 rounded bg-gray-300 dark:bg-white/15 sm:mx-0" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-gray-200 p-5 dark:bg-white/10">
              <div className="mb-3 h-3 w-20 rounded bg-gray-300 dark:bg-white/15" />
              <div className="mb-3 h-9 w-full rounded-lg bg-gray-300 dark:bg-white/15" />
              <div className="mb-1 flex justify-between">
                <div className="h-3 w-14 rounded bg-gray-300 dark:bg-white/15" />
                <div className="h-3 w-10 rounded bg-gray-300 dark:bg-white/15" />
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-300 dark:bg-white/15" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl bg-gray-200 p-5 dark:bg-white/10">
                  <div className="mb-3 h-10 w-10 rounded-xl bg-gray-300 dark:bg-white/15" />
                  <div className="mb-1 h-6 w-12 rounded bg-gray-300 dark:bg-white/15" />
                  <div className="h-3 w-16 rounded bg-gray-300 dark:bg-white/15" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl bg-gray-200 p-5 dark:bg-white/10">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gray-300 dark:bg-white/15" />
                <div className="h-4 w-36 rounded bg-gray-300 dark:bg-white/15" />
                <div className="h-5 w-6 rounded-full bg-gray-300 dark:bg-white/15" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="overflow-hidden rounded-xl bg-gray-300 dark:bg-white/15">
                    <div className="aspect-[16/10] bg-gray-300 dark:bg-white/20" />
                    <div className="space-y-2 p-3">
                      <div className="h-3.5 w-4/5 rounded bg-gray-300 dark:bg-white/20" />
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-12 rounded bg-gray-300 dark:bg-white/20" />
                        <div className="h-3 w-14 rounded bg-gray-300 dark:bg-white/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-gray-200 p-5 dark:bg-white/10">
              <div className="mb-4 h-4 w-28 rounded bg-gray-300 dark:bg-white/15" />
              <div className="mb-4 h-16 w-full rounded-xl bg-gray-300 dark:bg-white/15" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-gray-300 dark:bg-white/15" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 rounded bg-gray-300 dark:bg-white/15" />
                      <div className="h-7 w-full rounded-lg bg-gray-300 dark:bg-white/15" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
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
      </div>
    );
  }

  const level = profile.gamifications
    ? calculateLevel(profile.gamifications.xp)
    : 1;
  const xp = profile.gamifications?.xp ?? 0;
  const tone = ROLE_TONE[profile.role] || "blue";
  const products = profile.products ?? [];
  const achievements = profile.achievements ?? [];

  const unlockedAchievements = achievements.filter((a) => a.status === "unlocked");
  const inProgressAchievements = achievements.filter(
    (a) => a.status === "in_progress"
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-white/45 dark:hover:text-white cursor-pointer"
      >
        <FiArrowLeft size={14} />
        Volver
      </button>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* ─── LEFT COLUMN ─── */}
        <div className="space-y-6">
          <ProfileHeader
            profile={profile}
            isOwner={isOwner}
            isBlocked={isBlocked}
            blocking={blocking}
            onToggleBlock={handleToggleBlock}
          />

          {profile.gamifications && (
            <XpProgressPanel level={level} xp={xp} tone={tone} />
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FiBookOpen, label: "Cursos", value: profile._count.enrollments, gradient: "from-blue-500/[0.04] to-blue-500/[0.02]", blur: "bg-blue-500/5", iconColors: "bg-blue-500/10 text-blue-500" },
              { icon: FiPackage, label: "Productos", value: profile._count.products, gradient: "from-violet-500/[0.04] to-violet-500/[0.02]", blur: "bg-violet-500/5", iconColors: "bg-violet-500/10 text-violet-500" },
              { icon: FiLink, label: "Afiliaciones", value: profile._count.affiliations, gradient: "from-emerald-500/[0.04] to-emerald-500/[0.02]", blur: "bg-emerald-500/5", iconColors: "bg-emerald-500/10 text-emerald-500" },
              { icon: FiMessageSquare, label: "Reseñas", value: profile._count.reviews, gradient: "from-amber-500/[0.04] to-amber-500/[0.02]", blur: "bg-amber-500/5", iconColors: "bg-amber-500/10 text-amber-500" },
            ].map(({ icon: Icon, label, value, gradient, blur, iconColors }) => (
              <div
                key={label}
                className="relative overflow-hidden rounded-2xl border border-border bg-surface p-4 text-center shadow-sm"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`} />
                <div className={`pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full blur-3xl ${blur}`} />
                <div className={`pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full blur-3xl ${blur}`} />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className={`relative mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl ${iconColors}`}>
                  <Icon size={18} />
                </div>
                <p className="relative text-xl font-bold text-gray-900 dark:text-white">
                  {value}
                </p>
                <p className="relative text-xs text-gray-400 dark:text-white/35">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {achievements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <FiStar size={15} className="text-amber-500" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Logros
                </h2>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  {unlockedAchievements.length}/{achievements.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {unlockedAchievements.map((a) => (
                  <AchievementBadgeCard
                    key={a.key}
                    title={a.title}
                    description={a.description}
                    icon={achievementIcon(a.icon)}
                    status="unlocked"
                    xpReward={a.xpReward}
                    accent={
                      (ROLE_ACCENT[profile.role] || "violet") as any
                    }
                    unlockedLabel="Desbloqueado"
                  />
                ))}
                {inProgressAchievements.map((a) => (
                  <AchievementBadgeCard
                    key={a.key}
                    title={a.title}
                    description={a.description}
                    icon={achievementIcon(a.icon)}
                    status="in_progress"
                    progress={a.progress}
                    xpReward={a.xpReward}
                    accent={
                      (ROLE_ACCENT[profile.role] || "violet") as any
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="space-y-6">
          {profile.role === "CREATOR" && products.length > 0 && (
            <ProfileProducts products={products} isOwner={isOwner} />
          )}

          {profile.role === "CREATOR" &&
            products.length === 0 &&
            profile._count.products > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
                  <FiPackage
                    size={24}
                    className="text-gray-300 dark:text-white/20"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Sin productos visibles
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
                  Este creador no tiene productos publicados actualmente
                </p>
              </div>
            )}

          {profile.id && (
            <ProfileComments
              profileId={profile.id}
              isOwner={isOwner}
              currentUserId={user?.id}
              onCommentCountChange={setProfileCommentCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
