"use client";

import { motion, AnimatePresence } from "motion/react";
import { MdOutlineDashboard, MdOutlineSchool } from "react-icons/md";
import type { Role } from "@/types/user";
import { IconType } from "react-icons";
import { useProfile } from "@/hooks/useProfile";
import { CiSettings } from "react-icons/ci";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    label: "Configuración",
    icon: CiSettings,
    href: "/user/settings",
    roles: ["STUDENT", "PRODUCER", "AFFILIATE"],
  },
];

export function UserAside({ isOpen, asideRef }: UserAsideProps) {
  const { user, loading } = useProfile();
  const pathname = usePathname();

  const role = (user?.role ?? "STUDENT") as Role;

  const visibleItems = loading
    ? NAV_ITEMS.filter((item) => item.roles.includes("STUDENT"))
    : NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <motion.aside
      ref={asideRef}
      animate={{ width: isOpen ? 256 : 56 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="row-start-1 row-span-2 max-md:hidden bg-surface rounded-lg p-2 overflow-hidden"
    >
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
                      : "text-gray-400 dark:hover:text-primary dark:hover:bg-primary/15 cursor-pointer"
                  }
                `}
              >
                {/* 🔥 Barra izquierda activa */}
                {isActive && (
                  <motion.div
                    layoutId="active-bar"
                    className="absolute left-0 top-0 bottom-1 w-1 h-full bg-primary rounded-l-md"
                  />
                )}

                {/* Background pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className={`absolute inset-0 ${
                      isOpen ? "bg-primary/5" : "bg-primary/15"
                    } rounded-md`}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <Icon size={20} className="shrink-0 relative z-10" />

                {/* Label */}
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
                      className="whitespace-nowrap overflow-hidden relative z-10"
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
    </motion.aside>
  );
}
