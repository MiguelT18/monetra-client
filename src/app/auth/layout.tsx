import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Autenticación del usuario",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh h-auto flex flex-col items-center justify-center relative">
      {children}
    </main>
  );
}
