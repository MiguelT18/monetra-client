"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { FiLock, FiTrendingUp, FiThermometer, FiEdit3, FiAward, FiChevronRight, FiEyeOff, FiEye as FiEyeIcon, FiClock, FiEye } from "react-icons/fi";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Role } from "@/types/user";
import type { Achievement } from "@/types/user";
import { achievementIcon } from "@/lib/achievement-icons";

export function xpForNextLevel(level: number): number {
  const linear = 50 * level;
  const logarithmic = 80 * Math.log(level + 1);
  const exponential = 5 * level * level;
  return Math.max(Math.floor(linear + logarithmic + exponential), 1);
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForNextLevel(i);
  }
  return total;
}

export function calculateLevel(xp: number): number {
  let low = 1;
  let high = 1000;
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    if (totalXpForLevel(mid) <= xp) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low;
}

export function abbreviateXP(xp: number): string {
  if (xp >= 1_000_000) return `${((xp / 1_000_000)).toFixed(1).replace(/\.0$/, "")}M`;
  if (xp >= 1_000) return `${((xp / 1_000)).toFixed(1).replace(/\.0$/, "")}K`;
  return xp.toString();
}

export type AchievementStatus = "unlocked" | "in_progress" | "locked";

export function roleTone(role: Role): "role" {
  return "role";
}

export function roleLabel(role: Role): string {
  if (role === "STUDENT") return "Estudiante";
  if (role === "CREATOR") return "Creador";
  if (role === "ADMIN") return "Admin";
  return "Afiliado";
}

export function UserPageHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: ReactNode;
}) {
  return (
    <header className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            {title}
          </h1>
          {badge}
        </div>
        <p className="max-w-2xl text-sm text-gray-500 dark:text-white/55 sm:text-base">
          {description}
        </p>
      </div>
    </header>
  );
}

export function AuroraBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-role-accent/10 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-role-accent/6 blur-3xl" />
      <div className="absolute right-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-role-accent/8 blur-3xl" />
      <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-role-accent/5 blur-3xl" />
      <div className="absolute -bottom-16 right-1/3 h-48 w-48 rounded-full bg-role-accent/7 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.10] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
  aurora = false,
}: {
  icon: IconType;
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "blue" | "emerald" | "violet" | "amber" | "red" | "role";
  aurora?: boolean;
}) {
  const toneRing =
    tone === "blue"
      ? "border-blue-200/80 dark:border-blue-500/20 bg-blue-500/[0.04] dark:bg-blue-500/10"
      : tone === "emerald"
        ? "border-emerald-200/80 dark:border-emerald-500/20 bg-emerald-500/[0.04] dark:bg-emerald-500/10"
        : tone === "violet"
          ? "border-violet-200/80 dark:border-violet-500/20 bg-violet-500/[0.04] dark:bg-violet-500/10"
          : tone === "amber"
            ? "border-amber-200/80 dark:border-amber-500/20 bg-amber-500/[0.04] dark:bg-amber-500/10"
            : tone === "red"
              ? "border-red-200/80 dark:border-red-500/20 bg-red-500/[0.04] dark:bg-red-500/10"
              : tone === "role"
                ? "border-role-accent/20 bg-role-accent/[0.04] dark:bg-role-accent/10"
                : "border-border bg-background/60 dark:bg-white/3";

  const iconClass =
    tone === "blue"
      ? "text-blue-600 dark:text-blue-400"
      : tone === "emerald"
        ? "text-emerald-600 dark:text-emerald-400"
        : tone === "violet"
          ? "text-violet-600 dark:text-violet-400"
          : tone === "amber"
            ? "text-amber-600 dark:text-amber-400"
            : tone === "red"
              ? "text-red-600 dark:text-red-400"
              : tone === "role"
                ? "text-role-accent"
                : "text-gray-500 dark:text-white/50";

  if (aurora) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-role-accent/15 bg-role-accent/[0.03] p-5 shadow-md backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-xl dark:bg-role-accent/10">
        <AuroraBackdrop />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
              {label}
            </p>
            <p className="truncate text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              {value}
            </p>
            {hint ? (
              <p className="text-xs text-gray-500 dark:text-white/40">{hint}</p>
            ) : null}
          </div>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-role-accent/20 bg-role-accent/10 shadow-sm ${iconClass}`}
          >
            <Icon size={16} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-5 shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 ${toneRing}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
            {label}
          </p>
          <p className="truncate text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-gray-500 dark:text-white/40">{hint}</p>
          ) : null}
        </div>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm ${iconClass}`}
          >
            <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  tone = "neutral",
  aurora = false,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  tone?: "neutral" | "role";
  aurora?: boolean;
}) {
  const sectionCls =
    tone === "role"
      ? "rounded-2xl border border-role-accent/25 bg-role-accent/[0.03] shadow-sm dark:bg-role-accent/[0.06]"
      : aurora
        ? "relative overflow-hidden rounded-2xl border border-role-accent/20 bg-role-accent/[0.03] shadow-sm backdrop-blur-sm dark:bg-role-accent/10"
        : "rounded-2xl border border-border bg-background/60 shadow-sm dark:bg-white/3";
  return (
    <section className={sectionCls}>
      {aurora ? <AuroraBackdrop className="opacity-70" /> : null}
      <div className="relative flex flex-col gap-2 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {action}
      </div>
      <div className="relative p-5 sm:p-6">{children}</div>
    </section>
  );
}

