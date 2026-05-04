"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";

interface MenuButtonProps {
  isOpen: boolean;
  onToggle: (value: boolean) => void;
}

export default function MenuButton({ isOpen, onToggle }: MenuButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        onToggle(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <button
      ref={buttonRef}
      onClick={() => onToggle(!isOpen)}
      className="flex flex-col justify-center items-center w-8 h-8 cursor-pointer space-y-1.25 text-gray-400 hover:text-gray-200 p-2 rounded-lg hover:bg-gray-800 transition-colors outline-none"
    >
      <motion.span
        animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="block h-0.5 w-5 bg-gray-400 rounded-full origin-center"
      />
      <motion.span
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.1 }}
        className="block h-0.5 w-5 bg-gray-400 rounded-full"
      />
      <motion.span
        animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="block h-0.5 w-5 bg-gray-400 rounded-full origin-center"
      />
    </button>
  );
}
