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
      className="relative flex items-center justify-center size-9 rounded-lg hover:bg-primary/15 transition-colors outline-none group cursor-pointer"
    >
      <div className="grid place-items-center w-5 h-4">
        <motion.span
          className="col-start-1 row-start-1 w-full h-0.5 rounded-full bg-gray-800 dark:bg-gray-400 group-hover:bg-primary origin-center"
          animate={
            isOpen
              ? { rotate: 45, y: 0 }
              : { rotate: 0, y: -7 }
          }
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
        <motion.span
          className="col-start-1 row-start-1 w-full h-0.5 rounded-full bg-gray-800 dark:bg-gray-400 group-hover:bg-primary"
          animate={
            isOpen
              ? { opacity: 0, scaleX: 0 }
              : { opacity: 1, scaleX: 1 }
          }
          transition={{ duration: 0.15 }}
        />
        <motion.span
          className="col-start-1 row-start-1 w-full h-0.5 rounded-full bg-gray-800 dark:bg-gray-400 group-hover:bg-primary origin-center"
          animate={
            isOpen
              ? { rotate: -45, y: 0 }
              : { rotate: 0, y: 7 }
          }
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
      </div>
    </button>
  );
}
