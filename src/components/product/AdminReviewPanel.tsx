"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { FiCheck, FiX, FiAlertCircle, FiCheckCircle, FiEye, FiChevronDown, FiChevronRight, FiPlay } from "react-icons/fi";
import type { ProductResponse, ModuleData } from "@/lib/product-api";
import { HlsPlayer } from "@/components/player/HlsPlayer";

interface AdminReviewPanelProps {
  product: ProductResponse;
  reviewLoading: boolean;
  onAdminReview: (action: "PUBLISHED" | "REJECTED") => void;
  modules: ModuleData | null;
  productId: string;
}

export default function AdminReviewPanel({ product, reviewLoading, onAdminReview, modules, productId }: AdminReviewPanelProps) {
  const [previewVideo, setPreviewVideo] = useState<{ moduleIndex: number; lessonIndex: number } | null>(null);

  const statusColors: Record<string, string> = {
    UNDER_REVIEW: "border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10",
    PUBLISHED: "border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10",
    REJECTED: "border-red-200 bg-red-50/80 dark:border-red-500/30 dark:bg-red-500/10",
    DRAFT: "border-border bg-background/60 dark:bg-white/3",
    ARCHIVED: "border-border bg-background/60 dark:bg-white/3",
  };

  const statusLabels: Record<string, string> = {
    DRAFT: "Borrador",
    UNDER_REVIEW: "En revisión",
    PUBLISHED: "Publicado",
    REJECTED: "Rechazado",
    ARCHIVED: "Archivado",
  };

  const statusIcons: Record<string, typeof FiAlertCircle> = {
    UNDER_REVIEW: FiAlertCircle,
    PUBLISHED: FiCheckCircle,
    REJECTED: FiX as unknown as typeof FiAlertCircle,
  };

  const StatusIcon = statusIcons[product.status] || FiAlertCircle;

  const statusTextColors: Record<string, string> = {
    UNDER_REVIEW: "text-amber-700 dark:text-amber-300",
    PUBLISHED: "text-emerald-700 dark:text-emerald-300",
    REJECTED: "text-red-700 dark:text-red-300",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-md ${statusColors[product.status] || statusColors.DRAFT}`}>
      <div className="mb-4 flex items-center gap-2">
        <StatusIcon size={16} className={statusTextColors[product.status] || "text-gray-500 dark:text-white/45"} />
        <h3 className={`text-sm font-bold ${statusTextColors[product.status] || "text-gray-700 dark:text-white/70"}`}>
          {statusLabels[product.status] || product.status}
        </h3>
      </div>

      {product.status === "UNDER_REVIEW" && (
        <>
          <p className="mb-4 text-xs leading-relaxed text-amber-600/70 dark:text-amber-400/60">
            Revisa el contenido del curso, los videos y la configuración antes de aprobar o rechazar.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onAdminReview("PUBLISHED")}
              disabled={reviewLoading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {reviewLoading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FiCheck size={14} />
              )}
              Aprobar
            </button>
            <button
              onClick={() => onAdminReview("REJECTED")}
              disabled={reviewLoading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 cursor-pointer"
            >
              <FiX size={14} />
              Rechazar
            </button>
          </div>
        </>
      )}

      {modules && modules.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-white/55">Vista previa de lecciones</p>
          <div className="space-y-1">
            {modules.map((mod, mIdx) =>
              mod.lessons.map((lesson, lIdx) => {
                if (!lesson.hlsUrl) return null;
                return (
                  <button
                    key={`${mIdx}-${lIdx}`}
                    onClick={() => setPreviewVideo({ moduleIndex: mIdx, lessonIndex: lIdx })}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-gray-600 transition-colors hover:bg-primary/5 dark:text-white/60 dark:hover:bg-primary/10 cursor-pointer"
                  >
                    <FiPlay size={10} className="shrink-0 text-gray-400" />
                    <span className="truncate">{mod.title} / {lesson.title}</span>
                    <FiEye size={10} className="ml-auto shrink-0 text-primary" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {previewVideo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 overflow-hidden"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 dark:text-white/55">Reproduciendo vista previa</span>
            <button
              onClick={() => setPreviewVideo(null)}
              className="text-[11px] text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white cursor-pointer"
            >
              Cerrar
            </button>
          </div>
          <HlsPlayer productId={productId} moduleIndex={previewVideo.moduleIndex} lessonIndex={previewVideo.lessonIndex} className="rounded-lg" />
        </motion.div>
      )}
    </div>
  );
}
