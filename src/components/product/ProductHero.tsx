"use client";

import { FiClock, FiBookOpen, FiStar, FiUsers, FiPlay } from "react-icons/fi";
import type { ProductResponse, ModuleData } from "@/lib/product-api";
import { HlsPlayer } from "@/components/player/HlsPlayer";
import { CATEGORIES } from "@/lib/categories";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

interface ProductHeroProps {
  product: ProductResponse;
  producerName: string;
  totalDuration: number;
  modules: ModuleData | null;
}

export default function ProductHero({ product, producerName, totalDuration, modules }: ProductHeroProps) {
  const totalLessons = modules?.reduce((a, m) => a + m.lessons.length, 0) ?? 0;
  const categoryLabel = CATEGORIES.find((c) => c.id === product.category)?.label;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background dark:from-primary/8">
      {product.introVideoUrl ? (
        <div className="relative">
          <HlsPlayer url={product.introVideoUrl} />
        </div>
      ) : product.thumbnail ? (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 shadow-2xl backdrop-blur-sm ring-1 ring-white/30">
              <FiPlay size={28} className="ml-1 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 shadow-2xl backdrop-blur-sm ring-1 ring-white/20">
              <FiPlay size={28} className="ml-1 text-white" />
            </div>
            <p className="text-sm font-medium text-white/60">Vista previa del curso</p>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Producto digital
          </span>
          {categoryLabel && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {categoryLabel}
            </span>
          )}
          {product.rating != null && product.rating > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <FiStar size={12} className="fill-current" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          {product.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/45">
          Por {producerName}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-white/60">
          {totalDuration > 0 && (
            <div className="flex items-center gap-1.5">
              <FiClock size={14} className="shrink-0 text-gray-400" />
              <span>{formatDuration(totalDuration)} de contenido</span>
            </div>
          )}
          {modules && modules.length > 0 && (
            <div className="flex items-center gap-1.5">
              <FiBookOpen size={14} className="shrink-0 text-gray-400" />
              <span>
                {modules.length} módulo{modules.length !== 1 ? "s" : ""} · {totalLessons} clase{totalLessons !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {product._count?.enrollments != null && (
            <div className="flex items-center gap-1.5">
              <FiUsers size={14} className="shrink-0 text-gray-400" />
              <span>{product._count.enrollments} estudiante{product._count.enrollments !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
