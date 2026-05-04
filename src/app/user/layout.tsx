import { ReactNode } from "react";
import { UserAside } from "@/components/UI/UserAside";
import { UserNavbar } from "@/components/UI/UserNavbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard del usuario",
};

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh h-full w-full md:grid md:grid-cols-[auto_1fr] grid-rows-[auto_1fr] p-2">
      <UserNavbar />

      <UserAside />

      <section className="bg-[#101826]/30 md:ml-2 rounded-lg p-4">
        {children}
      </section>
    </main>
  );
}
