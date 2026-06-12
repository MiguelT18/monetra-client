"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useNotification } from "@/hooks/useNotification";
import type { Role } from "@/types/user";
import {
  getProductPreview,
  updateProduct,
  submitForReview,
  type ProductResponse,
  type ModuleData,
} from "@/lib/product-api";
import { UserPageHeader } from "@/components/user/userShell";
import {
  FiArrowLeft,
  FiSave,
  FiSend,
  FiVideo,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiChevronRight,
  FiImage,
  FiFileText,
  FiClock,
  FiLink,
} from "react-icons/fi";
import { resizeThumbnailFile } from "@/lib/resizeImage";

interface LessonForm {
  title: string;
  durationMinutes: string;
}

interface ModuleForm {
  title: string;
  lessons: LessonForm[];
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const { user, loading: profileLoading } = useProfile();
  const role = (user?.role ?? "STUDENT") as Role;
  const { notify } = useNotification();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [affiliateEnabled, setAffiliateEnabled] = useState(false);
  const [commissionRate, setCommissionRate] = useState("");
  const [affiliateCookieDays, setAffiliateCookieDays] = useState("30");

  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [modules, setModules] = useState<ModuleForm[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    if (profileLoading || role !== "CREATOR") return;

    const loadProduct = async () => {
      const { ok, result } = await getProductPreview(productId);
      if (ok && result.data?.product) {
        const p = result.data.product;
        setProduct(p);
        setTitle(p.title);
        setDescription(p.description);
        setPrice(String(p.price));
        setThumbnailPreview(p.thumbnail ?? null);
        setAffiliateEnabled(p.affiliateEnabled);
        setCommissionRate(p.commissionRate != null ? String(p.commissionRate) : "");
        setAffiliateCookieDays(String(p.affiliateCookieDays || 30));
        setIntroVideoUrl(p.introVideoUrl ?? "");

        if (p.modules && Array.isArray(p.modules)) {
          setModules(
            p.modules.map((m) => ({
              title: m.title,
              lessons: m.lessons.map((l) => ({
                title: l.title,
                durationMinutes: l.durationMinutes != null ? String(l.durationMinutes) : "",
              })),
            }))
          );
        }
      }
      setLoading(false);
    };

    loadProduct();
  }, [profileLoading, role, productId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setThumbnailFile(file);
      const dataUrl = await resizeThumbnailFile(file);
      setThumbnailPreview(dataUrl);
    } catch (err: any) {
      setError(err.message ?? "Error al procesar la imagen");
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
    setThumbnailFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addModule = () => {
    setModules([...modules, { title: "", lessons: [{ title: "", durationMinutes: "" }] }]);
    setExpandedModules(new Set([...expandedModules, modules.length]));
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
    const newExpanded = new Set(expandedModules);
    newExpanded.delete(index);
    setExpandedModules(newExpanded);
  };

  const updateModuleTitle = (index: number, value: string) => {
    const updated = [...modules];
    updated[index].title = value;
    setModules(updated);
  };

  const toggleModule = (index: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedModules(newExpanded);
  };

  const addLesson = (moduleIndex: number) => {
    const updated = [...modules];
    updated[moduleIndex].lessons.push({ title: "", durationMinutes: "" });
    setModules(updated);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const updated = [...modules];
    updated[moduleIndex].lessons.splice(lessonIndex, 1);
    setModules(updated);
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: "title" | "durationMinutes",
    value: string
  ) => {
    const updated = [...modules];
    (updated[moduleIndex].lessons[lessonIndex] as any)[field] = value;
    setModules(updated);
  };

  const buildModulesPayload = (): ModuleData | null => {
    const valid = modules.filter(
      (m) => m.title.trim() !== "" || m.lessons.some((l) => l.title.trim() !== "")
    );
    if (valid.length === 0) return null;
    return valid.map((m) => ({
      title: m.title.trim(),
      lessons: m.lessons
        .filter((l) => l.title.trim() !== "")
        .map((l) => ({
          title: l.title.trim(),
          durationMinutes: l.durationMinutes ? Number(l.durationMinutes) : undefined,
        })),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      thumbnail: thumbnailPreview || null,
      affiliateEnabled,
      commissionRate: affiliateEnabled && commissionRate ? Number(commissionRate) : null,
      affiliateCookieDays: affiliateEnabled ? Number(affiliateCookieDays) : undefined,
      introVideoUrl: introVideoUrl.trim() || null,
      modules: buildModulesPayload(),
    };

    if (thumbnailPreview === null && product?.thumbnail) {
      payload.thumbnail = null;
    }

    const { ok, result } = await updateProduct(productId, payload);
    if (!ok) {
      setError(result.message ?? "Error al guardar");
      setSaving(false);
      return;
    }

    notify("success", "Producto actualizado");
    setSaving(false);
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    setError(null);

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      thumbnail: thumbnailPreview || null,
      affiliateEnabled,
      commissionRate: affiliateEnabled && commissionRate ? Number(commissionRate) : null,
      affiliateCookieDays: affiliateEnabled ? Number(affiliateCookieDays) : undefined,
      introVideoUrl: introVideoUrl.trim() || null,
      modules: buildModulesPayload(),
    };

    if (thumbnailPreview === null && product?.thumbnail) {
      payload.thumbnail = null;
    }

    const { ok: updateOk } = await updateProduct(productId, payload);
    if (!updateOk) {
      setError("Error al guardar los cambios");
      setSubmittingReview(false);
      return;
    }

    const { ok: reviewOk } = await submitForReview(productId);
    if (!reviewOk) {
      setError("Error al enviar a revisión");
      setSubmittingReview(false);
      return;
    }

    notify("success", "Producto enviado a revisión");
    router.push("/user/products");
  };

  const inputBase =
    "w-full rounded-xl border border-border bg-background/40 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary/60 focus:bg-background focus:shadow-[0_0_0_3px] focus:shadow-primary/10 dark:placeholder:text-white/30";

  const labelBase = "text-sm font-semibold text-gray-700 dark:text-white/80";

  if (profileLoading || role !== "CREATOR") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-surface" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-500 dark:text-white/45">
          Producto no encontrado
        </p>
        <button
          onClick={() => router.push("/user/products")}
          className="text-sm font-medium text-primary hover:underline cursor-pointer"
        >
          Volver a Mis productos
        </button>
      </div>
    );
  }

