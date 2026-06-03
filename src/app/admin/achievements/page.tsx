"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import {
  FiPlus, FiEdit2, FiTrash2, FiInbox, FiAward, FiChevronDown, FiCheck,
  FiInfo,
} from "react-icons/fi";
import { Modal } from "@/components/UI/Modal";
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/admin-api";
import { achievementIcon } from "@/lib/achievement-icons";
import type { IconType } from "react-icons";

interface AchievementForm {
  id?: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  role: string;
}

const EMPTY_FORM: AchievementForm = {
  key: "",
  title: "",
  description: "",
  icon: "FiAward",
  xpReward: 0,
  role: "STUDENT",
};

const ROLES = ["STUDENT", "CREATOR", "AFFILIATE"];

const ROLE_BADGE: Record<string, string> = {
  STUDENT: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  CREATOR: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  AFFILIATE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ADMIN: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const ICON_OPTIONS = [
  "FiPlayCircle", "FiZap", "FiAward", "FiMessageCircle", "FiCheckCircle",
  "FiBookOpen", "FiPackage", "FiShoppingBag", "FiStar", "FiUsers",
  "FiDollarSign", "FiLayers", "FiLink", "FiTrendingUp", "FiTarget",
  "FiShare2", "FiClock", "FiBarChart2",
];

function SelectField({
  label,
  value,
  options,
  onChange,
  renderOption,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  renderOption?: (opt: string) => React.ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        triggerRef.current?.contains(target) ||
        menuEl?.contains(target)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, menuEl]);

  function openMenu() {
    if (disabled) return;
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const listHeight = Math.min(options.length * 44 + 8, 280);
    const showAbove = spaceBelow < listHeight && spaceAbove > spaceBelow;
    setMenuStyle({
      position: "fixed",
      left: `${rect.left}px`,
      [showAbove ? "bottom" : "top"]: showAbove
        ? `${window.innerHeight - rect.top + 4}px`
        : `${rect.bottom + 4}px`,
      width: `${rect.width}px`,
      maxHeight: `${Math.min(280, showAbove ? spaceAbove - 8 : spaceBelow - 8)}px`,
      overflowY: "auto",
      zIndex: 9999,
    });
    setOpen(true);
  }

  return (
    <div ref={containerRef}>
      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/45">
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={openMenu}
        disabled={disabled}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-gray-900 transition hover:border-primary/40 disabled:opacity-50 dark:text-white"
      >
        <span className="flex items-center gap-2">
          {renderOption ? renderOption(value) : value}
        </span>
        <FiChevronDown
          size={14}
          className={`shrink-0 text-gray-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open &&
        createPortal(
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={undefined}
            transition={{ duration: 0.15 }}
            style={menuStyle}
            ref={setMenuEl}
            className="overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
          >
            {options.map((opt) => {
              const selected = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-primary/5 dark:text-white/80"
                  }`}
                >
                  {renderOption ? renderOption(opt) : opt}
                  {selected && <FiCheck size={14} className="ml-auto shrink-0" />}
                </button>
              );
            })}
          </motion.div>,
          document.body,
        )}
    </div>
  );
}

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editing, setEditing] = useState<AchievementForm | null>(null);
  const [deleting, setDeleting] = useState<AchievementForm | null>(null);
  const [form, setForm] = useState<AchievementForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    const res = await getAllTemplates();
    if (res.ok && res.data) {
      setAchievements(res.data as any);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(a: AchievementForm) {
    setEditing(a);
    setForm({ ...a });
    setModalOpen(true);
  }

  function openDelete(a: AchievementForm) {
    setDeleting(a);
    setDeleteModalOpen(true);
  }

  async function handleSave() {
    if (!form.key || !form.title || !form.description || !form.icon || !form.role) return;
    setSaving(true);

    const payload = {
      key: form.key,
      title: form.title,
      description: form.description,
      icon: form.icon,
      xpReward: form.xpReward,
      role: form.role,
    };

    const res = editing?.id
      ? await updateTemplate(editing.id, payload)
      : await createTemplate(payload);

    if (res.ok) {
      setModalOpen(false);
      fetchAchievements();
    }

    setSaving(false);
  }

  async function handleDelete() {
    if (!deleting?.id) return;
    setSaving(true);

    const res = await deleteTemplate(deleting.id);

    if (res.ok) {
      setDeleteModalOpen(false);
      setDeleting(null);
      fetchAchievements();
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-48 rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="h-64 rounded-xl bg-gray-200 dark:bg-white/10" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestión de logros
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/55">
            {achievements.length} logros registrados
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
        >
          <FiPlus size={16} />
          Nuevo logro
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background/60 py-16 text-center dark:bg-white/3">
          <FiInbox size={48} className="mb-4 text-gray-400 dark:text-white/25" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            No hay logros
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/45">
            Crea tu primer logro para comenzar.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-background/60 dark:bg-white/3">
                <th className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">Icono</th>
                <th className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">Key</th>
                <th className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">Título</th>
                <th className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">Rol</th>
                <th className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">XP</th>
                <th className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((a) => {
                const Icon = achievementIcon(a.icon);
                return (
                  <tr
                    key={a.id ?? a.key}
                    className="border-b border-border last:border-0 transition-colors hover:bg-primary/[0.02]"
                  >
                    <td className="px-5 py-3.5">
                      <Icon size={18} className="text-gray-500 dark:text-white/50" />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600 dark:text-white/60">
                      {a.key}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                      {a.title}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[a.role] ?? "bg-primary/10 text-primary"}`}>
                        {a.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-white/60">
                      +{a.xpReward} XP
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary dark:text-white/50"
                          title="Editar"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(a)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-white/50"
                          title="Eliminar"
                        >
                          <FiTrash2 size={15} />
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="p-6">
          <h3 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">
            {editing ? "Editar logro" : "Nuevo logro"}
          </h3>
          <div className="space-y-4">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-white/45">
              Key (identificador único)
              <span className="group relative inline-flex">
                <FiInfo size={12} className="text-gray-400" />
                <span className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-gray-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:text-white/70 pointer-events-none">
                  Identificador alfanumérico único (ej: <code className="font-mono text-primary">first-lesson</code>).
                  Solo letras minúsculas, números y guiones. No se puede modificar después de crear el logro.
                </span>
              </span>
            </label>
            <input
              type="text"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value.replace(/[^a-z0-9-]/g, "") })}
              disabled={!!editing}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 disabled:opacity-50 dark:text-white dark:placeholder-white/30"
              placeholder="first-lesson"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/45">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-white/30"
              placeholder="Primera lección"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/45">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-white/30"
              placeholder="Completa tu primera lección..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Icono"
              value={form.icon}
              options={ICON_OPTIONS}
              onChange={(v) => setForm({ ...form, icon: v })}
              renderOption={(opt) => {
                const Icon = achievementIcon(opt);
                return (
                  <span className="flex items-center gap-2">
                    <Icon size={16} className="text-gray-500 dark:text-white/50" />
                    {opt}
                  </span>
                );
              }}
            />
            <SelectField
              label="Rol"
              value={form.role}
              options={ROLES}
              onChange={(v) => setForm({ ...form, role: v })}
              renderOption={(opt) => opt}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-white/45">XP de recompensa</label>
            <input
              type="number"
              value={form.xpReward}
              onChange={(e) => setForm({ ...form, xpReward: Math.max(0, parseInt(e.target.value) || 0) })}
              min={0}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-primary/5 dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.key || !form.title || !form.description}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear logro"}
            </button>
          </div>
        </div>
        </div>
      </Modal>

      {/* Delete confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="p-6">
          <h3 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">
            Eliminar logro
          </h3>
          <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-white/55">
            ¿Estás seguro de eliminar <strong className="text-gray-900 dark:text-white">{deleting?.title}</strong>?
            Esta acción también eliminará el progreso de todos los usuarios asociados a este logro.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-primary/5 dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
        </div>
      </Modal>
    </motion.div>
  );
}
