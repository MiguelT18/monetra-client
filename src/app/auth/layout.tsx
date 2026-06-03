import { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Autenticación del usuario",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh h-auto flex flex-col items-center justify-center relative">
      <Link
        href="/"
        className="fixed top-5 left-5 z-50 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background/70 backdrop-blur-md text-foreground/70 hover:text-foreground hover:bg-surface transition-all"
      >
        <FiArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>
      {children}
    </main>
  );
}
