"use client";

import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types/user";

const DASHBOARD_TITLE: Record<Role, string> = {
  STUDENT: "Dashboard del estudiante",
  PRODUCER: "Dashboard del productor",
  AFFILIATE: "Dashboard del afiliado",
};

export default function UserDashboard() {
  const { user } = useProfile();

  const role = (user?.role ?? "STUDENT") as Role;
  const title = DASHBOARD_TITLE[role];

  return (
    <div className="grid place-content-center h-full">
      <motion.h2
        key={title} // 👈 re-anima cuando cambia el rol
        className="text-2xl text-gray-900 dark:text-white text-center"
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        animate={{ opacity: 1, y: 0 }}
      >
        {title}
      </motion.h2>
    </div>
  );
}
