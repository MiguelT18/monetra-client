"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MdOutlineDashboard, MdOutlineSchool } from "react-icons/md";
import type { Role } from "@/types/user";
import { IconType } from "react-icons";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { useNotification } from "@/hooks/useNotification";
import { xpForNextLevel, totalXpForLevel, calculateLevel, abbreviateXP } from "@/components/user/userShell";
import {
  FiLogOut,
  FiBookOpen,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiShoppingCart,
  FiPackage,
  FiLink,
  FiSettings,
  FiShield,
  FiUserCheck,
  FiFlag,
  FiMail,
} from "react-icons/fi";
import Link from "next/link";
import LogoIcon from "@/icons/Logo";
import { usePathname } from "next/navigation";
import { FaUserAlt } from "react-icons/fa";
import Image from "next/image";
import MenuButton from "@/components/MenuButton";

interface UserAsideProps {
  isOpen: boolean;
  onToggle: () => void;
  asideRef: React.RefObject<HTMLElement | null>;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

interface NavItem {
  label: string;
  icon: IconType;
  href: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Mercado",
    icon: FiShoppingCart,
    href: "/user/explore",
    roles: ["STUDENT", "CREATOR", "AFFILIATE"],
  },
  {
    label: "Dashboard",
    icon: MdOutlineDashboard,
    href: "/user/dashboard",
    roles: ["STUDENT", "CREATOR", "AFFILIATE"],
  },
  {
    label: "Bandeja de entrada",
    icon: FiMail,
    href: "/user/inbox",
    roles: ["STUDENT", "CREATOR", "AFFILIATE", "ADMIN"],
  },
  {
    label: "Mis cursos",
    icon: MdOutlineSchool,
    href: "/user/courses",
    roles: ["STUDENT"],
  },
  {
    label: "Mis productos",
    icon: FiPackage,
    href: "/user/products",
    roles: ["CREATOR"],
  },
  {
    label: "Mis afiliaciones",
    icon: FiLink,
    href: "/user/affiliations",
    roles: ["AFFILIATE"],
  },
  {
    label: "Logros",
    icon: FiAward,
    href: "/user/achievements",
    roles: ["STUDENT", "AFFILIATE", "CREATOR"],
  },
  {
    label: "Logros",
    icon: FiAward,
    href: "/admin/achievements",
    roles: ["ADMIN"],
  },
  {
    label: "Revisiones",
    icon: FiShield,
    href: "/admin/reviews",
    roles: ["ADMIN"],
  },
  {
    label: "Usuarios",
    icon: FiUserCheck,
    href: "/admin/users",
    roles: ["ADMIN"],
  },
  {
    label: "Reportes",
    icon: FiFlag,
    href: "/admin/reports",
    roles: ["ADMIN"],
  },
  {
    label: "Configuración",
    icon: FiSettings,
    href: "/user/settings",
    roles: ["STUDENT", "CREATOR", "AFFILIATE"],
  },
];

const ROLE_CONFIG: Record<
  Role,
  {
    label: string;
    description: string;
    icon: IconType;
    colorClass: string;
    bgClass: string;
    textClass: string;
  }
