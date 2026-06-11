"use client";

import { motion } from "motion/react";
import LogoIcon from "@/icons/Logo";
import Link from "next/link";
import type { ReactNode } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { requestOAuthUrl, type OAuthProvider } from "@/lib/auth-api";
import { useNotification } from "@/hooks/useNotification";
import { useState } from "react";

export const AUTH_INPUT_CLASS =
  "w-full rounded-lg bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition hover:border-[#7C3AED] hover:ring-1 hover:ring-[#7C3AED]";

export const AUTH_FIELD_VARIANTS = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export const AUTH_STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export function AuthBackground() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#7C3AED20,transparent_60%)] dark:bg-[radial-gradient(circle_at_top,#7C3AED40,transparent_60%)] backdrop-blur-2xl pointer-events-none" />
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="relative flex w-full min-h-dvh items-center justify-center bg-gray-50 py-10 dark:bg-[#0B0F14]">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl max-md:mx-5 max-md:p-4 dark:border-white/10 dark:bg-white/5 dark:shadow-black/30"
      >
        <div className="mb-6 flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="rounded-lg border border-gray-200 bg-gray-100 p-2 text-black dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <LogoIcon width={32} height={32} />
          </motion.div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-gray-600 dark:text-white/55">{subtitle}</p>
          ) : null}
        </div>

        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </motion.div>
    </section>
  );
}

export function AuthDivider({ label = "o continúa con" }: { label?: string }) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-gray-200 dark:border-white/10" />
      </div>
      <p className="relative mx-auto w-fit bg-white px-3 text-xs text-gray-500 dark:bg-[#12121a] dark:text-white/40">
        {label}
      </p>
    </div>
  );
}

const SOCIAL: { provider: OAuthProvider; label: string; icon: ReactNode }[] = [
  {
    provider: "google",
    label: "Google",
    icon: <FcGoogle size={18} />,
  },
  {
    provider: "github",
    label: "GitHub",
    icon: <FaGithub size={18} className="text-gray-900 dark:text-white" />,
  },
];

export function SocialAuthButtons() {
  const { notify } = useNotification();
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
    null,
  );

  const handleOAuth = async (provider: OAuthProvider) => {
    setLoadingProvider(provider);
    try {
      const url = await requestOAuthUrl(provider);
      window.location.assign(url);
    } catch (err) {
      console.error("[oauth]", err);
      notify(
        "error",
        err instanceof Error ? err.message : "Error al conectar con el proveedor",
      );
      setLoadingProvider(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {SOCIAL.map(({ provider, label, icon }) => (
        <motion.button
          key={provider}
          type="button"
          disabled={loadingProvider !== null}
          whileHover={{ scale: loadingProvider ? 1 : 1.02 }}
          whileTap={{ scale: loadingProvider ? 1 : 0.98 }}
          onClick={() => handleOAuth(provider)}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 transition hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/85 dark:hover:border-[#7C3AED]/50 dark:hover:bg-[#7C3AED]/10 cursor-pointer"
        >
          {icon}
          {loadingProvider === provider ? "Conectando…" : label}
        </motion.button>
      ))}
    </div>
  );
}

export function AuthSubmitButton({
  loading,
  loadingLabel,
  label,
}: {
  loading: boolean;
  loadingLabel: string;
  label: string;
}) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.03 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      className="w-full cursor-pointer rounded-lg bg-[#7C3AED] py-2.5 font-medium text-white shadow-lg shadow-[#7C3AED]/30 hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? loadingLabel : label}
    </motion.button>
  );
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="text-center text-sm text-gray-600 dark:text-white/60">
      {text}{" "}
      <Link
        href={href}
        className="font-medium text-[#7C3AED] transition hover:text-[#9F7AEA]"
      >
        {linkText}
      </Link>
    </p>
  );
}