export type InfoProductAccent =
  | "blue"
  | "emerald"
  | "violet"
  | "amber"
  | "rose"
  | "cyan";

const accentThumbnail: Record<
  InfoProductAccent,
  { gradient: string; iconBg: string; iconText: string }
> = {
  blue: {
    gradient:
      "from-blue-500/25 via-blue-600/10 to-slate-900/5 dark:from-blue-500/35 dark:via-blue-600/15 dark:to-black/30",
    iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-300",
    iconText: "text-blue-600/70 dark:text-blue-300/80",
  },
  emerald: {
    gradient:
      "from-emerald-500/25 via-emerald-600/10 to-slate-900/5 dark:from-emerald-500/35 dark:via-emerald-600/15 dark:to-black/30",
    iconBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
    iconText: "text-emerald-600/70 dark:text-emerald-300/80",
  },
  violet: {
    gradient:
      "from-violet-500/25 via-violet-600/10 to-slate-900/5 dark:from-violet-500/35 dark:via-violet-600/15 dark:to-black/30",
    iconBg: "bg-violet-500/20 text-violet-600 dark:text-violet-300",
    iconText: "text-violet-600/70 dark:text-violet-300/80",
  },
  amber: {
    gradient:
      "from-amber-500/25 via-amber-600/10 to-slate-900/5 dark:from-amber-500/35 dark:via-amber-600/15 dark:to-black/30",
    iconBg: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
    iconText: "text-amber-600/70 dark:text-amber-300/80",
  },
  rose: {
    gradient:
      "from-rose-500/25 via-rose-600/10 to-slate-900/5 dark:from-rose-500/35 dark:via-rose-600/15 dark:to-black/30",
    iconBg: "bg-rose-500/20 text-rose-600 dark:text-rose-300",
    iconText: "text-rose-600/70 dark:text-rose-300/80",
  },
  cyan: {
    gradient:
      "from-cyan-500/25 via-cyan-600/10 to-slate-900/5 dark:from-cyan-500/35 dark:via-cyan-600/15 dark:to-black/30",
    iconBg: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300",
    iconText: "text-cyan-600/70 dark:text-cyan-300/80",
  },
};

const accentColorHex: Record<InfoProductAccent, string> = {
  blue: "#3B82F6",
  emerald: "#10B981",
  violet: "#8B5CF6",
  amber: "#F59E0B",
  rose: "#F43F5E",
  cyan: "#06B6D4",
};

