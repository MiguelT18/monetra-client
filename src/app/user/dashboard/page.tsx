"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useProfile } from "@/hooks/useProfile";
import type { Role } from "@/types/user";

const DASHBOARD_TITLE: Record<Role, string> = {
  STUDENT: "Dashboard del estudiante",
  PRODUCER: "Dashboard del productor",
  AFFILIATE: "Dashboard del afiliado",
};

export default function UserDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const { notify } = useNotification();
  const { user } = useProfile();

  const role = (user?.role ?? "STUDENT") as Role;
  const title = DASHBOARD_TITLE[role];

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const result = await res.json();

      if (res.ok) {
        notify("success", result.message);
        setTimeout(() => router.push("/auth/login"), 1000);
      } else {
        notify("error", result.message);
      }
    } catch (error) {
      console.error("[logout error]:", error);
      notify("error", "Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

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

      <motion.button
        onClick={handleLogout}
        disabled={loading}
        className="bg-black text-white dark:bg-white dark:text-black mt-6 cursor-pointer py-2 rounded-md hover:bg-black/70 dark:hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {loading ? "Cerrando sesión..." : "Cerrar sesión"}
      </motion.button>
    </div>
  );
}
