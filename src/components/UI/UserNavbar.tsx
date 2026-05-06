"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import MenuButton from "@/components/UI/MenuButton";
import { useProfile } from "@/hooks/useProfile";
import { FaUserAlt } from "react-icons/fa";
import { FiBell, FiChevronDown, FiCheck } from "react-icons/fi";
import { useNotification } from "@/hooks/useNotification";

interface UserNavbarProps {
  isOpen: boolean;
  onToggle: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

type Role = "STUDENT" | "PRODUCER" | "AFFILIATE";

const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "STUDENT",
    label: "Estudiante",
    description: "Accede a cursos y contenido",
  },
  {
    value: "PRODUCER",
    label: "Productor",
    description: "Crea y vende contenido",
  },
  {
    value: "AFFILIATE",
    label: "Afiliado",
    description: "Promociona y gana comisiones",
  },
];

function RoleSelect({ currentRole }: { currentRole: Role }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Role>(currentRole ?? "STUDENT");
  const [updating, setUpdating] = useState<Role | null>(null);

  const { notify } = useNotification();
  const { changeRole } = useProfile();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (!updating) setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [updating]);

  const selectedRole = ROLES.find((r) => r.value === selected)!;

  const handleSelect = async (role: Role) => {
    if (role === selected || updating) return;

    setUpdating(role);

    try {
      const { ok, message } = await changeRole(role);

      if (!ok) {
        notify("error", message);
        return;
      }

      setSelected(role);
      setOpen(false);
    } catch {
      notify("error", "Error al actualizar el rol");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          if (!updating) setOpen(!open);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 transition-all text-sm text-gray-700 dark:text-white/80 cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="group-hover:text-primary">{selectedRole.label}</span>

        <AnimatePresence mode="wait" initial={false}>
          {updating ? (
            <motion.span
              key="spinner"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                className="block"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle
                    cx="7"
                    cy="7"
                    r="5.5"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="2"
                  />
                  <path
                    d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
                    stroke="#7C3AED"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.span>
            </motion.span>
          ) : (
            <motion.span
              key="chevron"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1, rotate: open ? 180 : 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
            >
              <FiChevronDown
                size={14}
                className="text-gray-400 dark:text-white/40 group-hover:text-primary"
              />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.85, scaleX: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1, scaleX: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.9, scaleX: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
              mass: 0.8,
            }}
            style={{ originY: 0, originX: 1 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d1520] shadow-xl dark:shadow-black/40 overflow-hidden z-50"
          >
            {ROLES.map((role, i) => (
              <motion.button
                key={role.value}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.2, ease: "easeOut" }}
                onClick={() => {
                  handleSelect(role.value);
                }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-primary/10 transition-colors text-left cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {role.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">
                    {role.description}
                  </p>
                </div>
                {selected === role.value && (
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <FiCheck
                      size={14}
                      className="text-[#7C3AED] mt-0.5 shrink-0"
                    />
                  </motion.span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationButton() {
  const hasNotifications = true;

  return (
    <button className="relative p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#7C3AED]/50 dark:hover:border-[#7C3AED]/50 transition-all cursor-pointer group">
      <FiBell
        size={16}
        className="text-gray-500 dark:text-white/50 group-hover:text-[#7C3AED] transition-colors"
      />
      {hasNotifications && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
      )}
    </button>
  );
}

export function UserNavbar({ isOpen, onToggle, buttonRef }: UserNavbarProps) {
  const { user, loading } = useProfile();

  return (
    <nav className="col-start-2 bg-gray-200/60 dark:bg-[#101826]/30 rounded-lg p-3">
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
              <div className="bg-gray-300 dark:bg-white/10 rounded-full p-2 border border-gray-200 dark:border-white/10">
                <FaUserAlt
                  className="text-gray-500 dark:text-white/50"
                  size={16}
                />
              </div>
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
