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
import { FiX, FiCheck, FiImage, FiTrash2 } from "react-icons/fi";
import { Select } from "@/components/UI/Select";
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductInput>({
    defaultValues: {
      title: editProduct?.title ?? "",
      description: editProduct?.description ?? "",
      price: editProduct?.price ?? 0,
      status: editProduct?.status ?? "DRAFT",
      affiliateEnabled: editProduct?.affiliateEnabled ?? false,
      commissionRate: editProduct?.commissionRate ?? null,
      affiliateCookieDays: editProduct?.affiliateCookieDays ?? 30,
    },
  });

  const { notify } = useNotification();

  const watchedAffiliate = watch("affiliateEnabled");

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: CreateProductInput) => {
    setSubmitting(true);
    setError(null);

    const payload: any = {
      ...data,
      price: Number(data.price),
      thumbnail: thumbnailPreview || null,
      commissionRate: data.affiliateEnabled ? Number(data.commissionRate) : null,
      affiliateCookieDays: data.affiliateEnabled ? Number(data.affiliateCookieDays) : undefined,
    };

    if (isEditing && thumbnailPreview === null && editProduct?.thumbnail) {
      payload.thumbnail = null;
    }

    const { ok, result } = isEditing
      ? await updateProduct(editProduct!.id, payload)
      : await createProduct(payload);

    if (!ok) {
      setError(result.message ?? "Error al guardar el producto");
      setSubmitting(false);
      return;
    }

    notify("success", isEditing ? "Producto actualizado correctamente" : "Producto creado correctamente");
    onSuccess();
  };

  const inputBase =
    "w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-primary dark:placeholder:text-white/30";

  const labelBase = "text-sm font-medium text-gray-700 dark:text-white/80";

  const fieldError = (msg?: string) =>
    msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isEditing ? "Editar producto" : "Nuevo producto"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
        >
          <FiX size={18} />
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}

      <div className="flex flex-col gap-1">
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

      <div className="flex flex-col gap-1">
        <label className={labelBase}>Descripción</label>
        <textarea
          {...register("description", {
            required: "La descripción es obligatoria",
            minLength: { value: 10, message: "Mínimo 10 caracteres" },
            maxLength: { value: 5000, message: "Máximo 5000 caracteres" },
          })}
          className={`${inputBase} min-h-[100px] resize-y`}
          placeholder="Describe tu producto en detalle..."
        />
        {fieldError(errors.description?.message)}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelBase}>Precio ($)</label>
        <input
          type="number"
          step="0.01"
          {...register("price", {
            required: "El precio es obligatorio",
            valueAsNumber: true,
            min: { value: 0.01, message: "El precio debe ser mayor a 0" },
            max: { value: 999999, message: "Precio máximo: 999,999" },
          })}
          className={inputBase}
          placeholder="0.00"
        />
        {fieldError(errors.price?.message)}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelBase}>Miniatura</label>
        <div className="flex items-start gap-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-background/50 transition-colors hover:border-primary/50"
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
                  className="absolute right-1 top-1 rounded-lg bg-black/50 p-1 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80"
                >
                  <FiTrash2 size={12} />
                </button>
              </>
            ) : (
              <FiImage size={24} className="text-gray-400 dark:text-white/30" />
            )}
          </div>
          <div className="flex flex-col gap-1 pt-1">
            <p className="text-xs font-medium text-gray-600 dark:text-white/60">
              {thumbnailPreview ? "Imagen seleccionada" : "Sube una imagen"}
            </p>
            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-white/40">
              Formatos: JPG, PNG, WebP
              <br />
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
                className="mt-1 self-start rounded-lg border border-border px-3 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-primary/5 hover:text-primary dark:text-white/60"
              >
                Seleccionar archivo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelBase} htmlFor="status-select">Estado</label>
        <Select
          id="status-select"
          value={watch("status") ?? "DRAFT"}
          onChange={(v) => setValue("status", v as "DRAFT" | "PUBLISHED")}
          options={[
            { value: "DRAFT", label: "Borrador" },
            { value: "PUBLISHED", label: "Publicado" },
          ]}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="affiliate"
          {...register("affiliateEnabled")}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <label htmlFor="affiliate" className="text-sm text-gray-700 dark:text-white/80">
          Habilitar programa de afiliados
        </label>
      </div>

      {watchedAffiliate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className={labelBase}>Comisión (%)</label>
            <input
              type="number"
              {...register("commissionRate", {
                valueAsNumber: true,
                min: { value: 0, message: "Mínimo 0%" },
                max: { value: 100, message: "Máximo 100%" },
              })}
              className={inputBase}
              placeholder="15"
            />
            {fieldError(errors.commissionRate?.message)}
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelBase}>Días de cookie</label>
            <p className="text-xs text-gray-500 dark:text-white/45 leading-relaxed">
              Ventana de tiempo (en días) durante la que el afiliado recibe
              comisión si el usuario compra después de hacer clic en su enlace.
              Por ejemplo: 30 días significa que si un usuario compra hasta 30
              días después del clic, el afiliado gana su comisión.
            </p>
            <input
              type="number"
              {...register("affiliateCookieDays", {
                valueAsNumber: true,
                min: { value: 1, message: "Mínimo 1 día" },
                max: { value: 365, message: "Máximo 365 días" },
              })}
              className={inputBase}
              placeholder="30"
            />
            {fieldError(errors.affiliateCookieDays?.message)}
          </div>
        </motion.div>
      )}

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <FiCheck size={16} />
          )}
          {submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
