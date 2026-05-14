"use client";

import { motion } from "motion/react";

export default function AffiliationsPage() {
  return (
    <div className="grid place-content-center h-full">
      <motion.h1
        className="text-2xl text-gray-900 dark:text-white text-center flex items-center gap-2"
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        animate={{ opacity: 1, y: 0 }}
      >
        Mis afiliaciones
      </motion.h1>
    </div>
  );
}
