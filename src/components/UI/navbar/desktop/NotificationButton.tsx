"use client";

import { FiBell, FiBellOff, FiShield, FiAlertCircle, FiMail, FiCheck } from "react-icons/fi";
import { useRef, useState, useEffect } from "react";
import { DropdownMenu } from "@/components/DropdownMenu";
import { useProfile } from "@/hooks/useProfile";
import type { Notification, Role } from "@/types/user";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 5;
const CACHE_DURATION = 30_000;

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "ahora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function SenderInfo({ sender, currentUserRole }: { sender: Notification["sender"]; currentUserRole?: Role }) {
  if (!sender) return null;
  const isCurrentUserAdmin = currentUserRole === "ADMIN";
  const isAdminSender = sender.role === "ADMIN" || (!isCurrentUserAdmin && sender.fullname === "Equipo de Soporte");
  const displayName = sender.fullname ?? sender.username ?? "Sistema";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400 dark:text-white/40">{displayName}</span>
      {isAdminSender && isCurrentUserAdmin && (
        <span className="inline-flex items-center gap-0.5 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <FiShield size={8} />
          Admin
        </span>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3 border-b border-border px-4 py-3">
          <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="h-3.5 w-3/4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="h-3 w-full rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="h-2.5 w-12 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { user } = useProfile();
  const router = useRouter();

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
      setInitialLoading(false);
      setLastFetchTime(Date.now());
    }
  };

  useEffect(() => {
    if (!open) return;

    const hasData = notifications.length > 0;
    const isStale = Date.now() - lastFetchTime > CACHE_DURATION;

    if (!hasData) {
      setInitialLoading(true);
      fetchNotifications(true);
    } else if (isStale) {
      fetchNotifications(true);
    }
    if (unreadCount > 0) {
      fetch("/api/notifications/read-all", { method: "PATCH" });
      setUnreadCount(0);
    }
  }, [open]);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = () => {
      fetch("/api/notifications/unread-count")
        .then((r) => r.json())
        .then((json) => {
          if (typeof json.data?.count === "number") {
            setUnreadCount(json.data.count);
          }
          if (user.role === "ADMIN" && typeof json.data?.pendingReviewCount === "number") {
            setPendingReviewCount(json.data.pendingReviewCount);
          }
        });
    };

    fetchCounts();

    const interval = setInterval(fetchCounts, 15000);

    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationClick = async (n: Notification) => {
    setOpen(false);
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" });
    }
    router.push(n.link || "/user/inbox");
  };

  const hasMore = total > notifications.length;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative p-2 rounded-lg border transition-all cursor-pointer group ${
          unreadCount > 0 || pendingReviewCount > 0
            ? "bg-primary/10 border-primary/30 dark:bg-primary/15 dark:border-primary/40"
            : "bg-gray-100 dark:bg-white/5 border-border hover:border-primary/50 dark:hover:border-primary/50"
        }`}
      >
        {unreadCount > 0 || pendingReviewCount > 0 ? (
          <FiBell size={16} className="text-primary transition-colors" />
        ) : (
          <FiBellOff size={16} className="text-gray-400 dark:text-white/40 group-hover:text-primary transition-colors" />
        )}
        {(unreadCount > 0 || pendingReviewCount > 0) && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
            {unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : (pendingReviewCount > 99 ? "99+" : pendingReviewCount)}
          </span>
        )}
      </button>

      <DropdownMenu
        isOpen={open}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
        align="right"
        offset={8}
        className="w-[28rem]"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <FiMail size={14} className="text-gray-400" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Notificaciones
            </p>
          </div>
          <button
            onClick={() => { setOpen(false); router.push("/user/inbox"); }}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Ver todas
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {pendingReviewCount > 0 && user?.role === "ADMIN" && (
            <button
              onClick={() => { setOpen(false); router.push("/admin/reviews"); }}
              className="flex w-full items-start gap-3 border-b border-border bg-amber-50/50 px-4 py-3 text-left transition-colors hover:bg-amber-50 dark:bg-amber-500/5 dark:hover:bg-amber-500/10 cursor-pointer"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <FiAlertCircle size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Revisiones pendientes
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-600/70 dark:text-amber-400/60">
                  {pendingReviewCount} {pendingReviewCount === 1 ? "producto espera" : "productos esperan"} tu revisión
                </p>
              </div>
              <span className="flex h-5 min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
                {pendingReviewCount}
              </span>
            </button>
          )}

          {initialLoading ? (
            <SkeletonList />
          ) : notifications.length === 0 && pendingReviewCount === 0 ? (
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
          ) : null}

          {!initialLoading && notifications.length > 0 && (
            <>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group relative flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-all last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                    n.read ? "" : "bg-primary/[0.02]"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      n.read
                        ? "bg-gray-100 text-gray-400 dark:bg-white/5"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <FiBell size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${n.read ? "font-normal text-gray-500 dark:text-white/60" : "font-semibold text-gray-900 dark:text-white"}`}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-white/55 line-clamp-2">
                      {n.message}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <SenderInfo sender={n.sender} currentUserRole={user?.role} />
                      <span className="text-[11px] text-gray-400 dark:text-white/30">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!n.read ? (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  ) : (
                    <FiCheck size={12} className="mt-2 shrink-0 text-gray-300 dark:text-white/20" />
                  )}
                </button>
              ))}
              {hasMore && (
                <button
                  onClick={() => fetchNotifications(false)}
                  disabled={loading}
                  className="w-full border-t border-border px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Cargando..." : `Cargar más (${notifications.length}/${total})`}
                </button>
              )}
            </>
          )}
        </div>

        <div className="border-t border-border px-4 py-2.5">
          <button
            onClick={() => { setOpen(false); router.push("/user/inbox"); }}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <FiMail size={13} />
            Ir a la bandeja de entrada
          </button>
        </div>
      </DropdownMenu>
    </>
  );
}
