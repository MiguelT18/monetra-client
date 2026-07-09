"use client";

import { useState, useEffect, use } from "react";
import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/user";
import {
  getProductPreview,
  getProduct,
  getProductAnalytics,
  reviewProduct,
  type ProductPreviewResponse,
  type ProductAnalytics,
  type ModuleData,
} from "@/lib/product-api";
import { listMyEnrollments, type EnrollmentResponse } from "@/lib/enrollment-api";
import {
  listProductReviews,
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
  FiArrowLeft,
} from "react-icons/fi";
import ProductHero from "@/components/product/ProductHero";
import ProductSidebar from "@/components/product/ProductSidebar";
import CurriculumSection from "@/components/product/CurriculumSection";
import ReviewSection from "@/components/product/ReviewSection";
import InstructorCard from "@/components/product/InstructorCard";
import CreatorMetrics from "@/components/product/CreatorMetrics";
import AdminReviewPanel from "@/components/product/AdminReviewPanel";

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

  const [affiliations, setAffiliations] = useState<AffiliationResponse[]>([]);
  const [affiliateEligible, setAffiliateEligible] = useState<boolean | null>(null);
  const [affiliateReasons, setAffiliateReasons] = useState<string[]>([]);
  const [joiningAffiliate, setJoiningAffiliate] = useState(false);
  const [affiliateSuccess, setAffiliateSuccess] = useState(false);
  const [affiliateError, setAffiliateError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [reviewsKey, setReviewsKey] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);

  const isEnrolled = enrollments.some((e) => e.productId === productId);
  const isAffiliated = affiliations.some((a) => a.productId === productId);

  useEffect(() => {
    if (profileLoading) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [previewResult, enrollmentsResult, reviewsResult] = await Promise.all([
          getProductPreview(productId),
          role === "STUDENT"
            ? listMyEnrollments(1, 100)
            : Promise.resolve({ ok: false, result: { data: { enrollments: [] } } }),
          listProductReviews(productId, 1, 50),
        ]);

        if (previewResult.ok && previewResult.result.data) {
          setPreview(previewResult.result.data as ProductPreviewResponse);
        } else if (role === "ADMIN") {
          const productResult = await getProduct(productId);
          if (productResult.ok && productResult.result.data?.product) {
            const p = productResult.result.data.product;
            setPreview({
              product: p,
              temperature: 0,
              temperatureLabel: "N/A",
              recentSales: 0,
              recentEnrollments: 0,
            });
          } else {
            setError("Producto no encontrado");
          }
        } else {
          setError("Producto no encontrado o no disponible");
        }

        if (enrollmentsResult.ok && enrollmentsResult.result.data?.enrollments) {
          setEnrollments(enrollmentsResult.result.data.enrollments);
        }

        if (reviewsResult.ok && reviewsResult.result.data) {
          const data = reviewsResult.result.data as ReviewsResult;
          setReviews(data.reviews);
          setTotalReviews(data.total);
        }

        if (role === "CREATOR" && previewResult.ok && previewResult.result.data) {
          const analyticsResult = await getProductAnalytics(productId);
          if (analyticsResult.ok && analyticsResult.result.data) {
            setAnalytics(analyticsResult.result.data as ProductAnalytics);
          }
        }
      } catch (err) {
        console.error("Error loading course data:", err);
        setError("Error al cargar los datos del curso");
      } finally {
        setLoading(false);
      }
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
      } else {
        setAffiliateEligible(false);
        setAffiliateReasons(["No se pudo verificar elegibilidad"]);
      }
    };

    loadAffiliateData();
  }, [profileLoading, role, productId]);

  useEffect(() => {
    if (!loading && isEnrolled) {
      router.replace("/user/courses");
    }
  }, [loading, isEnrolled, router]);

  const handleAdminReview = async (action: "PUBLISHED" | "REJECTED") => {
    setReviewLoading(true);
    const { ok, result } = await reviewProduct(productId, action);
    if (ok) {
      setPreview((prev) =>
        prev ? { ...prev, product: { ...prev.product, status: action } } : prev
      );
      window.dispatchEvent(new CustomEvent("pending-reviews-changed"));
    }
    setReviewLoading(false);
  };

  const handleJoinAffiliate = async () => {
    setJoiningAffiliate(true);
    setAffiliateError(null);

    try {
      const { ok, result } = await joinProductAsAffiliate(productId);

      if (ok && result.data?.affiliation) {
        setAffiliations((prev) => [...prev, result.data.affiliation]);
        setAffiliateSuccess(true);
      } else {
        setAffiliateError(result.message || "Error al unirse al programa de afiliados");
      }
    } catch {
      setAffiliateError("Error de conexión. Intenta de nuevo.");
    }

    setJoiningAffiliate(false);
  };

  if (loading || profileLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-64 rounded-2xl bg-gray-200 dark:bg-white/10" />
          <div className="grid gap-4 lg:grid-cols-3">
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

  const { product, temperature, temperatureLabel, recentSales, recentEnrollments } = preview;
  const isCreator = user?.id === product.producerId;
  const modules = product.modules as ModuleData | null;
  const producerName = product.producer?.username
    ? `@${product.producer.username}`
    : product.producer?.fullname ?? "Creador";

  const totalDuration = modules?.reduce(
    (acc, mod) => acc + mod.lessons.reduce((la, l) => la + (l.durationMinutes ?? 0), 0), 0
  ) ?? 0;

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

      {/* ─── TWO-COLUMN LAYOUT ─── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* LEFT COLUMN: Main content */}
        <div className="space-y-8 lg:col-span-2">
          <ProductHero
            product={product}
            producerName={producerName}
            totalDuration={totalDuration}
            modules={modules}
          />

          {/* Highlights cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background/60 p-4 text-center dark:bg-white/3">
              <p className="text-xl font-bold text-primary">{modules?.length ?? 0}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
                Módulo{modules?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-4 text-center dark:bg-white/3">
              <p className="text-xl font-bold text-violet-500">
                {modules?.reduce((a, m) => a + m.lessons.length, 0) ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
                Clases
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-4 text-center dark:bg-white/3">
              <p className="text-xl font-bold text-emerald-500">
                {product._count?.enrollments ?? 0}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
                Estudiantes
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
              Descripción
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-white/70">
              {product.description}
            </p>
          </div>

          {/* Curriculum */}
          {modules && modules.length > 0 && (
            <CurriculumSection
              modules={modules}
              role={role}
              productId={productId}
            />
          )}

          {/* Instructor */}
          <InstructorCard
            producer={product.producer}
            producerName={producerName}
          />

          {/* Reviews */}
          <ReviewSection
            reviews={reviews}
            totalReviews={totalReviews}
            avgRating={avgRating}
            isEnrolled={isEnrolled}
            onReviewSubmitted={() => setReviewsKey((k) => k + 1)}
            productId={productId}
          />
        </div>

        {/* RIGHT COLUMN: Sidebar (sticky) */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <ProductSidebar
              product={product}
              role={role}
              isCreator={isCreator}
              isEnrolled={isEnrolled}
              isAffiliated={isAffiliated}
              affiliateEligible={affiliateEligible}
              affiliateReasons={affiliateReasons}
              joiningAffiliate={joiningAffiliate}
              affiliateSuccess={affiliateSuccess}
              affiliateError={affiliateError}
              temperature={temperature}
              temperatureLabel={temperatureLabel}
              preview={{ recentSales, recentEnrollments }}
              reviewLoading={reviewLoading}
              onJoinAffiliate={handleJoinAffiliate}
              onAdminReview={handleAdminReview}
            />
          </div>
        </div>
      </div>

      {/* ─── ROLE-SPECIFIC SECTIONS (full width, below two-column) ─── */}
      <div className="mt-8 space-y-8">
        {/* Creator metrics */}
        {(role === "CREATOR" && isCreator && analytics) && (
          <CreatorMetrics
            analytics={analytics}
            temperature={temperature}
            temperatureLabel={temperatureLabel}
            recentSales={recentSales}
            recentEnrollments={recentEnrollments}
          />
        )}

        {/* Admin panel */}
        {role === "ADMIN" && (
          <AdminReviewPanel
            product={product}
            reviewLoading={reviewLoading}
            onAdminReview={handleAdminReview}
            modules={modules}
            productId={productId}
          />
        )}
      </div>

    </motion.div>
  );
}
