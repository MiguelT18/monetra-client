"use client";

import { motion, AnimatePresence } from "motion/react";
import { MdOutlineDashboard } from "react-icons/md";

interface UserAsideProps {
  isOpen: boolean;
}

export function UserAside({ isOpen }: UserAsideProps) {
  return (
    <motion.aside
      animate={{ width: isOpen ? 192 : 56 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="max-md:hidden bg-[#101826]/30 rounded-lg p-4 overflow-hidden"
    >
      <ul className="space-y-4">
        <li className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 cursor-pointer">
          <MdOutlineDashboard size={20} className="shrink-0" />

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Dashboard
              </motion.span>
            )}
          </AnimatePresence>
        </li>
      </ul>
    </motion.aside>
  );
}
