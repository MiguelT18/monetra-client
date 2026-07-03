"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { FiStar, FiMessageSquare, FiSend, FiUser } from "react-icons/fi";
import type { ReviewResponse } from "@/lib/review-api";

interface ReviewSectionProps {
  reviews: ReviewResponse[];
  totalReviews: number;
  avgRating: number;
  isEnrolled: boolean;
  onReviewSubmitted: () => void;
  productId: string;
}

export default function ReviewSection({ reviews, totalReviews, avgRating, isEnrolled, onReviewSubmitted, productId }: ReviewSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach((r) => { distribution[r.rating - 1]++; });

  const handleSubmit = async () => {
    setSubmittingReview(true);
    setReviewError(null);

    const { createProductReview } = await import("@/lib/review-api");
    const { ok, result } = await createProductReview(productId, {
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    });

    if (ok && result.data?.review) {
      onReviewSubmitted();
      setShowReviewForm(false);
      setReviewComment("");
      setReviewRating(5);
    } else {
      setReviewError(result.message || "Error al enviar la reseña");
    }

    setSubmittingReview(false);
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Opiniones</h2>
          {totalReviews > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <FiStar size={12} className="fill-current" />
              {avgRating.toFixed(1)}
              <span className="text-amber-600/70 dark:text-amber-400/70">({totalReviews})</span>
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

      {totalReviews > 0 && (
        <div className="mb-5 rounded-xl border border-border bg-background/60 p-4 dark:bg-white/3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="text-center sm:w-32">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</p>
              <div className="mt-1 flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar key={s} size={14} className={s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-white/20"} />
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-white/45">{totalReviews} opinión{totalReviews !== 1 ? "es" : ""}</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star - 1];
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-6 text-right text-xs text-gray-500 dark:text-white/45">{star}</span>
                    <FiStar size={10} className="fill-amber-400 text-amber-400 shrink-0" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                      <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs text-gray-400 dark:text-white/35">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-5 overflow-hidden rounded-xl border border-border bg-background/60 p-5 dark:bg-white/3"
        >
          <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Tu opinión</p>
          <div className="mb-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setReviewRating(star)} className="transition-transform hover:scale-110 cursor-pointer">
                <FiStar size={20} className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-white/20"} />
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
          {reviewError && <p className="mb-2 text-xs text-red-500">{reviewError}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowReviewForm(false); setReviewComment(""); setReviewError(null); }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/10 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
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
          <FiMessageSquare size={32} className="mx-auto mb-3 text-gray-300 dark:text-white/20" />
          <p className="text-sm font-medium text-gray-500 dark:text-white/45">Todavía no hay opiniones</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-white/30">Sé el primero en comentar este curso</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border bg-background/60 p-4 dark:bg-white/3">
              <div className="mb-2 flex items-center gap-3">
                {review.user.avatar ? (
                  <img src={review.user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                    <FiUser size={14} className="text-gray-400 dark:text-white/40" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {review.user.username ? `@${review.user.username}` : review.user.fullname ?? "Usuario"}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar key={s} size={12} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-white/10"} />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-white/30">
                      {new Date(review.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
              {review.comment && <p className="text-sm leading-relaxed text-gray-700 dark:text-white/65">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
