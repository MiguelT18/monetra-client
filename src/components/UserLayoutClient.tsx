"use client";

import { useState } from "react";
import { UserNavbar } from "@/components/UI/UserNavbar";
import { UserAside } from "@/components/UI/UserAside";
import { ReactNode } from "react";

export function UserLayoutClient({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="min-h-dvh h-full w-full md:grid md:grid-cols-[auto_1fr] grid-rows-[auto_1fr] p-2">
      <UserNavbar isOpen={isOpen} onToggle={setIsOpen} />
      <UserAside isOpen={isOpen} />
      <section className="bg-gray-200/60 dark:bg-[#101826]/30 md:ml-2 rounded-lg p-4">
        {children}
      </section>
    </main>
  );
}
