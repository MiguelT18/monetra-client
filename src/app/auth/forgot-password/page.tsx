"use client";

import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { requestForgotPassword } from "@/lib/auth-api";
import {
  AuthCard,
  AuthDivider,
  AUTH_INPUT_CLASS,
  AUTH_FIELD_VARIANTS,
  AUTH_STAGGER,
  AuthSubmitButton,
  AuthFooterLink,
  SocialAuthButtons,
} from "@/components/auth/auth-ui";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { notify } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    try {
      const result = await requestForgotPassword(data.email);
      setSent(true);
      notify("success", result.message);
    } catch (error) {
      console.error("[forgot-password]", error);
      notify("error", "No se pudo enviar el correo. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle={
        sent
          ? "Revisa tu bandeja de entrada y sigue el enlace del correo."
          : "Te enviaremos un enlace para restablecer tu contraseña."
      }
      footer={
        <AuthFooterLink
          text="¿Recordaste tu contraseña?"
          linkText="Volver a iniciar sesión"
          href="/auth/login"
        />
      }
    >
      {!sent ? (
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial="hidden"
          animate="visible"
          variants={AUTH_STAGGER}
          className="space-y-4"
        >
          <motion.div
            variants={AUTH_FIELD_VARIANTS}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-1"
          >
            <label
              htmlFor="email"
              className="text-sm text-gray-600 dark:text-white/70"
            >
              Correo electrónico
            </label>
            <input
              {...register("email", {
                required: "El correo es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Correo no válido",
                },
              })}
              className={AUTH_INPUT_CLASS}
              type="email"
              id="email"
              autoComplete="email"
              placeholder="tu@email.com"
            />
            {errors.email ? (
              <span className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </span>
            ) : null}
          </motion.div>

          <motion.div variants={AUTH_FIELD_VARIANTS}>
            <AuthSubmitButton
              loading={loading}
              loadingLabel="Enviando…"
              label="Enviar enlace"
            />
          </motion.div>

          <motion.div variants={AUTH_FIELD_VARIANTS}>
            <AuthDivider />
            <div className="pt-3">
              <SocialAuthButtons />
            </div>
          </motion.div>
        </motion.form>
      ) : (
        <p className="rounded-lg border border-[#7C3AED]/25 bg-[#7C3AED]/5 px-4 py-3 text-sm text-gray-700 dark:text-white/70">
          Si no ves el correo en unos minutos, revisa spam o solicita un nuevo
          enlace desde esta página.
        </p>
      )}
    </AuthCard>
  );
}
