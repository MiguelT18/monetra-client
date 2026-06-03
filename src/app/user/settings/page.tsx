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
  FiMail,
} from "react-icons/fi";
import { FaRegTrashAlt, FaUserAlt } from "react-icons/fa";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { resizeImageFile } from "@/lib/resizeImage";
import { PhoneInput } from "@/components/UI/PhoneInput";

const BIO_MAX = 160;

function roleTone(role: Role): "blue" | "emerald" | "violet" | "amber" | "red" {
  if (role === "STUDENT") return "amber";
  if (role === "CREATOR") return "violet";
  if (role === "ADMIN") return "red";
  return "emerald";
}

function roleLabel(role: Role) {
  if (role === "STUDENT") return "Estudiante";
  if (role === "CREATOR") return "Creador";
  if (role === "ADMIN") return "Admin";
  return "Afiliado";
}

function roleSettingsIntro(role: Role) {
  if (role === "STUDENT")
    return "Perfil, seguridad y preferencias de aprendizaje. Las opciones específicas de estudiante aparecen abajo.";
  if (role === "CREATOR")
    return "Gestiona tu identidad de marca, pagos como vendedor y preferencias de catálogo.";
  if (role === "ADMIN")
    return "Configuración general de la plataforma, gestión de logros y control de usuarios.";
  return "Configura cómo cobras comisiones, tus enlaces de tracking y datos fiscales básicos.";
}

export default function UserSettings() {
  const { user, loading, updateProfile, changeRole } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const tone = roleTone(role);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    setBio(user.bio ?? "");
    setAvatar(user.avatar);
    setPhone(user.phone ?? "");
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

    let avatarUrl = avatar;

    if (avatar && user && avatar.startsWith("data:")) {
      const uploadRes = await fetch("/api/users/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: avatar }),
      });

      const uploadResult = await uploadRes.json();

      if (!uploadRes.ok) {
        setSaving(false);
        setFeedback({ type: "error", message: uploadResult.message ?? "Error al subir la imagen" });
        return;
      }

      avatarUrl = uploadResult.data?.avatar ?? avatar;
    }

    const result = await updateProfile({
      bio: bio.trim() || null,
      avatar: avatarUrl,
      phone: phone || null,
    });

    setSaving(false);

    if (!result.ok) {
      setFeedback({ type: "error", message: result.message });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    setFeedback({ type: "success", message: result.message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const profileDirty =
    user &&
    (bio !== (user.bio ?? "") || avatar !== (user.avatar ?? null) || phone !== (user.phone ?? ""));

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
            Tu foto, nombre, usuario y teléfono se muestran en la plataforma.
          </p>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3">
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
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-gray-800 transition hover:bg-primary/5 dark:text-white dark:hover:bg-primary/10 cursor-pointer"
              >
                <FiCamera size={14} />
                Cambiar foto
              </button>

              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar(null)}
                  className="text-xs text-gray-500 underline-offset-2 hover:underline dark:text-white/45 cursor-pointer flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <FaRegTrashAlt />
                  Quitar foto
                </button>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-white/55">
                  <FiUser size={14} />
                  Nombre completo
                </span>
                <input
                  value={user?.fullname ?? ""}
                  readOnly
                  className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-gray-900 outline-none dark:bg-white/4 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-white/55">
                  <FiUser size={14} />
                  Usuario
                </span>
                <input
                  value={`@${user?.username ?? ""}`}
                  readOnly
                  className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-gray-900 outline-none dark:bg-white/4 dark:text-white"
                />
              </label>

              <label className="block">
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
                  className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-white/4 dark:text-white"
                />
                <span className="mt-1 block text-right text-xs text-gray-500 dark:text-white/40">
                  {bio.length}/{BIO_MAX}
                </span>
              </label>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Cuenta">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-white/55">
                <FiMail size={14} />
                Correo electrónico
              </span>
              <input
                readOnly
                value={user?.email ?? ""}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-gray-900 outline-none dark:bg-white/4 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-white/55">
                <FiAlignLeft size={14} className="rotate-90" />
                Teléfono
              </span>
              <PhoneInput value={phone} onChange={setPhone} />
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

        {role === "ADMIN" && (
          <SectionCard title="Administración de la plataforma">
            <p className="mb-4 text-sm text-gray-600 dark:text-white/55">
              Gestiona los logros, usuarios y configuración general de la plataforma.
            </p>
            <div className="flex flex-wrap gap-2">
              <QuickLink href="/admin/achievements" label="Gestionar logros" variant="primary" />
              <QuickLink href="/admin/users" label="Usuarios" variant="outline" />
            </div>
          </SectionCard>
        )}

        {role === "ADMIN" && (
          <SectionCard title="Salir del modo administrador">
            <p className="mb-4 text-sm text-gray-600 dark:text-white/55">
              Si ya no necesitas gestionar la plataforma, puedes volver al rol de
              estudiante. Siempre podrás retomar el rol de admin más tarde si es necesario.
            </p>
            <button
              type="button"
              onClick={async () => {
                await changeRole("STUDENT");
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-all hover:bg-red-500/20 dark:border-red-500/20 dark:text-red-300"
            >
              Salir del rol admin
            </button>
          </SectionCard>
        )}

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

        {role === "CREATOR" && (
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

        <div className={`mt-5 flex ${feedback ? "justify-between items-center" : "justify-end"}`}>
          {feedback && (
            <p
              className={`block text-sm ${feedback.type === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500"
                }`}
            >
              {feedback.message}
            </p>
          )}

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving || !profileDirty}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Guardando..." : "Guardar perfil"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
