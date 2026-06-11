"use client";

import { useState, useEffect, use } from "react";
import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/user";
import {
  getProductPreview,
  type ProductPreviewResponse,
  type ModuleData,
} from "@/lib/product-api";
import { listMyEnrollments, type EnrollmentResponse } from "@/lib/enrollment-api";
import {
  listProductReviews,
  createProductReview,
  type ReviewResponse,
  type ReviewsResult,
} from "@/lib/review-api";
import {
  listMyAffiliations,
  checkAffiliateEligibility,
  joinProductAsAffiliate,
  type AffiliationResponse,
} from "@/lib/affiliation-api";
import {
  FiClock,
  FiStar,
  FiDollarSign,
  FiPlay,
  FiChevronDown,
  FiChevronRight,
  FiArrowLeft,
  FiZap,
  FiThermometer,
  FiBookOpen,
  FiCheck,
  FiVideo,
  FiMessageSquare,
  FiSend,
  FiUser,
  FiMail,
  FiShield,
  FiRefreshCw,
  FiLock,
  FiHeart,
  FiLink,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={16}
          className={
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300 dark:text-white/20"
          }
        />
      ))}
    </div>
  );
}

function TemperatureBadge({
  temperature,
  label,
}: {
  temperature: number;
  label: string;
}) {
  const color =
    temperature < 25
      ? "from-blue-500 to-cyan-500"
      : temperature < 50
        ? "from-emerald-500 to-teal-500"
        : temperature < 75
          ? "from-amber-500 to-orange-500"
          : "from-red-500 to-rose-500";

  const textColor =
    temperature < 25
      ? "text-blue-600 dark:text-blue-400"
      : temperature < 50
        ? "text-emerald-600 dark:text-emerald-400"
        : temperature < 75
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 dark:bg-white/3">
      <div className="mb-2 flex items-center gap-2">
        <FiThermometer size={16} className={textColor} />
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
          Temperatura
        </span>
      </div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${textColor}`}>{temperature}</span>
        <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${temperature}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-gray-500 dark:text-white/40">
        Basado en ventas, inscripciones y comisiones
      </p>
    </div>
  );
}

function ModuleAccordion({ modules }: { modules: ModuleData }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-500 dark:text-white/45">
        <FiBookOpen size={14} />
        <span>
          {modules.length} módulo{modules.length !== 1 ? "s" : ""} · {totalLessons} clase{totalLessons !== 1 ? "s" : ""}
        </span>
      </div>
      {modules.map((mod, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-background/60 dark:bg-white/3"
        >
          <button
            onClick={() =>
              setExpandedIndex(expandedIndex === index ? null : index)
            }
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/5 cursor-pointer"
          >
            {expandedIndex === index ? (
              <FiChevronDown size={16} className="shrink-0 text-primary" />
            ) : (
              <FiChevronRight size={16} className="shrink-0 text-gray-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Módulo {index + 1}: {mod.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-white/45">
                {mod.lessons.length} clase{mod.lessons.length !== 1 ? "s" : ""}
              </p>
            </div>
          </button>
          {expandedIndex === index && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border"
            >
              <ul className="divide-y divide-border">
                {mod.lessons.map((lesson, lessonIndex) => (
                  <li
                    key={lessonIndex}
                    className="flex items-center gap-3 px-4 py-2.5 pl-10"
                  >
                    <FiPlay
                      size={12}
                      className="shrink-0 text-gray-400 dark:text-white/35"
                    />
                    <span className="flex-1 text-sm text-gray-700 dark:text-white/70">
                      {lesson.title}
                    </span>
                    {lesson.durationMinutes && (
                      <span className="shrink-0 text-xs text-gray-400 dark:text-white/35">
                        {formatDuration(lesson.durationMinutes)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

function VideoPlayer({ url }: { url: string }) {
  const getEmbedUrl = (videoUrl: string): string | null => {
    const youtubeMatch = videoUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
        <div className="text-center">
          <FiVideo size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Video no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <iframe
        src={embedUrl}
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default function ProductPreviewPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const { user, loading: profileLoading } = useProfile();
  const router = useRouter();
  const role = (user?.role ?? "STUDENT") as Role;

  const [preview, setPreview] = useState<ProductPreviewResponse | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [affiliations, setAffiliations] = useState<AffiliationResponse[]>([]);
  const [affiliateEligible, setAffiliateEligible] = useState<boolean | null>(null);
  const [affiliateReasons, setAffiliateReasons] = useState<string[]>([]);
  const [joiningAffiliate, setJoiningAffiliate] = useState(false);
  const [affiliateSuccess, setAffiliateSuccess] = useState(false);
  const [affiliateError, setAffiliateError] = useState<string | null>(null);

  const isEnrolled = enrollments.some((e) => e.productId === productId);
  const isAffiliated = affiliations.some((a) => a.productId === productId);

  useEffect(() => {
    if (profileLoading) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      const [previewResult, enrollmentsResult, reviewsResult] = await Promise.all([
        getProductPreview(productId),
        role === "STUDENT"
          ? listMyEnrollments(1, 100)
          : Promise.resolve({ ok: false, result: { data: { enrollments: [] } } }),
        listProductReviews(productId, 1, 50),
      ]);

      if (previewResult.ok && previewResult.result.data) {
        setPreview(previewResult.result.data as ProductPreviewResponse);
      } else {
        setError("Producto no encontrado o no disponible");
      }

      if (
        enrollmentsResult.ok &&
        enrollmentsResult.result.data?.enrollments
      ) {
        setEnrollments(enrollmentsResult.result.data.enrollments);
      }

      if (reviewsResult.ok && reviewsResult.result.data) {
        const data = reviewsResult.result.data as ReviewsResult;
        setReviews(data.reviews);
        setTotalReviews(data.total);
      }

      setLoading(false);
    };

    loadData();
  }, [productId, profileLoading, role]);

  useEffect(() => {
    if (profileLoading || role !== "AFFILIATE") return;

    const loadAffiliateData = async () => {
      const [affiliationsResult, eligibilityResult] = await Promise.allSettled([
        listMyAffiliations(1, 100),
        checkAffiliateEligibility(productId),
      ]);

      if (affiliationsResult.status === "fulfilled" && affiliationsResult.value.ok && affiliationsResult.value.result.data?.affiliations) {
        setAffiliations(affiliationsResult.value.result.data.affiliations);
      }

      if (eligibilityResult.status === "fulfilled" && eligibilityResult.value.ok && eligibilityResult.value.result.data) {
        const data = eligibilityResult.value.result.data as { eligible: boolean; reasons: string[] };
        setAffiliateEligible(data.eligible);
        setAffiliateReasons(data.reasons);
      }
    };

    loadAffiliateData();
  }, [profileLoading, role, productId]);

  useEffect(() => {
    if (!loading && isEnrolled) {
      router.replace("/user/courses");
    }
  }, [loading, isEnrolled, router]);

  if (loading || profileLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-64 rounded-2xl bg-gray-200 dark:bg-white/10" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-white/10" />
            </div>
            <div className="h-48 rounded-xl bg-gray-200 dark:bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {error || "Producto no encontrado"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
        >
          <FiArrowLeft size={14} />
          Volver
        </button>
      </div>
    );
  }

  const { product, temperature, temperatureLabel } = preview;
  const modules = product.modules as ModuleData | null;
  const producerName = product.producer?.username
    ? `@${product.producer.username}`
    : product.producer?.fullname ?? "Creador";

  const totalDuration = modules?.reduce(
    (acc, mod) =>
      acc + mod.lessons.reduce((la, l) => la + (l.durationMinutes ?? 0), 0),
    0
  );

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    setReviewError(null);

    const { ok, result } = await createProductReview(productId, {
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    });

    if (ok && result.data?.review) {
      setReviews((prev) => [result.data.review, ...prev]);
      setTotalReviews((prev) => prev + 1);
      setShowReviewForm(false);
      setReviewComment("");
      setReviewRating(5);
    } else {
      setReviewError(result.message || "Error al enviar la reseña");
    }

    setSubmittingReview(false);
  };

  const handleJoinAffiliate = async () => {
    setJoiningAffiliate(true);
    setAffiliateError(null);

    const { ok, result } = await joinProductAsAffiliate(productId);

    if (ok && result.data?.affiliation) {
      setAffiliations((prev) => [...prev, result.data.affiliation]);
      setAffiliateSuccess(true);
    } else {
      setAffiliateError(result.message || "Error al unirse al programa de afiliados");
    }

    setJoiningAffiliate(false);
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto max-w-6xl"
    >
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-white/50 dark:hover:text-white cursor-pointer"
      >
        <FiArrowLeft size={14} />
        Volver al mercado
      </button>

      {product.introVideoUrl ? (
        <div className="mb-6">
          <VideoPlayer url={product.introVideoUrl} />
        </div>
      ) : (
        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="relative flex aspect-video cursor-pointer items-center justify-center">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
              aria-hidden
            />
            <div className="relative flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 shadow-2xl backdrop-blur-sm ring-1 ring-white/20 transition-transform hover:scale-110">
                <FiPlay size={32} className="ml-1 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white/80">
                  Vista previa del curso
                </p>
                <p className="mt-1 text-xs text-white/40">
                  El instructor aún no sube un video de introducción
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                Producto digital
              </span>
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
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-line text-gray-700 dark:text-white/70">
              {product.description}
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Opiniones
                </h2>
                {totalReviews > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <FiStar size={12} className="fill-current" />
                    {avgRating.toFixed(1)}
                    <span className="text-amber-600/70 dark:text-amber-400/70">
                      ({totalReviews})
                    </span>
                  </span>
                )}
              </div>
              {isEnrolled && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-primary/40 hover:bg-primary/5 dark:text-white/70 dark:hover:bg-primary/10 cursor-pointer"
                >
                  <FiMessageSquare size={12} />
                  Escribir opinión
                </button>
              )}
            </div>

            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden rounded-xl border border-border bg-background/60 p-5 dark:bg-white/3"
              >
                <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                  Tu opinión
                </p>
                <div className="mb-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110 cursor-pointer"
                    >
                      <FiStar
                        size={20}
                        className={
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300 dark:text-white/20"
                        }
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Cuéntanos qué te pareció el curso (opcional)"
                  rows={3}
                  className="mb-3 w-full resize-none rounded-lg border border-border bg-background/50 px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
                />
                {reviewError && (
                  <p className="mb-2 text-xs text-red-500">{reviewError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewComment("");
                      setReviewError(null);
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/10 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    {submittingReview ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <FiSend size={12} />
                    )}
                    Enviar
                  </button>
                </div>
              </motion.div>
            )}

            {reviews.length === 0 ? (
              <div className="rounded-xl border border-border bg-background/30 py-10 text-center dark:bg-white/2">
                <FiMessageSquare
                  size={32}
                  className="mx-auto mb-3 text-gray-300 dark:text-white/20"
                />
                <p className="text-sm font-medium text-gray-500 dark:text-white/45">
                  Todavía no hay opiniones
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-white/30">
                  Sé el primero en comentar este curso
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-border bg-background/60 p-4 dark:bg-white/3"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      {review.user.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                          <FiUser
                            size={14}
                            className="text-gray-400 dark:text-white/40"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {review.user.username
                            ? `@${review.user.username}`
                            : review.user.fullname ?? "Usuario"}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <FiStar
                                key={s}
                                size={12}
                                className={
                                  s <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-200 dark:text-white/10"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-gray-400 dark:text-white/30">
                            {new Date(review.createdAt).toLocaleDateString(
                              "es-ES",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-white/65">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {modules && modules.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                Contenido del curso
              </h2>
              <ModuleAccordion modules={modules} />
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-2xl border border-border bg-background/60 p-5 shadow-md dark:bg-white/3">
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
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
                    <span>
                      {modules.length} módulo{modules.length !== 1 ? "s" : ""} ·{" "}
                      {modules.reduce((a, m) => a + m.lessons.length, 0)} clases
                    </span>
                  </div>
                )}
                {product.rating != null && product.rating > 0 && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-white/60">
                    <FiStar size={14} className="shrink-0 text-amber-400" />
                    <span>{product.rating.toFixed(1)} de 5</span>
                    <RatingStars rating={product.rating} />
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-white/60">
                  <FiDollarSign size={14} className="shrink-0 text-gray-400" />
                  <span>Acceso de por vida</span>
                </div>
              </div>

              {role === "STUDENT" && !isEnrolled && (
                <div className="space-y-2">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg">
                    <FiZap size={16} />
                    Comprar ahora
                  </button>
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 text-sm font-medium text-gray-700 transition-all hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10">
                    <FiMail size={16} />
                    Enviar mensaje al creador
                  </button>
                </div>
              )}

              {isEnrolled && (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <FiCheck size={16} />
                  Ya estás inscrito
                </div>
              )}

              {!isEnrolled && role !== "STUDENT" && (
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 text-sm font-medium text-gray-700 transition-all hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10">
                  <FiMail size={16} />
                  Enviar mensaje al creador
                </button>
              )}

              {role === "AFFILIATE" && product.affiliateEnabled && (
                <div className="space-y-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Comisión: {product.commissionRate}%
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">
                      Gana ${(product.price * (product.commissionRate ?? 0)) / 100}{" "}
                      por venta
                    </p>
                  </div>

                  {isAffiliated ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <FiCheckCircle size={16} />
                      Ya estás afiliado
                    </div>
                  ) : affiliateSuccess ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <FiCheckCircle size={16} />
                      Te has afiliado correctamente
                    </div>
                  ) : affiliateEligible === false ? (
                    <button
                      disabled
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white/30"
                    >
                      <FiAlertCircle size={16} />
                      Afiliación no disponible
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinAffiliate}
                      disabled={joiningAffiliate}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10 disabled:opacity-50"
                    >
                      {joiningAffiliate ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                      ) : (
                        <FiLink size={16} />
                      )}
                      {joiningAffiliate ? "Uniéndote..." : "Afiliarse al curso"}
                    </button>
                  )}

                  {affiliateError && (
                    <p className="text-center text-xs text-red-500">{affiliateError}</p>
                  )}

                  {affiliateEligible === false && affiliateReasons.length > 0 && (
                    <div className="rounded-xl border border-border bg-background/60 p-3 dark:bg-white/3">
                      <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-white/45">
                        Motivos:
                      </p>
                      <ul className="space-y-1">
                        {affiliateReasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-500 dark:text-white/40">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gray-400 dark:bg-white/30" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {role === "AFFILIATE" && !product.affiliateEnabled && (
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 text-sm font-medium text-gray-700 transition-all hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10">
                  <FiMail size={16} />
                  Enviar mensaje al creador
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4 dark:bg-white/3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
                Creador
              </p>
              <div className="mt-2 flex items-center gap-3">
                {product.producer?.avatar ? (
                  <img
                    src={product.producer.avatar}
                    alt={producerName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-600 dark:text-violet-400">
                    {producerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {producerName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/45">
                    Instructor
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-5 dark:bg-white/3">
              <div className="flex items-center gap-2 mb-4">
                <FiShield size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Garantía de satisfacción
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <FiRefreshCw size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="text-xs leading-relaxed text-gray-600 dark:text-white/55">
                    <strong className="text-gray-900 dark:text-white">30 días de garantía</strong> — Si el curso no cumple tus expectativas, te devolvemos tu dinero sin preguntas.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FiLock size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="text-xs leading-relaxed text-gray-600 dark:text-white/55">
                    <strong className="text-gray-900 dark:text-white">Acceso de por vida</strong> — Compra una vez y accede al curso siempre, incluyendo actualizaciones futuras.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FiHeart size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="text-xs leading-relaxed text-gray-600 dark:text-white/55">
                    <strong className="text-gray-900 dark:text-white">Soporte directo</strong> — Contacta al instructor ante cualquier duda o problema.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
