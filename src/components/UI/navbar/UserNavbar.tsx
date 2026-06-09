"use client";

import MenuButton from "@/components/MenuButton";
import { useProfile } from "@/hooks/useProfile";
import { FaUserAlt, FaCog } from "react-icons/fa";
import { RoleSelect } from "./desktop/RoleSelect";
import { NotificationButton } from "./desktop/NotificationButton";
import { UserSearch } from "./desktop/UserSearch";
import { AnimatePresence, motion } from "motion/react";
import type { Role } from "@/types/user";
import { FiMoon, FiSun, FiChevronRight } from "react-icons/fi";
import { useThemeContext } from "@/contexts/themeContext";
import Image from "next/image";
import Link from "next/link";
import { totalXpForLevel, xpForNextLevel, calculateLevel, abbreviateXP } from "@/components/user/userShell";

interface UserNavbarProps {
  isOpen: boolean;
  onToggle: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function UserNavbar({ isOpen, onToggle, buttonRef }: UserNavbarProps) {
  const { user, loading } = useProfile();
  const { theme, toggle } = useThemeContext();

  return (
    <nav className="col-start-2 bg-surface rounded-2xl p-3 shadow-sm">
      {/* Desktop navbar */}
      <div className="max-md:hidden flex items-center gap-4">
        <MenuButton isOpen={isOpen} onToggle={onToggle} buttonRef={buttonRef} />

        <UserSearch />

        <div className="flex items-center gap-3 ml-auto">
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

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="relative p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer group"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.span
                  key="moon"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
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
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
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
          <div className="w-px h-8 bg-gray-200 dark:bg-white/10" />

          {/* Profile */}
          {loading || !user ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-white/10" />
              <div className="flex flex-col gap-1">
                <div className="h-3.5 w-24 bg-gray-300 dark:bg-white/10 rounded" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-white/5 rounded" />
              </div>
            </div>
          ) : (
            <Link
              href="/user/settings"
              className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <div className="relative shrink-0">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={`Foto de perfil de ${user.fullname}`}
                    width={36}
                    height={36}
                    className="rounded-full size-9 object-cover ring-2 ring-gray-200 dark:ring-white/10 group-hover:ring-primary/40 dark:group-hover:ring-primary/60 transition-all"
                  />
                ) : (
                  <div className="rounded-full size-9 flex items-center justify-center bg-gray-200 dark:bg-white/10 ring-2 ring-gray-200 dark:ring-white/10 group-hover:ring-primary/40 dark:group-hover:ring-primary/60 transition-all">
                    <FaUserAlt className="text-gray-500 dark:text-white/50" size={14} />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaCog size={8} className="text-gray-500 dark:text-white/60" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-gray-900 dark:text-white text-sm font-medium leading-tight truncate">
                  {user.fullname?.split(" ").slice(0, 2).join(" ") ?? user.username}
                </p>
                  {(() => {
                    const lvl = calculateLevel(user.gamifications.xp);
                    const xpInLevel = user.gamifications.xp - totalXpForLevel(lvl);
                    return (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-primary dark:text-primary/90 uppercase tracking-wider">
                          Nv.{lvl}
                        </span>
                        <div className="h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden w-14">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                            style={{
                              width: `${Math.min((xpInLevel / xpForNextLevel(lvl)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-white/40 font-medium tabular-nums">
                          {abbreviateXP(xpInLevel)} XP
                        </span>
                      </div>
                    );
                  })()}
              </div>
              <FiChevronRight
                size={12}
                className="shrink-0 text-gray-300 dark:text-white/20 group-hover:text-gray-500 dark:group-hover:text-white/50 transition-colors"
              />
            </Link>
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
