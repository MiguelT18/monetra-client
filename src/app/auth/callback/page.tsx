"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/hooks/useNotification";
import { completeOAuthCallback } from "@/lib/auth-api";
import { AuthCard } from "@/components/auth/auth-ui";
import Link from "next/link";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const oauthError = params.get("error_description");

    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (!code) {
      setError("No se recibió el código de autorización");
      return;
    }

    (async () => {
      const { ok, result } = await completeOAuthCallback(code);

      if (!ok) {
        setError(result.message ?? "Error al completar el inicio de sesión");
        notify("error", result.message ?? "Error al iniciar sesión");
        return;
      }

      notify("success", result.message ?? "Iniciaste sesión");
      router.replace("/user/dashboard");
    })();
  }, [router, notify]);

  if (error) {
    return (
      <AuthCard title="No se pudo iniciar sesión" subtitle={error}>
        <Link
          href="/auth/login"
          className="inline-flex w-full justify-center rounded-lg bg-[#7C3AED] py-2.5 text-sm font-medium text-white shadow-lg shadow-[#7C3AED]/30 hover:bg-[#6D28D9]"
        >
          Volver al login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Completando acceso"
      subtitle="Estamos verificando tu cuenta con el proveedor…"
    >
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#7C3AED]/30 border-t-[#7C3AED]" />
        <p className="text-xs text-gray-500 dark:text-white/40">
          Un momento, por favor
        </p>
      </div>
    </AuthCard>
  );
}
