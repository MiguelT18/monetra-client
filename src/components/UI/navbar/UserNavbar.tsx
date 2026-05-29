"use client";

import MenuButton from "@/components/MenuButton";
import { useProfile } from "@/hooks/useProfile";
import { FaUserAlt } from "react-icons/fa";
import { RoleSelect } from "./desktop/RoleSelect";
import { NotificationButton } from "./desktop/NotificationButton";
import { AnimatePresence, motion } from "motion/react";
import type { Role } from "@/types/user";
import { FiMoon, FiSun } from "react-icons/fi";
import { useThemeContext } from "@/contexts/themeContext";
import Image from "next/image";

interface UserNavbarProps {
  isOpen: boolean;
  onToggle: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function UserNavbar({ isOpen, onToggle, buttonRef }: UserNavbarProps) {
  const { user, loading } = useProfile();
  const { theme, toggle } = useThemeContext();

  return (
    <nav className="col-start-2 bg-surface rounded-lg p-3">
      {/* Desktop navbar */}
      <div className="max-md:hidden flex items-center justify-between">
        <MenuButton isOpen={isOpen} onToggle={onToggle} buttonRef={buttonRef} />

        <div className="flex items-center gap-3">
          {/* Role select */}
          {loading ? (
            <div className="h-8 w-28 rounded-lg bg-gray-300 dark:bg-white/10 animate-pulse" />
          ) : (
            user && (
              <RoleSelect currentRole={(user.role as Role) ?? "STUDENT"} />
            )
          )}

          {/* Notifications */}
          <NotificationButton />

          <button
            onClick={toggle}
            className="relative p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer group"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.span
                  key="moon"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }} // Ajuste de velocidad
                  className="block"
                >
                  <FiMoon
                    size={16}
                    className="text-white/50 group-hover:text-primary transition-colors"
                  />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }} // Ajuste de velocidad
                  className="block"
                >
                  <FiSun
                    size={16}
                    className="text-gray-500 group-hover:text-primary transition-colors"
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-white/10" />

          {/* Profile */}
          {loading || !user ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-white/10" />
              <div className="flex flex-col gap-1">
                <div className="h-3.5 w-24 bg-gray-300 dark:bg-white/10 rounded" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-white/5 rounded" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={`Foto de perfil de ${user.fullname}`}
                  width={32}
                  height={32}
                  className="rounded-full size-10 object-cover border border-gray-200 dark:border-white/10"
                />
              ) : (
                <div className="bg-gray-300 dark:bg-white/10 rounded-full p-2 border border-gray-200 dark:border-white/10">
                  <FaUserAlt className="text-gray-500 dark:text-white/50" size={16} />
                </div>
              )}
              <div className="space-y-1">
                <p className="block text-gray-900 dark:text-white text-sm font-medium leading-tight">
                  Hola, {user.fullname?.split(" ")[0] ?? user.username}
                </p>
                <p className="block text-gray-400 dark:text-white/40 text-xs leading-tight">
                  Nv. {user.gamifications.level} · {user.gamifications.xp} XP
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navbar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between w-full">
          <NotificationButton />
          <MenuButton
            isOpen={isOpen}
            onToggle={onToggle}
            buttonRef={buttonRef}
          />
        </div>
      </div>
    </nav>
  );
}
