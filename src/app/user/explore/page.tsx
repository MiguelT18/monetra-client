"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/user";
import { HlsPlayer } from "@/components/player/HlsPlayer";
import {
  SectionCard,
  QuickLink,
  RoleBadge,
  roleTone,
  roleLabel,
  InfoProductCard,
  InfoProductCardSkeleton,
  type InfoProductAccent,
} from "@/components/user/userShell";
import type { IconType } from "react-icons";
import {
  FiSearch,
  FiBookOpen,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiDollarSign,
  FiPercent,
  FiBarChart2,
  FiZap,
  FiPenTool,
  FiCode,
  FiCpu,
  FiLayers,
  FiPackage,
  FiInbox,
  FiX,
  FiShoppingBag,
  FiLink,
  FiCheck,
  FiSliders,
  FiChevronDown,
} from "react-icons/fi";
import { listCatalog, type ProductResponse, type CatalogResult } from "@/lib/product-api";
import { listMyEnrollments, type EnrollmentResponse } from "@/lib/enrollment-api";
import { joinProductAsAffiliate, listMyAffiliations, type AffiliationResponse } from "@/lib/affiliation-api";
import { CATEGORIES, detectProductCategories } from "@/lib/categories";

const ACCENTS: InfoProductAccent[] = ["blue", "emerald", "violet", "amber", "rose", "cyan"];

const ICONS: IconType[] = [FiBookOpen, FiCode, FiLayers, FiZap, FiCpu, FiPenTool, FiPackage, FiTrendingUp];

type TemperatureFilter = "all" | "hot" | "cold";

type SortBy = "none" | "students" | "interaction";

interface ActiveFilters {
  selectedCategory: string[];
  temperature: TemperatureFilter;
  sortBy: SortBy;
}

const FILTER_TEMP_OPTIONS: { value: TemperatureFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "hot", label: "Alta (\u226550)" },
  { value: "cold", label: "Baja (<50)" },
];

const FILTER_SORT_OPTIONS: { value: SortBy; label: string; icon: IconType }[] = [
  { value: "none", label: "Ninguno", icon: FiX },
  { value: "students", label: "Más estudiantes", icon: FiUsers },
  { value: "interaction", label: "Alta interacción", icon: FiTrendingUp },
];

function categoryLabel(id: string): string {
  const cat = CATEGORIES.find((c) => c.id === id);
  return cat?.label ?? id;
}

type ExploreItem = {
  title: string;
  category: string;
  accent: InfoProductAccent;
  icon: IconType;
  thumbnail?: string | null;
  badge?: string;
  promoLabel?: string;
  subtitle?: string;
  highlights: { icon: IconType; label: string }[];
  actionLabel?: string;
  productId?: string;
  isEnrolled?: boolean;
  priceDisplay?: string;
  commissionDisplay?: string;
  temperatureValue?: number;
  temperatureColor?: string;
  temperatureLabel?: string;
  isOwner?: boolean;
};

function computeTemperature(product: ProductResponse): { value: number; color: string; label: string } {
  const daysOld = Math.floor((Date.now() - new Date(product.createdAt).getTime()) / 86400000);
  const recencyScore = Math.max(0, 40 - daysOld * 2);
  const ratingScore = (product.rating ?? 0) * 12;
  const value = Math.min(100, Math.max(0, recencyScore + ratingScore));

  let label: string;
  let color: string;
  if (value < 25) { label = "Frío"; color = "#3B82F6"; }
  else if (value < 50) { label = "Tibio"; color = "#F59E0B"; }
  else if (value < 75) { label = "Caliente"; color = "#F97316"; }
  else { label = "En llamas"; color = "#EF4444"; }

  return { value, color, label };
}

