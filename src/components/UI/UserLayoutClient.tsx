"use client";

import { useState, useRef, useEffect } from "react";
import { ReactNode } from "react";
import { UserNavbar } from "@/components/UI/navbar/UserNavbar";
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

      if (!clickedAside && !clickedButton) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <ProfileProvider>
      <main className="min-h-dvh h-full w-full bg-background p-2 max-md:space-y-2 md:grid md:h-dvh md:min-h-0 md:grid-cols-[auto_1fr] md:grid-rows-[auto_1fr] md:gap-2 md:overflow-hidden">
        <UserNavbar
          isOpen={isOpen}
          onToggle={() => setIsOpen((prev) => !prev)}
          buttonRef={buttonRef}
        />
        <UserAside isOpen={isOpen} asideRef={asideRef} />

        <section className="row-start-2 col-start-2 min-h-0 overflow-y-auto bg-surface rounded-lg p-3 sm:p-5">
          {children}
        </section>
      </main>
    </ProfileProvider>
  );
}
