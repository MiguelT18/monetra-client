"use client";

import { motion } from "motion/react";

export default function ProductsPage() {
  return (
    <div className="grid place-content-center h-full">
      <motion.h2
        className="text-2xl"
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        animate={{ opacity: 1, y: 0 }}
      >
        Mis productos
      </motion.h2>
    </div>
  );
}
