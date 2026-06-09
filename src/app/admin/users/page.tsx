"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  FiSearch, FiInbox, FiSend, FiSlash, FiMessageSquare, FiAlertTriangle,
} from "react-icons/fi";
import { Modal } from "@/components/UI/Modal";
import { useNotification } from "@/hooks/useNotification";
import type { UserProfile } from "@/types/user";

function UserAvatar({ user, className }: { user: UserProfile; className?: string }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        className={`shrink-0 rounded-full object-cover ${className ?? "h-10 w-10"}`}
      />
    );
  }
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-white/10 dark:text-white/70 ${className ?? "h-10 w-10"}`}>
      {(user.fullname?.[0] ?? user.username?.[0] ?? "?").toUpperCase()}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notifUser, setNotifUser] = useState<UserProfile | null>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [banConfirmUser, setBanConfirmUser] = useState<UserProfile | null>(null);
  const { notify } = useNotification();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setUsers(json.data.users ?? []);
        setTotal(json.data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleBan(user: UserProfile) {
    setBanConfirmUser(user);
  }

  async function handleBanConfirm() {
    const user = banConfirmUser;
    if (!user) return;
    setBanConfirmUser(null);
    const banned = !user.banned;
    const res = await fetch(`/api/users/${user.id}/ban`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned }),
    });
    const json = await res.json();
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, banned } : u)),
      );
      const name = user.fullname ?? user.username ?? "Usuario";
      notify(banned ? "warning" : "success", banned ? `${name} suspendido` : `${name} restaurado`);
    } else {
      notify("error", json.message ?? "Error al actualizar el usuario");
    }
  }

  async function handleSendNotification() {
    if (!notifUser || !notifTitle || !notifMessage) return;
    setSending(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: notifUser.id,
          title: notifTitle,
          message: notifMessage,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        notify("success", "Notificación enviada correctamente");
        setNotifUser(null);
        setNotifTitle("");
        setNotifMessage("");
      } else {
        notify("error", json.message ?? "Error al enviar la notificación");
      }
    } catch {
      notify("error", "Error de conexión al enviar la notificación");
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/55">
          {total > 0
            ? `${total} usuario${total !== 1 ? "s" : ""} registrado${total !== 1 ? "s" : ""}`
            : "Gestiona los usuarios de la plataforma"}
        </p>
      </div>

      <div className="mb-5">
        <div className="relative max-w-md">
          <FiSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, usuario o email…"
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition hover:border-primary hover:ring-1 hover:ring-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FiInbox size={40} className="mb-3 text-gray-300 dark:text-white/20" />
          <p className="text-sm font-medium text-gray-500 dark:text-white/50">
            {search
              ? "No se encontraron usuarios con esos filtros"
              : "No hay usuarios registrados"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 shadow-sm transition hover:border-primary/20 ${
                user.banned
                  ? "border-red-200 bg-red-50/50 dark:border-red-500/20 dark:bg-red-500/5"
                  : "border-border bg-surface"
              }`}
            >
              <UserAvatar user={user} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user.fullname ?? user.username ?? "Sin nombre"}
                  </p>
                  {user.banned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300">
                      <FiSlash size={10} />
                      Suspendido
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-gray-400 dark:text-white/40">
                  {user.email}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setNotifUser(user)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-gray-400 transition hover:border-primary/40 hover:text-primary dark:hover:border-primary/40"
                  title="Enviar notificación"
                >
                  <FiMessageSquare size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleBan(user)}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border transition ${
                    user.banned
                      ? "border-emerald-300 text-emerald-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400"
                      : "border-red-200 text-red-500 hover:border-red-400 hover:text-red-600 dark:border-red-500/30 dark:text-red-400"
                  }`}
                  title={user.banned ? "Restaurar usuario" : "Suspender usuario"}
                >
                  <FiSlash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!notifUser}
        onClose={() => { setNotifUser(null); setNotifTitle(""); setNotifMessage(""); }}
        className="p-5"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            {notifUser && <UserAvatar user={notifUser} className="h-10 w-10 shrink-0" />}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificación del sistema
              </h2>
              <p className="truncate text-sm text-gray-500 dark:text-white/55">
                Para {notifUser?.fullname ?? notifUser?.username ?? notifUser?.email}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-white/40">
              <FiSend size={12} />
              Vista previa
            </div>
            <div className="rounded-lg border border-border bg-surface px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {notifTitle || "Título de la notificación"}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-white/70">
                {notifMessage || "El mensaje se mostrará aquí..."}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-white/45">
                Título
              </label>
              <span className={`text-xs ${notifTitle.length > 60 ? "text-red-500" : "text-gray-400"}`}>
                {notifTitle.length}/80
              </span>
            </div>
            <input
              type="text"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value.slice(0, 80))}
              placeholder="Ej: Bienvenido a la plataforma"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition hover:border-primary hover:ring-1 hover:ring-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-white/45">
                Mensaje
              </label>
              <span className={`text-xs ${notifMessage.length > 240 ? "text-red-500" : "text-gray-400"}`}>
                {notifMessage.length}/300
              </span>
            </div>
            <textarea
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value.slice(0, 300))}
              rows={3}
              placeholder="Escribe el mensaje que el usuario verá como notificación del sistema..."
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition hover:border-primary hover:ring-1 hover:ring-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => { setNotifUser(null); setNotifTitle(""); setNotifMessage(""); }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:text-white/70 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <motion.button
              type="button"
              onClick={handleSendNotification}
              disabled={sending || !notifTitle.trim() || !notifMessage.trim()}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Enviando...
                </>
              ) : (
                <>
                  <FiSend size={14} />
                  Enviar notificación
                </>
              )}
            </motion.button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