function productToExploreItem(
  product: ProductResponse,
  index: number,
  role?: Role,
  enrolledProductIds?: Set<string>,
  currentUserId?: string,
  affiliatedProductIds?: Set<string>,
): ExploreItem {
  const daysOld = Math.floor((Date.now() - new Date(product.createdAt).getTime()) / 86400000);
  const producer = (product as any).producer as { fullname?: string; username?: string } | undefined;
  const producerName = producer?.username ? `@${producer.username}` : (producer?.fullname ?? "Creador");
  const isNew = daysOld < 14;
  const price = Number(product.price).toFixed(2);
  const priceLabel = `$${price}`;
  const isAffiliateView = role === "AFFILIATE";
  const hasCommission = product.affiliateEnabled && product.commissionRate;
  const isEnrolled = enrolledProductIds?.has(product.id) ?? false;
  const isAffiliated = affiliatedProductIds?.has(product.id) ?? false;

  const temp = computeTemperature(product);

  const highlights: { icon: IconType; label: string }[] = [];
  let badge: string | undefined;
  let promoLabel: string | undefined;

  let priceDisplay: string | undefined;
  let commissionDisplay: string | undefined;

  if (isAffiliateView) {
    badge = hasCommission ? `${product.commissionRate}%` : "Sin comisión";
    priceDisplay = priceLabel;

    if (hasCommission) {
      const commissionAmount = (Number(product.price) * product.commissionRate!) / 100;
      commissionDisplay = `+$${commissionAmount.toFixed(2)}`;
      promoLabel = `Gana $${commissionAmount.toFixed(2)}/venta`;
    }

    highlights.push({ icon: FiZap, label: isNew ? "Nuevo" : `${daysOld} días` });
  } else {
    priceDisplay = priceLabel;

    if (hasCommission) {
      highlights.push({ icon: FiPercent, label: `${product.commissionRate}% comisión` });
    }

    highlights.push({
      icon: isNew ? FiZap : FiClock,
      label: isNew ? "Nuevo" : `${daysOld} días`,
    });
  }

  return {
    title: product.title,
    category: categoryLabel(product.category ?? "otros"),
    accent: ACCENTS[index % ACCENTS.length],
    icon: ICONS[index % ICONS.length],
    thumbnail: product.thumbnail,
    badge,
    promoLabel,
    subtitle: `Por ${producerName}`,
    highlights,
    actionLabel: isEnrolled
      ? "Ver mis cursos"
      : isAffiliated
        ? "Afiliado"
        : isAffiliateView
          ? "Afiliarme"
          : "Ver detalle",
    productId: product.id,
    isEnrolled,
    priceDisplay,
    commissionDisplay,
    temperatureValue: temp.value,
    temperatureColor: temp.color,
    temperatureLabel: temp.label,
    isOwner: currentUserId ? product.producerId === currentUserId : false,
  };
}

function ExploreGrid({ items, onAffiliateClick }: { items: ExploreItem[]; onAffiliateClick?: (productId: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <InfoProductCard
          key={item.productId ?? item.title}
          {...item}
          productId={item.productId}
          isEnrolled={item.isEnrolled}
          isAffiliateView={item.actionLabel === "Afiliarme"}
          onAffiliateClick={onAffiliateClick}
          temperatureValue={item.temperatureValue}
          temperatureColor={item.temperatureColor}
          temperatureLabel={item.temperatureLabel}
          isOwner={item.isOwner}
        />
      ))}
    </div>
  );
}

