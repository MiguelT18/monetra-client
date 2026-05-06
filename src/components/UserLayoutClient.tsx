"use client";

import { useState, useRef, useEffect } from "react";
import { ReactNode } from "react";
import { UserNavbar } from "@/components/UI/UserNavbar";
import { UserAside } from "@/components/UI/UserAside";
import { ProfileProvider } from "@/hooks/useProfile";

export function UserLayoutClient({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedAside = asideRef.current?.contains(target);
      const clickedButton = buttonRef.current?.contains(target);

      // cerrar solo si el click fue fuera del aside Y fuera del botón
      if (!clickedAside && !clickedButton) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <ProfileProvider>
      <main className="min-h-dvh h-full w-full md:grid md:grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-2 p-2 max-md:space-y-2">
        <UserNavbar
          isOpen={isOpen}
          onToggle={() => setIsOpen((prev) => !prev)} // 👈 toggle limpio
          buttonRef={buttonRef}
        />
        <UserAside isOpen={isOpen} asideRef={asideRef} />

        <section className="row-start-2 col-start-2 bg-gray-200/60 dark:bg-[#101826]/30 rounded-lg p-4">
          {children}
        </section>
      </main>
    </ProfileProvider>
  );
}
