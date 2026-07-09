"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import { useNotification } from "@/hooks/useNotification";
import type { Role } from "@/types/user";
import {
  UserPageHeader,
  SectionCard,
  StatCard,
  RoleBadge,
} from "@/components/user/userShell";
import {
  getAffiliation,
  type AffiliationDetailResponse,
} from "@/lib/affiliation-api";
import {
  FiArrowLeft,
  FiLink,
  FiCopy,
  FiExternalLink,
  FiDollarSign,
  FiClock,
  FiPercent,
  FiVideo,
  FiInfo,
  FiRefreshCw,
} from "react-icons/fi";

export default function AffiliationDetailPage({
  params,
}: {
  params: Promise<{ affiliationId: string }>;
}) {
  const { affiliationId } = use(params);
  const router = useRouter();
  const { user, loading: profileLoading } = useProfile();
  const { notify } = useNotification();
  const role = (user?.role ?? "STUDENT") as Role;
  const [affiliation, setAffiliation] = useState<AffiliationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loadAffiliation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { ok, result } = await getAffiliation(affiliationId);
      if (ok && result?.data) {
        setAffiliation(result.data);
      } else {
        setAffiliation(null);
        setError(result?.message ?? "Afiliación no encontrada");
      }
    } catch {
      setAffiliation(null);
      setError("Error al cargar la afiliación");
    } finally {
      setLoading(false);
    }
  }, [affiliationId]);

  useEffect(() => {
    if (profileLoading || role !== "AFFILIATE") return;
    loadAffiliation();
  }, [profileLoading, role, loadAffiliation]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      notify("success", "Copiado al portapapeles");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      notify("error", "No se pudo copiar");
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="h-64 rounded-xl bg-gray-200 dark:bg-white/10" />
      </div>
    );
  }

  if (role !== "AFFILIATE" || error || !affiliation) {
    const isNotFound = error === "Afiliación no encontrada" || (!affiliation && !error);
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg rounded-2xl border border-border bg-background/60 p-6 text-center dark:bg-white/3"
      >
        <div className="mb-3 flex justify-center">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isNotFound ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"}`}>
            {isNotFound ? <FiInfo size={20} /> : <FiRefreshCw size={20} />}
          </div>
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {error ?? "Afiliación no encontrada"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {isNotFound
            ? "El enlace no existe o no tienes acceso a esta afiliación"
            : "Revisa tu conexión e inténtalo de nuevo"}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          {!isNotFound && (
            <button
              type="button"
              onClick={loadAffiliation}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
            >
              <FiRefreshCw size={14} />
              Reintentar
            </button>
          )}
          <Link
            href="/user/affiliations"
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Mis afiliaciones
          </Link>
        </div>
      </motion.div>
    );
  }

  const { product, code } = affiliation;
  const earningsPerSale = product.price * (product.commissionRate / 100);
  const referralUrl = `https://monetra.io/ref/${code}`;
  const checkoutUrl = `https://monetra.io/checkout/${product.id}?ref=${code}`;
  const salesPageUrl = `/user/explore/${product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto flex max-w-6xl flex-col gap-4"
    >
      <button
        onClick={() => router.push("/user/affiliations")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-white/45 dark:hover:text-white cursor-pointer"
      >
        <FiArrowLeft size={14} />
        Mis afiliaciones
      </button>

      <UserPageHeader
        title={product.title}
        description={`Afiliado · Código: ${code}`}
        badge={<RoleBadge label="Afiliado" tone="role" />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {product.thumbnail && (
            <div className="overflow-hidden rounded-2xl border border-border">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="aspect-video w-full object-cover"
              />
            </div>
          )}

          <SectionCard title="Información del producto">
            <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">
              {product.description}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
              <Link
                href={salesPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-gray-800 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white dark:hover:bg-primary/10"
              >
                <FiExternalLink size={13} />
                Ver página de ventas
              </Link>
            </div>
          </SectionCard>

          {product.affiliateDescription && (
            <SectionCard title="Descripción para afiliados">
              <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed whitespace-pre-line">
                {product.affiliateDescription}
              </p>
            </SectionCard>
          )}

          {product.affiliateVideoUrl && (
            <SectionCard title="Video promocional">
              {product.affiliateVideoUrl.match(/\.m3u8/) ? (
                <div className="overflow-hidden rounded-xl border border-border bg-black">
                  <video
                    src={product.affiliateVideoUrl}
                    className="aspect-video w-full"
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-gray-100 dark:bg-white/5">
                  <div className="text-center">
                    <FiVideo size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-white/45">
                      Video de afiliados disponible
                    </p>
                  </div>
                </div>
              )}
            </SectionCard>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid gap-3">
            <StatCard
              icon={FiPercent}
              label="Tu comisión"
              value={`${product.commissionRate}%`}
              hint={`$${earningsPerSale.toFixed(2)} por venta`}
              tone="role"
            />
            <StatCard
              icon={FiClock}
              label="Ventana de cookies"
              value={`${product.affiliateCookieDays} días`}
              hint="Comisión asegurada en este período"
              tone="neutral"
            />
            <StatCard
              icon={FiDollarSign}
              label="Ganancia potencial"
              value={`$${earningsPerSale.toFixed(2)}`}
              hint="Por cada venta referida"
              tone="role"
            />
          </div>

          <SectionCard title="Tus enlaces">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-white/40">
                  Link de referido
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    readOnly
                    value={referralUrl}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs text-gray-600 dark:text-white/60"
                  />
                  <button
                    onClick={() => copyToClipboard(referralUrl, "referral")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-primary/40 hover:text-primary dark:text-white/60 cursor-pointer"
                  >
                    {copiedField === "referral" ? (
                      <span className="text-emerald-500">Copiado</span>
                    ) : (
                      <>
                        <FiCopy size={13} />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-white/40">
                  Link de checkout (con ref)
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    readOnly
                    value={checkoutUrl}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs text-gray-600 dark:text-white/60"
                  />
                  <button
                    onClick={() => copyToClipboard(checkoutUrl, "checkout")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-primary/40 hover:text-primary dark:text-white/60 cursor-pointer"
                  >
                    {copiedField === "checkout" ? (
                      <span className="text-emerald-500">Copiado</span>
                    ) : (
                      <>
                        <FiCopy size={13} />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-white/40">
                  Página de ventas
                </label>
                <div className="mt-1">
                  <a
                    href={salesPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                  >
                    <FiExternalLink size={13} />
                    Abrir página de ventas
                  </a>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recursos">
            <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">
              Usa estos enlaces en tus campañas, newsletters, redes sociales o sitio web.
              Cada venta realizada a través de tu link de referido te generará una comisión
              del <strong>{product.commissionRate}%</strong> dentro de los{" "}
              <strong>{product.affiliateCookieDays} días</strong> posteriores al clic.
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2.5 dark:border-blue-500/20 dark:bg-blue-500/10">
              <FiInfo size={14} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Comprueba que el programa permita promoción en los canales que usas.
                Revisa las políticas de marca del creador.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </motion.div>
  );
}
