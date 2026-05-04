import { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { IoIosArrowBack } from "react-icons/io";

export const metadata: Metadata = {
  title: "Autenticación del usuario",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh h-dvh flex flex-col items-center justify-center relative">
      {children}

      <Link
        href="/"
        className="flex items-center gap-1 text-sm absolute top-5 left-5 border rounded-md border-slate-500/70 text-black/70 hover:bg-slate-500/10 dark:border-slate-500/30 dark:text-white/70 px-2 py-1 dark:hover:bg-slate-500/10 transition-colors"
      >
        <IoIosArrowBack />
        Inicio
      </Link>
    </main>
  );
}