export function InfoProductCard({
  title,
  category,
  accent = "violet",
  icon: Icon,
  thumbnail,
  badge,
  promoLabel,
  subtitle,
  highlights,
  actionLabel,
  productId,
  isEnrolled,
  isAffiliateView,
  priceDisplay,
  commissionDisplay,
  onAffiliateClick,
  temperatureValue,
  temperatureColor,
  temperatureLabel,
  isOwner,
}: {
  title: string;
  category: string;
  accent?: InfoProductAccent;
  icon: IconType;
  thumbnail?: string | null;
  badge?: string;
  promoLabel?: string;
  subtitle?: string;
  highlights: { icon: IconType; label: string }[];
  actionLabel?: string;
  productId?: string;
  isEnrolled?: boolean;
  isAffiliateView?: boolean;
  priceDisplay?: string;
  commissionDisplay?: string;
  onAffiliateClick?: (productId: string) => void;
  temperatureValue?: number;
  temperatureColor?: string;
  temperatureLabel?: string;
  isOwner?: boolean;
}) {
  const thumb = accentThumbnail[accent];
  const accentHex = accentColorHex[accent];

  const href = productId
    ? isEnrolled
      ? "/user/courses"
      : `/user/explore/${productId}`
    : undefined;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-role-accent/30 ring-1 ring-role-accent/0 group-hover:ring-role-accent/15">
      {/* Accent gradient bar at top */}
      <div
        className="absolute inset-x-0 top-0 z-10 h-1 shrink-0"
        style={{ background: `linear-gradient(90deg, ${accentHex}, ${accentHex}88, ${accentHex}44)` }}
      />

      {/* Thumbnail area */}
      {href ? (
        <Link
          href={href}
          className={`relative block aspect-[16/10] overflow-hidden ${thumbnail ? "" : `bg-linear-to-br ${thumb.gradient}`}`}
        >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
              aria-hidden
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/20 shadow-lg backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:rotate-3 ${thumb.iconBg}`}
              >
                <Icon size={26} className={thumb.iconText} />
              </div>
            </div>
          </>
        )}

        {/* Badge */}
        {badge && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-bold shadow-md backdrop-blur-sm dark:bg-gray-900/80"
            style={{ color: accentHex }}
          >
            {badge}
          </span>
        )}

        {/* Promo label */}
        {promoLabel && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
              <FiTrendingUp size={12} />
              {promoLabel}
            </span>
          </div>
        )}

        {/* Category tag */}
        <span className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
          <FiClock size={10} />
          {category}
        </span>
      </Link>
      ) : (
        <div
          className={`relative block aspect-[16/10] overflow-hidden ${thumbnail ? "" : `bg-linear-to-br ${thumb.gradient}`}`}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <>
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
                aria-hidden
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/20 shadow-lg backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:rotate-3 ${thumb.iconBg}`}
                >
                  <Icon size={26} className={thumb.iconText} />
                </div>
              </div>
            </>
          )}

          {badge && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-bold shadow-md backdrop-blur-sm dark:bg-gray-900/80"
              style={{ color: accentHex }}
            >
              {badge}
            </span>
          )}

          {promoLabel && (
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
                <FiTrendingUp size={12} />
                {promoLabel}
              </span>
            </div>
          )}

          <span className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
            <FiClock size={10} />
            {category}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4 pt-3.5">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-start gap-2">
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 dark:text-white group-hover:text-primary transition-colors">
              {title}
            </h3>
            {category && category !== "Producto digital" && (
              <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary leading-5">
                {category}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="flex items-center gap-1 truncate text-xs font-medium text-gray-500 dark:text-white/45">
              <FiEye size={11} className="shrink-0" />
              {subtitle}
            </p>
          )}
          {priceDisplay && (
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {priceDisplay}
              </span>
              {commissionDisplay && (
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {commissionDisplay}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Highlights */}
        <ul className="flex flex-wrap gap-1.5">
          {temperatureValue != null && temperatureColor && (
            <li
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium shadow-sm"
              style={{ backgroundColor: `${temperatureColor}18`, color: temperatureColor, borderColor: `${temperatureColor}30` }}
            >
              <FiThermometer size={12} className="shrink-0" />
              {temperatureValue}
            </li>
          )}
          {highlights.map(({ icon: Hi, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-gray-600 shadow-sm transition-colors group-hover:bg-background dark:bg-white/[0.03] dark:text-white/60"
            >
              <Hi size={12} className="shrink-0" />
              {label}
            </li>
          ))}
        </ul>

        {/* CTA */}
        {isOwner ? (
          <div className="mt-auto flex gap-2">
            <Link
              href={`/user/explore/${productId}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 py-2.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/10 active:scale-[0.98]"
            >
              <FiEye size={13} />
              Ver detalle
            </Link>
            <Link
              href={`/user/products/${productId}/edit`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:opacity-90 active:scale-[0.98]"
            >
              <FiEdit3 size={13} />
              Editar producto
            </Link>
          </div>
        ) : actionLabel && isAffiliateView ? (
          <div className="mt-auto flex gap-2">
            <Link
              href={`/user/explore/${productId}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 py-2.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/10 active:scale-[0.98]"
            >
              Ver producto
            </Link>
            <button
              type="button"
              onClick={() => onAffiliateClick?.(productId!)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:opacity-90 active:scale-[0.98]"
            >
              {actionLabel}
            </button>
          </div>
        ) : actionLabel && href ? (
          <Link
            href={href}
            className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:opacity-90 active:scale-[0.98]"
          >
            {isEnrolled ? "Ver mis cursos" : actionLabel}
          </Link>
        ) : actionLabel ? (
          <button
            type="button"
            onClick={() => onAffiliateClick?.(productId!)}
            className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:opacity-90 active:scale-[0.98]"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function InfoProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm">
      <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-white/10 dark:to-white/5" />
      <div className="aspect-16/10 animate-pulse bg-gray-200 dark:bg-white/10" />
      <div className="space-y-3 p-4 pt-3.5">
        <div className="h-4 w-4/5 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-6 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10"
            />
          ))}
        </div>
        <div className="h-9 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

export function XpProgressPanel({
  level,
  xp,
  tone = "blue",
}: {
  level: number;
  xp: number;
  tone?: "blue" | "emerald" | "violet" | "amber" | "red" | "role";
}) {
  const currentLevelXp = totalXpForLevel(level);
  const xpInLevel = Math.max(0, xp - currentLevelXp);
  const neededXp = xpForNextLevel(level);
  const pct = Math.min(100, Math.round((xpInLevel / neededXp) * 100));
  const remaining = Math.max(0, neededXp - xpInLevel);
  const barClass =
    tone === "blue"
      ? "bg-blue-500"
      : tone === "emerald"
        ? "bg-emerald-500"
        : tone === "violet"
          ? "bg-violet-500"
        : tone === "red"
          ? "bg-red-500"
        : tone === "role"
          ? "bg-role-accent"
          : "bg-amber-500";
  const ringClass =
    tone === "blue"
      ? "border-blue-200/80 dark:border-blue-500/20 bg-blue-500/[0.04] dark:bg-blue-500/10"
      : tone === "emerald"
        ? "border-emerald-200/80 dark:border-emerald-500/20 bg-emerald-500/[0.04] dark:bg-emerald-500/10"
        : tone === "violet"
          ? "border-violet-200/80 dark:border-violet-500/20 bg-violet-500/[0.04] dark:bg-violet-500/10"
        : tone === "red"
          ? "border-red-200/80 dark:border-red-500/20 bg-red-500/[0.04] dark:bg-red-500/10"
        : tone === "role"
          ? "border-role-accent/20 bg-role-accent/[0.04] dark:bg-role-accent/10"
          : "border-amber-200/80 dark:border-amber-500/20 bg-amber-500/[0.04] dark:bg-amber-500/10";

  return (
    <div className={`mb-6 rounded-2xl border p-5 shadow-md ${ringClass}`}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
            Tu progreso
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            Nivel {level}
          </p>
        </div>
        <p className="text-sm text-gray-600 dark:text-white/55">
          <span className="font-semibold text-gray-900 dark:text-white">
            {xpInLevel}
          </span>
          {" / "}
          {neededXp} XP
        </p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-white/40">
        {remaining === 0
          ? "¡Listo para subir de nivel! Completa un logro para avanzar."
          : `Faltan ${remaining} XP para alcanzar el nivel ${level + 1}`}
      </p>
    </div>
  );
}

export function AchievementBadgeCard({
  title,
  description,
  icon: Icon,
  status,
  progress = 0,
  xpReward,
  accent = "violet",
  unlockedLabel,
}: {
  title: string;
  description: string;
  icon: IconType;
  status: AchievementStatus;
  progress?: number;
  xpReward?: number;
  accent?: InfoProductAccent;
  unlockedLabel?: string;
}) {
  const thumb = accentThumbnail[accent];
  const isLocked = status === "locked";
  const isUnlocked = status === "unlocked";

  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-4 transition-all hover:shadow-md ${
        isLocked
          ? "border-border bg-background/30 dark:bg-white/2"
          : isUnlocked
            ? "border-primary/30 bg-primary/4 shadow-sm dark:bg-primary/8"
            : "border-border bg-surface"
      } ${isLocked ? "opacity-75" : ""}`}
    >
      {isLocked ? (
        <FiLock
          className="absolute right-3 top-3 text-gray-400 dark:text-white/35"
          size={14}
          aria-hidden
        />
      ) : null}
      {isUnlocked && unlockedLabel ? (
        <span className="absolute right-3 top-3 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
          {unlockedLabel}
        </span>
      ) : null}

      <div
        className={`mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br shadow-inner ${thumb.gradient} ${isLocked ? "grayscale" : ""}`}
      >
        <Icon size={22} className={thumb.iconText} />
      </div>

      <h3
        className={`pr-6 text-sm font-semibold leading-snug ${isLocked ? "text-gray-500 dark:text-white/45" : "text-gray-900 dark:text-white"}`}
      >
        {title}
      </h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-gray-500 dark:text-white/45">
        {description}
      </p>

      {status === "in_progress" ? (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] font-medium text-gray-500 dark:text-white/40">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {xpReward ? (
        <p
          className={`mt-2 text-[10px] font-semibold ${isUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}`}
        >
          {isUnlocked
            ? `+${xpReward} XP obtenidos`
            : `+${xpReward} XP al desbloquear`}
        </p>
      ) : null}
    </article>
  );
}

export function PlaceholderRow({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle: string;
  meta?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border hover:bg-primary/[0.03] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 cursor-pointer transition-all hover:shadow-sm">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-white/45">{subtitle}</p>
      </div>
      {meta ? (
        <span className="shrink-0 text-xs font-medium text-primary">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

export function QuickLink({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "outline";
}) {
  const cls =
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
      : "inline-flex items-center justify-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white dark:hover:bg-primary/10";

  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}

export function RoleBadge({
  label,
  tone,
}: {
  label: string;
  tone: "blue" | "emerald" | "violet" | "amber" | "red" | "role";
}) {
  const cls =
    tone === "blue"
      ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
      : tone === "emerald"
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
        : tone === "violet"
          ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
        : tone === "red"
          ? "bg-red-500/15 text-red-700 dark:text-red-300"
        : tone === "role"
          ? "bg-role-accent/15 text-role-accent"
          : "bg-amber-500/15 text-amber-700 dark:text-amber-300";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

export function rankForLevel(level: number): string {
  if (level >= 50) return "Leyenda";
  if (level >= 40) return "Campeón";
  if (level >= 30) return "Experto";
  if (level >= 20) return "Veterano";
  if (level >= 10) return "Avanzado";
  if (level >= 5) return "Aprendiz";
  return "Novato";
}

const ACHIEVEMENT_TABS = [
  { key: "unlocked", label: "Desbloqueados" },
  { key: "in_progress", label: "En progreso" },
  { key: "locked", label: "Próximos" },
] as const;

export function AchievementsCard({
  achievements,
  onViewAll,
}: {
  achievements: Achievement[];
  onViewAll?: string;
}) {
  const [tab, setTab] = useState<(typeof ACHIEVEMENT_TABS)[number]["key"]>("unlocked");

  const grouped = {
    unlocked: achievements.filter((a) => a.status === "unlocked"),
    in_progress: achievements.filter((a) => a.status === "in_progress"),
    locked: achievements.filter((a) => a.status === "locked"),
  };

  const counts = {
    unlocked: grouped.unlocked.length,
    in_progress: grouped.in_progress.length,
    locked: grouped.locked.length,
  };

  const visible = grouped[tab];
  const accents: InfoProductAccent[] = [
    "blue", "emerald", "violet", "amber", "rose", "cyan",
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-background/60 shadow-sm dark:bg-white/3">
      <AuroraBackdrop className="opacity-60" />
      <div className="relative border-b border-border px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FiAward size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Logros
              </h2>
              <p className="text-xs text-gray-500 dark:text-white/45">
                {counts.unlocked} desbloqueados · {achievements.length} en total
              </p>
            </div>
          </div>
          {onViewAll && (
            <Link
              href={onViewAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-role-accent hover:underline"
            >
              Ver todos
              <FiChevronRight size={12} />
            </Link>
          )}
        </div>

        <div className="mt-3 flex gap-1.5">
          {ACHIEVEMENT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "bg-role-accent/10 text-role-accent ring-1 ring-role-accent/30"
                  : "text-gray-500 hover:bg-gray-100 dark:text-white/50 dark:hover:bg-white/5"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 text-[10px] font-bold ${
                  tab === t.key
                    ? "bg-role-accent/15 text-role-accent"
                    : "bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-white/50"
                }`}
              >
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative p-5 sm:p-6">
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-white/45">
            {tab === "unlocked"
              ? "Aún no has desbloqueado logros. ¡Sigue aprendiendo!"
              : tab === "in_progress"
                ? "No tienes logros en progreso por ahora."
                : "No hay logros bloqueados."}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((item, i) => (
              <AchievementBadgeCard
                key={item.id}
                title={item.title}
                description={item.description}
                icon={achievementIcon(item.icon)}
                progress={item.progress}
                xpReward={item.xpReward}
                accent={accents[i % accents.length]}
                unlockedLabel={item.status === "unlocked" ? "Desbloqueado" : undefined}
                status={item.status}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function BankGlassCard({
  label,
  amount,
  breakdown,
  icon: Icon,
  formatter = (v) => `$${v.toFixed(2)}`,
  defaultHidden = false,
}: {
  label: string;
  amount: number;
  breakdown?: { label: string; value: number; color: string }[];
  icon: IconType;
  formatter?: (v: number) => string;
  defaultHidden?: boolean;
}) {
  const [hidden, setHidden] = useState(defaultHidden);

  const mask = (v: number) => (hidden ? "••••••" : formatter(v));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-role-accent/30 bg-gradient-to-br from-role-accent/[0.08] via-background to-role-accent/[0.03] p-5 shadow-lg backdrop-blur-md dark:from-role-accent/15 dark:to-role-accent/[0.04] sm:p-6">
      <AuroraBackdrop className="opacity-80" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-role-accent/15 text-role-accent shadow-sm">
            <Icon size={18} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
              {label}
            </p>
            <p className="truncate text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
              {mask(amount)}
            </p>
          </div>
        </div>
        <button
          onClick={() => setHidden((v) => !v)}
          className="shrink-0 text-foreground/30 transition-colors hover:text-foreground/70 cursor-pointer"
          aria-label={hidden ? "Mostrar monto" : "Ocultar monto"}
        >
          {hidden ? <FiEyeIcon size={16} /> : <FiEyeOff size={16} />}
        </button>
      </div>

      {breakdown && breakdown.length > 0 && (
        <div className="relative mt-4 space-y-2 border-t border-role-accent/15 pt-4">
          {breakdown.map((b) => (
            <div
              key={b.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 text-gray-500 dark:text-white/50">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: b.color }}
                />
                {b.label}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {mask(b.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
