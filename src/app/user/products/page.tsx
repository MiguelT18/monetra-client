"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types/user";
import {
  UserPageHeader,
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
  type MyProductsResult,
} from "@/lib/product-api";
import {
  FiPackage,
  FiUsers,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiInbox,
  FiImage,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiShoppingCart,
  FiTrendingUp,
} from "react-icons/fi";

const PAGE_LIMIT = 5;

function statusLabel(status: string) {
  switch (status) {
    case "DRAFT": return "Borrador";
    case "UNDER_REVIEW": return "En revisión";
    case "PUBLISHED": return "Activo";
    case "REJECTED": return "Rechazado";
    default: return "Archivado";
  }
}

function statusColor(status: string) {
  switch (status) {
    case "PUBLISHED": return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
    case "UNDER_REVIEW": return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
    case "REJECTED": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    case "DRAFT": return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
    default: return "text-gray-500 dark:text-white/45 bg-gray-100 dark:bg-white/10";
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "PUBLISHED": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "UNDER_REVIEW": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "REJECTED": return "bg-red-500/10 text-red-600 dark:text-red-400";
    case "DRAFT": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    default: return "bg-gray-500/10 text-gray-500 dark:text-white/40";
  }
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("...");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  }
  return pages;
}

function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-xs text-gray-500 dark:text-white/45">
        Página <span className="font-medium text-gray-700 dark:text-white/70">{page}</span> de{" "}
        <span className="font-medium text-gray-700 dark:text-white/70">{totalPages}</span>
        {" "}— {total} producto{total !== 1 ? "s" : ""}
      </p>

      <nav className="flex items-center gap-1" aria-label="Paginación">
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-white/10 dark:text-white/50 cursor-pointer"
          aria-label="Primera página"
        >
          <FiChevronsLeft size={15} />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-white/10 dark:text-white/50 cursor-pointer"
          aria-label="Página anterior"
        >
          <FiChevronLeft size={15} />
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-xs text-gray-400 dark:text-white/30">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  p === page
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <span className="sm:hidden text-xs font-medium text-gray-600 dark:text-white/60 px-2">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-white/10 dark:text-white/50 cursor-pointer"
          aria-label="Página siguiente"
        >
          <FiChevronRight size={15} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-white/10 dark:text-white/50 cursor-pointer"
          aria-label="Última página"
        >
          <FiChevronsRight size={15} />
        </button>
      </nav>
    </div>
  );
}

function ProductRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="space-y-1.5">
          <div className="h-4 w-48 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
      <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
    </div>
  );
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
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/user/products/${product.id}/edit`);
  };

  const students = product._count?.enrollments ?? 0;
  const affiliates = product._count?.affiliations ?? 0;
  const orders = product._count?.orders ?? 0;
  const revenue = orders * Number(product.price);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleRowClick}
      className="relative flex flex-col gap-3 rounded-xl border border-border bg-surface shadow-sm transition-all hover:shadow-md px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 hover:dark:bg-white/4 cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-200 to-gray-100 dark:from-white/10 dark:to-white/5">
              <FiImage size={16} className="text-gray-400 dark:text-white/30" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {product.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-white/45">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-white/45">
          <span className="flex items-center gap-1">
            <FiUsers size={12} />
            {students}
          </span>
          <span className="flex items-center gap-1">
            <FiShoppingCart size={12} />
            {orders}
          </span>
          <span className="flex items-center gap-1">
            <FiTrendingUp size={12} />
            {affiliates}
          </span>
          <span className="font-medium text-gray-700 dark:text-white/70">
            ${revenue.toFixed(0)}
          </span>
        </div>

        <motion.span
          animate={{ opacity: hovered ? 0 : 1, scale: hovered ? 0.9 : 1 }}
          transition={{ duration: 0.12 }}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColor(product.status)}`}
        >
          {statusLabel(product.status)}
        </motion.span>

        <motion.div
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.9 }}
          transition={{ duration: 0.12 }}
          className="flex items-center gap-1"
          style={{ pointerEvents: hovered ? "auto" : "none" }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/15 cursor-pointer"
            title="Editar"
          >
            <FiEdit3 size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product); }}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 cursor-pointer"
            title="Eliminar"
          >
            <FiTrash2 size={15} />
          </button>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-2 sm:hidden">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/45">
          <span>{students} estudiantes</span>
          <span>{orders} ventas</span>
          <span className="font-medium text-gray-700 dark:text-white/70">${revenue.toFixed(0)}</span>
        </div>
        <div className="flex w-full gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary/40 hover:text-primary dark:text-white/60 cursor-pointer"
          >
            <FiEdit3 size={12} />
            Editar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product); }}
            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-red-400 hover:text-red-600 dark:text-white/60 cursor-pointer"
          >
            <FiTrash2 size={12} />
            Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductsPage() {
  const { user, loading: profileLoading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [changingPage, setChangingPage] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fetchProducts = useCallback(async (pageNum: number) => {
    if (role !== "CREATOR") return;
    setChangingPage(true);
    setLoading(true);
    const { ok, result } = await listMyProducts(pageNum, PAGE_LIMIT);
    if (ok && result.data) {
      const data = result.data as MyProductsResult;
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    }
    setLoading(false);
    setChangingPage(false);
  }, [role]);

  useEffect(() => {
    if (!profileLoading) {
      fetchProducts(1);
    }
  }, [profileLoading, fetchProducts]);

  useEffect(() => {
    if (!profileLoading && role === "CREATOR") {
      setPage(1);
    }
  }, [role, profileLoading]);

  const handlePageChange = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
    fetchProducts(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (product: ProductResponse) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleDelete = (product: ProductResponse) => {
    setDeleteTarget(product);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { ok } = await deleteProduct(deleteTarget.id);
    if (ok) {
      setDeleteTarget(null);
      const remainingTotal = total - 1;
      const newTotalPages = Math.ceil(remainingTotal / PAGE_LIMIT);
      const targetPage = Math.min(page, Math.max(1, newTotalPages));
      setPage(targetPage);
      fetchProducts(targetPage);
    }
    setDeleting(false);
  };

  const handleFormSuccess = () => {
    setProductModalOpen(false);
    setEditingProduct(undefined);
    fetchProducts(page);
  };

  const handleFormClose = () => {
    setProductModalOpen(false);
    setEditingProduct(undefined);
  };

  const publishedCount = products.filter((p) => p.status === "PUBLISHED").length;
  const underReviewCount = products.filter((p) => p.status === "UNDER_REVIEW").length;
  const draftCount = products.filter((p) => p.status === "DRAFT").length;
  const rejectedCount = products.filter((p) => p.status === "REJECTED").length;
  const archivedCount = products.filter((p) => p.status === "ARCHIVED").length;
  const totalStudents = products.reduce((acc, p) => acc + (p._count?.enrollments ?? 0), 0);
  const totalAffiliations = products.reduce((acc, p) => acc + (p._count?.affiliations ?? 0), 0);
  const totalOrders = products.reduce((acc, p) => acc + (p._count?.orders ?? 0), 0);

  if (profileLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-200 dark:bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  if (role !== "CREATOR") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg rounded-2xl border border-border bg-background/60 p-6 text-center dark:bg-white/3"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Solo creadores gestionan el catálogo
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-white/55">
          Activa el rol Creador para crear y editar productos.
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
        description="Panel de gestión: crea, edita y monitorea el rendimiento de tu catálogo."
        badge={<RoleBadge label="Creador" tone="violet" />}
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <section className="flex flex-col rounded-2xl border border-border bg-background/60 p-4 shadow-md dark:bg-white/3 sm:p-5">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0 space-y-2 sm:space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-white/45 sm:text-xs">
                Productos
              </p>
              <p className="truncate text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
                {total}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm text-gray-500 dark:text-white/50 sm:h-12 sm:w-12">
              <FiPackage size={18} />
            </div>
          </div>
          <div className="mt-auto pt-3 sm:pt-4">
            <div className="h-px bg-border dark:bg-white/10 mb-2 sm:mb-3" />
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center justify-between text-[11px] sm:text-xs min-w-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span className="text-gray-500 dark:text-white/40 truncate">Activos</span>
                </div>
                <span className="shrink-0 font-medium text-emerald-600 dark:text-emerald-400">{publishedCount}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs min-w-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <span className="text-gray-500 dark:text-white/40 truncate">En revisión</span>
                </div>
                <span className="shrink-0 font-medium text-blue-600 dark:text-blue-400">{underReviewCount}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs min-w-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <span className="text-gray-500 dark:text-white/40 truncate">Borradores</span>
                </div>
                <span className="shrink-0 font-medium text-amber-600 dark:text-amber-400">{draftCount}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs min-w-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <span className="text-gray-500 dark:text-white/40 truncate">Rechazados</span>
                </div>
                <span className="shrink-0 font-medium text-red-600 dark:text-red-400">{rejectedCount}</span>
              </div>
            </div>
            {total > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10 flex sm:mt-3">
                {[
                  { count: publishedCount, color: "bg-emerald-500" },
                  { count: underReviewCount, color: "bg-blue-500" },
                  { count: draftCount, color: "bg-amber-500" },
                  { count: rejectedCount, color: "bg-red-500" },
                ].map((seg) =>
                  seg.count > 0 ? (
                    <div
                      key={seg.color}
                      className={`h-full ${seg.color} transition-all`}
                      style={{ width: `${(seg.count / total) * 100}%` }}
                    />
                  ) : null
                )}
              </div>
            )}
            {archivedCount > 0 && (
              <p className="mt-1 text-[11px] text-gray-400 dark:text-white/35 text-right sm:mt-1.5">
                +{archivedCount} archivado{archivedCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-col rounded-2xl border border-violet-200/80 bg-violet-500/[0.04] p-4 shadow-md dark:border-violet-500/20 dark:bg-violet-500/10 sm:p-5">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0 space-y-2 sm:space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-white/45 sm:text-xs">
                Rendimiento
              </p>
              <p className="truncate text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
                {totalStudents}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-sm text-violet-600 dark:text-violet-400 sm:h-12 sm:w-12">
              <FiUsers size={18} />
            </div>
          </div>
          <div className="mt-auto pt-3 sm:pt-4">
            <div className="h-px bg-violet-200/50 dark:bg-violet-500/15 mb-2 sm:mb-3" />
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between min-w-0 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                  <span className="text-[11px] text-gray-500 dark:text-white/40 sm:text-xs truncate">Estudiantes</span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                  {totalStudents}
                </span>
              </div>
              <div className="flex items-center justify-between min-w-0 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-violet-300" />
                  <span className="text-[11px] text-gray-500 dark:text-white/40 sm:text-xs truncate">Afiliados</span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                  {totalAffiliations}
                </span>
              </div>
              <div className="flex items-center justify-between min-w-0 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-violet-200 dark:bg-violet-600" />
                  <span className="text-[11px] text-gray-500 dark:text-white/40 sm:text-xs truncate">Ventas</span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                  {totalOrders}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SectionCard
        title="Catálogo"
        action={
          <button
            onClick={() => {
              setEditingProduct(undefined);
              setProductModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-md cursor-pointer"
          >
            <FiPlus size={15} />
            Nuevo producto
          </button>
        }
      >
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <ProductRowSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
              <FiInbox size={20} className="text-gray-400 dark:text-white/40" />
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
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-6 flex flex-col items-center gap-4 border-t border-border pt-4 sm:flex-row sm:justify-between">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={handlePageChange}
            />
            <QuickLink
              href="/user/explore"
              label="Ver mercado"
              variant="outline"
            />
          </div>
        )}
      </SectionCard>

      <Modal isOpen={productModalOpen} onClose={handleFormClose}>
        <ProductForm
          editProduct={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <Modal isOpen={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
              <FiTrash2 size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Eliminar producto
              </h3>
              <p className="text-sm text-gray-500 dark:text-white/45">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-white/70 mb-6">
            ¿Estás seguro de eliminar <strong>{deleteTarget?.title}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-600 dark:text-white/60 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {deleting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : null}
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