export default function ExplorePage() {
  const { user, loading: profileLoading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const tone = roleTone(role);

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [affiliating, setAffiliating] = useState(false);
  const [affiliateDone, setAffiliateDone] = useState(false);
  const [affiliations, setAffiliations] = useState<AffiliationResponse[]>([]);
  const [affiliateError, setAffiliateError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    selectedCategory: [],
    temperature: "all",
    sortBy: "none",
  });
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  const enrolledProductIds = new Set(enrollments.map((e) => e.productId));
  const affiliatedProductIds = new Set(affiliations.map((a) => a.productId));

  const fetchCatalog = async (pageNum: number, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setCatalogLoading(true);
    }

    const { ok, result } = await listCatalog(pageNum);
    if (ok && result.data) {
      const data = result.data as CatalogResult;
      if (append) {
        setProducts((prev) => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }
      setTotalPages(data.totalPages);
    }

    setCatalogLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    if (!profileLoading) {
      fetchCatalog(1);

      if (role === "STUDENT") {
        listMyEnrollments(1, 100).then(({ ok, result }) => {
          if (ok && result.data?.enrollments) {
            setEnrollments(result.data.enrollments);
          }
        });
      }

      if (role === "AFFILIATE") {
        listMyAffiliations(1, 100).then(({ ok, result }) => {
          if (ok && result.data?.affiliations) {
            setAffiliations(result.data.affiliations);
          }
        });
      }
    }
  }, [profileLoading, role]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCatalog(nextPage, true);
  };

  const handleAffiliateClick = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowAffiliateModal(true);
    }
  };

  const handleAffiliateConfirm = async () => {
    if (!selectedProduct) return;
    setAffiliating(true);
    setAffiliateError(null);
    try {
      const { ok, result } = await joinProductAsAffiliate(selectedProduct.id);
      if (ok && result.data?.affiliation) {
        setAffiliations((prev) => [...prev, result.data.affiliation]);
        setAffiliateDone(true);
      } else {
        setAffiliateError(result?.message || "Error al afiliarse al producto");
      }
    } catch {
      setAffiliateError("Error de conexión. Intenta de nuevo.");
    }
    setAffiliating(false);
  };

  const handleAffiliateClose = () => {
    setShowAffiliateModal(false);
    setSelectedProduct(null);
    setAffiliateDone(false);
  };

  const query = searchQuery.toLowerCase().trim();
  const searchedProducts = query
    ? products.filter((p) => {
      const producer = (p as any).producer as { fullname?: string; username?: string } | undefined;
      const producerName = producer?.fullname ?? producer?.username ?? "";
      return (
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        producerName.toLowerCase().includes(query)
      );
    })
    : products;

  const roleFiltered = role === "AFFILIATE"
    ? searchedProducts.filter((p) => p.affiliateEnabled && p.commissionRate)
    : searchedProducts;

  const filteredProducts = roleFiltered.filter((p) => {
    if (activeFilters.selectedCategory.length > 0) {
      const cats = detectProductCategories(p);
      if (!cats.some((cat) => activeFilters.selectedCategory.includes(cat))) return false;
    }
    if (activeFilters.temperature !== "all") {
      const temp = computeTemperature(p);
      if (activeFilters.temperature === "hot" && temp.value < 50) return false;
      if (activeFilters.temperature === "cold" && temp.value >= 50) return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts];
  if (activeFilters.sortBy === "students") {
    sortedProducts.sort((a, b) => (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0));
  } else if (activeFilters.sortBy === "interaction") {
    sortedProducts.sort((a, b) => {
      const scoreA = (a._count?.enrollments ?? 0) * 2 + (a._count?.orders ?? 0) + (a.rating ?? 0) * 5;
      const scoreB = (b._count?.enrollments ?? 0) * 2 + (b._count?.orders ?? 0) + (b.rating ?? 0) * 5;
      return scoreB - scoreA;
    });
  }

  const hasActiveFilters = activeFilters.selectedCategory.length > 0 || activeFilters.temperature !== "all" || activeFilters.sortBy !== "none";

  const publishedCount = sortedProducts.length;
  const affiliateCount = sortedProducts.filter((p) => p.affiliateEnabled).length;
  const avgPrice = publishedCount > 0
    ? sortedProducts.reduce((s, p) => s + Number(p.price), 0) / publishedCount
    : 0;
  const maxCommission = affiliateCount > 0
    ? Math.max(...sortedProducts.filter((p) => p.affiliateEnabled).map((p) => p.commissionRate ?? 0))
    : 0;

  const catalogItems = sortedProducts.map((p, i) =>
    productToExploreItem(p, i, role, enrolledProductIds, user?.id, affiliatedProductIds)
  );

  if (profileLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="animate-pulse space-y-2">
          <div className="h-8 w-3/4 max-w-lg rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-4 w-full max-w-md rounded bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200 dark:bg-white/10" />
          ))}
        </div>
        <InfoProductCardSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto flex max-w-6xl flex-col"
    >
      {/* Hero Header */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-role-accent/[0.05] via-background to-role-accent/[0.02] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-role-accent/8 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-role-accent/5 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-role-accent/6 blur-3xl" />
          <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-role-accent/4 blur-3xl" />
          <div className="absolute -bottom-16 right-1/3 h-48 w-48 rounded-full bg-role-accent/7 blur-3xl" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "20px 20px" }} />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-role-accent/10 text-role-accent">
                <FiShoppingBag size={20} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                    Mercado
                  </h1>
                  <RoleBadge label={roleLabel(role)} tone={tone} />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-white/55 sm:text-base">
                  {role === "STUDENT" || role === "ADMIN"
                    ? "Descubre cursos y productos digitales creados por nuestra comunidad."
                    : role === "CREATOR"
                      ? "Analiza el mercado y encuentra oportunidades para tus productos."
                      : "Encuentra productos con comisiones atractivas para promocionar."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Promociones y descuentos de temporada */}
        <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-gradient-to-br from-role-accent/[0.07] to-transparent p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-role-accent/15 text-role-accent">
                <FiZap size={14} />
              </div>
              <span className="text-sm font-semibold text-role-accent">Descuentos de temporada</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/55">
              Aprovecha nuestras ofertas estacionales con hasta <strong>40% OFF</strong> en cursos seleccionados. Precios especiales por tiempo limitado.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-gradient-to-br from-role-accent/[0.04] to-transparent p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-role-accent/15 text-role-accent">
                <FiClock size={14} />
              </div>
              <span className="text-sm font-semibold text-role-accent">Oferta relámpago</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/55">
              <strong>3 días restantes</strong> para aprovechar los mejores precios en productos destacados. No te pierdas esta oportunidad.
            </p>
          </div>
        </div>

        {/* Información del mercado */}
        <div className="relative mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-white/45">
          <span className="flex items-center gap-1.5">
            <FiBookOpen size={12} /> {publishedCount} producto{publishedCount !== 1 ? "s" : ""} disponible{publishedCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <FiUsers size={12} /> Comunidad activa
          </span>
          <span className="flex items-center gap-1.5">
            <FiTrendingUp size={12} /> Nuevos cursos cada semana
          </span>
          {avgPrice > 0 && (
            <span className="flex items-center gap-1.5">
              <FiDollarSign size={12} /> Precio promedio ${avgPrice.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="relative mb-6 space-y-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/80 px-4 py-2.5 shadow-sm transition focus-within:border-role-accent/50 focus-within:ring-1 focus-within:ring-role-accent/30 dark:bg-white/[0.03]">
          <FiSearch className="shrink-0 text-gray-400 dark:text-white/40" size={15} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              role === "STUDENT" || role === "ADMIN"
                ? "Buscar por nombre, creador o precio…"
                : role === "CREATOR"
                  ? "Buscar productos, categorías o competidores…"
                  : "Buscar por comisión, producto o nicho…"
            }
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden dark:text-white dark:placeholder:text-white/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white/70 cursor-pointer"
            >
              <FiX size={14} />
            </button>
          )}
          <div className="h-5 w-px bg-border" />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${hasActiveFilters
              ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300"
              : "text-gray-500 hover:bg-gray-100 dark:text-white/50 dark:hover:bg-white/10"
              }`}
          >
            <FiSliders size={13} />
            Ordenar
            <FiChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Hotmart-style category strip */}
        <div className="overflow-x-auto">
          <div className="flex gap-1.5 pb-2">
            <button
              onClick={() => setActiveFilters((prev) => ({ ...prev, selectedCategory: [] }))}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${activeFilters.selectedCategory.length === 0
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                }`}
            >
              Todas
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setActiveFilters((prev) => ({
                    ...prev,
                    selectedCategory: prev.selectedCategory.includes(cat.id)
                      ? prev.selectedCategory.filter((id) => id !== cat.id)
                      : [...prev.selectedCategory, cat.id],
                  }))
                }
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${activeFilters.selectedCategory.includes(cat.id)
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-1.5"
            >
              {activeFilters.selectedCategory.map((catId) => (
                <span key={catId} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  {categoryLabel(catId)}
                  <button
                    onClick={() =>
                      setActiveFilters((prev) => ({
                        ...prev,
                        selectedCategory: prev.selectedCategory.filter((id) => id !== catId),
                      }))
                    }
                    className="ml-0.5 hover:text-primary/70 cursor-pointer"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              ))}
              {activeFilters.temperature !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  Temp: {activeFilters.temperature === "hot" ? "Alta" : "Baja"}
                  <button
                    onClick={() => setActiveFilters((prev) => ({ ...prev, temperature: "all" }))}
                    className="ml-0.5 hover:text-primary/70 cursor-pointer"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              )}
              {activeFilters.sortBy !== "none" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  {activeFilters.sortBy === "students" ? "Más estudiantes" : "Alta interacción"}
                  <button
                    onClick={() => setActiveFilters((prev) => ({ ...prev, sortBy: "none" }))}
                    className="ml-0.5 hover:text-primary/70 cursor-pointer"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              )}
              <button
                onClick={() => setActiveFilters({ selectedCategory: [], temperature: "all", sortBy: "none" })}
                className="text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-white/60 cursor-pointer"
              >
                Limpiar todo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort/Temp filter dropdown */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              ref={filterPanelRef}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full z-20 mt-2 origin-top-right overflow-hidden rounded-xl border border-border bg-background shadow-lg"
            >
              <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
                {/* Temperature */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Temperatura</p>
                  <div className="flex gap-1.5">
                    {FILTER_TEMP_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setActiveFilters((prev) => ({ ...prev, temperature: opt.value }))}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${activeFilters.temperature === opt.value
                          ? "bg-primary/10 text-primary ring-1 ring-primary/30 dark:bg-primary/20 dark:text-primary-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Ordenar por</p>
                  <div className="flex gap-1.5">
                    {FILTER_SORT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setActiveFilters((prev) => ({ ...prev, sortBy: opt.value }))}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${activeFilters.sortBy === opt.value
                            ? "bg-primary/10 text-primary ring-1 ring-primary/30 dark:bg-primary/20 dark:text-primary-300"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                            }`}
                        >
                          <Icon size={12} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {catalogLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <InfoProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <SectionCard title="Productos disponibles" tone="role">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
              <FiInbox size={20} className="text-gray-400 dark:text-white/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-white/70">
                Aún no hay productos publicados
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
                Los productos que los creadores publiquen aparecerán aquí.
              </p>
            </div>
          </div>
        </SectionCard>
      ) : catalogItems.length === 0 ? (
        <SectionCard title="Sin resultados" tone="role">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
              <FiSearch size={20} className="text-gray-400 dark:text-white/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-white/70">
                {query && hasActiveFilters
                  ? `Sin resultados para "${searchQuery}" con los filtros actuales`
                  : query
                    ? `Sin resultados para "${searchQuery}"`
                    : hasActiveFilters
                      ? "Ningún producto coincide con los filtros seleccionados"
                      : "Sin resultados"}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
                {query || hasActiveFilters
                  ? "Intenta con otros términos o ajusta los filtros."
                  : "Prueba con otros términos o revisa el catálogo completo."}
              </p>
            </div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          tone="role"
          title={query ? `Resultados para "${searchQuery}"` : "Productos disponibles"}
          action={
            <span className="text-xs text-gray-500 dark:text-white/45">
              {filteredProducts.length} resultado{filteredProducts.length !== 1 ? "s" : ""}
              {!query && products.length > 0 ? ` — Pág. ${page}` : ""}
            </span>
          }
        >
          <ExploreGrid items={catalogItems} onAffiliateClick={handleAffiliateClick} />

          {!query && page < totalPages && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer"
              >
                {loadingMore ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                ) : null}
                {loadingMore ? "Cargando..." : "Cargar más productos"}
              </button>
            </div>
          )}
        </SectionCard>
      )}

      {/* Affiliate confirmation modal */}
      <AnimatePresence>
        {showAffiliateModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={handleAffiliateClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e: any) => e.stopPropagation()}
              className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-background shadow-2xl max-h-[85vh] overflow-hidden"
            >
              <div className="shrink-0 overflow-hidden">
                {selectedProduct.affiliateVideoUrl?.match(/\.m3u8/) ? (
                  <HlsPlayer url={selectedProduct.affiliateVideoUrl} />
                ) : selectedProduct.affiliateVideoUrl ? (
                  <div className="overflow-hidden bg-black">
                    <video src={selectedProduct.affiliateVideoUrl} className="aspect-video w-full" controls playsInline />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/10 to-violet-500/10">
                    <p className="text-sm text-gray-400">Sin video para afiliados</p>
                  </div>
                )}
              </div>
              <div className="space-y-3 overflow-y-auto p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedProduct.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                      <FiLink size={14} />
                      <span>Programa de afiliados</span>
                    </div>
                  </div>
                  <button onClick={handleAffiliateClose} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-white/60 cursor-pointer">
                    <FiX size={18} />
                  </button>
                </div>

                {/* Earnings breakdown */}
                {selectedProduct.commissionRate && (
                  <div className="rounded-xl border border-border bg-background/40 p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-white/45">Precio del producto</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${Number(selectedProduct.price).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-white/45">Tu comisión</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedProduct.commissionRate}%</span>
                    </div>
                    <div className="border-t border-border pt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-white/70">Ganas por venta</span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        +${(Number(selectedProduct.price) * selectedProduct.commissionRate / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Temperature */}
                {selectedProduct && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/45">
                      <span>Temperatura del producto</span>
                      <span className="font-medium" style={{ color: computeTemperature(selectedProduct).color }}>
                        {computeTemperature(selectedProduct).label} · {computeTemperature(selectedProduct).value}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${computeTemperature(selectedProduct).value}%`,
                          backgroundColor: computeTemperature(selectedProduct).color,
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedProduct.affiliateDescription ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-white/60">
                    {selectedProduct.affiliateDescription}
                  </p>
                ) : (
                  <p className="text-sm italic text-gray-400 dark:text-white/35">
                    Sin descripción para afiliados
                  </p>
                )}
                {affiliateError && (
                  <p className="text-xs text-red-500 text-center">{affiliateError}</p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  {affiliateDone ? (
                    <>
                      <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <FiCheck size={16} />
                        ¡Afiliado exitosamente!
                      </div>
                      <button
                        onClick={handleAffiliateClose}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:text-white/70 dark:hover:bg-white/5 cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleAffiliateConfirm}
                        disabled={affiliating}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      >
                        {affiliating ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <FiLink size={14} />
                        )}
                        Confirmar afiliación
                      </button>
                      <button
                        onClick={handleAffiliateClose}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:text-white/70 dark:hover:bg-white/5 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
