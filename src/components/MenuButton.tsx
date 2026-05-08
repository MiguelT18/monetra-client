"use client";

import { motion } from "motion/react";

interface MenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function MenuButton({
  isOpen,
  onToggle,
  buttonRef,
}: MenuButtonProps) {
  return (
    <button
      ref={buttonRef}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onToggle();
      }}
      className="flex flex-col justify-center items-center w-8 h-8 cursor-pointer space-y-1.25 p-2 rounded-lg hover:bg-primary/15 transition-colors outline-none group"
    >
      <motion.span
        animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="block h-0.5 w-5 bg-gray-800 dark:bg-gray-400 group-hover:bg-primary rounded-full origin-center"
      />
      <motion.span
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.1 }}
        className="block h-0.5 w-5 bg-gray-800 dark:bg-gray-400 group-hover:bg-primary rounded-full"
      />
      <motion.span
        animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="block h-0.5 w-5 bg-gray-800 dark:bg-gray-400 group-hover:bg-primary rounded-full origin-center"
      />
    </button>
  );
}
