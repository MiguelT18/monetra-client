"use client";

import { FiBell, FiBellOff, FiCheck, FiClock, FiShield, FiTrash2, FiTrash } from "react-icons/fi";
import { useRef, useState, useEffect } from "react";
import { DropdownMenu } from "@/components/DropdownMenu";
import { useProfile } from "@/hooks/useProfile";
import type { Notification, Role } from "@/types/user";

const PAGE_SIZE = 5;

function SenderInfo({ sender }: { sender: Notification["sender"] }) {
  if (!sender) return null;
  const name = sender.fullname ?? sender.username ?? "Sistema";
  const isAdmin = sender.role === "ADMIN";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400 dark:text-white/40">{name}</span>
      {isAdmin && (
        <span className="inline-flex items-center gap-0.5 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <FiShield size={8} />
          Admin
        </span>
      )}
    </div>
  );
}

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { user } = useProfile();

  const fetchNotifications = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const currentOffset = reset ? 0 : offset;
    try {
      const res = await fetch(`/api/notifications?offset=${currentOffset}&limit=${PAGE_SIZE}`);
      const json = await res.json();
      if (json.data) {
        const items: Notification[] = json.data.notifications ?? [];
        setTotal(json.data.total ?? 0);
        if (reset) {
          setNotifications(items);
          setOffset(items.length);
        } else {
          setNotifications((prev) => [...prev, ...items]);
          setOffset(currentOffset + items.length);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchNotifications(true);
    if (unreadCount > 0) {
      fetch("/api/notifications/read-all", { method: "PATCH" });
      setUnreadCount(0);
    }
  }, [open]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications/unread-count")
      .then((r) => r.json())
      .then((json) => {
        if (typeof json.data?.count === "number") {
          setUnreadCount(json.data.count);
        }
      });

    const interval = setInterval(() => {
      fetch("/api/notifications/unread-count")
        .then((r) => r.json())
        .then((json) => {
          if (typeof json.data?.count === "number") {
            setUnreadCount(json.data.count);
          }
        });
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((t) => t - 1);
    }
  };

  const handleDeleteAll = async () => {
    const res = await fetch("/api/notifications", { method: "DELETE" });
    if (res.ok) {
      setNotifications([]);
      setTotal(0);
      setOffset(0);
    }
  };

  const hasMore = total > notifications.length;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative p-2 rounded-lg border transition-all cursor-pointer group ${
          unreadCount > 0
            ? "bg-primary/10 border-primary/30 dark:bg-primary/15 dark:border-primary/40"
            : "bg-gray-100 dark:bg-white/5 border-border hover:border-primary/50 dark:hover:border-primary/50"
        }`}
      >
        {unreadCount > 0 ? (
          <FiBell
            size={16}
            className="text-primary transition-colors"
          />
        ) : (
          <FiBellOff
            size={16}
            className="text-gray-400 dark:text-white/40 group-hover:text-primary transition-colors"
          />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <DropdownMenu
        isOpen={open}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
        align="right"
        offset={8}
        className="w-96"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Notificaciones
          </p>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                <span className="text-xs text-gray-400 dark:text-white/40">
                  {notifications.length}/{total}
                </span>
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Eliminar todas"
                >
                  <FiTrash size={12} />
                  Eliminar todas
                </button>
              </>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <div className="flex items-center justify-center rounded-full bg-gray-100 p-3 dark:bg-white/5">
                <FiBell size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-white/70">
                Sin notificaciones
              </p>
              <p className="text-xs text-gray-400 dark:text-white/30">
                No tienes notificaciones por ahora.
              </p>
            </div>
          ) : (
            <>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group/item relative border-b border-border px-4 py-3 transition-colors last:border-b-0 ${
                    n.read ? "opacity-60" : "bg-primary/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        n.read
                          ? "bg-gray-100 text-gray-400 dark:bg-white/5"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {n.read ? <FiCheck size={12} /> : <FiClock size={12} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-white/55 line-clamp-2">
                        {n.message}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <SenderInfo sender={n.sender} />
                        <span className="text-[11px] text-gray-400 dark:text-white/30">
                          {new Date(n.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    {!n.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(n.id);
                    }}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md opacity-0 transition-all bg-white text-gray-400 shadow-sm ring-1 ring-gray-200 hover:bg-red-50 hover:text-red-500 hover:ring-red-200 group-hover/item:opacity-100 dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-red-500/10 dark:hover:ring-red-500/30"
                    title="Eliminar"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
              {hasMore && (
                <button
                  onClick={() => fetchNotifications(false)}
                  disabled={loading}
                  className="w-full border-t border-border px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {loading ? "Cargando..." : `Cargar más (${notifications.length}/${total})`}
                </button>
              )}
            </>
          )}
        </div>
      </DropdownMenu>
    </>
  );
}
