"use client";

import { motion } from "motion/react";
import { useProfile } from "@/hooks/useProfile";

export default function UserCourses() {
  const { user } = useProfile();
  const username = user?.fullname?.split(" ")[0] ?? user?.username ?? "";

  return (
    <div className="grid place-content-center h-full">
      <motion.h2
        className="text-2xl text-gray-900 dark:text-white text-center"
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        animate={{ opacity: 1, y: 0 }}
      >
        Mis cursos — {username}
      </motion.h2>
    </div>
  );
}
