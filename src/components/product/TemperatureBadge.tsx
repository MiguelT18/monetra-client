"use client";

import { FiThermometer } from "react-icons/fi";

export function TemperatureBadge({ temperature, label }: { temperature: number; label: string }) {
  const color =
    temperature < 25
      ? "from-blue-500 to-cyan-500"
      : temperature < 50
        ? "from-emerald-500 to-teal-500"
        : temperature < 75
          ? "from-amber-500 to-orange-500"
          : "from-red-500 to-rose-500";

  const textColor =
    temperature < 25
      ? "text-blue-600 dark:text-blue-400"
      : temperature < 50
        ? "text-emerald-600 dark:text-emerald-400"
        : temperature < 75
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 dark:bg-white/3">
      <div className="mb-2 flex items-center gap-2">
        <FiThermometer size={16} className={textColor} />
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-white/45">
          Temperatura
        </span>
      </div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${textColor}`}>{temperature}</span>
        <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${temperature}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-gray-500 dark:text-white/40">
        Basado en ventas, inscripciones y comisiones
      </p>
    </div>
  );
}
