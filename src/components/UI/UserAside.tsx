"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MdOutlineDashboard, MdOutlineSchool } from "react-icons/md";
import type { Role } from "@/types/user";
import { IconType } from "react-icons";
import { useProfile } from "@/hooks/useProfile";
import { CiSettings } from "react-icons/ci";
import { useRouter } from "next/navigation";
import { useNotification } from "@/hooks/useNotification";
import {
  FiLogOut,
  FiBookOpen,
  FiTrendingUp,
  FiUsers,
  FiAward,
} from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUserAlt } from "react-icons/fa";
import { BsBoxSeam } from "react-icons/bs";

interface UserAsideProps {
  isOpen: boolean;
  asideRef: React.RefObject<HTMLElement | null>;
}

interface NavItem {
  label: string;
  icon: IconType;
  href: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: MdOutlineDashboard,
    href: "/user/dashboard",
    roles: ["STUDENT", "PRODUCER", "AFFILIATE"],
  },
  {
    label: "Mis cursos",
    icon: MdOutlineSchool,
    href: "/user/courses",
    roles: ["STUDENT"],
  },
  {
    label: "Explorar",
    icon: FiBookOpen,
    href: "/user/explore",
    roles: ["STUDENT", "PRODUCER", "AFFILIATE"],
  },
  {
    label: "Mis productos",
    icon: BsBoxSeam,
    href: "/user/products",
    roles: ["PRODUCER"],
  },
  {
    label: "Mis afiliaciones",
    icon: FiUsers,
    href: "/user/affiliations",
    roles: ["AFFILIATE"],
  },
  {
    label: "Logros",
    icon: FiAward,
    href: "/user/achievements",
    roles: ["STUDENT", "AFFILIATE", "PRODUCER"],
  },
  {
    label: "Configuración",
    icon: CiSettings,
    href: "/user/settings",
    roles: ["STUDENT", "PRODUCER", "AFFILIATE"],
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
  PRODUCER: {
    label: "Productor",
    description: "Crea y vende tu propio contenido.",
    icon: FiTrendingUp,
    colorClass: "bg-emerald-500",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/10",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  AFFILIATE: {
    label: "Afiliado",
    description: "Promociona productos y gana comisiones.",
    icon: FiUsers,
    colorClass: "bg-violet-500",
    bgClass: "bg-violet-500/10 dark:bg-violet-500/10",
    textClass: "text-violet-600 dark:text-violet-400",
  },
};

// XP necesaria para el siguiente nivel (simplificado)
function xpForNextLevel(level: number) {
  return level * 500;
}

export function UserAside({ isOpen, asideRef }: UserAsideProps) {
  const [logoutLoading, setLogoutLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { user, loading } = useProfile();
  const { notify } = useNotification();
  {
  }

  const role = (user?.role ?? "STUDENT") as Role;
  const roleConfig = ROLE_CONFIG[role];
  const RoleIcon = roleConfig.icon;

  const visibleItems = loading
    ? NAV_ITEMS.filter((item) => item.roles.includes("STUDENT"))
    : NAV_ITEMS.filter((item) => item.roles.includes(role));

  const currentXp = user?.gamifications.xp ?? 0;
  const currentLevel = user?.gamifications.level ?? 1;
  const nextLevelXp = xpForNextLevel(currentLevel);
  const xpProgress = Math.min((currentXp / nextLevelXp) * 100, 100);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const result = await res.json();

      if (res.ok) {
        router.push("/auth/login");
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
      className="row-start-1 row-span-2 max-md:hidden bg-surface rounded-lg overflow-hidden flex flex-col"
    >
      <div className="flex flex-col flex-1 p-2 min-h-0 justify-between">
        {/* Top: role badge + nav items */}
        <div className="space-y-1">
          {/* Role badge */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="mb-4"
              >
                <div
                  className={`flex items-start gap-3 rounded-lg px-3 py-3 ${roleConfig.bgClass}`}
                >
                  <div className={`mt-0.5 shrink-0 ${roleConfig.textClass}`}>
                    <RoleIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold ${roleConfig.textClass}`}
                    >
                      {roleConfig.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 leading-relaxed">
                      {roleConfig.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav items */}
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                  relative flex items-center p-3 rounded-md transition-all
                  ${isOpen ? "gap-2 justify-start" : "justify-center"}
                  ${
                    isActive
                      ? "text-primary cursor-not-allowed"
                      : "text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/15 cursor-pointer"
                  }
                `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-bar"
                        className="absolute left-0 top-0 bottom-1 w-1 h-full bg-primary rounded-l-md"
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className={`absolute inset-0 ${
                          isOpen ? "bg-primary/15" : "bg-primary/25"
                        } rounded-md`}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon size={20} className="shrink-0 relative z-10" />
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="whitespace-nowrap overflow-hidden relative z-10 text-sm"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom: perfil + logout */}
        <div className="pt-2 border-t border-border space-y-1">
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="px-2 py-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 border border-border flex items-center justify-center">
                      <FaUserAlt
                        size={16}
                        className="text-gray-500 dark:text-white/50"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate leading-tight mb-1">
                        {user?.fullname ?? user?.username ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/40 truncate leading-tight">
                        @{user?.username ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-white/40">
                        Nv. {currentLevel}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-white/40">
                        Nv. {currentLevel + 1}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
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
                      {currentXp} / {nextLevelXp} XP
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className={`
          w-full relative flex items-center p-3 rounded-md transition-all
          text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400
          hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer
          ${isOpen ? "gap-2 justify-start" : "justify-center"}
        `}
          >
            <FiLogOut size={20} className="shrink-0" />
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="whitespace-nowrap overflow-hidden text-sm"
                >
                  {logoutLoading ? "Cerrando sesión..." : "Cerrar sesión"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
