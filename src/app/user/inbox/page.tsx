"use client";

import { useState, useEffect, useCallback } from "react";
import { useProfile } from "@/hooks/useProfile";
import type { Notification, Role } from "@/types/user";
import { UserPageHeader } from "@/components/user/userShell";
import {
  FiBell,
  FiBellOff,
  FiCheck,
  FiTrash2,
  FiShield,
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 20;

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "ahora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function SenderBadge({ sender, currentUserRole }: { sender: Notification["sender"]; currentUserRole?: Role }) {
  if (!sender) return null;
  const isCurrentUserAdmin = currentUserRole === "ADMIN";
  const isAdminSender = sender.role === "ADMIN" || (!isCurrentUserAdmin && sender.fullname === "Equipo de Soporte");
  const displayName = sender.fullname ?? sender.username ?? "Sistema";
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-white/40">
      {displayName}
      {isAdminSender && isCurrentUserAdmin && (
        <span className="inline-flex items-center gap-0.5 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <FiShield size={8} />
          Admin
        </span>
      )}
    </span>
  );
}

export default function InboxPage() {
  const { user, loading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchPage = useCallback(async (p: number) => {
    setPageLoading(true);
    try {
      const offset = (p - 1) * PAGE_SIZE;
      const res = await fetch(`/api/notifications?offset=${offset}&limit=${PAGE_SIZE}`);
      const json = await res.json();
      if (json.data) {
        setNotifications(json.data.notifications ?? []);
        setTotal(json.data.total ?? 0);
      }
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
      await fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" });
    }
    if (n.link) {
      router.push(n.link);
    }
  };

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((x) => (x.id === id ? { ...x, read: true } : x))
    );
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((t) => t - 1);
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const handleBulkMarkRead = async () => {
    for (const id of selectedIds) {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    }
    setNotifications((prev) =>
      prev.map((x) => (selectedIds.has(x.id) ? { ...x, read: true } : x))
    );
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    }
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setTotal((t) => t - selectedIds.size);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const loadingSkeleton = (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl border border-border p-4">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="h-12 w-72 rounded-lg bg-gray-200 dark:bg-white/10" />
        {loadingSkeleton}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserPageHeader
        title="Bandeja de entrada"
        description="Todas tus notificaciones en un solo lugar."
      />

      <section className="rounded-2xl border border-border bg-background/60 shadow-sm dark:bg-white/3">
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
                <button
                  onClick={() => { setFilter("all"); setPage(1); }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    filter === "all"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => { setFilter("unread"); setPage(1); }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    filter === "unread"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70"
                  }`}
                >
                  No leídas
                </button>
              </div>
              <span className="text-xs text-gray-400 dark:text-white/30">
                {total} {total === 1 ? "notificación" : "notificaciones"}
              </span>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-white/50">
                  {selectedIds.size} seleccionadas
                </span>
                <button
                  onClick={handleBulkMarkRead}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <FiCheck size={12} />
                  Marcar leídas
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <FiTrash2 size={12} />
                  Eliminar
                </button>
              </div>
            )}
          </div>

          <div className="divide-y divide-border rounded-xl border border-border">
            {pageLoading ? (
              loadingSkeleton
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <div className="flex items-center justify-center rounded-full bg-gray-100 p-4 dark:bg-white/5">
                  <FiInbox size={24} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-white/70">
                  {filter === "all" ? "Bandeja vacía" : "No hay notificaciones sin leer"}
                </p>
                <p className="text-xs text-gray-400 dark:text-white/30">
                  {filter === "all"
                    ? "No tienes notificaciones por ahora."
                    : "Todas las notificaciones han sido leídas."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`group relative flex items-start gap-4 px-4 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                    selectedIds.has(n.id) ? "bg-primary/5" : ""
                  }`}
                >
                  <label className="mt-1.5 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(n.id)}
                      onChange={() => toggleSelect(n.id)}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </label>
                  <button
                    onClick={() => handleNotificationClick(n)}
                    className="flex flex-1 items-start gap-4 text-left cursor-pointer"
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        n.read
                          ? "bg-gray-100 text-gray-400 dark:bg-white/5"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {n.read ? <FiBellOff size={14} /> : <FiBell size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            n.read
                              ? "font-normal text-gray-500 dark:text-white/60"
                              : "font-semibold text-gray-900 dark:text-white"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-gray-400 dark:text-white/30">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-white/55">
                        {n.message}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <SenderBadge sender={n.sender} currentUserRole={role} />
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="flex h-7 w-7 items-center justify-center rounded text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-primary group-hover:opacity-100 dark:hover:bg-white/10 cursor-pointer"
                        title="Marcar como leída"
                      >
                        <FiCheck size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="flex h-7 w-7 items-center justify-center rounded text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-500/10 cursor-pointer"
                      title="Eliminar"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-400 dark:text-white/30">
                Página {page} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FiChevronLeft size={12} />
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Siguiente
                  <FiChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
