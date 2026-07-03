"use client";

import { useState, useEffect, use, useMemo } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/hooks/useNotification";
import { getProduct, reviewProduct, getProducerReviewStats, type ProductResponse, type ModuleData, type ProducerReviewStats } from "@/lib/product-api";
import { HlsPlayer } from "@/components/player/HlsPlayer";
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiClock,
  FiBookOpen,
  FiPlay,
  FiChevronDown,
  FiChevronRight,
  FiStar,
  FiDollarSign,
  FiEye,
  FiAlertCircle,
  FiCheckCircle,
  FiVideo,
  FiImage,
  FiUser,
  FiShield,
  FiRefreshCw,
  FiLink,
  FiMessageSquare,
} from "react-icons/fi";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export default function AdminReviewDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const router = useRouter();
  const { notify } = useNotification();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [previewVideo, setPreviewVideo] = useState<{ moduleIndex: number; lessonIndex: number } | null>(null);
  const [reviewStats, setReviewStats] = useState<ProducerReviewStats | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const { ok, result } = await getProduct(productId);
      if (ok && result.data?.product) {
        const p = result.data.product as ProductResponse;
        setProduct(p);
        if (p.producer?.id) {
          getProducerReviewStats(p.producer.id).then(({ ok: ok2, result: stats }) => {
            if (ok2) setReviewStats(stats);
          });
        }
      } else {
        setError(result.message || "Producto no encontrado");
      }
      setLoading(false);
    };
    loadProduct();
  }, [productId]);

  const handleReview = async (action: "PUBLISHED" | "REJECTED") => {
    setReviewLoading(true);
    const { ok, result } = await reviewProduct(productId, action);
    if (ok) {
      notify("success", action === "PUBLISHED" ? "Producto aprobado y publicado" : "Producto rechazado");
      window.dispatchEvent(new CustomEvent("pending-reviews-changed"));
      if (action === "PUBLISHED") {
        router.push("/admin/users");
      }
    } else {
      notify("error", result.message || "Error al revisar el producto");
    }
    setReviewLoading(false);
  };

  const diffEntries = useMemo(() => {
    if (!product?.previousValues) return [];
    const prev = product.previousValues;
    const entries: { label: string; oldVal: string; newVal: string }[] = [];

    if (prev.title !== undefined && prev.title !== product.title) {
      entries.push({ label: 'Título', oldVal: prev.title, newVal: product.title });
    }
    if (prev.description !== undefined && prev.description !== product.description) {
      entries.push({ label: 'Descripción', oldVal: prev.description, newVal: product.description });
    }
    if (prev.price !== undefined && Number(prev.price) !== Number(product.price)) {
      entries.push({ label: 'Precio', oldVal: `$${Number(prev.price).toFixed(2)}`, newVal: `$${Number(product.price).toFixed(2)}` });
    }
    if (prev.thumbnail !== undefined && prev.thumbnail !== product.thumbnail) {
      entries.push({ label: 'Miniatura', oldVal: prev.thumbnail ? 'Imagen' : 'Sin imagen', newVal: product.thumbnail ? 'Imagen' : 'Sin imagen' });
    }
    if (prev.introVideoUrl !== undefined && prev.introVideoUrl !== product.introVideoUrl) {
      entries.push({ label: 'Video intro', oldVal: prev.introVideoUrl || 'Ninguno', newVal: product.introVideoUrl || 'Ninguno' });
    }
    if (prev.affiliateEnabled !== undefined && prev.affiliateEnabled !== product.affiliateEnabled) {
      entries.push({ label: 'Afiliados', oldVal: prev.affiliateEnabled ? 'Activado' : 'Desactivado', newVal: product.affiliateEnabled ? 'Activado' : 'Desactivado' });
    }
    if (prev.affiliateDescription !== undefined && prev.affiliateDescription !== product.affiliateDescription) {
      entries.push({ label: 'Desc. afiliados', oldVal: prev.affiliateDescription || '(vacío)', newVal: product.affiliateDescription || '(vacío)' });
    }
    if (prev.affiliateVideoUrl !== undefined && prev.affiliateVideoUrl !== product.affiliateVideoUrl) {
      entries.push({ label: 'Video afiliados', oldVal: prev.affiliateVideoUrl || 'Ninguno', newVal: product.affiliateVideoUrl || 'Ninguno' });
    }
    if (prev.commissionRate !== undefined && Number(prev.commissionRate) !== Number(product.commissionRate)) {
      entries.push({ label: 'Comisión', oldVal: `${prev.commissionRate ?? 0}%`, newVal: `${product.commissionRate}%` });
    }
    if (prev.affiliateCookieDays !== undefined && Number(prev.affiliateCookieDays) !== Number(product.affiliateCookieDays)) {
      entries.push({ label: 'Cookie days', oldVal: String(prev.affiliateCookieDays), newVal: String(product.affiliateCookieDays) });
    }
    if (prev.modules !== undefined && JSON.stringify(prev.modules) !== JSON.stringify(product.modules)) {
      const oldModules = (prev.modules as any[]) || [];
      const newModules = (product.modules as any[]) || [];
      const oldCount = oldModules.length;
      const newCount = newModules.length;
      const oldLessons = oldModules.reduce((a: number, m: any) => a + (m.lessons?.length ?? 0), 0);
      const newLessons = newModules.reduce((a: number, m: any) => a + (m.lessons?.length ?? 0), 0);
      entries.push({ label: 'Contenido', oldVal: `${oldCount} módulos, ${oldLessons} clases`, newVal: `${newCount} módulos, ${newLessons} clases` });
    }

    return entries;
  }, [product]);

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-white/10" />
        <div className="space-y-3">
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{error || "Producto no encontrado"}</p>
        <button onClick={() => router.push("/admin/reviews")} className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
          <FiArrowLeft size={14} /> Volver a revisiones
        </button>
      </div>
    );
  }

  const modules = product.modules as ModuleData | null;
  const producerName = product.producer?.username ? `@${product.producer.username}` : product.producer?.fullname ?? "Creador";

  const totalDuration = modules?.reduce(
    (acc, mod) => acc + mod.lessons.reduce((la, l) => la + (l.durationMinutes ?? 0), 0), 0
  );

  const totalLessons = modules?.reduce((acc, mod) => acc + mod.lessons.length, 0) ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl px-4 sm:px-6"
    >
      {/* Back button */}
      <button
        onClick={() => router.push("/admin/reviews")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-white/50 dark:hover:text-white cursor-pointer"
      >
        <FiArrowLeft size={14} />
        Volver a revisiones
      </button>

      {/* Status banner */}
      <div className={`mb-6 rounded-2xl border p-5 ${
        product.status === "UNDER_REVIEW"
          ? "border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10"
          : product.status === "PUBLISHED"
            ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10"
            : product.status === "REJECTED"
              ? "border-red-200 bg-red-50/80 dark:border-red-500/30 dark:bg-red-500/10"
              : "border-border bg-background/60 dark:bg-white/3"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <div className="flex items-center gap-3">
            {product.status === "UNDER_REVIEW" && (
              <FiAlertCircle size={20} className="shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            {product.status === "PUBLISHED" && (
              <FiCheckCircle size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            {product.status === "REJECTED" && (
              <FiX size={20} className="shrink-0 text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className={`text-sm font-bold ${
                product.status === "UNDER_REVIEW" ? "text-amber-700 dark:text-amber-300" :
                product.status === "PUBLISHED" ? "text-emerald-700 dark:text-emerald-300" :
                product.status === "REJECTED" ? "text-red-700 dark:text-red-300" :
                "text-gray-700 dark:text-white/70"
              }`}>
                {product.status === "UNDER_REVIEW" && "Producto en revisión"}
                {product.status === "PUBLISHED" && "Producto publicado"}
                {product.status === "REJECTED" && "Producto rechazado"}
                {product.status === "DRAFT" && "Producto en borrador"}
                {product.status === "ARCHIVED" && "Producto archivado"}
              </p>
              <p className="text-xs text-gray-500 dark:text-white/45 mt-0.5">
                Creado el {new Date(product.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6 sm:space-y-8">
          {/* Thumbnail / Intro video */}
          {product.introVideoUrl ? (
            <HlsPlayer url={product.introVideoUrl} className="rounded-2xl border border-border" />
          ) : product.thumbnail ? (
            <div className="overflow-hidden rounded-2xl border border-border">
              <img src={product.thumbnail} alt={product.title} className="w-full aspect-video object-cover" />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              <div className="text-center">
                <FiImage size={40} className="mx-auto mb-3 text-white/30" />
                <p className="text-sm text-white/50">Sin imagen de portada</p>
              </div>
            </div>
          )}

          {/* Title and description */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                Producto digital
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                product.status === "UNDER_REVIEW" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" :
                product.status === "PUBLISHED" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" :
                product.status === "REJECTED" ? "bg-red-500/15 text-red-700 dark:text-red-300" :
                "bg-gray-500/15 text-gray-700 dark:text-white/70"
              }`}>
                {product.status === "UNDER_REVIEW" ? "En revisión" :
                 product.status === "PUBLISHED" ? "Publicado" :
                 product.status === "REJECTED" ? "Rechazado" :
                 product.status === "DRAFT" ? "Borrador" : "Archivado"}
              </span>
              {product.rating != null && product.rating > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <FiStar size={12} className="fill-current" />
                  {product.rating.toFixed(1)}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
              {product.title}
            </h1>
            {product.previousValues?.title !== undefined && product.previousValues?.title !== product.title && (
              <div className="mt-2 overflow-hidden rounded-lg border border-border font-mono text-xs dark:border-white/10">
                <div className="flex items-start gap-2.5 border-l-4 border-red-400 bg-red-50/80 px-3 py-1 dark:border-red-500 dark:bg-red-500/8">
                  <span className="shrink-0 font-bold text-red-400 select-none leading-5">−</span>
                  <span className="text-red-800 dark:text-red-300">{product.previousValues.title}</span>
                </div>
                <div className="flex items-start gap-2.5 border-l-4 border-emerald-400 bg-emerald-50/80 px-3 py-1 dark:border-emerald-500 dark:bg-emerald-500/8">
                  <span className="shrink-0 font-bold text-emerald-400 select-none leading-5">+</span>
                  <span className="text-emerald-800 dark:text-emerald-300">{product.title}</span>
                </div>
              </div>
            )}
            <p className="mt-1.5 text-sm text-gray-500 dark:text-white/45">
              Por {producerName} · ${Number(product.price).toFixed(2)}
            </p>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-white/70">
              {product.description}
            </p>
            {product.previousValues?.description !== undefined && product.previousValues?.description !== product.description && (
              <div className="mt-2 overflow-hidden rounded-lg border border-border font-mono text-xs dark:border-white/10">
                <div className="flex items-start gap-2.5 border-l-4 border-red-400 bg-red-50/80 px-3 py-1 dark:border-red-500 dark:bg-red-500/8">
                  <span className="shrink-0 font-bold text-red-400 select-none leading-5">−</span>
                  <span className="text-red-800 dark:text-red-300 whitespace-pre-line">{product.previousValues.description}</span>
                </div>
                <div className="flex items-start gap-2.5 border-l-4 border-emerald-400 bg-emerald-50/80 px-3 py-1 dark:border-emerald-500 dark:bg-emerald-500/8">
                  <span className="shrink-0 font-bold text-emerald-400 select-none leading-5">+</span>
                  <span className="text-emerald-800 dark:text-emerald-300 whitespace-pre-line">{product.description}</span>
                </div>
              </div>
            )}
          </div>

          {/* Course stats */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {totalDuration && totalDuration > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 sm:px-4 sm:py-2.5 dark:bg-white/3">
                <FiClock size={16} className="shrink-0 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-white/70">{formatDuration(totalDuration)}</span>
              </div>
            )}
            {modules && modules.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 sm:px-4 sm:py-2.5 dark:bg-white/3">
                <FiBookOpen size={16} className="shrink-0 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-white/70">{modules.length} módulos · {totalLessons} clases</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 sm:px-4 sm:py-2.5 dark:bg-white/3">
              <FiDollarSign size={16} className="shrink-0 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-white/70">${Number(product.price).toFixed(2)}</span>
            </div>
          </div>

          {/* Modules / Course content */}
          {modules && modules.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contenido del curso</h2>
                {product.previousValues?.modules !== undefined && JSON.stringify(product.previousValues.modules) !== JSON.stringify(product.modules) && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border font-mono text-xs dark:border-white/10">
                    <div className="flex items-start gap-2.5 border-l-4 border-red-400 bg-red-50/80 px-3 py-1 dark:border-red-500 dark:bg-red-500/8">
                      <span className="shrink-0 font-bold text-red-400 select-none leading-5">−</span>
                      <span className="text-red-800 dark:text-red-300">{(product.previousValues.modules as any[])?.length ?? 0} módulos, {((product.previousValues.modules as any[]) || []).reduce((a: number, m: any) => a + (m.lessons?.length ?? 0), 0)} clases</span>
                    </div>
                    <div className="flex items-start gap-2.5 border-l-4 border-emerald-400 bg-emerald-50/80 px-3 py-1 dark:border-emerald-500 dark:bg-emerald-500/8">
                      <span className="shrink-0 font-bold text-emerald-400 select-none leading-5">+</span>
                      <span className="text-emerald-800 dark:text-emerald-300">{modules?.length ?? 0} módulos, {totalLessons} clases</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {modules.map((mod, modIndex) => (
                  <div key={modIndex} className="overflow-hidden rounded-xl border border-border bg-background/60 dark:bg-white/3">
                    <button
                      onClick={() => toggleModule(modIndex)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-primary/5 cursor-pointer"
                    >
                      {expandedModules.has(modIndex) ? (
                        <FiChevronDown size={16} className="shrink-0 text-primary" />
                      ) : (
                        <FiChevronRight size={16} className="shrink-0 text-gray-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Módulo {modIndex + 1}: {mod.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-white/45">
                          {mod.lessons.length} {mod.lessons.length === 1 ? "clase" : "clases"}
                          {mod.evaluation && ` · ${mod.evaluation.questions.length} preguntas de evaluación`}
                        </p>
                      </div>
                      {mod.lessons.some((l) => l.hlsUrl) && (
                        <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                          <FiVideo size={11} />
                          Video
                        </span>
                      )}
                    </button>
                    {expandedModules.has(modIndex) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border"
                      >
                        <ul className="divide-y divide-border">
                          {mod.lessons.map((lesson, lessonIndex) => (
                            <li key={lessonIndex}>
                              <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 pl-8 sm:pl-12">
                                <FiPlay size={12} className="shrink-0 text-gray-400 dark:text-white/35" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-gray-700 dark:text-white/70">{lesson.title}</p>
                                  {lesson.content && (
                                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-400 dark:text-white/40">{lesson.content}</p>
                                  )}
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  {lesson.durationMinutes && (
                                    <span className="text-xs text-gray-400 dark:text-white/35">{formatDuration(lesson.durationMinutes)}</span>
                                  )}
                                  {lesson.hlsUrl && (
                                    <button
                                      onClick={() => setPreviewVideo(
                                        previewVideo?.moduleIndex === modIndex && previewVideo?.lessonIndex === lessonIndex
                                          ? null
                                          : { moduleIndex: modIndex, lessonIndex }
                                      )}
                                      className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer ${
                                        previewVideo?.moduleIndex === modIndex && previewVideo?.lessonIndex === lessonIndex
                                          ? "border-primary/50 bg-primary/10 text-primary"
                                          : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                                      }`}
                                    >
                                      <FiEye size={10} className="sm:size-[11px]" />
                                      {previewVideo?.moduleIndex === modIndex && previewVideo?.lessonIndex === lessonIndex ? "Cerrar" : "Ver"}
                                    </button>
                                  )}
                                </div>
                              </div>
                              {previewVideo?.moduleIndex === modIndex && previewVideo?.lessonIndex === lessonIndex && lesson.hlsUrl && (
                                <div className="border-t border-border px-4 pb-4 pl-12 pt-3">
                                  <HlsPlayer
                                    productId={productId}
                                    moduleIndex={modIndex}
                                    lessonIndex={lessonIndex}
                                    url={lesson.hlsUrl}
                                    className="rounded-lg"
                                  />
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                        {mod.evaluation && (
                          <div className="border-t border-border bg-primary/[0.02] px-4 py-3 pl-12">
                            <div className="flex items-center gap-2">
                              <FiCheckCircle size={14} className="text-primary" />
                              <span className="text-xs font-medium text-gray-700 dark:text-white/70">
                                Evaluación del módulo · {mod.evaluation.questions.length} preguntas
                              </span>
                              <span className="text-xs text-gray-400 dark:text-white/40">
                                (Aprobación: {mod.evaluation.passingScore}%)
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!modules || modules.length === 0) && (
            <div className="rounded-xl border border-border bg-background/30 py-12 text-center dark:bg-white/2">
              <FiBookOpen size={32} className="mx-auto mb-3 text-gray-300 dark:text-white/20" />
              <p className="text-sm font-medium text-gray-500 dark:text-white/45">Este curso no tiene contenido</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-white/30">El creador aún no ha agregado módulos ni lecciones.</p>
            </div>
          )}


        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Price card */}
          <div className="rounded-2xl border border-border bg-background/60 p-5 shadow-md dark:bg-white/3">
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.previousValues?.price !== undefined && Number(product.previousValues.price) !== Number(product.price) && (
                <div className="mt-2 overflow-hidden rounded-lg border border-border font-mono text-xs dark:border-white/10">
                  <div className="flex items-start gap-2.5 border-l-4 border-red-400 bg-red-50/80 px-3 py-1 dark:border-red-500 dark:bg-red-500/8">
                    <span className="shrink-0 font-bold text-red-400 select-none leading-5">−</span>
                    <span className="text-red-800 dark:text-red-300">${Number(product.previousValues.price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-start gap-2.5 border-l-4 border-emerald-400 bg-emerald-50/80 px-3 py-1 dark:border-emerald-500 dark:bg-emerald-500/8">
                    <span className="shrink-0 font-bold text-emerald-400 select-none leading-5">+</span>
                    <span className="text-emerald-800 dark:text-emerald-300">${Number(product.price).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4 space-y-2.5">
              {totalDuration && totalDuration > 0 && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-white/60">
                  <FiClock size={14} className="shrink-0 text-gray-400" />
                  <span>{formatDuration(totalDuration)} de contenido</span>
                </div>
              )}
              {modules && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-white/60">
                  <FiBookOpen size={14} className="shrink-0 text-gray-400" />
                  <span>{modules.length} módulo{modules.length !== 1 ? "s" : ""} · {totalLessons} clases</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-white/60">
                <FiDollarSign size={14} className="shrink-0 text-gray-400" />
                <span>Acceso de por vida</span>
              </div>
            </div>

            {/* Affiliate config */}
            {product.affiliateEnabled && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiLink size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    Programa de afiliados
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {product.commissionRate}%
                  </span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">de comisión</span>
                </div>
                {product.previousValues?.commissionRate !== undefined && Number(product.previousValues.commissionRate) !== Number(product.commissionRate) && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border font-mono text-xs dark:border-white/10">
                    <div className="flex items-start gap-2.5 border-l-4 border-red-400 bg-red-50/80 px-3 py-1 dark:border-red-500 dark:bg-red-500/8">
                      <span className="shrink-0 font-bold text-red-400 select-none leading-5">−</span>
                      <span className="text-red-800 dark:text-red-300">{product.previousValues.commissionRate ?? 0}%</span>
                    </div>
                    <div className="flex items-start gap-2.5 border-l-4 border-emerald-400 bg-emerald-50/80 px-3 py-1 dark:border-emerald-500 dark:bg-emerald-500/8">
                      <span className="shrink-0 font-bold text-emerald-400 select-none leading-5">+</span>
                      <span className="text-emerald-800 dark:text-emerald-300">{product.commissionRate}%</span>
                    </div>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-100/60 px-2.5 py-1.5 dark:bg-emerald-500/15">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300">Cookie days: {product.affiliateCookieDays}</span>
                </div>
                {product.previousValues?.affiliateCookieDays !== undefined && Number(product.previousValues.affiliateCookieDays) !== Number(product.affiliateCookieDays) && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border font-mono text-xs dark:border-white/10">
                    <div className="flex items-start gap-2.5 border-l-4 border-red-400 bg-red-50/80 px-3 py-1 dark:border-red-500 dark:bg-red-500/8">
                      <span className="shrink-0 font-bold text-red-400 select-none leading-5">−</span>
                      <span className="text-red-800 dark:text-red-300">{product.previousValues.affiliateCookieDays ?? 30} días</span>
                    </div>
                    <div className="flex items-start gap-2.5 border-l-4 border-emerald-400 bg-emerald-50/80 px-3 py-1 dark:border-emerald-500 dark:bg-emerald-500/8">
                      <span className="shrink-0 font-bold text-emerald-400 select-none leading-5">+</span>
                      <span className="text-emerald-800 dark:text-emerald-300">{product.affiliateCookieDays} días</span>
                    </div>
                  </div>
                )}

                {/* Affiliate description */}
                {product.affiliateDescription && (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">Descripción para afiliados</p>
                    <p className="text-xs leading-relaxed text-gray-700 dark:text-white/70">{product.affiliateDescription}</p>
                  </div>
                )}
                {product.previousValues?.affiliateDescription !== undefined && product.previousValues?.affiliateDescription !== product.affiliateDescription && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border font-mono text-xs dark:border-white/10">
                    <div className="flex items-start gap-2.5 border-l-4 border-red-400 bg-red-50/80 px-3 py-1 dark:border-red-500 dark:bg-red-500/8">
                      <span className="shrink-0 font-bold text-red-400 select-none leading-5">−</span>
                      <span className="text-red-800 dark:text-red-300">{product.previousValues.affiliateDescription || '(vacío)'}</span>
                    </div>
                    <div className="flex items-start gap-2.5 border-l-4 border-emerald-400 bg-emerald-50/80 px-3 py-1 dark:border-emerald-500 dark:bg-emerald-500/8">
                      <span className="shrink-0 font-bold text-emerald-400 select-none leading-5">+</span>
                      <span className="text-emerald-800 dark:text-emerald-300">{product.affiliateDescription || '(vacío)'}</span>
                    </div>
                  </div>
                )}

                {/* Affiliate video */}
                {product.affiliateVideoUrl ? (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">Video para afiliados</p>
                    <HlsPlayer url={product.affiliateVideoUrl} className="rounded-xl border border-emerald-300 dark:border-emerald-500/30" />
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-border bg-background/40 px-3 py-2 dark:bg-white/3">
                    <FiVideo size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-white/45">Sin video de introducción para afiliados</span>
                  </div>
                )}
                {product.previousValues?.affiliateVideoUrl !== undefined && product.previousValues?.affiliateVideoUrl !== product.affiliateVideoUrl && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border font-mono text-xs dark:border-white/10">
                    <div className="flex items-start gap-2.5 border-l-4 border-red-400 bg-red-50/80 px-3 py-1 dark:border-red-500 dark:bg-red-500/8">
                      <span className="shrink-0 font-bold text-red-400 select-none leading-5">−</span>
                      <span className="text-red-800 dark:text-red-300">{product.previousValues.affiliateVideoUrl || 'Ninguno'}</span>
                    </div>
                    <div className="flex items-start gap-2.5 border-l-4 border-emerald-400 bg-emerald-50/80 px-3 py-1 dark:border-emerald-500 dark:bg-emerald-500/8">
                      <span className="shrink-0 font-bold text-emerald-400 select-none leading-5">+</span>
                      <span className="text-emerald-800 dark:text-emerald-300">{product.affiliateVideoUrl || 'Ninguno'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Producer info */}
          <div className="rounded-2xl border border-border bg-background/60 p-4 dark:bg-white/3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">Creador</p>
            <div className="mt-2 flex items-center gap-3">
              {product.producer?.avatar ? (
                <img src={product.producer.avatar} alt={producerName} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-600 dark:text-violet-400">
                  {producerName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{producerName}</p>
                <p className="text-xs text-gray-500 dark:text-white/45">Instructor</p>
              </div>
            </div>

            <div className="mt-3 border-t border-border pt-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <FiCheckCircle size={12} />
                    {reviewStats?.positiveCount ?? 0} positivas
                  </span>
                  {(reviewStats?.neutralCount ?? 0) > 0 && (
                    <span className="text-gray-500 dark:text-white/45">
                      {reviewStats?.neutralCount} neutras
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-red-500">
                    <FiX size={12} />
                    {reviewStats?.negativeCount ?? 0} negativas
                  </span>
                  {reviewStats?.profileCommentCount !== undefined && (
                    <span className="flex items-center gap-1 text-gray-500 dark:text-white/45">
                      <FiMessageSquare size={12} />
                      {reviewStats.profileCommentCount} comentario{reviewStats.profileCommentCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {(reviewStats?.recentComments?.length ?? 0) > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/45">
                      Últimos comentarios
                    </p>
                    {reviewStats!.recentComments.map((c) => (
                      <div key={c.id} className="rounded-lg border border-border bg-background/40 p-2.5 dark:bg-white/3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[11px] font-medium text-gray-900 dark:text-white">
                            {c.user.fullname ?? c.user.username ?? "Usuario"}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            {Array.from({ length: 5 }, (_, i) => (
                              <FiStar
                                key={i}
                                size={10}
                                className={i < c.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-white/20"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-white/55 line-clamp-2">{c.comment}</p>
                        <p className="mt-0.5 text-[10px] text-gray-400 dark:text-white/30">en "{c.product.title}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>

          {/* Stats card */}
          {product._count && (
            <div className="rounded-2xl border border-border bg-background/60 p-4 dark:bg-white/3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">Estadísticas</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/45">Inscripciones</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product._count.enrollments}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/45">Ventas</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product._count.orders}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/45">Afiliados</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product._count.affiliations}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Approve/Reject — full-width at the bottom */}
      {product.status === "UNDER_REVIEW" && (
        <div className="mt-6 sm:mt-8 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/60 dark:border-amber-500/25 dark:from-amber-500/8 dark:to-amber-500/3">
          <div className="relative px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/15">
                  <FiShield size={16} className="sm:size-[18px] text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">Revisión pendiente</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-amber-600/70 dark:text-amber-400/60">
                    Has revisado todo el contenido del curso. Si todo está correcto, aprueba el producto para publicarlo.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 border-t border-amber-200/60 pt-3 sm:pt-4 dark:border-amber-500/15">
              <button
                onClick={() => handleReview("PUBLISHED")}
                disabled={reviewLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
              >
                {reviewLoading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiCheck size={14} />
                )}
                Aprobar
              </button>
              <button
                onClick={() => handleReview("REJECTED")}
                disabled={reviewLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white/60 px-4 py-2 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:border-red-300 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 dark:border-red-500/30 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10 cursor-pointer"
              >
                <FiX size={14} />
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
