"use client";

import { motion } from "motion/react";
import type { Role } from "@/types/user";
import { useProfile } from "@/hooks/useProfile";

const SETTINGS_TITLE: Record<Role, string> = {
  STUDENT: "Configuración del estudiante",
  PRODUCER: "Configuración del productor",
  AFFILIATE: "Configuración del afiliado",
};

export default function UserSettings() {
  const { user } = useProfile();

  const role = (user?.role ?? "STUDENT") as Role;
  const title = SETTINGS_TITLE[role];

  return (
    <div className="grid place-content-center h-full">
      <motion.h2
        className="text-2xl"
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        animate={{ opacity: 1, y: 0 }}
      >
        {title}
      </motion.h2>
    </div>
  );
}
