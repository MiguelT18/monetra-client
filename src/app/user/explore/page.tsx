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
} from "react-icons/fi";
import { listCatalog, type ProductResponse, type CatalogResult } from "@/lib/product-api";

const ACCENTS: InfoProductAccent[] = ["blue", "emerald", "violet", "amber", "rose", "cyan"];

const ICONS: IconType[] = [FiBookOpen, FiCode, FiLayers, FiZap, FiCpu, FiPenTool, FiPackage, FiTrendingUp];

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
};

function productToExploreItem(product: ProductResponse, index: number, role?: Role): ExploreItem {
  const daysOld = Math.floor((Date.now() - new Date(product.createdAt).getTime()) / 86400000);
  const producer = (product as any).producer as { fullname?: string; username?: string } | undefined;
  const producerName = producer?.username ? `@${producer.username}` : (producer?.fullname ?? "Creador");
  const isNew = daysOld < 14;
  const price = Number(product.price).toFixed(2);
  const priceLabel = `$${price}`;
  const isAffiliateView = role === "AFFILIATE";
  const hasCommission = product.affiliateEnabled && product.commissionRate;

  const highlights: { icon: IconType; label: string }[] = [];
  let badge: string | undefined;
  let promoLabel: string | undefined;

  if (isAffiliateView) {
    badge = hasCommission ? `${product.commissionRate}%` : "Sin comisión";

    if (hasCommission) {
      const commissionAmount = (Number(product.price) * product.commissionRate!) / 100;
      promoLabel = `Gana $${commissionAmount.toFixed(2)}/venta`;
    }

    highlights.push({ icon: FiDollarSign, label: priceLabel });
    highlights.push({
      icon: isNew ? FiZap : FiClock,
      label: isNew ? "Nuevo" : `${daysOld} días`,
    });
  } else {
    badge = priceLabel;

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
    category: "Producto digital",
    accent: ACCENTS[index % ACCENTS.length],
    icon: ICONS[index % ICONS.length],
    thumbnail: product.thumbnail,
    badge,
    promoLabel,
    subtitle: `Por ${producerName}`,
    highlights,
    actionLabel: "Ver detalle",
  };
}

function ExploreGrid({ items }: { items: ExploreItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <InfoProductCard key={item.title} {...item} />
      ))}
    </div>
  );
}

function roleTone(role: Role): "blue" | "emerald" | "violet" | "amber" | "red" {
  if (role === "STUDENT") return "amber";
  if (role === "CREATOR") return "violet";
  if (role === "ADMIN") return "red";
  return "emerald";
}

function roleLabel(role: Role) {
  if (role === "STUDENT") return "Estudiante";
  if (role === "CREATOR") return "Creador";
  if (role === "ADMIN") return "Admin";
  return "Afiliado";
}

export default function ExplorePage() {
  const { user, loading: profileLoading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const tone = roleTone(role);

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    }
  }, [profileLoading]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCatalog(nextPage, true);
  };

  const publishedCount = products.length;
  const affiliateCount = products.filter((p) => p.affiliateEnabled).length;
  const avgPrice = publishedCount > 0
    ? products.reduce((s, p) => s + Number(p.price), 0) / publishedCount
    : 0;
  const maxCommission = affiliateCount > 0
    ? Math.max(...products.filter((p) => p.affiliateEnabled).map((p) => p.commissionRate ?? 0))
    : 0;

  const query = searchQuery.toLowerCase().trim();
  const filteredProducts = query
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

  const catalogItems = filteredProducts.map((p, i) => productToExploreItem(p, i, role));

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
      <UserPageHeader
        title="Explorar el mercado"
        description={
          role === "STUDENT" || role === "ADMIN"
            ? "Descubre cursos y productos digitales creados por nuestra comunidad. Encuentra lo que mejor se adapte a tu aprendizaje."
            : role === "CREATOR"
              ? "Analiza el mercado, compara precios y encuentra oportunidades para posicionar tus productos."
              : "Encuentra productos con comisiones atractivas para promocionar y generar ingresos."
        }
        badge={<RoleBadge label={roleLabel(role)} tone={tone} />}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {role === "STUDENT" || role === "ADMIN" ? (
          <>
            <StatCard
              icon={FiBookOpen}
              label="Cursos disponibles"
              value={String(publishedCount)}
              hint="Productos publicados en la plataforma"
              tone={role === "ADMIN" ? "red" : "amber"}
            />
            <StatCard
              icon={FiDollarSign}
              label="Desde"
              value={avgPrice > 0 ? `$${avgPrice.toFixed(0)}` : "—"}
              hint="Precio promedio del mercado"
              tone="neutral"
            />
            <StatCard
              icon={FiUsers}
              label="Comunidad"
              value="En crecimiento"
              hint="Nuevos cursos cada semana"
              tone={role === "ADMIN" ? "red" : "amber"}
            />
          </>
        ) : role === "CREATOR" ? (
          <>
            <StatCard
              icon={FiTrendingUp}
              label="Mercado total"
              value={String(publishedCount)}
              hint="Productos publicados en la plataforma"
              tone="violet"
            />
            <StatCard
              icon={FiDollarSign}
              label="Precio promedio"
              value={avgPrice > 0 ? `$${avgPrice.toFixed(0)}` : "—"}
              hint="Referencia para tus precios"
              tone="neutral"
            />
            <StatCard
              icon={FiPercent}
              label="Con afiliación"
              value={`${affiliateCount} (${publishedCount > 0 ? Math.round(affiliateCount / publishedCount * 100) : 0}%)`}
              hint="Productos con programa de afiliados"
              tone="violet"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={FiTrendingUp}
              label="Oportunidades"
              value={String(affiliateCount)}
              hint="Productos con programa de afiliados"
              tone="emerald"
            />
            <StatCard
              icon={FiPercent}
              label="Comisión máxima"
              value={maxCommission > 0 ? `${maxCommission}%` : "—"}
              hint="Productos con mayor comisión"
              tone="emerald"
            />
            <StatCard
              icon={FiBookOpen}
              label="Catálogo total"
              value={String(publishedCount)}
              hint="Productos disponibles"
              tone="neutral"
            />
          </>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-background/50 p-4 dark:bg-white/3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 transition hover:border-[#7C3AED] hover:ring-1 hover:ring-[#7C3AED] focus-within:border-[#7C3AED] focus-within:ring-1 focus-within:ring-[#7C3AED] dark:border-white/10 dark:bg-white/5">
          <FiSearch className="shrink-0 text-gray-400 dark:text-white/40" />
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
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden dark:text-white dark:placeholder:text-white/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white/70"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      {catalogLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <InfoProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <SectionCard title="Productos disponibles">
          <div className="flex flex-col items-center gap-3 py-10 text-center">
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
        <SectionCard title="Productos disponibles">
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
              <FiSearch size={20} className="text-gray-400 dark:text-white/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-white/70">
                Sin resultados para &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
                Prueba con otros términos o revisa el catálogo completo.
              </p>
            </div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title={query ? `Resultados para "${searchQuery}"` : "Productos disponibles"}
          action={
            <span className="text-xs text-gray-500 dark:text-white/45">
              {filteredProducts.length} resultado{filteredProducts.length !== 1 ? "s" : ""}
              {!query && products.length > 0 ? ` — Pág. ${page}` : ""}
            </span>
          }
        >
          <ExploreGrid items={catalogItems} />

          {!query && page < totalPages && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 dark:text-white/80 dark:hover:bg-primary/10"
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

    </motion.div>
  );
}
