"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { createProduct, type CreateProductInput } from "@/lib/product-api";
import { FiX, FiCheck } from "react-icons/fi";
import { Select } from "@/components/UI/Select";

interface CreateProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProductForm({ onClose, onSuccess }: CreateProductFormProps) {
  const [affiliateEnabled, setAffiliateEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductInput>({
    defaultValues: {
      status: "DRAFT",
      affiliateEnabled: false,
      commissionRate: null,
      affiliateCookieDays: 30,
    },
  });

  const watchedAffiliate = watch("affiliateEnabled");

  const onSubmit = async (data: CreateProductInput) => {
    setSubmitting(true);
    setError(null);

    const payload = {
      ...data,
      price: Number(data.price),
      commissionRate: data.affiliateEnabled ? Number(data.commissionRate) : null,
      affiliateCookieDays: data.affiliateEnabled ? Number(data.affiliateCookieDays) : undefined,
    };

    const { ok, result } = await createProduct(payload);

    if (!ok) {
      setError(result.message ?? "Error al crear el producto");
      setSubmitting(false);
      return;
    }

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
        <h2 className="text-lg font-semibold">Nuevo producto</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
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
        <label className={labelBase} htmlFor="status-select">Estado inicial</label>
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
          {submitting ? "Creando..." : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
