"use client";

import { motion } from "motion/react";
import type { Role } from "@/types/user";
import { useProfile } from "@/hooks/useProfile";
import {
  UserPageHeader,
  SectionCard,
  RoleBadge,
  QuickLink,
} from "@/components/user/userShell";
import {
  FiUser,
  FiLock,
  FiBell,
  FiCreditCard,
  FiLink2,
  FiCamera,
  FiAlignLeft,
} from "react-icons/fi";
import { FaUserAlt } from "react-icons/fa";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { resizeImageFile } from "@/lib/resizeImage";

const BIO_MAX = 160;

function roleTone(role: Role): "blue" | "emerald" | "violet" {
  if (role === "STUDENT") return "blue";
  if (role === "PRODUCER") return "emerald";
  return "violet";
}

function roleLabel(role: Role) {
  if (role === "STUDENT") return "Estudiante";
  if (role === "PRODUCER") return "Productor";
  return "Afiliado";
}

function roleSettingsIntro(role: Role) {
  if (role === "STUDENT")
    return "Perfil, seguridad y preferencias de aprendizaje. Las opciones específicas de estudiante aparecen abajo.";
  if (role === "PRODUCER")
    return "Gestiona tu identidad de marca, pagos como vendedor y preferencias de catálogo.";
  return "Configura cómo cobras comisiones, tus enlaces de tracking y datos fiscales básicos.";
}

export default function UserSettings() {
  const { user, loading, updateProfile } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const tone = roleTone(role);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    setBio(user.bio ?? "");
    setAvatar(user.avatar);
  }, [user]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFeedback(null);

    try {
      const dataUrl = await resizeImageFile(file);
      setAvatar(dataUrl);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "No se pudo procesar la imagen",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setFeedback(null);

    const result = await updateProfile({
      bio: bio.trim() || null,
      avatar,
    });

    setSaving(false);

    if (!result.ok) {
      setFeedback({ type: "error", message: result.message });
      return;
    }

    setFeedback({ type: "success", message: result.message });
  };

  const profileDirty =
    user &&
    (bio !== (user.bio ?? "") || avatar !== (user.avatar ?? null));

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="h-40 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="h-40 rounded-xl bg-gray-200 dark:bg-white/10" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-auto flex max-w-3xl flex-col"
    >
      <UserPageHeader
        title="Configuración"
        description={roleSettingsIntro(role)}
        badge={<RoleBadge label={roleLabel(role)} tone={tone} />}
      />

      <div className="space-y-6">
        <SectionCard title="Perfil público">
          <p className="mb-5 text-sm text-gray-600 dark:text-white/55">
            Tu foto y descripción se muestran en la plataforma para cualquier rol.
          </p>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-gray-100 dark:bg-white/5">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Foto de perfil"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FaUserAlt
                      className="text-gray-400 dark:text-white/40"
                      size={32}
                    />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-gray-800 transition hover:bg-primary/5 dark:text-white dark:hover:bg-primary/10"
              >
                <FiCamera size={14} />
                Cambiar foto
              </button>

              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar(null)}
                  className="text-xs text-gray-500 underline-offset-2 hover:underline dark:text-white/45"
                >
                  Quitar foto
                </button>
              )}
            </div>

            <label className="block flex-1">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-white/55">
                <FiAlignLeft size={14} />
                Descripción
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                rows={4}
                maxLength={BIO_MAX}
                placeholder="Cuéntanos sobre ti, tu experiencia o lo que ofreces..."
                className="w-full resize-y rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-white/4 dark:text-white"
              />
              <span className="mt-1 block text-right text-xs text-gray-500 dark:text-white/40">
                {bio.length}/{BIO_MAX}
              </span>
            </label>
          </div>

          {feedback && (
            <p
              className={`mt-4 text-sm ${
                feedback.type === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving || !profileDirty}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Cuenta">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-white/55">
                <FiUser size={14} />
                Nombre visible
              </span>
              <input
                readOnly
                value={user?.fullname ?? ""}
                placeholder="Tu nombre"
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-gray-900 outline-none dark:bg-white/4 dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-white/55">
                <FiUser size={14} />
                Usuario
              </span>
              <input
                readOnly
                value={user?.username ?? ""}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-gray-900 outline-none dark:bg-white/4 dark:text-white"
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Seguridad y avisos">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-primary/5 dark:text-white dark:hover:bg-primary/10"
            >
              <FiLock size={16} />
              Contraseña
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-primary/5 dark:text-white dark:hover:bg-primary/10"
            >
              <FiBell size={16} />
              Notificaciones
            </button>
          </div>
        </SectionCard>

        {role === "STUDENT" && (
          <SectionCard title="Aprendizaje">
            <p className="mb-4 text-sm text-gray-600 dark:text-white/55">
              Preferencias de subtítulos, velocidad de video por defecto y
              recordatorios de estudio.
            </p>
            <div className="flex flex-wrap gap-2">
              <QuickLink href="/user/courses" label="Ir a mis cursos" variant="outline" />
              <QuickLink href="/user/dashboard" label="Dashboard" variant="primary" />
            </div>
          </SectionCard>
        )}

        {role === "PRODUCER" && (
          <SectionCard title="Vendedor y pagos">
            <p className="mb-4 text-sm text-gray-600 dark:text-white/55">
              Cuenta bancaria o wallet, datos fiscales simplificados y política
              de reembolsos visible para compradores.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-gray-500 dark:text-white/45">
                <FiCreditCard size={14} />
                Método de cobro · pendiente de conexión
              </span>
              <QuickLink href="/user/products" label="Mis productos" variant="outline" />
            </div>
          </SectionCard>
        )}

        {role === "AFFILIATE" && (
          <SectionCard title="Afiliado y cobros">
            <p className="mb-4 text-sm text-gray-600 dark:text-white/55">
              Define cómo recibes comisiones y revisa el estado de tus enlaces
              de tracking.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-gray-500 dark:text-white/45">
                <FiCreditCard size={14} />
                Cuenta de pago
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-gray-500 dark:text-white/45">
                <FiLink2 size={14} />
                Dominios permitidos en enlaces
              </span>
              <QuickLink href="/user/affiliations" label="Mis afiliaciones" variant="outline" />
            </div>
          </SectionCard>
        )}
      </div>
    </motion.div>
  );
}
