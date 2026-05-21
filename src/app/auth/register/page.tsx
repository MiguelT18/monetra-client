"use client";

import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
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

interface RegisterUserProps {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUserProps>();

  const onSubmit = async (data: RegisterUserProps) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          fullname: `${data.firstname} ${data.lastname}`.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        notify("error", result.message);
        return;
      }

      notify("success", result.message);
      router.push("/auth/login");
    } catch (error) {
      console.error("[register]", error);
      notify("error", "Error registrando al usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Crea una cuenta"
      subtitle="Regístrate con email o continúa con Google o GitHub."
      footer={
        <AuthFooterLink
          text="¿Ya tienes una cuenta?"
          linkText="Inicia sesión"
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
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            variants={AUTH_FIELD_VARIANTS}
            className="flex flex-col gap-1"
          >
            <label
              htmlFor="firstname"
              className="text-sm text-gray-600 dark:text-white/70"
            >
              Nombres
            </label>
            <input
              {...register("firstname", {
                required: "El nombre es obligatorio",
              })}
              className={AUTH_INPUT_CLASS}
              type="text"
              id="firstname"
              autoComplete="given-name"
              placeholder="John"
            />
            {errors.firstname ? (
              <span className="mt-1 text-xs text-red-500">
                {errors.firstname.message}
              </span>
            ) : null}
          </motion.div>

          <motion.div
            variants={AUTH_FIELD_VARIANTS}
            className="flex flex-col gap-1"
          >
            <label
              htmlFor="lastname"
              className="text-sm text-gray-600 dark:text-white/70"
            >
              Apellidos
            </label>
            <input
              {...register("lastname", {
                required: "El apellido es obligatorio",
              })}
              className={AUTH_INPUT_CLASS}
              type="text"
              id="lastname"
              autoComplete="family-name"
              placeholder="Doe"
            />
            {errors.lastname ? (
              <span className="mt-1 text-xs text-red-500">
                {errors.lastname.message}
              </span>
            ) : null}
          </motion.div>
        </div>

        <motion.div variants={AUTH_FIELD_VARIANTS} className="flex flex-col gap-1">
          <label
            htmlFor="username"
            className="text-sm text-gray-600 dark:text-white/70"
          >
            Nombre de usuario
          </label>
          <input
            {...register("username", {
              required: "El nombre de usuario es obligatorio",
            })}
            className={AUTH_INPUT_CLASS}
            type="text"
            id="username"
            autoComplete="username"
            placeholder="john_doe"
          />
          {errors.username ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.username.message}
            </span>
          ) : null}
        </motion.div>

        <motion.div variants={AUTH_FIELD_VARIANTS} className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="text-sm text-gray-600 dark:text-white/70"
          >
            Email
          </label>
          <input
            {...register("email", {
              required: "El correo electrónico es obligatorio",
            })}
            className={AUTH_INPUT_CLASS}
            type="email"
            id="email"
            autoComplete="email"
            placeholder="john_doe@gmail.com"
          />
          {errors.email ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.email.message}
            </span>
          ) : null}
        </motion.div>

        <motion.div variants={AUTH_FIELD_VARIANTS} className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-sm text-gray-600 dark:text-white/70"
          >
            Contraseña
          </label>
          <input
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 8,
                message: "Mínimo 8 caracteres",
              },
            })}
            className={AUTH_INPUT_CLASS}
            type="password"
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
          />
          {errors.password ? (
            <span className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </span>
          ) : null}
        </motion.div>

        <motion.div variants={AUTH_FIELD_VARIANTS}>
          <AuthSubmitButton
            loading={loading}
            loadingLabel="Registrando…"
            label="Registrarse"
          />
        </motion.div>

        <motion.div variants={AUTH_FIELD_VARIANTS} className="space-y-3">
          <AuthDivider label="o regístrate con" />
          <SocialAuthButtons />
        </motion.div>
      </motion.form>
    </AuthCard>
  );
}
