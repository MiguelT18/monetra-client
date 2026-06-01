"use client";

import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/hooks/useNotification";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  establishRecoverySession,
  updatePassword,
} from "@/lib/auth-api";
import {
  AuthCard,
  AUTH_INPUT_CLASS,
  AUTH_FIELD_VARIANTS,
  AUTH_STAGGER,
  AuthSubmitButton,
  AuthFooterLink,
} from "@/components/auth/auth-ui";
import Link from "next/link";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

function parseHashTokens() {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  const type = params.get("type");
  if (!access_token || !refresh_token || type !== "recovery") return null;
  return { access_token, refresh_token };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch("password");

  useEffect(() => {
    const tokens = parseHashTokens();
    if (!tokens) {
      setSessionError(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const { ok, result } = await establishRecoverySession(
        tokens.access_token,
        tokens.refresh_token,
      );

      if (cancelled) return;

      if (!ok) {
        setSessionError(true);
        notify("error", result.message ?? "Enlace inválido o expirado");
        return;
      }

      setSessionReady(true);
      window.history.replaceState(null, "", "/auth/reset-password");
    })();

    return () => {
      cancelled = true;
    };
  }, [notify]);

  const onSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    try {
      const { ok, result } = await updatePassword(data.password);

      if (!ok) {
        notify("error", result.message ?? "No se pudo actualizar la contraseña");
        return;
      }

      notify("success", result.message ?? "Contraseña actualizada");
      router.push("/user/dashboard");
    } catch (error) {
      console.error("[reset-password]", error);
      notify("error", "Error al guardar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (sessionError) {
    return (
      <AuthCard
        title="Enlace no válido"
        subtitle="El enlace ha expirado o ya fue utilizado."
        footer={
          <AuthFooterLink
            text="¿Necesitas uno nuevo?"
            linkText="Solicitar recuperación"
            href="/auth/forgot-password"
          />
        }
      >
        <Link
          href="/auth/login"
          className="inline-flex w-full justify-center rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-800 transition hover:border-[#7C3AED]/50 dark:border-white/10 dark:text-white"
        >
          Ir a iniciar sesión
        </Link>
      </AuthCard>
    );
  }

  if (!sessionReady) {
    return (
      <AuthCard
        title="Restablecer contraseña"
        subtitle="Validando tu enlace de recuperación…"
      >
        <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Nueva contraseña"
      subtitle="Elige una contraseña segura de al menos 8 caracteres."
      footer={
        <AuthFooterLink
          text="¿Ya tienes acceso?"
          linkText="Iniciar sesión"
          href="/auth/login"
        />
      }
    >
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        initial="hidden"
        animate="visible"
        variants={AUTH_STAGGER}
        className="space-y-4"
      >
        <motion.div
          variants={AUTH_FIELD_VARIANTS}
          className="flex flex-col gap-1"
        >
          <label
            htmlFor="password"
            className="text-sm text-gray-600 dark:text-white/70"
          >
            Nueva contraseña
          </label>
          <div className="flex items-center gap-2">
            <input
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 8,
                  message: "Mínimo 8 caracteres",
                },
              })}
              className={AUTH_INPUT_CLASS}
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="flex h-[42px] min-w-[42px] items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-400 transition-colors hover:text-gray-600 dark:border-white/10 dark:bg-white/5 dark:hover:text-white/70"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </span>
          ) : null}
        </motion.div>

        <motion.div
          variants={AUTH_FIELD_VARIANTS}
          className="flex flex-col gap-1"
        >
          <label
            htmlFor="confirmPassword"
            className="text-sm text-gray-600 dark:text-white/70"
          >
            Confirmar contraseña
          </label>
          <div className="flex items-center gap-2">
            <input
              {...register("confirmPassword", {
                required: "Confirma la contraseña",
                validate: (value) =>
                  value === password || "Las contraseñas no coinciden",
              })}
              className={AUTH_INPUT_CLASS}
              type={showConfirm ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="flex h-[42px] min-w-[42px] items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-400 transition-colors hover:text-gray-600 dark:border-white/10 dark:bg-white/5 dark:hover:text-white/70"
              tabIndex={-1}
            >
              {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.confirmPassword ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </span>
          ) : null}
        </motion.div>

        <motion.div variants={AUTH_FIELD_VARIANTS}>
          <AuthSubmitButton
            loading={loading}
            loadingLabel="Guardando…"
            label="Guardar contraseña"
          />
        </motion.div>
      </motion.form>
    </AuthCard>
  );
}
