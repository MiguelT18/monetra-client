"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { useForm } from "react-hook-form";
import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiBook,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiPlay,
  FiCheck,
  FiGlobe,
  FiChevronDown,
  FiLayers,
  FiPercent,
  FiTarget,
  FiHeart,
  FiMail,
} from "react-icons/fi";
import LogoIcon from "@/icons/Logo";
import { useProfile } from "@/hooks/useProfile";
import HeroParticles from "@/components/effects/HeroParticles";
import { FiMoon, FiSun } from "react-icons/fi";
import { useThemeContext } from "@/contexts/themeContext";


function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    mode: "onBlur",
  });

  async function onSubmit() {
    setStatus("loading");
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.6 }}
      className="mt-7 w-full max-w-md mx-auto rounded-2xl border border-border/70 bg-surface/40 backdrop-blur-sm px-4 py-3"
    >
      <p className="text-xs text-foreground/40 mb-2">
        Recibe contenido exclusivo y novedades
      </p>
      {status === "success" ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium text-center py-1">
          ¡Gracias por suscribirte!
        </p>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                type="email"
                placeholder="tu@email.com"
                {...register("email", {
                  required: "El correo es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Ingresa un correo válido",
                  },
                })}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-background/80 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-60 transition-all whitespace-nowrap"
            >
              {isSubmitting ? "Enviando..." : "Suscribirme"}
            </button>
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </form>
      )}
      {status === "error" && (
        <p className="text-xs text-red-500 mt-1">
          Algo salió mal. Intenta de nuevo.
        </p>
      )}
    </motion.div>
  );
}


const stats = [
  { value: "500+", label: "Creadores" },
  { value: "10K+", label: "Estudiantes" },
  { value: "1K+", label: "Afiliados" },
  { value: "50K+", label: "Cursos completados" },
];

const pains = [
  {
    icon: FiPercent,
    title: "Comisiones abusivas",
    description:
      "Las plataformas tradicionales te cobran hasta el 15% y no aportan valor real. Te quedas sin margen mientras ellos se llevan la tajada.",
  },
  {
    icon: FiBarChart2,
    title: "Estudiantes que abandonan",
    description:
      "El 80% de los estudiantes no termina los cursos. Sin engagement, tu contenido se pierde en el olvido.",
  },
  {
    icon: FiUsers,
    title: "Afiliados sin motivación",
    description:
      "Comisiones bajas, herramientas pobres y nulo seguimiento. Tu red de afiliados merece un sistema que realmente funcione.",
  },
  {
    icon: FiStar,
    title: "Sin diferenciación",
    description:
      "Tus cursos se ven igual que los de todos. Sin identidad de marca ni experiencia única, eres invisible en el mar de la competencia.",
  },
];

const roles = [
  {
    icon: FiZap,
    title: "Creador",
    subtitle: "Convierte tu experiencia en ingresos recurrentes",
    gradient: "from-violet-600 to-purple-600",
    shadow: "shadow-violet-500/25",
    points: [
      "Crea cursos con gamificación integrada que retienen alumnos",
      "Comisiones justas — las más competitivas del mercado",
      "Construye una comunidad engagada que vuelve por más",
      "Analíticas en tiempo real de retención y rendimiento",
    ],
    cta: "Quiero crear",
  },
  {
    icon: FiGlobe,
    title: "Afiliado",
    subtitle: "Gana comisiones promocionando cursos que convierten",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/25",
    points: [
      "Comisiones generosas con 30 cookie days",
      "Links de referido únicos con tracking en tiempo real",
      "Catálogo de cursos de alta conversión listos para promocionar",
      "Escala tus ingresos sin límites ni topes",
    ],
    cta: "Quiero afiliarme",
  },
  {
    icon: FiBook,
    title: "Estudiante",
    subtitle: "Aprende jugando y dispara tu potencial de ingresos",
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/25",
    points: [
      "Cursos prácticos que realmente transforman tu carrera",
      "Gana XP, sube de nivel, desbloquea contenido exclusivo",
      "Compite en rankings y conviértete en referente",
      "Certificaciones que pesan en tu CV y en tu bolsillo",
    ],
    cta: "Quiero aprender",
  },
];

