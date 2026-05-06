"use client";

import { motion, AnimatePresence } from "motion/react";
import { MdOutlineDashboard, MdOutlineSchool } from "react-icons/md";
import type { Role } from "@/types/user";
import { IconType } from "react-icons";
import { useProfile } from "@/hooks/useProfile";
import { CiSettings } from "react-icons/ci";
import Link from "next/link";

interface UserAsideProps {
  isOpen: boolean;
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

export function UserAside({ isOpen }: UserAsideProps) {
  const { user, loading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;

  const visibleItems = loading
    ? NAV_ITEMS.filter((item) => item.roles.includes("STUDENT"))
    : NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <motion.aside
      animate={{ width: isOpen ? 220 : 56 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="max-md:hidden bg-gray-200/60 dark:bg-[#101826]/30 rounded-lg p-2 overflow-hidden"
    >
      <ul className="space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
            flex items-center text-gray-400 dark:hover:text-primary dark:hover:bg-primary/15
            p-2 rounded-md transition-all cursor-pointer
            ${isOpen ? "gap-2 justify-start" : "justify-center"}
          `}
              >
                <Icon size={20} className="shrink-0" />

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
                      className="whitespace-nowrap overflow-hidden"
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