> = {
  STUDENT: {
    label: "Estudiante",
    description: "Accede a cursos y contenido educativo.",
    icon: FiBookOpen,
    colorClass: "bg-blue-500",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/10",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  CREATOR: {
    label: "Creador",
    description: "Crea y vende tu propio contenido.",
    icon: FiTrendingUp,
    colorClass: "bg-violet-500",
    bgClass: "bg-violet-500/10 dark:bg-violet-500/10",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  AFFILIATE: {
    label: "Afiliado",
    description: "Promociona productos y gana comisiones.",
    icon: FiUsers,
    colorClass: "bg-violet-500",
    bgClass: "bg-violet-500/10 dark:bg-violet-500/10",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  ADMIN: {
    label: "Admin",
    description: "Gestiona la plataforma y los usuarios.",
    icon: FiAward,
    colorClass: "bg-red-500",
    bgClass: "bg-red-500/10 dark:bg-red-500/10",
    textClass: "text-red-600 dark:text-red-400",
  },
};

export function UserAside({ isOpen, onToggle, asideRef, buttonRef }: UserAsideProps) {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [pendingReviews, setPendingReviews] = useState(0);

  const pathname = usePathname();
  const router = useRouter();

  const { user, loading, changeRole, clearUser, previousRole } = useProfile();
  const { notify } = useNotification();

  const role = (user?.role ?? "STUDENT") as Role;

  useEffect(() => {
    if (role !== "ADMIN") { setPendingReviews(0); return; }

    const fetchPending = (signal: AbortSignal) => {
      fetch("/api/products/admin/pending-reviews", { signal })
        .then((r) => r.json())
        .then((json) => {
          const products = json.data?.products;
          if (Array.isArray(products)) setPendingReviews(products.length);
        })
        .catch(() => {});
    };

    const controller = new AbortController();
    fetchPending(controller.signal);

    const onReviewsChanged = () => fetchPending(controller.signal);
    window.addEventListener("pending-reviews-changed", onReviewsChanged);

    return () => { controller.abort(); window.removeEventListener("pending-reviews-changed", onReviewsChanged); };
  }, [role]);

  const visibleItems = loading
    ? NAV_ITEMS.filter((item) => item.roles.includes("STUDENT"))
    : NAV_ITEMS.filter((item) => item.roles.includes(role));

  const currentXp = user?.gamifications.xp ?? 0;
  const computedLevel = calculateLevel(currentXp);
  const currentLevelXp = totalXpForLevel(computedLevel);
  const xpInLevel = Math.max(0, currentXp - currentLevelXp);
  const nextLevelXp = xpForNextLevel(computedLevel);
  const xpProgress = Math.min((xpInLevel / nextLevelXp) * 100, 100);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const result = await res.json();

      if (res.ok) {
        clearUser();
        router.push("/");
        notify("success", result.message);
      } else {
        notify("error", result.message);
      }
    } catch (error) {
      console.error("[logout error]:", error);
      notify("error", "Error al cerrar sesión");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <motion.aside
      ref={asideRef}
      animate={{ width: isOpen ? 256 : 56 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="row-start-1 row-span-2 max-md:hidden bg-surface rounded-2xl overflow-hidden flex flex-col shadow-sm"
    >
      <div className="flex flex-col flex-1 p-2 min-h-0 justify-between">
        {/* Top section */}
        <div className="space-y-1">
          {/* Menu button - always visible */}
          <div className={`flex items-center ${isOpen ? "justify-end" : "justify-center"} mb-2`}>
            <MenuButton isOpen={isOpen} onToggle={onToggle} buttonRef={buttonRef} />
          </div>

          {/* Content visible only when expanded */}
          {isOpen && (
            <>
              {/* Logo */}
              <Link href="/" className="mb-5 mt-2 block">
                <div className="flex items-center gap-2.5 px-2">
                  <span className="text-primary shrink-0">
                    <LogoIcon width={30} height={30} />
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Monetra
                  </span>
                </div>
              </Link>

              {/* Nav items */}
              <ul className="space-y-1.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                      relative flex items-center p-3 rounded-lg transition-all gap-2.5 justify-start
                      ${isActive
                            ? "text-primary cursor-not-allowed"
                            : "text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/15 cursor-pointer"
                          }
                    `}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-bar"
                            className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-sm"
                          />
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-primary/15 rounded-md"
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                        <Icon size={20} className="shrink-0 relative z-10" />
                        <span className="whitespace-nowrap overflow-hidden relative z-10 text-sm">
                          {item.label}
                        </span>
                        {item.href === "/admin/reviews" && pendingReviews > 0 && (
                          <span className="ml-auto relative z-10 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                            {pendingReviews > 99 ? "99+" : pendingReviews}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Bottom: perfil + logout - visible only when expanded */}
        {isOpen && (
          <div className="pt-2 border-t border-border space-y-1">
            <div className="px-2 py-3 space-y-3">
              <div className="flex items-center gap-2.5">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={`Foto de perfil de ${user.fullname}`}
                    width={40}
                    height={40}
                    className="rounded-full size-10 object-cover border-2 border-gray-200 dark:border-white/10"
                  />
                ) : (
                  <div className="bg-gray-200 dark:bg-white/10 rounded-full p-2 border-2 border-gray-200 dark:border-white/10">
                    <FaUserAlt className="text-gray-500 dark:text-white/50" size={16} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate leading-tight mb-0.5">
                    {user?.fullname ?? user?.username ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/40 truncate leading-tight">
                    @{user?.username ?? "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-white/45">
                    Nv. {computedLevel}
                  </span>
                  <span className="text-xs font-medium text-gray-500 dark:text-white/45">
                    Nv. {computedLevel + 1}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 20,
                      delay: 0.1,
                    }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-white/30 text-center">
                  {abbreviateXP(xpInLevel)} / {abbreviateXP(nextLevelXp)} XP
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              {role !== "ADMIN" && user?.email === "miguel.teranj02@gmail.com" && (
                <button
                  type="button"
                  disabled={roleLoading || logoutLoading}
                  onClick={async () => {
                    setRoleLoading(true);
                    const res = await changeRole("ADMIN");
                    if (res.ok) {
                      notify("success", "Rol cambiado a Admin");
                    } else notify("error", res.message);
                    setRoleLoading(false);
                  }}
                  className="relative flex-1 flex items-center p-2.5 rounded-lg transition-all bg-emerald-500/5 gap-1.5 justify-center text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer min-w-0 disabled:opacity-50"
                >
                  {roleLoading ? (
                    <span className="size-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  ) : (
                    <FiShield size={16} className="shrink-0" />
                  )}
                  <span className="truncate text-xs font-medium">
                    {roleLoading ? "Cambiando..." : "Ser Admin"}
                  </span>
                </button>
              )}
              {role === "ADMIN" && (
                <button
                  type="button"
                  disabled={roleLoading || logoutLoading}
                  onClick={async () => {
                    setRoleLoading(true);
                    const res = await changeRole(previousRole);
                    if (res.ok) {
                      notify("success", `Rol cambiado a ${ROLE_CONFIG[previousRole].label}`);
                      if (pathname.startsWith("/admin")) {
                        router.push("/user/dashboard");
                      }
                    } else notify("error", res.message);
                    setRoleLoading(false);
                  }}
                  className="relative flex-1 flex items-center p-2.5 rounded-lg transition-all bg-orange-500/5 gap-1.5 justify-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 cursor-pointer min-w-0 disabled:opacity-50"
                >
                  {roleLoading ? (
                    <span className="size-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  ) : (
                    <FiShield size={16} className="shrink-0" />
                  )}
                  <span className="truncate text-xs font-medium">
                    {roleLoading ? "Cambiando..." : "Salir de Admin"}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading || roleLoading}
                className="relative flex-1 flex items-center p-2.5 rounded-lg transition-all bg-red-500/5 gap-1.5 justify-center text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer min-w-0 disabled:opacity-50"
              >
                <FiLogOut size={16} className="shrink-0" />
                <span className="truncate text-xs font-medium">
                  {logoutLoading ? "Cerrando..." : "Salir"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
