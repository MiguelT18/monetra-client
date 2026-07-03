"use client";

import { FiZap, FiMail, FiCheck, FiCheckCircle, FiAlertCircle, FiLink, FiDollarSign, FiEdit, FiThermometer, FiShoppingCart, FiRefreshCw, FiLock, FiHeart, FiUsers } from "react-icons/fi";
import Link from "next/link";
import type { ProductResponse } from "@/lib/product-api";
import type { Role } from "@/types/user";
import { TemperatureBadge } from "./TemperatureBadge";

interface ProductSidebarProps {
  product: ProductResponse;
  role: Role;
  isCreator: boolean;
  isEnrolled: boolean;
  isAffiliated: boolean;
  affiliateEligible: boolean | null;
  affiliateReasons: string[];
  joiningAffiliate: boolean;
  affiliateSuccess: boolean;
  affiliateError: string | null;
  temperature: number;
  temperatureLabel: string;
  preview: { recentSales: number; recentEnrollments: number };
  reviewLoading: boolean;
  onJoinAffiliate: () => void;
  onAdminReview: (action: "PUBLISHED" | "REJECTED") => void;
}

export default function ProductSidebar({
  product,
  role,
  isCreator,
  isEnrolled,
  isAffiliated,
  affiliateEligible,
  affiliateReasons,
  joiningAffiliate,
  affiliateSuccess,
  affiliateError,
  temperature,
  temperatureLabel,
  preview,
  reviewLoading,
  onJoinAffiliate,
  onAdminReview,
}: ProductSidebarProps) {
  const commissionEarnings = ((product.price * (product.commissionRate ?? 0)) / 100);

  return (
    <aside className="space-y-4">
      {/* ─── STUDENT / default sidebar ─── */}
      {(role === "STUDENT" || (!isCreator && role !== "AFFILIATE" && role !== "ADMIN")) && (
        <div className="rounded-2xl border border-border bg-background/60 p-5 shadow-md dark:bg-white/3">
          <div className="mb-4 text-center">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {!isEnrolled ? (
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg cursor-pointer">
              <FiShoppingCart size={16} />
              Comprar ahora
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
              <FiCheck size={16} />
              Ya estás inscrito
            </div>
          )}

          <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 text-sm font-medium text-gray-700 transition-all hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer">
            <FiMail size={16} />
            Enviar mensaje al creador
          </button>

          <div className="mt-5 space-y-3 border-t border-border pt-4">
            <div className="flex items-start gap-2.5">
              <FiRefreshCw size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              <span className="text-xs leading-relaxed text-gray-600 dark:text-white/55">
                <strong className="text-gray-900 dark:text-white">30 días de garantía</strong>
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <FiLock size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              <span className="text-xs leading-relaxed text-gray-600 dark:text-white/55">
                <strong className="text-gray-900 dark:text-white">Acceso de por vida</strong>
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <FiHeart size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              <span className="text-xs leading-relaxed text-gray-600 dark:text-white/55">
                <strong className="text-gray-900 dark:text-white">Soporte directo</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── CREATOR sidebar ─── */}
      {role === "CREATOR" && isCreator && (
        <div className="rounded-2xl border border-border bg-background/60 p-5 shadow-md dark:bg-white/3">
          <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
            Panel del creador
          </h3>

          <Link
            href={`/user/products/${product.id}/edit`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
          >
            <FiEdit size={16} />
            Editar producto
          </Link>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/55">
                <FiThermometer size={12} className="text-primary" />
                Temperatura
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{temperature}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/55">
                <FiShoppingCart size={12} className="text-primary" />
                Ventas recientes
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{preview.recentSales}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/55">
                <FiUsers size={12} className="text-primary" />
                Inscripciones recientes
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{preview.recentEnrollments}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/55">
                <FiUsers size={12} className="text-primary" />
                Afiliados
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{product._count?.affiliations ?? 0}</span>
            </div>
          </div>

          {product.affiliateEnabled && product.commissionRate != null && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-primary">Comisión de afiliados</p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{product.commissionRate}%</p>
            </div>
          )}
        </div>
      )}

      {/* ─── AFFILIATE sidebar ─── */}
      {role === "AFFILIATE" && (
        <div className="rounded-2xl border border-border bg-background/60 p-5 shadow-md dark:bg-white/3">
          {isAffiliated ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
              <FiCheckCircle size={16} />
              Ya estás afiliado
            </div>
          ) : affiliateEligible === false ? (
            <div className="space-y-3">
              <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white/30">
                <FiAlertCircle size={16} />
                Afiliación no disponible
              </button>
              {affiliateReasons.length > 0 && (
                <div className="rounded-xl border border-border bg-background/60 p-3 dark:bg-white/3">
                  <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-white/45">Motivos:</p>
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
          ) : affiliateEligible === null ? (
            <div className="flex items-center justify-center py-6">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          ) : product.affiliateEnabled ? (
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
                Comisión del curso
              </p>
              <div className="my-3 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {product.commissionRate}%
                </span>
              </div>
              <div className="mb-4 rounded-lg bg-emerald-50 py-2 dark:bg-emerald-500/10">
                <span className="text-sm text-emerald-700 dark:text-emerald-300">
                  Ganas <strong className="text-emerald-800 dark:text-emerald-200">${commissionEarnings.toFixed(2)}</strong> por venta
                </span>
              </div>
              <div className="mb-4">
                <TemperatureBadge temperature={temperature} label={temperatureLabel} />
              </div>
              <button
                onClick={onJoinAffiliate}
                disabled={joiningAffiliate || affiliateSuccess}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {joiningAffiliate ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : affiliateSuccess ? (
                  <FiCheck size={16} />
                ) : (
                  <FiLink size={16} />
                )}
                {affiliateSuccess ? "¡Afiliado exitosamente!" : joiningAffiliate ? "Uniéndote..." : "Afiliarse al curso"}
              </button>
              {affiliateError && <p className="mt-2 text-xs text-red-500">{affiliateError}</p>}
            </div>
          ) : (
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3 text-sm font-medium text-gray-700 transition-all hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer">
              <FiMail size={16} />
              Enviar mensaje al creador
            </button>
          )}
        </div>
      )}

      {/* ─── ADMIN sidebar ─── */}
      {role === "ADMIN" && (
        <div className="rounded-2xl border border-border bg-background/60 p-5 shadow-md dark:bg-white/3">
          <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
            Revisión de producto
          </h3>

          <div className={`rounded-xl border p-4 ${
            product.status === "UNDER_REVIEW"
              ? "border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/10"
              : product.status === "PUBLISHED"
                ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                : "border-border bg-background/60 dark:bg-white/3"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {product.status === "UNDER_REVIEW" && <FiAlertCircle size={16} className="text-amber-600 dark:text-amber-400" />}
              {product.status === "PUBLISHED" && <FiCheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />}
              <span className={`text-sm font-bold ${
                product.status === "UNDER_REVIEW" ? "text-amber-700 dark:text-amber-300" :
                product.status === "PUBLISHED" ? "text-emerald-700 dark:text-emerald-300" :
                "text-gray-700 dark:text-white/70"
              }`}>
                {product.status === "DRAFT" ? "Borrador" :
                 product.status === "UNDER_REVIEW" ? "En revisión" :
                 product.status === "PUBLISHED" ? "Publicado" :
                 product.status === "REJECTED" ? "Rechazado" : product.status}
              </span>
            </div>

            {product.status === "UNDER_REVIEW" && (
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
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/55">
                <FiThermometer size={12} className="text-primary" />
                Temperatura
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{temperature}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/55">
                <FiUsers size={12} className="text-primary" />
                Inscripciones
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{product._count?.enrollments ?? 0}</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      )}

    </aside>
  );
}

function FiX({ size }: { size?: number }) {
  return (
    <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
