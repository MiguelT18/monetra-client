"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { FiBookOpen, FiChevronDown, FiChevronRight, FiPlay, FiEye } from "react-icons/fi";
import type { ModuleData } from "@/lib/product-api";
import type { Role } from "@/types/user";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

interface CurriculumSectionProps {
  modules: ModuleData;
  role?: Role;
  productId?: string;
  onPreviewVideo?: (moduleIndex: number, lessonIndex: number) => void;
}

export default function CurriculumSection({ modules, role, productId, onPreviewVideo }: CurriculumSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const isAdmin = role === "ADMIN";
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
        Contenido del curso
      </h2>
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-500 dark:text-white/45">
        <FiBookOpen size={14} />
        <span>{modules.length} módulo{modules.length !== 1 ? "s" : ""} · {totalLessons} clase{totalLessons !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-2">
        {modules.map((mod, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-border bg-background/60 dark:bg-white/3">
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/5 cursor-pointer"
            >
              {expandedIndex === index ? (
                <FiChevronDown size={16} className="shrink-0 text-primary" />
              ) : (
                <FiChevronRight size={16} className="shrink-0 text-gray-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Módulo {index + 1}: {mod.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-white/45">
                  {mod.lessons.length} clase{mod.lessons.length !== 1 ? "s" : ""}
                </p>
              </div>
            </button>
            {expandedIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border"
              >
                <ul className="divide-y divide-border">
                  {mod.lessons.map((lesson, lessonIndex) => (
                    <li key={lessonIndex} className="flex items-center gap-3 px-4 py-2.5 pl-10">
                      <FiPlay size={12} className="shrink-0 text-gray-400 dark:text-white/35" />
                      <span className="flex-1 text-sm text-gray-700 dark:text-white/70">{lesson.title}</span>
                      {lesson.durationMinutes && (
                        <span className="shrink-0 text-xs text-gray-400 dark:text-white/35">
                          {formatDuration(lesson.durationMinutes)}
                        </span>
                      )}
                      {isAdmin && lesson.hlsUrl && productId && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onPreviewVideo?.(index, lessonIndex); }}
                          className="flex shrink-0 items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10 cursor-pointer"
                        >
                          <FiEye size={11} />
                          Vista previa
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
