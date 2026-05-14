"use client";

import { motion, AnimatePresence } from "motion/react";
import { useNotification } from "@/hooks/useNotification";
import { useProfile } from "@/hooks/useProfile";
import { useRef, useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import type { Role } from "@/types/user";
import { DropdownMenu } from "@/components/DropdownMenu";

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

export function RoleSelect({ currentRole }: { currentRole: Role }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Role>(currentRole ?? "STUDENT");
  const [updating, setUpdating] = useState<Role | null>(null);

  const { notify } = useNotification();
  const { changeRole, refetch } = useProfile();

  const buttonRef = useRef<HTMLButtonElement>(null);

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

      refetch();
      setSelected(role);
      setOpen(false);
    } catch {
      notify("error", "Error al actualizar el rol");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => {
          if (!updating) setOpen((prev) => !prev);
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

      <DropdownMenu
        isOpen={open}
        onClose={() => {
          if (!updating) setOpen(false);
        }}
        anchorRef={buttonRef}
        align="left"
        offset={8}
        className="w-60"
      >
        {ROLES.map((role, i) => (
          <motion.button
            key={role.value}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.2, ease: "easeOut" }}
            onClick={() => handleSelect(role.value)}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-left cursor-pointer group"
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
                <FiCheck size={14} className="text-[#7C3AED] mt-0.5 shrink-0" />
              </motion.span>
            )}
          </motion.button>
        ))}
      </DropdownMenu>
    </>
  );
}
