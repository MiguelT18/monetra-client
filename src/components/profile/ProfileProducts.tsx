"use client";

import Link from "next/link";
import { FiPackage, FiStar, FiClock, FiEdit3, FiEye } from "react-icons/fi";
import type { ProfileProduct } from "@/lib/user";

const accentColors = [
  { from: "from-violet-500/25", via: "via-violet-600/10", to: "to-slate-900/5", light: "from-violet-500/35", lightVia: "via-violet-600/15", lightTo: "to-black/30", text: "text-violet-600 dark:text-violet-300", bg: "bg-violet-500/20" },
  { from: "from-blue-500/25", via: "via-blue-600/10", to: "to-slate-900/5", light: "from-blue-500/35", lightVia: "via-blue-600/15", lightTo: "to-black/30", text: "text-blue-600 dark:text-blue-300", bg: "bg-blue-500/20" },
  { from: "from-emerald-500/25", via: "via-emerald-600/10", to: "to-slate-900/5", light: "from-emerald-500/35", lightVia: "via-emerald-600/15", lightTo: "to-black/30", text: "text-emerald-600 dark:text-emerald-300", bg: "bg-emerald-500/20" },
  { from: "from-amber-500/25", via: "via-amber-600/10", to: "to-slate-900/5", light: "from-amber-500/35", lightVia: "via-amber-600/15", lightTo: "to-black/30", text: "text-amber-600 dark:text-amber-300", bg: "bg-amber-500/20" },
  { from: "from-rose-500/25", via: "via-rose-600/10", to: "to-slate-900/5", light: "from-rose-500/35", lightVia: "via-rose-600/15", lightTo: "to-black/30", text: "text-rose-600 dark:text-rose-300", bg: "bg-rose-500/20" },
  { from: "from-cyan-500/25", via: "via-cyan-600/10", to: "to-slate-900/5", light: "from-cyan-500/35", lightVia: "via-cyan-600/15", lightTo: "to-black/30", text: "text-cyan-600 dark:text-cyan-300", bg: "bg-cyan-500/20" },
];

function formatDuration(minutes: number | null): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export default function ProfileProducts({
  products,
  isOwner,
}: {
  products: ProfileProduct[];
  isOwner?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
          <FiPackage size={24} className="text-gray-300 dark:text-white/20" />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Aún no ha publicado productos
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
          Los productos publicados aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
          <FiPackage size={15} className="text-violet-500" />
        </div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
          Productos publicados
        </h2>
        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
          {products.length}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((product, index) => {
          const accent = accentColors[index % accentColors.length];
          return (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-surface shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
            >
              <div
                className="absolute inset-x-0 top-0 z-10 h-1 shrink-0"
                style={{
                  background: `linear-gradient(90deg, var(--accent-hex, #8B5CF6), ${accent.text.replace("text-", "").split(" ")[0] || "#8B5CF6"}88, transparent)`,
                }}
              />

              <Link
                href={`/user/explore/${product.id}`}
                className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${accent.from} ${accent.via} ${accent.to} dark:${accent.light} dark:${accent.lightVia} dark:${accent.lightTo}`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.3]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                  aria-hidden
                />
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/20 shadow-lg backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:rotate-3 ${accent.bg} ${accent.text}`}>
                      <FiPackage size={22} />
                    </div>
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col gap-2 p-3.5">
                <Link href={`/user/explore/${product.id}`}>
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors hover:text-primary dark:text-white">
                    {product.title}
                  </h3>
                </Link>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    ${product.price.toFixed(2)}
                  </span>

                  <div className="flex items-center gap-2">
                    {product.rating != null && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        <FiStar size={10} />
                        {product.rating.toFixed(1)}
                      </span>
                    )}
                    {product.duration != null && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-white/40">
                        <FiClock size={10} />
                        {formatDuration(product.duration)}
                      </span>
                    )}
                  </div>
                </div>

                {isOwner ? (
                  <div className="flex gap-2">
                    <Link
                      href={`/user/explore/${product.id}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/10 active:scale-[0.98]"
                    >
                      <FiEye size={13} />
                      Ver detalle
                    </Link>
                    <Link
                      href={`/user/products/${product.id}/edit`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                      <FiEdit3 size={13} />
                      Editar producto
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/user/explore/${product.id}`}
                    className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-background/60 py-2 text-xs font-medium text-gray-600 transition-all hover:border-primary/30 hover:text-primary dark:text-white/60 dark:hover:text-primary"
                  >
                    <FiEye size={13} />
                    Ver detalle
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
