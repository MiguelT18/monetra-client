"use client";

import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";

export default function UserCourses() {
  const { user } = useProfile();
  const username = user?.fullname?.split(" ")[0] ?? user?.username ?? "";

  return (
    <div className="grid place-content-center h-full">
      <motion.h2
        className="text-2xl text-gray-900 dark:text-white text-center flex items-center gap-2"
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        animate={{ opacity: 1, y: 0 }}
      >
        Mis cursos —{" "}
        {username ? (
          username
        ) : (
          <div className="block w-40 h-8 rounded-md bg-gray-300 dark:bg-white/10 animate-pulse" />
        )}
      </motion.h2>
    </div>
  );
}