  const canSubmitReview =
    product.status === "DRAFT" || product.status === "REJECTED";

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/user/products")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-white/45 dark:hover:text-white cursor-pointer"
      >
        <FiArrowLeft size={14} />
        Mis productos
      </button>

      <UserPageHeader
        title="Editar producto"
        description={product.title}
        badge={
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              product.status === "PUBLISHED"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : product.status === "DRAFT"
                  ? "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/60"
                  : product.status === "UNDER_REVIEW"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    : "bg-red-500/15 text-red-600 dark:text-red-400"
            }`}
          >
            {product.status === "PUBLISHED"
              ? "Activo"
              : product.status === "DRAFT"
                ? "Borrador"
                : product.status === "UNDER_REVIEW"
                  ? "En revisión"
                  : "Rechazado"}
          </span>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
              Información básica
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelBase}>Título</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputBase}
                  placeholder="Ej: Curso avanzado de React"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelBase}>Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputBase} min-h-[140px] resize-y`}
                  placeholder="Describe tu producto en detalle..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelBase}>Precio ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`${inputBase} pl-7`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FiVideo size={16} className="text-gray-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Video de introducción
              </h2>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelBase}>URL del video</label>
              <div className="relative">
                <FiLink
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={introVideoUrl}
                  onChange={(e) => setIntroVideoUrl(e.target.value)}
                  className={`${inputBase} pl-9`}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-white/35">
                Soporta YouTube y Vimeo. Este video se muestra en la página pública
                del curso.
              </p>
            </div>
            {introVideoUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-border">
                <div className="flex aspect-video items-center justify-center bg-gray-100 dark:bg-white/5">
                  <div className="text-center">
                    <FiVideo
                      size={24}
                      className="mx-auto mb-2 text-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-white/45">
                      Vista previa del video
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiFileText size={16} className="text-gray-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Contenido del curso
                </h2>
              </div>
              <button
                onClick={addModule}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary/40 hover:text-primary dark:text-white/60 cursor-pointer"
              >
                <FiPlus size={12} />
                Módulo
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center dark:bg-white/2">
                <FiFileText
                  size={28}
                  className="mx-auto mb-2 text-gray-300 dark:text-white/20"
                />
                <p className="text-sm font-medium text-gray-500 dark:text-white/45">
                  Sin contenido aún
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-white/30">
                  Agrega módulos y clases para estructurar tu curso
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {modules.map((mod, mIndex) => (
                  <div
                    key={mIndex}
                    className="overflow-hidden rounded-xl border border-border bg-background/60 dark:bg-white/3"
                  >
                    <div
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/5"
                      onClick={() => toggleModule(mIndex)}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {mIndex + 1}
                      </span>
                      <input
                        value={mod.title}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateModuleTitle(mIndex, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-white/30"
                        placeholder="Título del módulo"
                      />
                      <span className="text-[11px] text-gray-400 dark:text-white/35">
                        {mod.lessons.length}{" "}
                        {mod.lessons.length === 1 ? "clase" : "clases"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeModule(mIndex);
                        }}
                        className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer"
                      >
                        <FiTrash2 size={14} />
                      </button>
                      {expandedModules.has(mIndex) ? (
                        <FiChevronDown
                          size={16}
                          className="shrink-0 text-gray-400"
                        />
                      ) : (
                        <FiChevronRight
                          size={16}
                          className="shrink-0 text-gray-400"
                        />
                      )}
                    </div>

                    {expandedModules.has(mIndex) && (
                      <div className="border-t border-border/50 px-4 py-3 space-y-2">
                        {mod.lessons.map((lesson, lIndex) => (
                          <div
                            key={lIndex}
                            className="flex items-center gap-2"
                          >
                            <FiFileText
                              size={12}
                              className="shrink-0 text-gray-400 dark:text-white/30"
                            />
                            <input
                              value={lesson.title}
                              onChange={(e) =>
                                updateLesson(mIndex, lIndex, "title", e.target.value)
                              }
                              className="min-w-0 flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400 dark:text-white/70 dark:placeholder:text-white/30"
                              placeholder="Título de la clase"
                            />
                            <div className="relative shrink-0">
                              <FiClock
                                size={10}
                                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                              />
                              <input
                                type="number"
                                value={lesson.durationMinutes}
                                onChange={(e) =>
                                  updateLesson(
                                    mIndex,
                                    lIndex,
                                    "durationMinutes",
                                    e.target.value
                                  )
                                }
                                className="w-16 rounded-lg border border-border bg-background/40 py-1 pl-6 pr-1 text-[11px] text-gray-600 outline-none focus:border-primary/50 dark:text-white/60"
                                placeholder="min"
                              />
                            </div>
                            <button
                              onClick={() => removeLesson(mIndex, lIndex)}
                              className="rounded-md p-1 text-gray-400 transition-colors hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addLesson(mIndex)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary transition-colors hover:text-primary/80 cursor-pointer"
                        >
                          <FiPlus size={10} />
                          Agregar clase
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
              Miniatura
            </h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-background/40 transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              {thumbnailPreview ? (
                <>
                  <img
                    src={thumbnailPreview}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveThumbnail();
                    }}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 cursor-pointer"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FiImage size={28} className="text-gray-300 dark:text-white/20" />
                  <span className="text-xs font-medium text-gray-400 dark:text-white/35">
                    Subir imagen
                  </span>
                </div>
              )}
            </div>
            <p className="mt-2 text-[11px] text-gray-400 dark:text-white/30">
              JPG, PNG o WebP. Máx. 640x640 px
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
              Afiliados
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  id="affiliate-edit"
                  checked={affiliateEnabled}
                  onChange={(e) => setAffiliateEnabled(e.target.checked)}
                  className="peer sr-only"
                />
                <label
                  htmlFor="affiliate-edit"
                  className="block h-5 w-9 cursor-pointer rounded-full bg-gray-300 transition-colors peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-4 dark:bg-white/20"
                />
              </div>
              <div className="space-y-0.5">
                <label
                  htmlFor="affiliate-edit"
                  className="text-sm font-medium text-gray-700 dark:text-white/80 cursor-pointer"
                >
                  Programa de afiliados
                </label>
                <p className="text-xs text-gray-400 dark:text-white/35">
                  Permite que afiliados promocionen tu producto
                </p>
              </div>
            </div>

            {affiliateEnabled && (
              <div className="mt-4 space-y-3 pl-2 border-l-2 border-primary/20">
                <div className="flex flex-col gap-1.5">
                  <label className={labelBase}>Comisión (%)</label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className={`${inputBase} max-w-32`}
                    placeholder="15"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelBase}>Días de cookie</label>
                  <input
                    type="number"
                    value={affiliateCookieDays}
                    onChange={(e) => setAffiliateCookieDays(e.target.value)}
                    className={`${inputBase} max-w-32`}
                    placeholder="30"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <button
          onClick={() => router.push("/user/products")}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:text-white/45 cursor-pointer"
        >
          Cancelar
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || submittingReview}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50 dark:text-white/70 cursor-pointer"
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            ) : (
              <FiSave size={16} className="shrink-0" />
            )}
            {saving ? "Guardando..." : "Guardar"}
          </button>
          {canSubmitReview && (
            <button
              onClick={handleSubmitReview}
              disabled={saving || submittingReview}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
            >
              {submittingReview ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FiSend size={16} className="shrink-0" />
              )}
              {submittingReview ? "Enviando..." : "Enviar a revisión"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
