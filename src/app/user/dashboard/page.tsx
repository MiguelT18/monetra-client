"use client";

import { motion } from "motion/react";

export default function UserDashboard() {
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
        className="bg-white text-black mt-6 cursor-pointer py-2 rounded-md hover:bg-white/70"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        Click me!
      </motion.button>
    </div>
  );
}
