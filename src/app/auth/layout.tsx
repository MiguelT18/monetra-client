"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { IoIosArrowBack } from "react-icons/io";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh h-dvh flex flex-col items-center justify-center px-4 relative">
      {children}

      <Link
        href="/"
        className="flex items-center gap-1 text-md absolute top-5 left-5 border rounded-md border-slate-500/30 text-white/70 px-2 py-1 hover:bg-slate-500/10 transition-colors"
      >
        <IoIosArrowBack />
        Inicio
      </Link>
    </main>
  );
}
