"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useCallback } from "react";

type Position = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

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

  const calculatePosition = useCallback(() => {
    if (!anchorRef.current || !menuRef.current) return;

    const anchor = anchorRef.current.getBoundingClientRect();
    const menuW = menuRef.current.offsetWidth;
    const menuH = menuRef.current.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const MARGIN = 8;

    const pos: Position = {};

    // --- Eje vertical ---
    const spaceBelow = vh - anchor.bottom - MARGIN;
    const spaceAbove = anchor.top - MARGIN;

    const goesBelow =
      side === "bottom"
        ? spaceBelow >= menuH || spaceBelow >= spaceAbove
        : spaceAbove < menuH;

    if (goesBelow) {
      pos.top = anchor.bottom + offset;
    } else {
      pos.bottom = vh - anchor.top + offset;
    }

    // --- Eje horizontal ---
    if (align === "right") {
      const idealLeft = anchor.right - menuW;
      if (idealLeft >= MARGIN) {
        pos.right = vw - anchor.right;
      } else {
        pos.left = Math.max(MARGIN, Math.min(anchor.left, vw - menuW - MARGIN));
      }
    } else {
      const idealLeft = anchor.left;
      if (idealLeft + menuW <= vw - MARGIN) {
        pos.left = idealLeft;
      } else {
        pos.left = Math.max(MARGIN, vw - menuW - MARGIN);
      }
    }

    // Aplicar posición directamente al DOM sin pasar por state
    const el = menuRef.current;
    el.style.top = pos.top !== undefined ? `${pos.top}px` : "";
    el.style.bottom = pos.bottom !== undefined ? `${pos.bottom}px` : "";
    el.style.left = pos.left !== undefined ? `${pos.left}px` : "";
    el.style.right = pos.right !== undefined ? `${pos.right}px` : "";
    el.style.visibility = "visible";
  }, [anchorRef, align, side, offset]);

  useEffect(() => {
    if (!isOpen) return;

    // Ocultar mientras se calcula la posición
    if (menuRef.current) {
      menuRef.current.style.visibility = "hidden";
    }

    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(calculatePosition);
    });

    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition, true);
    return () => {
      cancelAnimationFrame(outerFrame);
      if (innerFrame) cancelAnimationFrame(innerFrame);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
    };
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        anchorRef.current?.contains(e.target as Node)
      )
        return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, anchorRef]);

  return (
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
            visibility: "hidden", // oculto hasta que calculatePosition lo muestre
          }}
          className={`bg-surface border border-border rounded-xl shadow-xl dark:shadow-black/40 overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
