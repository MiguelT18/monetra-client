"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import {
  FiPlus, FiEdit2, FiTrash2, FiInbox, FiChevronDown, FiCheck,
  FiX, FiTag, FiZap,
} from "react-icons/fi";
import { Modal } from "@/components/UI/Modal";
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getXpRecommendation,
} from "@/lib/admin-api";
import { achievementIcon } from "@/lib/achievement-icons";

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

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Estudiante",
  CREATOR: "Creador",
  AFFILIATE: "Afiliado",
};

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

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard", "epic"] as const;

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
  epic: "Épico",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  hard: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  epic: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const RECOMMENDED_XP: Record<string, { label: string; value: number; hint: string }[]> = {
  easy: [
    { label: "10 XP", value: 10, hint: "Acción trivial" },
    { label: "25 XP", value: 25, hint: "Acción muy simple" },
    { label: "50 XP", value: 50, hint: "Acción básica" },
    { label: "75 XP", value: 75, hint: "Acción sencilla" },
  ],
  medium: [
    { label: "50 XP", value: 50, hint: "Acción básica" },
    { label: "100 XP", value: 100, hint: "Logro estándar" },
    { label: "150 XP", value: 150, hint: "Dedicación media" },
    { label: "200 XP", value: 200, hint: "Logro destacado" },
  ],
  hard: [
    { label: "150 XP", value: 150, hint: "Dedicación media" },
    { label: "250 XP", value: 250, hint: "Dificultad alta" },
    { label: "350 XP", value: 350, hint: "Requiere esfuerzo" },
    { label: "500 XP", value: 500, hint: "Logro épico" },
  ],
  epic: [
    { label: "300 XP", value: 300, hint: "Dificultad alta" },
    { label: "500 XP", value: 500, hint: "Logro épico" },
    { label: "750 XP", value: 750, hint: "Casi legendario" },
    { label: "1000 XP", value: 1000, hint: "Logro legendario" },
  ],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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
      <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-white/45">
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={openMenu}
        disabled={disabled}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-gray-900 transition hover:border-primary/40 disabled:opacity-50 dark:text-white cursor-pointer"
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
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
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
  const [customKey, setCustomKey] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

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
    setCustomKey(false);
    setModalOpen(true);
  }

  function openEdit(a: AchievementForm) {
    setEditing(a);
    setForm({ ...a });
    setCustomKey(false);
    setModalOpen(true);
  }

  function openDelete(a: AchievementForm) {
    setDeleting(a);
    setDeleteModalOpen(true);
  }

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      key: customKey ? prev.key : slugify(title),
    }));
  }

  function handleKeyChange(key: string) {
    setForm((prev) => ({
      ...prev,
      key: key.replace(/[^a-z0-9-]/g, ""),
    }));
  }

  async function handleSuggestXp() {
    setLoadingRecommendation(true);
    const res = await getXpRecommendation(difficulty as "easy" | "medium" | "hard" | "epic");
    if (res.ok && res.data) {
      setForm((prev) => ({ ...prev, xpReward: res.data!.xp }));
    }
    setLoadingRecommendation(false);
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

  const PreviewIcon = achievementIcon(form.icon);

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
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg cursor-pointer"
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
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-white/45 line-clamp-1">{a.description}</p>
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
                          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary dark:text-white/50 cursor-pointer"
                          title="Editar"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(a)}
                          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-white/50 cursor-pointer"
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
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editing ? "Editar logro" : "Nuevo logro"}
            </h3>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white/60 cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Preview */}
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-background/60 p-4 dark:bg-white/3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PreviewIcon size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {form.title || "Título del logro"}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-white/45 truncate">
                {form.description || "Descripción del logro"}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE[form.role] ?? "bg-primary/10 text-primary"}`}>
                  {ROLE_LABELS[form.role] ?? form.role}
                </span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-white/35">
                  +{form.xpReward} XP
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-white/45">
                Título
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-white/30"
                placeholder="Primera lección"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-white/45">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-white/30"
                placeholder="Completa tu primera lección..."
              />
            </div>

            {!editing && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-white/45">
                    <FiTag size={12} />
                    Identificador (key)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomKey(!customKey);
                      if (customKey) {
                        setForm((prev) => ({ ...prev, key: slugify(prev.title) }));
                      }
                    }}
                    className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    {customKey ? "Auto-generar" : "Personalizar"}
                  </button>
                </div>
                {customKey ? (
                  <input
                    type="text"
                    value={form.key}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-mono text-xs text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-white/30"
                    placeholder="first-lesson"
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2.5 dark:bg-white/3">
                    <code className="font-mono text-xs text-primary">
                      {form.key || "—"}
                    </code>
                    <span className="text-[10px] text-gray-400 dark:text-white/30">
                      (generado del título)
                    </span>
                  </div>
                )}
                <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">
                  Identificador único para actualizar el progreso. Solo minúsculas, números y guiones.
                </p>
              </div>
            )}

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
                renderOption={(opt) => ROLE_LABELS[opt] ?? opt}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-white/45">
                XP de recompensa
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.xpReward}
                  onChange={(e) => setForm({ ...form, xpReward: Math.max(0, parseInt(e.target.value) || 0) })}
                  min={0}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleSuggestXp}
                  disabled={loadingRecommendation}
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50 cursor-pointer"
                  title="Obtener XP sugerido según dificultad"
                >
                  {loadingRecommendation ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  ) : (
                    <FiZap size={13} />
                  )}
                  {loadingRecommendation ? "" : "Sugerir"}
                </button>
              </div>

              {/* Difficulty selector */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 dark:text-white/30">Dificultad:</span>
                {DIFFICULTY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition cursor-pointer ${
                      difficulty === d
                        ? DIFFICULTY_BADGE[d]
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-white/40 dark:hover:bg-white/10"
                    }`}
                  >
                    {DIFFICULTY_LABELS[d]}
                  </button>
                ))}
              </div>

              {/* Quick XP chips */}
              <div className="mt-2.5">
                <p className="mb-1.5 text-[10px] text-gray-400 dark:text-white/30">Valores rápidos ({DIFFICULTY_LABELS[difficulty]}):</p>
                <div className="flex flex-wrap gap-1.5">
                  {RECOMMENDED_XP[difficulty].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, xpReward: opt.value }))}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition cursor-pointer ${
                        form.xpReward === opt.value
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-background border border-border text-gray-600 hover:border-primary/30 hover:bg-primary/5 dark:text-white/60 dark:hover:bg-primary/10"
                      }`}
                      title={opt.hint}
                    >
                      <FiZap size={10} className={form.xpReward === opt.value ? "text-primary" : "text-gray-400 dark:text-white/30"} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-2 text-[10px] text-gray-400 dark:text-white/30">
                Selecciona dificultad y presiona "Sugerir", o elige un valor rápido.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-primary/5 dark:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.key || !form.title || !form.description}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear logro"}
            </button>
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
          <p className="text-sm text-gray-600 dark:text-white/55">
            ¿Estás seguro de eliminar <strong className="text-gray-900 dark:text-white">{deleting?.title}</strong>?
            Esta acción también eliminará el progreso de todos los usuarios asociados a este logro.
          </p>
          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-primary/5 dark:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
