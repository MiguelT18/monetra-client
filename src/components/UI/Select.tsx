"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { DropdownMenu } from "@/components/DropdownMenu";
import { FiChevronDown, FiCheck } from "react-icons/fi";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
  className = "",
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer ${className}`}
      >
        <span className={`truncate ${selected ? "text-inherit" : "text-gray-400 dark:text-white/30"}`}>
          {selected?.label ?? placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown
            size={14}
            className="text-gray-400 dark:text-white/40"
          />
        </motion.span>
      </button>

      <DropdownMenu
        isOpen={open}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
        align="left"
        offset={4}
        className="w-full min-w-[200px] max-w-[265px]"
      >
        {options.map((opt, i) => (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.15, ease: "easeOut" }}
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
            type="button"
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer"
          >
            <span className={value === opt.value ? "font-medium text-primary" : "text-gray-700 dark:text-white/80"}>
              {opt.label}
            </span>
            {value === opt.value && (
              <FiCheck size={14} className="shrink-0 text-primary" />
            )}
          </motion.button>
        ))}
      </DropdownMenu>
    </>
  );
}
