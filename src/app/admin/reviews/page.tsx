"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FiInbox, FiCheck, FiX, FiImage, FiExternalLink } from "react-icons/fi";
import { useNotification } from "@/hooks/useNotification";
import type { ProductResponse } from "@/lib/product-api";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { notify } = useNotification();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/admin/pending-reviews");
      const json = await res.json();
      if (json.data?.products) {
        setProducts(json.data.products);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReview = async (productId: string, action: "PUBLISHED" | "REJECTED") => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/products/${productId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        notify("error", json.message ?? "Error al revisar el producto");
        return;
      }
      notify("success", action === "PUBLISHED" ? "Producto aprobado" : "Producto rechazado");
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      notify("error", "Error de conexión");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-6xl flex-col"
    >
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Productos pendientes
        </h1>
        <p className="mt-1.5 text-sm text-foreground/55">
          Revisa y aprueba o rechaza los productos enviados por los creadores.
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200 dark:bg-white/10" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
            <FiInbox size={24} className="text-gray-400 dark:text-white/40" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground">No hay productos pendientes</p>
            <p className="mt-1 text-sm text-foreground/45">
              Todos los productos han sido revisados.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-4 shadow-sm dark:bg-white/3"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-200 to-gray-100 dark:from-white/10 dark:to-white/5">
                    <FiImage size={18} className="text-gray-400 dark:text-white/30" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{product.title}</p>
                <p className="text-xs text-foreground/45">
                  ${Number(product.price).toFixed(2)}
                  {product.producer && (
                    <> · por {product.producer.fullname ?? product.producer.username ?? "—"}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReview(product.id, "PUBLISHED")}
                  disabled={actionLoading === product.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {actionLoading === product.id ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <FiCheck size={14} />
                  )}
                  Aprobar
                </button>
                <button
                  onClick={() => handleReview(product.id, "REJECTED")}
                  disabled={actionLoading === product.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <FiX size={14} />
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
