"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const result = await res.json();

      if (res.ok) {
        notify("success", result.message);
        router.push("/auth/login");
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
        className="text-2xl"
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        animate={{ opacity: 1, y: 0 }}
      >
        Dashboard del usuario
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
