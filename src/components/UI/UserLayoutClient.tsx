"use client";

import { useState, useRef, useEffect } from "react";
import { ReactNode } from "react";
import { UserNavbar } from "@/components/UI/navbar/UserNavbar";
import { UserAside } from "@/components/UI/UserAside";
export function UserLayoutClient({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedAside = asideRef.current?.contains(target);
      const clickedButton = buttonRef.current?.contains(target);

      if (!clickedAside && !clickedButton) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <main className="relative min-h-dvh h-full w-full bg-background p-3 max-md:space-y-3 md:grid md:h-dvh md:min-h-0 md:grid-cols-[auto_1fr] md:grid-rows-[auto_1fr] md:gap-3 md:overflow-hidden">
        {/* Subtle background gradient */}
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent dark:from-primary/[0.02]" />

        <UserNavbar
          isOpen={isOpen}
          onToggle={() => setIsOpen((prev) => !prev)}
          buttonRef={buttonRef}
        />
        <UserAside isOpen={isOpen} asideRef={asideRef} />

        <section className="app-scrollbar relative row-start-2 col-start-2 min-h-0 overflow-y-auto bg-surface rounded-2xl p-4 shadow-sm sm:p-6">
          {children}
        </section>
      </main>
  );
}
