"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { listReports, dismissReport, adminDeleteComment, type ProfileCommentReport } from "@/lib/profile-comment-api";
import { useNotification } from "@/hooks/useNotification";
import {
  FiFlag,
  FiCheck,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";

export default function AdminReportsPage() {
  const { notify } = useNotification();
  const [reports, setReports] = useState<ProfileCommentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReports = useCallback(async (p: number) => {
    setLoading(true);
    const { ok, data } = await listReports(p);
    if (ok && data) {
      setReports(data.reports);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReports(page);
  }, [page, loadReports]);

  const handleDismiss = async (reportId: string) => {
    setActionLoading(reportId);
    const { ok } = await dismissReport(reportId);
    if (ok) {
      notify("success", "Reporte desestimado");
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setTotal((prev) => prev - 1);
    } else {
      notify("error", "Error al desestimar reporte");
    }
    setActionLoading(null);
  };

  const handleDeleteAndDismiss = async (reportId: string, commentId: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este comentario? Esta acción no se puede deshacer.")) return;
    setActionLoading(reportId);
    const { ok } = await adminDeleteComment(reportId, commentId);
    if (ok) {
      notify("success", "Comentario eliminado y reporte desestimado");
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setTotal((prev) => prev - 1);
    } else {
      notify("error", "Error al eliminar comentario");
    }
    setActionLoading(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl"
    >
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reportes de comentarios</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/45">
          {total} reporte{total !== 1 ? "s" : ""} pendiente{total !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background/60 py-16 text-center dark:bg-white/3">
          <FiCheck size={40} className="mb-3 text-emerald-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">No hay reportes pendientes</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-white/45">Todos los reportes han sido revisados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-border bg-background/60 p-5 dark:bg-white/3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <FiFlag size={16} className="text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Reporte en perfil de @{report.comment.profile.username || "desconocido"}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-white/30">
                        {new Date(report.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {report.reason && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        <FiAlertCircle size={11} className="inline mr-1" />
                        Motivo: {report.reason}
                      </p>
                    )}

                    <div className="mt-3 rounded-xl border border-border bg-background/40 p-3 dark:bg-white/3">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/45 mb-1.5">
                        <FiUser size={11} />
                        {report.comment.user.fullname || report.comment.user.username || "Usuario"} dijo:
                      </div>
                      <p className="text-sm text-gray-700 dark:text-white/70 whitespace-pre-line">
                        {report.comment.comment}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400 dark:text-white/35">
                      <span>
                        Reportado por: @{report.reporter.username || "desconocido"}
                      </span>
                      <span>
                        Autor del comentario: @{report.comment.user.username || "desconocido"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleDeleteAndDismiss(report.id, report.comment.id)}
                    disabled={actionLoading === report.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-600 active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading === report.id ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <FiTrash2 size={13} />
                    )}
                    Eliminar
                  </button>
                  <button
                    onClick={() => handleDismiss(report.id)}
                    disabled={actionLoading === report.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.97] disabled:opacity-50 dark:text-white/60 dark:hover:bg-white/5 cursor-pointer"
                  >
                    <FiCheck size={13} />
                    Desestimar
                  </button>
                </div>
              </div>
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
