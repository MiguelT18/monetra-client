"use client";

import { motion, AnimatePresence } from "motion/react";
import { MdOutlineDashboard } from "react-icons/md";

interface UserAsideProps {
  isOpen: boolean;
}

export function UserAside({ isOpen }: UserAsideProps) {
  return (
    <motion.aside
      animate={{ width: isOpen ? 220 : 56 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="max-md:hidden bg-gray-200/60 dark:bg-[#101826]/30 rounded-lg p-2 overflow-hidden"
    >
      <ul className="space-y-1">
        <li
          className={`
            flex items-center text-gray-400 dark:hover:text-primary dark:hover:bg-primary/15
            p-2 rounded-md transition-all cursor-pointer
            ${isOpen ? "gap-2 justify-start" : "justify-center"}
          `}
        >
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
