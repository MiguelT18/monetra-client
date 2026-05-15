"use client";

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
  FiFilter,
  FiClock,
  FiStar,
  FiAward,
  FiLayers,
  FiDollarSign,
  FiPercent,
  FiDownload,
  FiRepeat,
  FiBarChart2,
  FiZap,
  FiVideo,
  FiPenTool,
  FiCode,
  FiCpu,
  FiHeart,
} from "react-icons/fi";

function roleTone(role: Role): "blue" | "emerald" | "violet" {
  if (role === "STUDENT") return "blue";
  if (role === "PRODUCER") return "emerald";
  return "violet";
}

function roleLabel(role: Role) {
  if (role === "STUDENT") return "Estudiante";
  if (role === "PRODUCER") return "Productor";
  return "Afiliado";
}

type ExploreItem = {
  title: string;
  category: string;
  accent: InfoProductAccent;
  icon: IconType;
  badge?: string;
  subtitle?: string;
  highlights: { icon: IconType; label: string }[];
  actionLabel?: string;
};

const STUDENT_CATALOG: ExploreItem[] = [
  {
    title: "Sistemas de diseño en Figma",
    category: "Diseño",
    accent: "violet",
    icon: FiPenTool,
    badge: "4.9 ★",
    subtitle: "María López · Academia UI",
    highlights: [
      { icon: FiBarChart2, label: "Intermedio" },
      { icon: FiClock, label: "8 h video" },
      { icon: FiUsers, label: "1.2k alumnos" },
    ],
    actionLabel: "Ver detalle",
  },
  {
    title: "JavaScript moderno para web",
    category: "Desarrollo",
    accent: "amber",
    icon: FiCode,
    badge: "Nuevo",
    subtitle: "Carlos Ruiz · Fullstack Lab",
    highlights: [
      { icon: FiBarChart2, label: "Principiante" },
      { icon: FiAward, label: "Certificado" },
      { icon: FiLayers, label: "12 módulos" },
    ],
    actionLabel: "Inscribirme",
  },
  {
    title: "Productividad para developers",
    category: "Carrera",
    accent: "cyan",
    icon: FiZap,
    badge: "Popular",
    subtitle: "Ana Vega · Dev Productivity",
    highlights: [
      { icon: FiClock, label: "3 h · corto" },
      { icon: FiDownload, label: "Plantillas" },
      { icon: FiStar, label: "4.7 ★" },
    ],
    actionLabel: "Ver detalle",
  },
  {
    title: "IA aplicada al producto digital",
    category: "IA",
    accent: "blue",
    icon: FiCpu,
    badge: "Tendencia",
    subtitle: "Equipo Monetra · Ruta guiada",
    highlights: [
      { icon: FiBarChart2, label: "Avanzado" },
      { icon: FiVideo, label: "Live + async" },
      { icon: FiUsers, label: "Comunidad" },
    ],
    actionLabel: "Explorar ruta",
  },
];

const PRODUCER_CATALOG: ExploreItem[] = [
  {
    title: "Plantillas de onboarding SaaS",
    category: "SaaS",
    accent: "emerald",
    icon: FiLayers,
    badge: "Referencia",
    subtitle: "Ticket medio · alto volumen",
    highlights: [
      { icon: FiDollarSign, label: "€49–€79" },
      { icon: FiTrendingUp, label: "Demanda alta" },
      { icon: FiUsers, label: "Red de afiliados" },
    ],
    actionLabel: "Ver benchmark",
  },
  {
    title: "Mentorías 1:1 en grupo reducido",
    category: "Coaching",
    accent: "violet",
    icon: FiUsers,
    badge: "Tendencia",
    subtitle: "Formato premium · baja devolución",
    highlights: [
      { icon: FiDollarSign, label: "€200+" },
      { icon: FiBarChart2, label: "8% devolución" },
      { icon: FiClock, label: "6 semanas" },
    ],
    actionLabel: "Analizar nicho",
  },
  {
    title: "Bootcamp híbrido no-code",
    category: "No-code",
    accent: "cyan",
    icon: FiZap,
    badge: "En alza",
    subtitle: "Retención superior al promedio",
    highlights: [
      { icon: FiTrendingUp, label: "Nicho en alza" },
      { icon: FiLayers, label: "Híbrido" },
      { icon: FiAward, label: "Alta finalización" },
    ],
    actionLabel: "Ver benchmark",
  },
];

