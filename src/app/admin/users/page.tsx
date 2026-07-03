"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  FiSearch, FiInbox, FiSlash, FiShield, FiCheckCircle, FiXCircle, FiFilter, FiRotateCcw,
} from "react-icons/fi";
import { Modal } from "@/components/UI/Modal";
import { Select } from "@/components/UI/Select";
import { useNotification } from "@/hooks/useNotification";
import type { UserProfile } from "@/types/user";

function getInitials(user: UserProfile) {
  return (user.fullname?.[0] ?? user.username?.[0] ?? "?").toUpperCase();
}

function isOnline(user: UserProfile): boolean {
  if (!user.lastSeenAt) return false;
  const diff = Date.now() - new Date(user.lastSeenAt).getTime();
  return diff < 5 * 60 * 1000;
}

function StatusBadge({ user }: { user: UserProfile }) {
  const online = isOnline(user);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
      online
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
        : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-white/40"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-500" : "bg-gray-400 dark:bg-white/25"}`} />
      {online ? "En línea" : "Desconectado"}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
    CREATOR: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    AFFILIATE: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    STUDENT: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[role] ?? styles.STUDENT}`}>
      {role === "ADMIN" ? "Admin" : role === "CREATOR" ? "Creador" : role === "AFFILIATE" ? "Afiliado" : "Estudiante"}
    </span>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [bannedFilter, setBannedFilter] = useState("ALL");

  const hasActiveFilters = roleFilter !== "ALL" || bannedFilter !== "ALL";

  function clearFilters() {
    setRoleFilter("ALL");
    setBannedFilter("ALL");
  }
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());
  const [confirmTarget, setConfirmTarget] = useState<{ user: UserProfile; type: "ban" | "make-admin" } | null>(null);
  const { notify } = useNotification();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (bannedFilter !== "ALL") params.set("banned", bannedFilter);
      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setUsers(json.data.users ?? []);
        setTotal(json.data.total ?? 0);
        setFetched(true);
      }
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, bannedFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function executeBan(user: UserProfile) {
    const name = user.fullname ?? user.username ?? "Usuario";
    const banned = !user.banned;

    setLoadingUsers((prev) => new Set(prev).add(user.id));
    try {
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
        notify(banned ? "warning" : "success", banned ? `${name} suspendido` : `${name} restaurado`);
      } else {
        notify("error", json.message ?? "Error al actualizar el usuario");
      }
    } finally {
      setLoadingUsers((prev) => { const next = new Set(prev); next.delete(user.id); return next; });
    }
  }

  async function executeMakeAdmin(user: UserProfile) {
    const name = user.fullname ?? user.username ?? "Usuario";

    setLoadingUsers((prev) => new Set(prev).add(user.id));
    try {
      const res = await fetch(`/api/users/${user.id}/make-admin`, { method: "PATCH" });
      const json = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: "ADMIN" } : u)),
        );
        notify("success", `${name} ahora es administrador`);
      } else {
        notify("error", json.message ?? "Error al promover a administrador");
      }
    } finally {
      setLoadingUsers((prev) => { const next = new Set(prev); next.delete(user.id); return next; });
    }
  }

  function handleConfirm() {
    if (!confirmTarget) return;
    const { user, type } = confirmTarget;
    setConfirmTarget(null);
    if (type === "ban") executeBan(user);
    else executeMakeAdmin(user);
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

      <div className="mb-6 rounded-xl border border-border bg-surface/50 p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
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

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 sm:flex">
              <FiFilter size={13} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-400 dark:text-white/35">Filtros</span>
            </div>

            <div className="hidden sm:block h-6 w-px bg-border" />

            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: "ALL", label: "Todos los roles" },
                { value: "STUDENT", label: "Estudiante" },
                { value: "CREATOR", label: "Creador" },
                { value: "AFFILIATE", label: "Afiliado" },
                { value: "ADMIN", label: "Admin" },
              ]}
              className="w-40"
            />

            <Select
              value={bannedFilter}
              onChange={setBannedFilter}
              options={[
                { value: "ALL", label: "Todos los estados" },
                { value: "false", label: "Activos" },
                { value: "true", label: "Suspendidos" },
              ]}
              className="w-40"
            />

            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                type="button"
                onClick={clearFilters}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border text-gray-400 transition hover:border-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:border-red-500/30 dark:hover:bg-red-500/5"
                title="Limpiar filtros"
              >
                <FiRotateCcw size={15} />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {loading || !fetched ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"
            />
          ))}
        </div>
      ) : fetched && users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FiInbox size={40} className="mb-3 text-gray-300 dark:text-white/20" />
          <p className="text-sm font-medium text-gray-500 dark:text-white/50">
            {search
              ? "No se encontraron usuarios con esos filtros"
              : "No hay usuarios registrados"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50 dark:bg-white/[0.02]">
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Nombre completo</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Correo</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Usuario</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Rol</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Publicados</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Rechazados</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Estado</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => {
                const isLoading = loadingUsers.has(user.id);
                return (
                  <tr
                    key={user.id}
                    onClick={() => {
                      if (user.username) router.push(`/profile/${user.username}`);
                    }}
                    className={`cursor-pointer transition hover:bg-primary/5 dark:hover:bg-primary/[0.03] ${
                      user.banned ? "bg-red-50/30 dark:bg-red-500/[0.02]" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-white/70">
                            {getInitials(user)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900 dark:text-white">
                            {user.fullname ?? "—"}
                          </p>
                          {user.banned && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-red-500">
                              <FiSlash size={10} />
                              Suspendido
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600 dark:text-white/60">
                      {user.email}
                    </td>

                    <td className="px-4 py-3 text-gray-600 dark:text-white/60">
                      {user.username ? `@${user.username}` : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-white/70">
                        <FiCheckCircle size={13} className="text-emerald-500" />
                        {user.publishedProducts ?? user._count?.products ?? 0}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-white/70">
                        <FiXCircle size={13} className="text-red-400" />
                        {user.rejectedProducts ?? 0}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge user={user} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setConfirmTarget({ user, type: "make-admin" }); }}
                          disabled={isLoading || user.role === "ADMIN"}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-gray-400 transition hover:border-amber-400 hover:text-amber-600 disabled:pointer-events-none disabled:opacity-30 dark:hover:border-amber-400"
                          title="Promover a administrador"
                        >
                          {isLoading ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                          ) : (
                            <FiShield size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setConfirmTarget({ user, type: "ban" }); }}
                          disabled={isLoading}
                          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition disabled:pointer-events-none disabled:opacity-40 ${
                            user.banned
                              ? "border-emerald-300 text-emerald-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400"
                              : "border-red-200 text-red-500 hover:border-red-400 hover:text-red-600 dark:border-red-500/30 dark:text-red-400"
                          }`}
                          title={user.banned ? "Restaurar usuario" : "Suspender usuario"}
                        >
                          {isLoading ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <FiSlash size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        className="p-5"
      >
        {confirmTarget && (() => {
          const name = confirmTarget.user.fullname ?? confirmTarget.user.username ?? "Usuario";
          const isBan = confirmTarget.type === "ban";
          const verb = isBan
            ? (confirmTarget.user.banned ? "restaurar a" : "suspender a")
            : "promover a";
          const msg = isBan
            ? (confirmTarget.user.banned
              ? `El usuario podrá acceder nuevamente a la plataforma.`
              : `El usuario no podrá acceder a la plataforma y sus productos se ocultarán.`)
            : `El usuario obtendrá todos los permisos de administrador.`;

          return (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-white/10 dark:text-white/70">
                  {getInitials(confirmTarget.user)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isBan ? (confirmTarget.user.banned ? "Restaurar usuario" : "Suspender usuario") : "Promover a administrador"}
                  </h2>
                  <p className="truncate text-sm text-gray-500 dark:text-white/55">
                    {name}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface/50 p-4">
                <p className="text-sm text-gray-600 dark:text-white/70">
                  ¿Estás seguro de {verb} <strong>{name}</strong>?
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-white/45">
                  {msg}
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setConfirmTarget(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:text-white/70 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <motion.button
                  type="button"
                  onClick={handleConfirm}
                  whileTap={{ scale: 0.97 }}
                  className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white shadow-lg transition cursor-pointer ${
                    isBan
                      ? (confirmTarget.user.banned
                        ? "bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700"
                        : "bg-red-600 shadow-red-600/30 hover:bg-red-700")
                      : "bg-amber-600 shadow-amber-600/30 hover:bg-amber-700"
                  }`}
                >
                  {isBan ? (confirmTarget.user.banned ? "Restaurar" : "Suspender") : "Promover"}
                </motion.button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </motion.div>
  );
}
