"use client";

import { FiBell, FiBookOpen, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useRef, useState } from "react";
import { DropdownMenu } from "@/components/DropdownMenu";
import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types/user";

const ROLE_CONFIG: Record<
  Role,
  {
    icon: React.ReactNode;
    label: string;
    description: string;
    badge: string;
    badgeClassName: string;
  }
> = {
  STUDENT: {
    icon: <FiBookOpen size={20} className="text-blue-400 dark:text-blue-400" />,
    label: "Sin notificaciones",
    description: "Aquí verás novedades sobre\ntus cursos y contenido.",
    badge: "Estudiante",
    badgeClassName:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  PRODUCER: {
    icon: (
      <FiTrendingUp
        size={20}
        className="text-emerald-400 dark:text-emerald-400"
      />
    ),
    label: "Sin notificaciones",
    description: "Aquí verás actividad sobre\ntus cursos y ventas.",
    badge: "Productor",
    badgeClassName:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  AFFILIATE: {
    icon: (
      <FiUsers size={20} className="text-violet-400 dark:text-violet-400" />
    ),
    label: "Sin notificaciones",
    description: "Aquí verás actualizaciones\nsobre tus comisiones.",
    badge: "Afiliado",
    badgeClassName:
      "bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
};

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { user } = useProfile();
  const hasNotifications = false;

  const role = (user?.role as Role) ?? "STUDENT";
  const config = ROLE_CONFIG[role];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-border hover:border-[#7C3AED]/50 dark:hover:border-[#7C3AED]/50 transition-all cursor-pointer group"
      >
        <FiBell
          size={16}
          className="text-gray-500 dark:text-white/50 group-hover:text-[#7C3AED] transition-colors"
        />
        {hasNotifications && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
        )}
      </button>

      <DropdownMenu
        isOpen={open}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
        align="right"
        offset={8}
        className="w-80"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Notificaciones
          </p>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badgeClassName}`}
          >
            {config.badge}
          </span>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5">
            {config.icon}
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-white/70">
              {config.label}
            </p>
            <p className="text-xs text-gray-400 dark:text-white/30 leading-relaxed whitespace-pre-line">
              {config.description}
            </p>
          </div>
        </div>
      </DropdownMenu>
    </>
  );
}
