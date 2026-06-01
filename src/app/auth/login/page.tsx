"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { FiEye, FiEyeOff } from "react-icons/fi";
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

interface LoginUserProps {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { notify } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserProps>();

  const onSubmit = async (data: LoginUserProps) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        notify("error", result.message);
        return;
      }

      router.push("/user/dashboard");
      notify("success", result.message);
    } catch (error) {
      console.error("[login]", error);
      notify("error", "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle="Accede con tu correo o con un proveedor social."
      footer={
        <AuthFooterLink
          text="¿No tienes cuenta?"
          linkText="Crear una cuenta"
          href="/auth/register"
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
            {...register("email", { required: "El correo es obligatorio" })}
            className={AUTH_INPUT_CLASS}
            type="email"
            id="email"
            autoComplete="email"
            placeholder="john.doe@test.xyz"
          />
          {errors.email ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.email.message}
            </span>
          ) : null}
        </motion.div>

        <motion.div
          variants={AUTH_FIELD_VARIANTS}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="password"
              className="text-sm text-gray-600 dark:text-white/70"
            >
              Contraseña
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-[#7C3AED] transition hover:text-[#9F7AEA]"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <input
              {...register("password", {
                required: "La contraseña es obligatoria",
              })}
              className={AUTH_INPUT_CLASS}
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
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

        <motion.div variants={AUTH_FIELD_VARIANTS}>
          <AuthSubmitButton
            loading={loading}
            loadingLabel="Iniciando sesión…"
            label="Iniciar sesión"
          />
        </motion.div>

        <motion.div variants={AUTH_FIELD_VARIANTS} className="space-y-3">
          <AuthDivider />
          <SocialAuthButtons />
        </motion.div>
      </motion.form>
    </AuthCard>
  );
}