const gamificationFeatures = [
  {
    icon: FiZap,
    title: "Gana XP",
    desc: "Cada acción suma: completar lecciones, ayudar en comunidad, mantener rachas. Todo suma experiencia.",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    icon: FiAward,
    title: "Sube de Nivel",
    desc: "Cada nivel desbloquea contenido premium, descuentos exclusivos y reconocimiento en la plataforma.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: FiStar,
    title: "Logros e Insignias",
    desc: "Colecciona insignias únicas que demuestran tu expertise. Tu vitrina de logros habla por ti.",
    gradient: "from-sky-500 to-blue-500",
  },
  {
    icon: FiBarChart2,
    title: "Rankings Globales",
    desc: "Compite con miles de usuarios. Los mejores del ranking semanal ganan visibilidad y premios.",
    gradient: "from-rose-500 to-pink-500",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Home() {
  const { user, loading } = useProfile();
  const { theme, toggle } = useThemeContext();

  return (
    <div className="flex flex-col">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">
              <LogoIcon width={32} height={32} />
            </span>
            <span>Monetra</span>
          </Link>

          {!loading && (
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={toggle}
                    className="relative p-2 rounded-lg border border-border bg-background/60 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                    aria-label="Cambiar tema"
                  >
                    {theme === "dark" ? (
                      <FiSun size={16} className="text-foreground/70" />
                    ) : (
                      <FiMoon size={16} className="text-foreground/70" />
                    )}
                  </button>
                  <Link
                    href="/user/dashboard"
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullname ?? user.username}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                        {(user.fullname ?? user.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline text-sm font-medium text-foreground/80">
                      {user.fullname ?? user.username}
                    </span>
                    <FiArrowRight size={14} className="text-foreground/40" />
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={toggle}
                    className="relative p-2 rounded-lg border border-border bg-background/60 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                    aria-label="Cambiar tema"
                  >
                    {theme === "dark" ? (
                      <FiSun size={16} className="text-foreground/70" />
                    ) : (
                      <FiMoon size={16} className="text-foreground/70" />
                    )}
                  </button>
                  <Link
                    href="/auth/login"
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                  >
                    Crear cuenta gratis
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100svh] flex flex-col overflow-hidden pt-16 pb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-background dark:from-primary/10" />

        <HeroParticles />

        {/* Main content — vertically centered */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 text-center relative z-10 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-5"
            >
              <FiZap className="w-4 h-4" />
              <span>Crea, Gestiona y Vende</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-3"
            >
              Tu Conocimiento es{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                el Nuevo Oro
              </span>
              <br />
              Nosotros lo Potenciamos
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="max-w-3xl mx-auto text-sm sm:text-base text-foreground/60 leading-relaxed mb-6"
            >
              Crea tu producto, gestiona tu negocio y vende en todo el mundo.
              La primera plataforma educativa gamificada donde{" "}
              <strong className="text-foreground font-semibold">creadores</strong>,{" "}
              <strong className="text-foreground font-semibold">afiliados</strong> y{" "}
              <strong className="text-foreground font-semibold">estudiantes</strong>{" "}
              ganan mientras crecen con mecánicas de juego que multiplican el
              engagement y los ingresos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/auth/register"
                className="group px-6 py-2.5 text-base font-semibold rounded-lg bg-primary text-white hover:opacity-90 transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 flex items-center gap-2"
              >
                Comenzar Gratis
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#como-funciona"
                className="px-6 py-2.5 text-base font-semibold rounded-lg border border-border hover:bg-surface transition-all flex items-center gap-2"
              >
                <FiPlay className="w-5 h-5" />
                Ver Cómo Funciona
              </Link>
            </motion.div>

            <NewsletterForm />
          </motion.div>
        </div>

        {/* Chevron — pinned bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex justify-center pt-2 mt-auto max-[700px]:hidden relative z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <FiChevronDown className="w-6 h-6 text-foreground/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── STATS ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className="border-y border-border bg-surface/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-foreground/60">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── PAIN POINTS ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
              className="text-center mb-12"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-2xl sm:text-3xl font-bold mb-3"
            >
              ¿Cansado de plataformas que{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                no te valoran
              </span>
              ?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="max-w-2xl mx-auto text-base text-foreground/60"
            >
              Las plataformas tradicionales están obsoletas. Te cobran fortunas,
              no retienen estudiantes y ofrecen cero diferenciación.{" "}
              <strong className="text-foreground">Monetra cambia las reglas del juego.</strong>
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
            className="grid md:grid-cols-2 xl:grid-cols-4 gap-6"
          >
            {pains.map((pain) => (
              <motion.div
                key={pain.title}
                variants={cardVariants}
                className="p-6 rounded-2xl border border-border bg-surface hover:border-red-400/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                  <pain.icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{pain.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {pain.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── ROLES / HOW IT WORKS ─── */}
      <section
        id="como-funciona"
        className="relative py-16 bg-surface/50 border-y border-border overflow-hidden scroll-mt-20"
      >
        <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3"
            >
              Tres Formas de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                Ganar y Crecer
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="max-w-2xl mx-auto text-base text-foreground/60 mb-4"
            >
              Sea cual sea tu perfil, Monetra tiene un camino diseñado para ti.
              Todos ganan en este ecosistema.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={containerVariants}
            className="grid lg:grid-cols-3 gap-8"
          >
            {roles.map((role, idx) => (
              <motion.div
                key={role.title}
                variants={cardVariants}
                className="group relative rounded-2xl border border-border bg-background overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col"
              >
                <div className="absolute top-4 right-4 text-4xl font-black text-white/10 select-none pointer-events-none">
                  {String(idx + 1).padStart(2, "0")}
                </div>

                <div
                  className={`relative bg-gradient-to-r ${role.gradient} p-8 text-white overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] pointer-events-none" />
                  <role.icon className="w-10 h-10 mb-3 relative" />
                  <h3 className="text-xl font-bold relative">{role.title}</h3>
                  <p className="text-white/80 mt-1 relative">
                    {role.subtitle}
                  </p>
                </div>

                <div className="p-5 space-y-3 flex-1">
                  {role.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-start gap-3 group/point"
                    >
                      <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm text-foreground/70 leading-relaxed group-hover/point:text-foreground/90 transition-colors">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-5 pb-5">
                  <Link
                    href="/auth/register"
                    className={`group/btn block w-full text-center py-3 rounded-lg font-semibold bg-gradient-to-r ${role.gradient} text-white hover:opacity-90 transition-all shadow-lg ${role.shadow} hover:shadow-xl flex items-center justify-center gap-2`}
                  >
                    {role.cta}
                    <FiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── GAMIFICATION ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl font-bold mb-3"
            >
              La Educación se Convierte en{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                un Juego
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="max-w-2xl mx-auto text-base text-foreground/60"
            >
              Olvídate de cursos aburridos con 0% de retención. Monetra
              transforma el aprendizaje en una experiencia adictiva con
              mecánicas de game design.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
            className="grid md:grid-cols-2 xl:grid-cols-4 gap-6"
          >
            {gamificationFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="p-6 rounded-2xl bg-surface border border-border text-center hover:border-primary/30 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-base font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── ADDITIONAL BENEFITS ─── */}
      <section className="py-16 bg-surface/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl font-bold mb-3"
            >
              Todo lo que Necesitas en{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                un Solo Lugar
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="max-w-2xl mx-auto text-base text-foreground/60"
            >
              Herramientas profesionales para que te enfoques en lo que importa:
              crear, crecer y generar ingresos.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: FiLayers,
                title: "Catálogo Inteligente",
                desc: "Descubre cursos con algoritmos que aprenden de tus intereses y nivel de experiencia.",
              },
              {
                icon: FiTarget,
                title: "Tracking en Tiempo Real",
                desc: "Para afiliados: cada clic, cada venta, cada comisión. Sin misterios, total transparencia.",
              },
              {
                icon: FiHeart,
                title: "Comunidad Activa",
                desc: "Foros, grupos de estudio y eventos en vivo. El aprendizaje es social o no es.",
              },
              {
                icon: FiTrendingUp,
                title: "Analíticas Poderosas",
                desc: "Para creadores: retención, progreso, ingresos. Datos que te ayudan a mejorar.",
              },
              {
                icon: FiAward,
                title: "Certificaciones",
                desc: "Certificados verificables que tus estudiantes pueden presumir en LinkedIn y más.",
              },
              {
                icon: FiGlobe,
                title: "Multi-dispositivo",
                desc: "Accede desde tu navegador, tu tablet o tu móvil. Aprende donde sea, cuando sea.",
              },
            ].map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={cardVariants}
                className="p-6 rounded-2xl border border-border bg-background hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-16 bg-gradient-to-br from-primary/20 via-background to-background dark:from-primary/10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div variants={fadeInUp}>
            <FiAward className="w-16 h-16 text-primary mx-auto mb-6" />
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold mb-3"
          >
            Tu Viaje Empieza Ahora
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-foreground/60 mb-3"
          >
            Es <strong className="text-primary">completamente gratis</strong>.
            Sin tarjetas de crédito. Sin compromisos.
          </motion.p>
          <motion.p
            variants={fadeInUp}
            className="text-sm text-foreground/40 mb-8"
          >
            Únete a miles que ya están transformando su futuro con Monetra.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth/register"
              className="group px-8 py-4 text-lg font-bold rounded-xl bg-primary text-white hover:opacity-90 transition-all shadow-xl shadow-primary/40 hover:shadow-[0_0_40px_-8px_rgba(124,58,237,0.5)] flex items-center gap-2"
            >
              Crear mi cuenta gratis
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 text-base font-semibold rounded-xl border border-border hover:bg-surface transition-all"
            >
              Ya tengo cuenta
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-8 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-primary">
              <LogoIcon width={24} height={24} />
            </span>
            <span>Monetra</span>
          </Link>
          <p className="text-sm text-foreground/40">
            &copy; {new Date().getFullYear()} Monetra. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
