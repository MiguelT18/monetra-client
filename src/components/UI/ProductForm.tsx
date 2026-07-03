"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import {
  createProduct,
  updateProduct,
  type CreateProductInput,
  type ProductResponse,
} from "@/lib/product-api";
import { CATEGORIES } from "@/lib/categories";
import {
  FiX,
  FiCheck,
  FiImage,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { resizeThumbnailFile } from "@/lib/resizeImage";
import { useNotification } from "@/hooks/useNotification";

interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editProduct?: ProductResponse;
}

export function ProductForm({ onClose, onSuccess, editProduct }: ProductFormProps) {
  const isEditing = !!editProduct;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    editProduct?.thumbnail ?? null,
  );
  const [category, setCategory] = useState(editProduct?.category ?? "");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setError: formSetError,
    formState: { errors },
  } = useForm<CreateProductInput>({
    defaultValues: {
      title: editProduct?.title ?? "",
      description: editProduct?.description ?? "",
      price: editProduct?.price ?? 0,
      affiliateEnabled: editProduct?.affiliateEnabled ?? false,
    },
  });

  const { notify } = useNotification();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await resizeThumbnailFile(file);
      setThumbnailPreview(dataUrl);
    } catch (err: any) {
      setError(err.message ?? "Error al procesar la imagen");
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveProduct = async (data: CreateProductInput) => {
    setSubmitting(true);
    setError(null);
    setCategoryError(null);

    const payload: any = {
      ...data,
      price: Number(data.price),
      category: category,
      thumbnail: thumbnailPreview || null,
      commissionRate: data.affiliateEnabled ? 15 : null,
      affiliateCookieDays: data.affiliateEnabled ? 30 : undefined,
    };

    if (isEditing && thumbnailPreview === null && editProduct?.thumbnail) {
      payload.thumbnail = null;
    }

    const { ok, result } = isEditing
      ? await updateProduct(editProduct!.id, payload)
      : await createProduct(payload);

    if (!ok) {
      if (result.errors) {
        for (const err of result.errors) {
          if (err.field === "category") {
            setCategoryError(err.message);
          } else {
            formSetError(err.field as any, { message: err.message });
          }
        }
      } else {
        setError(result.message ?? "Error al guardar el producto");
      }
      setSubmitting(false);
      return;
    }

    notify("success", isEditing ? "Producto actualizado" : "Producto creado");
    onSuccess();
  };

  const inputBase =
    "w-full rounded-xl border border-border bg-background/40 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary/60 focus:bg-background focus:shadow-[0_0_0_3px] focus:shadow-primary/10 dark:placeholder:text-white/30";

  const labelBase = "text-sm font-semibold text-gray-700 dark:text-white/80";

  const fieldError = (msg: string | null | undefined) =>
    msg ? <p className="mt-1.5 text-xs font-medium text-red-500">{msg}</p> : null;

  const loadingSpinner = (white?: boolean) => (
    <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${
      white ? "border-white/30 border-t-white" : "border-foreground/30 border-t-foreground"
    }`} />
  );

  return (
    <form className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </h2>
          <p className="text-sm text-foreground/45">
            {isEditing ? "Actualiza los datos de tu producto" : "Completa los datos para crear tu producto"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/30 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer"
        >
          <FiX size={18} />
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-2.5 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className={labelBase}>Título</label>
        <input
          {...register("title", {
            required: "El título es obligatorio",
            minLength: { value: 3, message: "Mínimo 3 caracteres" },
            maxLength: { value: 100, message: "Máximo 100 caracteres" },
          })}
          className={inputBase}
          placeholder="Ej: Curso avanzado de React"
        />
        {fieldError(errors.title?.message)}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelBase}>Descripción</label>
        <textarea
          {...register("description", {
            required: "La descripción es obligatoria",
            minLength: { value: 10, message: "Mínimo 10 caracteres" },
            maxLength: { value: 5000, message: "Máximo 5000 caracteres" },
          })}
          className={`${inputBase} min-h-[120px] resize-y`}
          placeholder="Describe tu producto en detalle..."
        />
        {fieldError(errors.description?.message)}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelBase}>Precio ($)</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-foreground/40">$</span>
          <input
            type="number"
            step="0.01"
            {...register("price", {
              required: "El precio es obligatorio",
              valueAsNumber: true,
              min: { value: 0.01, message: "El precio debe ser mayor a 0" },
              max: { value: 999999, message: "Precio máximo: 999,999" },
            })}
            className={`${inputBase} pl-7`}
            placeholder="0.00"
          />
        </div>
        {fieldError(errors.price?.message)}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelBase}>Categoría</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { setCategory(category === cat.id ? "" : cat.id); setCategoryError(null); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                category === cat.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {fieldError(categoryError)}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelBase}>Miniatura</label>
        <div className="flex items-start gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-background/40 transition-all hover:border-primary/50 hover:bg-primary/5"
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
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-500 group-hover:opacity-100 cursor-pointer"
                >
                  <FiTrash2 size={12} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <FiImage size={28} className="text-foreground/25" />
                <span className="text-[10px] font-medium text-foreground/30">Subir</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-xs font-medium text-gray-600 dark:text-white/60">
              {thumbnailPreview ? "Imagen seleccionada" : "Sube una imagen"}
            </p>
            <p className="text-[11px] leading-relaxed text-foreground/40">
              Formatos: JPG, PNG, WebP<br />
              Máx. 640×640 px
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {!thumbnailPreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 self-start rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/60 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:text-white/60 cursor-pointer"
              >
                <FiUpload size={14} />
                Seleccionar archivo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-background/30 px-4 py-3">
        <div className="relative">
          <input
            type="checkbox"
            id="affiliate"
            {...register("affiliateEnabled")}
            className="peer sr-only"
          />
          <label
            htmlFor="affiliate"
            className="block h-5 w-9 cursor-pointer rounded-full bg-gray-300 transition-colors peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-4 dark:bg-white/20"
          />
        </div>
        <div className="space-y-0.5">
          <label htmlFor="affiliate" className="text-sm font-medium text-gray-700 dark:text-white/80 cursor-pointer">
            Habilitar programa de afiliados
          </label>
          <p className="text-xs text-foreground/45">
            Permite que afiliados promocionen tu producto a cambio de comisión
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/50 transition-colors hover:bg-gray-100 hover:text-foreground/80 dark:hover:bg-white/5 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit(saveProduct)}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            loadingSpinner(true)
          ) : (
            <FiCheck size={16} className="shrink-0" />
          )}
          {submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
