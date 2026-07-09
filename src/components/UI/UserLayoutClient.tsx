"use client";

import { useState, useRef, useEffect } from "react";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserNavbar } from "@/components/UI/navbar/UserNavbar";
import { UserAside } from "@/components/UI/UserAside";
import { AuroraField } from "@/components/user/AuroraField";
import { useProfile } from "@/hooks/useProfile";

const ADMIN_ROUTES = ["/admin"];

export function UserLayoutClient({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useProfile();
  const role = user?.role;

  useEffect(() => {
    if (loading || !role) return;
    if (role !== "ADMIN") return;
    const allowed = ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith("/admin"));
    if (!allowed) {
      router.replace("/admin/users");
    }
  }, [role, pathname, loading, router]);

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
    <main data-role={role?.toLowerCase()} className="relative min-h-dvh h-full w-full role-ambient-bg p-2 max-md:space-y-2 md:grid md:h-dvh md:min-h-0 md:grid-cols-[auto_1fr] md:grid-rows-[auto_1fr] md:gap-2 md:overflow-hidden">
      {/* Role-tinted ambient aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <AuroraField />
      </div>

      <UserNavbar
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
        buttonRef={buttonRef}
      />
      <UserAside isOpen={isOpen} onToggle={() => setIsOpen((prev) => !prev)} asideRef={asideRef} buttonRef={buttonRef} />

      <section className="app-scrollbar glass relative row-start-2 col-start-2 min-h-0 overflow-y-auto bg-surface rounded-2xl p-3 shadow-sm sm:p-4">
        {/* Spotlight overlay */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
          style={{
            background: `radial-gradient(ellipse 120% 100% at 50% 0%, var(--role-accent) 0%, transparent 60%)`,
            opacity: 0.05,
          }}
          aria-hidden="true"
        />
        {children}
      </section>
    </main>
  );
}
