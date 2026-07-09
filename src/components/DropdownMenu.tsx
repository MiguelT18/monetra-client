"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  align?: "left" | "right";
  side?: "top" | "bottom";
  offset?: number;
  className?: string;
}

export function DropdownMenu({
  isOpen,
  onClose,
  anchorRef,
  children,
  align = "right",
  side = "bottom",
  offset = 8,
  className = "",
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const menu = menuRef.current;
    const anchor = anchorRef.current;
    if (!menu || !anchor) return;

    const position = () => {
      const anchorRect = anchor.getBoundingClientRect();
      const menuW = menu.offsetWidth;
      const menuH = menu.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const MARGIN = 8;

      const spaceBelow = vh - anchorRect.bottom - MARGIN;
      const spaceAbove = anchorRect.top - MARGIN;
      const goesBelow =
        side === "bottom"
          ? spaceBelow >= menuH || spaceBelow >= spaceAbove
          : spaceAbove < menuH;

      const top = goesBelow
        ? anchorRect.bottom + offset
        : anchorRect.top - menuH - offset;

      const left =
        align === "right"
          ? Math.max(MARGIN, Math.min(anchorRect.right - menuW, vw - menuW - MARGIN))
          : Math.max(MARGIN, Math.min(anchorRect.left, vw - menuW - MARGIN));

      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      menu.style.visibility = "visible";
    };

    menu.style.visibility = "hidden";

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(position);
    });

    const observer = new ResizeObserver(() => position());
    observer.observe(menu);

    window.addEventListener("scroll", position, true);
    window.addEventListener("resize", position);

    const handleClick = (e: MouseEvent) => {
      if (
        menu.contains(e.target as Node) ||
        anchor.contains(e.target as Node)
      )
        return;
      onClose();
    };
    document.addEventListener("mousedown", handleClick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", position, true);
      window.removeEventListener("resize", position);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, onClose, anchorRef, align, side, offset]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const menu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.92, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 28,
            mass: 0.8,
          }}
          style={{
            position: "fixed",
            zIndex: 50,
          }}
          className={`bg-surface border border-border rounded-xl shadow-xl dark:shadow-black/40 overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(menu, document.body) : null;
}