const AFFILIATE_CATALOG: ExploreItem[] = [
  {
    title: "Curso de automatización con n8n",
    category: "Automatización",
    accent: "blue",
    icon: FiCpu,
    badge: "Solicitar acceso",
    subtitle: "Productor verificado · pagos puntuales",
    highlights: [
      { icon: FiPercent, label: "20% comisión" },
      { icon: FiClock, label: "Cookie 45 días" },
      { icon: FiDownload, label: "Kit promocional" },
    ],
    actionLabel: "Solicitar acceso",
  },
  {
    title: "Membresía comunidad creativos",
    category: "Comunidad",
    accent: "rose",
    icon: FiHeart,
    badge: "Abierto",
    subtitle: "Modelo recurrente · EPC estable",
    highlights: [
      { icon: FiPercent, label: "25% 1.er mes" },
      { icon: FiRepeat, label: "Recurrente" },
      { icon: FiTrendingUp, label: "EPC alto" },
    ],
    actionLabel: "Unirme al programa",
  },
  {
    title: "Ebook + workshop en vivo",
    category: "Formato mixto",
    accent: "amber",
    icon: FiBookOpen,
    badge: "Nuevo",
    subtitle: "Material en español · lanzamiento Q2",
    highlights: [
      { icon: FiPercent, label: "15% comisión" },
      { icon: FiDownload, label: "Swipes listos" },
      { icon: FiUsers, label: "Embudos incluidos" },
    ],
    actionLabel: "Ver creatividades",
  },
];

function ExploreGrid({ items }: { items: ExploreItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <InfoProductCard key={item.title} {...item} />
      ))}
    </div>
  );
}

export default function ExplorePage() {
  const { user, loading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const tone = roleTone(role);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="animate-pulse space-y-2">
          <div className="h-8 w-3/4 max-w-lg rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-4 w-full max-w-md rounded bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="h-14 animate-pulse rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <InfoProductCardSkeleton key={i} />
          ))}
        </div>
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
          role === "STUDENT"
            ? "Encuentra cursos y rutas de aprendizaje según tu nivel y objetivos."
            : role === "PRODUCER"
              ? "Analiza nichos, precios y formatos para posicionar mejor tus lanzamientos."
              : "Descubre productos con comisiones atractivas y materiales listos para promocionar."
        }
        badge={<RoleBadge label={roleLabel(role)} tone={tone} />}
      />

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-background/50 p-4 dark:bg-white/3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
          <FiSearch className="shrink-0 text-gray-400 dark:text-white/40" />
          <input
            type="search"
            readOnly
            placeholder={
              role === "STUDENT"
                ? "Buscar por tema, instructor o duración…"
                : role === "PRODUCER"
                  ? "Buscar categorías, keywords o competidores…"
                  : "Buscar productos, % de comisión o nicho…"
            }
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-white/35"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10"
        >
          <FiFilter size={16} />
          Filtros
        </button>
      </div>

      {role === "STUDENT" && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={FiBookOpen}
              label="Recomendados para ti"
              value="12+"
              hint="Basado en tu historial"
              tone="blue"
            />
            <StatCard
              icon={FiTrendingUp}
              label="Tendencias"
              value="UX · IA aplicada"
              hint="Categorías populares esta semana"
              tone="neutral"
            />
            <StatCard
              icon={FiUsers}
              label="Comunidad"
              value="Grupos activos"
              hint="Estudia con otros alumnos"
              tone="violet"
            />
          </div>
          <SectionCard title="Cursos destacados">
            <ExploreGrid items={STUDENT_CATALOG} />
          </SectionCard>
        </>
      )}

      {role === "PRODUCER" && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={FiTrendingUp}
              label="Nichos en alza"
              value="No-code · Datos"
              hint="Demanda estimada en la plataforma"
              tone="emerald"
            />
            <StatCard
              icon={FiBookOpen}
              label="Formato top"
              value="Bootcamps híbridos"
              hint="Mayor retención reportada"
              tone="neutral"
            />
            <StatCard
              icon={FiUsers}
              label="Afiliación"
              value="Canales activos"
              hint="Productos con red de afiliados"
              tone="violet"
            />
          </div>
          <SectionCard
            title="Inspiración y benchmarks"
            action={
              <QuickLink href="/user/products" label="Tu catálogo" variant="outline" />
            }
          >
            <p className="mb-4 text-sm text-gray-600 dark:text-white/55">
              Compara precios, formatos y señales de demanda antes de publicar o
              actualizar un producto.
            </p>
            <ExploreGrid items={PRODUCER_CATALOG} />
          </SectionCard>
        </>
      )}

      {role === "AFFILIATE" && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={FiTrendingUp}
              label="Mayor comisión"
              value="Hasta 40%"
              hint="Programas seleccionados"
              tone="violet"
            />
            <StatCard
              icon={FiBookOpen}
              label="Listos para promocionar"
              value="Kits y swipes"
              hint="Creatividades aprobadas"
              tone="blue"
            />
            <StatCard
              icon={FiUsers}
              label="Productores top"
              value="Verificados"
              hint="Historial de pagos puntual"
              tone="neutral"
            />
          </div>
          <SectionCard
            title="Oportunidades para afiliados"
            action={
              <QuickLink href="/user/affiliations" label="Mis programas" variant="outline" />
            }
          >
            <ExploreGrid items={AFFILIATE_CATALOG} />
          </SectionCard>
        </>
      )}
    </motion.div>
  );
}
