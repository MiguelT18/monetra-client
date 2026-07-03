"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  listProfileComments,
  createProfileComment,
  deleteProfileComment,
  reportProfileComment,
  blockUser,
  checkBlocked,
  type ProfileComment,
} from "@/lib/profile-comment-api";
import { useNotification } from "@/hooks/useNotification";
import {
  FiMessageSquare,
  FiSend,
  FiTrash2,
  FiFlag,
  FiUserX,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";

interface Props {
  profileId: string;
  isOwner: boolean;
  currentUserId?: string;
  onCommentCountChange?: (count: number) => void;
}

export default function ProfileComments({ profileId, isOwner, currentUserId, onCommentCountChange }: Props) {
  const { notify } = useNotification();
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [checkingBlocked, setCheckingBlocked] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const loadComments = useCallback(async (p: number) => {
    setLoading(true);
    const { ok, data } = await listProfileComments(profileId, p);
    if (ok && data) {
      setComments(data.comments);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      onCommentCountChange?.(data.total);
    }
    setLoading(false);
  }, [profileId, onCommentCountChange]);

  useEffect(() => {
    loadComments(page);
  }, [page, loadComments]);

  useEffect(() => {
    if (!currentUserId) {
      setCheckingBlocked(false);
      return;
    }
    checkBlocked(profileId).then(({ ok, data }) => {
      if (ok && data) setBlocked(data.blocked);
      setCheckingBlocked(false);
    });
  }, [profileId, currentUserId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const { ok, message } = await createProfileComment(profileId, newComment.trim());
    if (ok) {
      setNewComment("");
      notify("success", "Comentario publicado");
      loadComments(1);
      setPage(1);
    } else {
      notify("error", message || "Error al publicar comentario");
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { ok, message } = await deleteProfileComment(profileId, commentId);
    if (ok) {
      notify("success", "Comentario eliminado");
      loadComments(page);
    } else {
      notify("error", message || "Error al eliminar comentario");
    }
    setMenuOpen(null);
  };

  const handleReport = async (commentId: string) => {
    const reason = window.prompt("Motivo del reporte (opcional):");
    const { ok, message } = await reportProfileComment(profileId, commentId, reason || undefined);
    if (ok) {
      notify("success", "Comentario reportado a los administradores");
    } else {
      notify("error", message || "Error al reportar comentario");
    }
    setMenuOpen(null);
  };

  const handleBlock = async (blockedId: string) => {
    if (!window.confirm("¿Estás seguro de bloquear a este usuario? Se eliminarán todos sus comentarios en tu perfil.")) return;
    const { ok, message } = await blockUser(profileId, blockedId);
    if (ok) {
      notify("success", "Usuario bloqueado");
      loadComments(page);
    } else {
      notify("error", message || "Error al bloquear usuario");
    }
    setMenuOpen(null);
  };

  if (checkingBlocked) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <FiMessageSquare size={16} className="text-primary" />
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
          Comentarios ({total})
        </h2>
      </div>

      {!isOwner && !blocked && currentUserId && (
        <div className="mb-5 flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={2}
            maxLength={1000}
            className="flex-1 resize-none rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary dark:text-white dark:placeholder:text-white/35 dark:bg-white/3"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            className="self-end inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
          >
            {submitting ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <FiSend size={14} />
            )}
            Comentar
          </button>
        </div>
      )}

      {blocked && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-xs text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <FiAlertCircle size={14} className="shrink-0" />
          Has sido bloqueado por el dueño de este perfil. No puedes comentar.
        </div>
      )}

      {!currentUserId && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          <FiAlertCircle size={14} className="shrink-0" />
          Inicia sesión para dejar un comentario.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
            <FiMessageSquare size={24} className="text-gray-300 dark:text-white/20" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Aún no hay comentarios
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
            {currentUserId
              ? "Sé el primero en comentar sobre este usuario"
              : "No hay comentarios en este perfil"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="relative rounded-xl border border-border bg-background/40 p-3 dark:bg-white/3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {c.user.avatar ? (
                    <img src={c.user.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                      <FiUser size={14} className="text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {c.user.fullname || c.user.username || "Usuario"}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-white/30">
                      @{c.user.username} · {new Date(c.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>

                {(isOwner || c.user.id === currentUserId) && (
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="8" cy="3" r="1.5" />
                        <circle cx="8" cy="8" r="1.5" />
                        <circle cx="8" cy="13" r="1.5" />
                      </svg>
                    </button>

                    {menuOpen === c.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-border bg-surface p-1 shadow-lg">
                          {isOwner && c.user.id !== currentUserId && (
                            <>
                              <button
                                onClick={() => handleDelete(c.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                              >
                                <FiTrash2 size={14} />
                                Eliminar comentario
                              </button>
                              <button
                                onClick={() => handleReport(c.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer"
                              >
                                <FiFlag size={14} />
                                Reportar comentario
                              </button>
                              <button
                                onClick={() => handleBlock(c.user.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                              >
                                <FiUserX size={14} />
                                Bloquear usuario
                              </button>
                            </>
                          )}
                          {c.user.id === currentUserId && (
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <FiTrash2 size={14} />
                              Eliminar mi comentario
                            </button>
                          )}
                          {!isOwner && c.user.id !== currentUserId && (
                            <button
                              onClick={() => handleReport(c.id)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer"
                            >
                              <FiFlag size={14} />
                              Reportar comentario
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-700 dark:text-white/70 whitespace-pre-line">{c.comment}</p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:text-white/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FiChevronLeft size={12} /> Anterior
              </button>
              <span className="text-xs text-gray-500 dark:text-white/45">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:text-white/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Siguiente <FiChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
