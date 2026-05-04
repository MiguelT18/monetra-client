"use client";

import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import LogoIcon from "@/icons/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";

interface RegisterUserProps {
  username: string;
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
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        notify("error", result.message);
        setLoading(false);
        return;
      }

      notify("success", result.message);
      router.push("/auth/login");
    } catch (error) {
      console.error("[ERROR]:", error);
      notify("error", "Error registrando al usuario");
      setLoading(false);
    }
  };

  return (
    <section className="relative size-full flex items-center justify-center bg-gray-50 dark:bg-[#0B0F14] py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#7C3AED20,transparent_60%)] dark:bg-[radial-gradient(circle_at_top,#7C3AED40,transparent_60%)] backdrop-blur-2xl pointer-events-none" />

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-xl max-md:p-4 p-8 shadow-xl dark:shadow-black/30 max-md:mx-5"
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"
          >
            <LogoIcon width={32} height={32} />
          </motion.div>
        </div>

        <div className="space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Crea una cuenta
          </h1>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.07,
                },
              },
            }}
            className="space-y-4"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-1"
            >
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
                className="w-full rounded-lg bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition hover:border-[#7C3AED] hover:ring-1 hover:ring-[#7C3AED]"
                type="text"
                id="username"
                placeholder="john_doe"
              />

              {errors?.username && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </span>
              )}
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-1"
            >
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
                className="w-full rounded-lg bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition hover:border-[#7C3AED] hover:ring-1 hover:ring-[#7C3AED]"
                type="email"
                id="email"
                placeholder="john_doe@gmail.com"
              />

              {errors?.email && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </span>
              )}
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-1"
            >
              <label
                htmlFor="password"
                className="text-sm text-gray-600 dark:text-white/70"
              >
                Contraseña
              </label>

              <input
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
                className="w-full rounded-lg bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition hover:border-[#7C3AED] hover:ring-1 hover:ring-[#7C3AED]"
                type="password"
                id="password"
                placeholder="••••••••"
              />

              {errors?.password && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </span>
              )}
            </motion.div>
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-lg bg-[#7C3AED] py-2 font-medium text-white shadow-lg shadow-[#7C3AED]/30 hover:bg-[#6D28D9] cursor-pointer"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </motion.button>
        </div>

        <p className="text-sm text-gray-600 dark:text-white/60 text-center pt-6">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/auth/login"
            className="text-[#7C3AED] hover:text-[#9F7AEA] transition"
          >
            Inicia sesión
          </Link>
        </p>
      </motion.form>
    </section>
  );
}
