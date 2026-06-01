"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types/user";
import {
  UserPageHeader,
  StatCard,
  SectionCard,
  QuickLink,
  RoleBadge,
} from "@/components/user/userShell";
import { Modal } from "@/components/UI/Modal";
import { ProductForm } from "@/components/UI/ProductForm";
import {
  listMyProducts,
  deleteProduct,
  type ProductResponse,
} from "@/lib/product-api";
import {
  FiPackage,
  FiDollarSign,
  FiUsers,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiInbox,
} from "react-icons/fi";

function statusLabel(status: string) {
  return status === "DRAFT"
    ? "Borrador"
    : status === "PUBLISHED"
      ? "Activo"
      : "Archivado";
}

function statusColor(status: string) {
  return status === "PUBLISHED"
    ? "text-emerald-600 dark:text-emerald-400"
    : status === "DRAFT"
      ? "text-amber-600 dark:text-amber-400"
      : "text-gray-500 dark:text-white/45";
}

function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: ProductResponse;
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col gap-1 rounded-lg border border-border bg-background/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-white/2"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {product.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-white/45">
          ${Number(product.price).toFixed(2)} ·{" "}
          {new Date(product.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex min-w-[80px] items-center justify-end sm:min-w-[100px]">
          <motion.span
            animate={{ opacity: hovered ? 0 : 1, scale: hovered ? 0.9 : 1 }}
            transition={{ duration: 0.12 }}
            className={`text-xs font-medium ${statusColor(product.status)}`}
          >
            {statusLabel(product.status)}
          </motion.span>
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.9 }}
            transition={{ duration: 0.12 }}
            className="absolute flex items-center gap-1"
            style={{ pointerEvents: hovered ? "auto" : "none" }}
          >
            <button
              onClick={() => onEdit(product)}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/15"
              title="Editar"
            >
              <FiEdit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="Eliminar"
            >
              <FiTrash2 size={14} />
            </button>
          </motion.div>
        </div>
      </div>

      <div className="flex gap-2 sm:hidden">
        <button
          onClick={() => onEdit(product)}
          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-primary/40 hover:text-primary dark:text-white/60"
        >
          <FiEdit3 size={12} />
          Editar
        </button>
        <button
          onClick={() => onDelete(product)}
          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-red-400 hover:text-red-600 dark:text-white/60"
        >
          <FiTrash2 size={12} />
          Eliminar
        </button>
      </div>
    </motion.div>
  );
}

export default function ProductsPage() {
  const { user, loading: profileLoading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | undefined>(undefined);

  const fetchProducts = async () => {
    if (role !== "PRODUCER") return;
    setLoading(true);
    const { ok, result } = await listMyProducts();
    if (ok && result.data?.products) {
      setProducts(result.data.products);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!profileLoading) {
      fetchProducts();
    }
  }, [profileLoading, role]);

  const handleEdit = (product: ProductResponse) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleDelete = async (product: ProductResponse) => {
    if (!window.confirm(`¿Eliminar "${product.title}"?`)) return;

    const { ok } = await deleteProduct(product.id);
    if (ok) {
      fetchProducts();
    }
  };

  const handleFormSuccess = () => {
    setProductModalOpen(false);
    setEditingProduct(undefined);
    fetchProducts();
  };

  const handleFormClose = () => {
    setProductModalOpen(false);
    setEditingProduct(undefined);
  };

  const activos = products.filter((p) => p.status === "PUBLISHED").length;
  const totalAffiliations = products.reduce(
    (sum, p) => sum + (p._count?.affiliations ?? 0),
    0,
  );

  if (profileLoading || (loading && role === "PRODUCER")) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200 dark:bg-white/10"
            />
          ))}
        </div>
      </div>
    );
  }

  if (role !== "PRODUCER") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg rounded-xl border border-border bg-background/60 p-6 text-center dark:bg-white/3"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Solo productores gestionan el catálogo
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-white/55">
          Activa el rol Productor para crear y editar productos.
        </p>
        <div className="mt-4 flex justify-center">
          <QuickLink
            href="/user/dashboard"
            label="Ir al dashboard"
            variant="primary"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto flex max-w-6xl flex-col"
    >
      <UserPageHeader
        title="Mis productos"
        description="Publica, actualiza precios y conecta afiliados a tus lanzamientos."
        badge={<RoleBadge label="Productor" tone="emerald" />}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={FiPackage}
            label="Activos"
            value={String(activos)}
            hint={
              activos === 1
                ? "1 producto visible en la tienda"
                : `${activos} productos visibles en la tienda`
            }
            tone="emerald"
          />
          <StatCard
            icon={FiDollarSign}
            label="Ingresos (30 días)"
            value="—"
            hint="Conecta pagos para métricas"
            tone="neutral"
          />
          <StatCard
            icon={FiUsers}
            label="Afiliados"
            value={String(totalAffiliations)}
            hint="Promotores con enlace propio"
            tone="violet"
          />
        </div>
      </div>

      <SectionCard
        title="Catálogo"
        action={
          <span className="text-xs text-gray-500 dark:text-white/45">
            {products.length} producto{products.length !== 1 ? "s" : ""}
          </span>
        }
      >
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
              <FiInbox
                size={20}
                className="text-gray-400 dark:text-white/40"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-white/70">
                Aún no tienes productos
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
                Crea tu primer producto para empezar a vender.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <button
            onClick={() => {
              setEditingProduct(undefined);
              setProductModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <FiPlus size={16} />
            Nuevo producto
          </button>
          <QuickLink
            href="/user/explore"
            label="Ver mercado"
            variant="outline"
          />
        </div>
      </SectionCard>

      <Modal isOpen={productModalOpen} onClose={handleFormClose}>
        <ProductForm
          editProduct={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </motion.div>
  );
}
