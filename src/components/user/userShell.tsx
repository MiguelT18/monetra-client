import type { IconType } from "react-icons";
import Link from "next/link";
import type { ReactNode } from "react";

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
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            {title}
          </h1>
          {badge}
        </div>
        <p className="max-w-2xl text-sm text-gray-600 dark:text-white/60 sm:text-base">
          {description}
        </p>
      </div>
    </header>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: IconType;
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "blue" | "emerald" | "violet";
}) {
  const toneRing =
    tone === "blue"
      ? "border-blue-200/80 dark:border-blue-500/20 bg-blue-500/[0.04] dark:bg-blue-500/10"
      : tone === "emerald"
        ? "border-emerald-200/80 dark:border-emerald-500/20 bg-emerald-500/[0.04] dark:bg-emerald-500/10"
        : tone === "violet"
          ? "border-violet-200/80 dark:border-violet-500/20 bg-violet-500/[0.04] dark:bg-violet-500/10"
          : "border-border bg-background/60 dark:bg-white/3";

  const iconClass =
    tone === "blue"
      ? "text-blue-600 dark:text-blue-400"
      : tone === "emerald"
        ? "text-emerald-600 dark:text-emerald-400"
        : tone === "violet"
          ? "text-violet-600 dark:text-violet-400"
          : "text-gray-500 dark:text-white/50";

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${toneRing}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
            {label}
          </p>
          <p className="truncate text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-gray-500 dark:text-white/40">{hint}</p>
          ) : null}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface ${iconClass}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
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

export function InfoProductCard({
  title,
  category,
  accent = "violet",
  icon: Icon,
  badge,
  subtitle,
  highlights,
  actionLabel,
}: {
  title: string;
  category: string;
  accent?: InfoProductAccent;
  icon: IconType;
  badge?: string;
  subtitle?: string;
  highlights: { icon: IconType; label: string }[];
  actionLabel?: string;
}) {
  const thumb = accentThumbnail[accent];

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <div
        className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${thumb.gradient}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        ></div>
        <div
          className={`absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/20 shadow-lg backdrop-blur-sm transition group-hover:scale-105 ${thumb.iconBg}`}
        >
          <Icon size={26} className={thumb.iconText} />
        </div>
        <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {category}
        </span>
        {badge ? (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-surface/95 px-2 py-0.5 text-[10px] font-semibold text-primary shadow-sm backdrop-blur-sm dark:bg-gray-900/90">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 space-y-0.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
            {title}
          </h3>
          {subtitle ? (
            <p className="truncate text-xs text-gray-500 dark:text-white/45">
              {subtitle}
            </p>
          ) : null}
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {highlights.map(({ icon: Hi, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background/50 px-2 py-1 text-[11px] font-medium text-gray-600 dark:bg-white/4 dark:text-white/60"
            >
              <Hi size={12} className="shrink-0 opacity-70" />
              {label}
            </li>
          ))}
        </ul>

        {actionLabel ? (
          <button
            type="button"
            className="mt-auto w-full rounded-lg border border-border py-2 text-xs font-medium text-gray-800 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white/85 dark:hover:bg-primary/10"
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
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="aspect-[16/10] animate-pulse bg-gray-200 dark:bg-white/10" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-6 w-16 animate-pulse rounded-md bg-gray-200 dark:bg-white/10"
            />
          ))}
        </div>
      </div>
    </div>
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
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-background/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-white/2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-white/45">{subtitle}</p>
      </div>
      {meta ? (
        <span className="shrink-0 text-xs font-medium text-primary">{meta}</span>
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
      ? "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
      : "inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white dark:hover:bg-primary/10";

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
  tone: "blue" | "emerald" | "violet";
}) {
  const cls =
    tone === "blue"
      ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
      : tone === "emerald"
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
        : "bg-violet-500/15 text-violet-700 dark:text-violet-300";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}
