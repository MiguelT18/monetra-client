"use client";

import { motion } from "motion/react";
import type { Role } from "@/types/user";
import { useProfile } from "@/hooks/useProfile";
import { UserPageHeader, RoleBadge } from "@/components/user/userShell";
import {
  FiUser,
  FiLock,
  FiBell,
  FiCreditCard,
  FiLink2,
  FiCamera,
  FiAlignLeft,
  FiMail,
  FiShield,
  FiSave,
  FiArrowRight,
  FiRotateCcw,
  FiExternalLink,
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
    return "Perfil, seguridad y preferencias de aprendizaje.";
  if (role === "CREATOR")
    return "Gestiona tu identidad de marca, pagos y preferencias de catálogo.";
  if (role === "ADMIN")
    return "Configuración general de la plataforma y control de usuarios.";
  return "Configura cómo cobras comisiones y tus enlaces de tracking.";
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-white/45 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-white/45">
        <Icon size={12} />
        {label}
      </label>
      <div className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-white/4">
        {value || "—"}
      </div>
    </div>
  );
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
  const [avatarProcessing, setAvatarProcessing] = useState(false);
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
    setAvatarProcessing(true);

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
      setAvatarProcessing(false);
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

  const handleReset = () => {
    if (!user) return;
    setBio(user.bio ?? "");
    setAvatar(user.avatar);
    setPhone(user.phone ?? "");
    setFeedback(null);
  };

  const profileDirty =
    user &&
    (bio !== (user.bio ?? "") || avatar !== (user.avatar ?? null) || phone !== (user.phone ?? ""));

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="h-48 rounded-2xl bg-gray-200 dark:bg-white/10" />
        <div className="h-40 rounded-2xl bg-gray-200 dark:bg-white/10" />
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

      <div className="space-y-5">
        {/* Profile Section */}
        <SettingsSection
          icon={FiUser}
          title="Perfil público"
          description="Tu foto, nombre y descripción se muestran en la plataforma"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="group relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-border bg-gray-100 dark:bg-white/5 shadow-sm cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
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
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <FiCamera size={14} />
                  <span className="text-[11px] font-medium">Cambiar</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarProcessing}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer"
                >
                  {avatarProcessing ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  ) : (
                    <FiCamera size={13} />
                  )}
                  {avatarProcessing ? "Procesando..." : "Cambiar foto"}
                </button>

                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar(null)}
                    className="inline-flex items-center gap-1 text-[11px] text-gray-400 transition-colors hover:text-red-500 dark:text-white/35 cursor-pointer"
                  >
                    <FaRegTrashAlt size={10} />
                    Quitar foto
                  </button>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-1 flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ReadOnlyField icon={FiUser} label="Nombre completo" value={user?.fullname ?? ""} />
                <ReadOnlyField icon={FiUser} label="Usuario" value={`@${user?.username ?? ""}`} />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-white/45">
                  <FiAlignLeft size={12} />
                  Descripción
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                  rows={3}
                  maxLength={BIO_MAX}
                  placeholder="Cuéntanos sobre ti, tu experiencia o lo que ofreces..."
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:text-white dark:placeholder-white/30"
                />
                <div className="mt-1.5 flex justify-end">
                  <span className="text-[10px] font-medium tabular-nums text-gray-400 dark:text-white/30">
                    {bio.length}/{BIO_MAX}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection
          icon={FiMail}
          title="Cuenta"
          description="Correo electrónico y teléfono de contacto"
        >
          <div className="space-y-4">
            <ReadOnlyField icon={FiMail} label="Correo electrónico" value={user?.email ?? ""} />

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-white/45">
                <FiAlignLeft size={12} className="rotate-90" />
                Teléfono
              </label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
          </div>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection
          icon={FiLock}
          title="Seguridad"
          description="Contraseña y preferencias de notificaciones"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer"
            >
              <FiLock size={15} />
              Cambiar contraseña
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer"
            >
              <FiBell size={15} />
              Notificaciones
            </button>
          </div>
        </SettingsSection>

        {/* Admin Section */}
        {role === "ADMIN" && (
          <SettingsSection
            icon={FiShield}
            title="Administración"
            description="Gestiona logros, usuarios y configuración de la plataforma"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <a
                  href="/admin/achievements"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg cursor-pointer"
                >
                  Gestionar logros
                  <FiArrowRight size={13} />
                </a>
                <a
                  href="/admin/users"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-xs font-medium text-gray-700 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer"
                >
                  Usuarios
                  <FiArrowRight size={13} />
                </a>
              </div>

              <div className="rounded-xl border border-red-200/60 bg-red-500/5 p-4 dark:border-red-500/20 dark:bg-red-500/5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <FiShield size={15} className="text-red-500 dark:text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Salir del modo administrador
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-white/45">
                      Volverás al rol de estudiante. Podrás retomar el rol de admin más tarde.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        await changeRole("STUDENT");
                        window.location.reload();
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-500/20 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/15 cursor-pointer"
                    >
                      Salir del rol admin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        )}

        {/* Student Section */}
        {role === "STUDENT" && (
          <SettingsSection
            icon={FiUser}
            title="Aprendizaje"
            description="Preferencias de estudio y acceso rápido"
          >
            <div className="flex flex-wrap gap-2">
              <a
                href="/user/courses"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-xs font-medium text-gray-700 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer"
              >
                Mis cursos
                <FiArrowRight size={13} />
              </a>
              <a
                href="/user/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg cursor-pointer"
              >
                Dashboard
                <FiArrowRight size={13} />
              </a>
            </div>
          </SettingsSection>
        )}

        {/* Creator Section */}
        {role === "CREATOR" && (
          <SettingsSection
            icon={FiCreditCard}
            title="Vendedor y pagos"
            description="Cuenta bancaria, datos fiscales y política de reembolsos"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border bg-background/60 px-3 py-2 text-xs text-gray-500 dark:text-white/45">
                <FiCreditCard size={13} />
                Método de cobro · pendiente
              </span>
              <a
                href="/user/products"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-xs font-medium text-gray-700 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer"
              >
                Mis productos
                <FiArrowRight size={13} />
              </a>
            </div>
          </SettingsSection>
        )}

        {/* Affiliate Section */}
        {role === "AFFILIATE" && (
          <SettingsSection
            icon={FiLink2}
            title="Afiliado y cobros"
            description="Comisiones y enlaces de tracking"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border bg-background/60 px-3 py-2 text-xs text-gray-500 dark:text-white/45">
                <FiCreditCard size={13} />
                Cuenta de pago
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border bg-background/60 px-3 py-2 text-xs text-gray-500 dark:text-white/45">
                <FiLink2 size={13} />
                Dominios permitidos
              </span>
              <a
                href="/user/affiliations"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-xs font-medium text-gray-700 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white/80 dark:hover:bg-primary/10 cursor-pointer"
              >
                Mis afiliaciones
                <FiArrowRight size={13} />
              </a>
            </div>
          </SettingsSection>
        )}

        {/* Save Bar */}
        <div className="sticky bottom-0 z-9999 -mx-1 rounded-2xl border border-primary/20 bg-linear-to-r from-primary/5 via-surface to-primary/5 px-5 py-4 shadow-lg shadow-primary/5 backdrop-blur-md sm:px-6 dark:border-primary/10 dark:from-primary/10 dark:via-surface dark:to-primary/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {feedback && (
                <motion.p
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs font-medium ${
                    feedback.type === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {feedback.message}
                </motion.p>
              )}
              {!feedback && profileDirty && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Tienes cambios sin guardar
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/profile/${user?.username ?? ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-primary/40 hover:bg-primary/5 dark:text-white/70 dark:hover:bg-primary/10 cursor-pointer"
              >
                <FiExternalLink size={13} />
                Ver perfil
              </a>

              {profileDirty && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 dark:text-white/70 dark:hover:bg-primary/10 cursor-pointer"
                >
                  <FiRotateCcw size={13} />
                  Descartar
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving || !profileDirty}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiSave size={15} />
                )}
                {saving ? "Guardando..." : "Guardar perfil"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
