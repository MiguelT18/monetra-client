"use client";

import { useState, useRef, useEffect } from "react";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserNavbar } from "@/components/UI/navbar/UserNavbar";
import { UserAside } from "@/components/UI/UserAside";
import { RoleLayoutOverlay } from "@/components/UI/RoleLayoutOverlay";
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
    <main data-role={role?.toLowerCase()} className="relative min-h-dvh h-full w-full bg-background p-2 max-md:space-y-2 md:grid md:h-dvh md:min-h-0 md:grid-cols-[auto_1fr] md:grid-rows-[auto_1fr] md:gap-2 md:overflow-hidden">
      <RoleLayoutOverlay />

      <UserNavbar
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
        buttonRef={buttonRef}
      />
      <UserAside isOpen={isOpen} onToggle={() => setIsOpen((prev) => !prev)} asideRef={asideRef} buttonRef={buttonRef} />

      <section className="role-surface relative row-start-2 col-start-2 min-h-0 overflow-hidden rounded-2xl shadow-sm">
        <div className="app-scrollbar h-full overflow-y-auto rounded-2xl p-3 sm:p-4">
          {children}
        </div>
      </section>
    </main>
  );
}
