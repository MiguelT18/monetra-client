"use client";

import { useState, useEffect, use } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import {
  getCourseContent,
  completeLesson,
  getModuleEvaluation,
  submitModuleEvaluation,
  type CourseContentResponse,
  type LessonResponse,
  type ModuleResponse,
  type ModuleEvaluationResponse,
  type EvaluationResultResponse,
  type SubmitEvaluationAnswer,
  type EvaluationQuestionResponse,
  type GradedAnswerResponse,
  type QuestionType,
} from "@/lib/enrollment-api";
import { HlsPlayer } from "@/components/player/HlsPlayer";
import {
  FiChevronLeft,
  FiCheckCircle,
  FiCircle,
  FiPlay,
  FiCheck,
  FiClock,
  FiArrowLeft,
  FiAward,
  FiClipboard,
  FiX,
} from "react-icons/fi";
import Link from "next/link";

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const { enrollmentId } = use(params);
  const { user, loading: profileLoading } = useProfile();
  const router = useRouter();

  const [content, setContent] = useState<CourseContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  const [evaluation, setEvaluation] = useState<ModuleEvaluationResponse | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [evaluationStarted, setEvaluationStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | number[] | string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResultResponse | null>(null);

  useEffect(() => {
    if (profileLoading) return;

    const loadContent = async () => {
      setLoading(true);
      const { ok, result } = await getCourseContent(enrollmentId);
      if (ok && result.data) {
        const data = result.data as CourseContentResponse;
        setContent(data);

        const firstIncomplete = findFirstIncomplete(
          data.product.modules,
          data.enrollment.completedLessons,
        );
        if (firstIncomplete) {
          setActiveModule(firstIncomplete.moduleIndex);
          setActiveLesson(firstIncomplete.lessonIndex);
        }
      } else {
        setError(result.message || "No se pudo cargar el contenido");
      }
      setLoading(false);
    };

    loadContent();
  }, [enrollmentId, profileLoading]);

  if (profileLoading || loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-white/10" />
          <div className="aspect-video rounded-xl bg-gray-200 dark:bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {error || "Contenido no disponible"}
        </p>
        <Link
          href="/user/courses"
          className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <FiArrowLeft size={14} />
          Volver a mis cursos
        </Link>
      </div>
    );
  }

  const { enrollment, product } = content;
  const completedLessons = enrollment.completedLessons || [];
  const currentLesson =
    product.modules[activeModule]?.lessons[activeLesson];
  const isCompleted = currentLesson?.completed;
  const progress = enrollment.progress;

  const currentModule = product.modules[activeModule];
  const allLessonsCompleted = currentModule?.lessons.every((_, li) =>
    completedLessons.includes(`${activeModule}-${li}`),
  );
  const canTakeEvaluation =
    allLessonsCompleted &&
    currentModule?.hasEvaluation &&
    !currentModule.evaluationPassed;

  const handleComplete = async () => {
    setCompleting(true);
    const { ok, result } = await completeLesson(
      enrollmentId,
      activeModule,
      activeLesson,
    );
    if (ok && result.data) {
      const data = result.data as {
        progress: number;
        courseCompleted?: boolean;
      };
      setContent((prev) => {
        if (!prev) return prev;
        const newModules = prev.product.modules.map((mod, mi) => ({
          ...mod,
          lessons: mod.lessons.map((les, li) => ({
            ...les,
            completed:
              mi === activeModule && li === activeLesson ? true : les.completed,
          })),
        }));
        return {
          ...prev,
          enrollment: {
            ...prev.enrollment,
            progress: data.progress,
            completedLessons: [
              ...prev.enrollment.completedLessons,
              `${activeModule}-${activeLesson}`,
            ],
          },
          product: { ...prev.product, modules: newModules },
        };
      });

      if (data.courseCompleted) {
        setCompletedMessage(
          "¡Felicidades! Has completado el curso. Has ganado +200 XP.",
        );
      }

      const next = findNextLesson(
        product.modules,
        completedLessons,
        activeModule,
        activeLesson,
      );
      if (next) {
        setActiveModule(next.moduleIndex);
        setActiveLesson(next.lessonIndex);
      }
    }
    setCompleting(false);
  };

  const handleStartEvaluation = async () => {
    setEvaluationLoading(true);
    const { ok, result } = await getModuleEvaluation(enrollmentId, activeModule);
    if (ok && result.data) {
      setEvaluation(result.data as ModuleEvaluationResponse);
      setEvaluationStarted(true);
      setAnswers({});
      setEvaluationResult(null);
    } else {
      setError(result.message || "No se pudo cargar la evaluación");
    }
    setEvaluationLoading(false);
  };

  const handleSubmitEvaluation = async () => {
    if (Object.keys(answers).length < (evaluation?.questions.length ?? 0)) return;

    setSubmitting(true);
    const formatted: SubmitEvaluationAnswer[] = evaluation!.questions.map((q) => {
      const answer = answers[q.id];
      if (q.type === "short-answer") {
        return { questionId: q.id, textAnswer: String(answer ?? "") };
      }
      if (q.type === "multiple-answer") {
        return { questionId: q.id, selectedIndices: (answer as number[]) ?? [] };
      }
      return { questionId: q.id, selectedIndex: (answer as number) ?? -1 };
    });
    const { ok, result } = await submitModuleEvaluation(
      enrollmentId,
      activeModule,
      formatted,
    );
    if (ok && result.data) {
      const evalResult = result.data as EvaluationResultResponse;
      setEvaluationResult(evalResult);
      setContent((prev) => {
        if (!prev) return prev;
        const newModules = prev.product.modules.map((mod, mi) => {
          if (mi === activeModule) {
            return {
              ...mod,
              evaluationPassed: evalResult.passed,
              evaluationScore: evalResult.score,
            };
          }
          return mod;
        });
        return {
          ...prev,
          enrollment: {
            ...prev.enrollment,
            progress: evalResult.passed
              ? Math.min(
                  100,
                  prev.enrollment.progress +
                    Math.round(100 / newModules.length),
                )
              : prev.enrollment.progress,
            moduleResults: {
              ...prev.enrollment.moduleResults,
              [String(activeModule)]: {
                score: evalResult.score,
                passed: evalResult.passed,
                attemptedAt: new Date().toISOString(),
              },
            },
          },
          product: { ...prev.product, modules: newModules },
        };
      });

      if (evalResult.passed && evalResult.score === 100) {
        setCompletedMessage(
          `¡Evaluación aprobada! Puntaje: ${evalResult.score}%`,
        );
        setTimeout(() => setCompletedMessage(null), 5000);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col">
      <header className="flex items-center gap-4 border-b border-border px-4 py-3 sm:px-6">
        <Link
          href="/user/courses"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <FiArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {product.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/45">
            <span>Progreso: {progress}%</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {completedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 sm:mx-6"
        >
          <FiAward size={18} />
          {completedMessage}
        </motion.div>
      )}

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="w-full border-b border-border bg-background/40 lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
          <nav className="max-h-[40vh] overflow-y-auto p-3 lg:max-h-[calc(100vh-12rem)]">
            {product.modules.map((mod, mi) => (
              <div key={mi} className="mb-3">
                <button
                  onClick={() =>
                    setActiveModule(activeModule === mi ? -1 : mi)
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/5"
                >
                  <FiChevronLeft
                    size={14}
                    className={`shrink-0 transition-transform ${
                      activeModule === mi ? "-rotate-90" : ""
                    }`}
                  />
                  <span className="flex-1 truncate">{mod.title}</span>
                  {mod.evaluationPassed ? (
                    <FiCheckCircle size={14} className="shrink-0 text-emerald-500" />
                  ) : mod.hasEvaluation ? (
                    <FiClipboard size={14} className="shrink-0 text-amber-500" />
                  ) : null}
                </button>
                {activeModule === mi && (
                  <div className="ml-1 mt-1 space-y-0.5">
                    {mod.lessons.map((les, li) => {
                      const isActive =
                        activeModule === mi && activeLesson === li;
                      return (
                        <button
                          key={li}
                          onClick={() => {
                            setActiveModule(mi);
                            setActiveLesson(li);
                            setEvaluationStarted(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-gray-600 hover:bg-gray-50 dark:text-white/55 dark:hover:bg-white/5"
                          }`}
                        >
                          {les.completed ? (
                            <FiCheckCircle
                              size={14}
                              className="shrink-0 text-emerald-500"
                            />
                          ) : isActive ? (
                            <FiPlay
                              size={14}
                              className="shrink-0 text-primary"
                            />
                          ) : (
                            <FiCircle
                              size={14}
                              className="shrink-0 text-gray-300 dark:text-white/20"
                            />
                          )}
                          <span className="flex-1 truncate">
                            {les.title}
                          </span>
                          {les.durationMinutes && (
                            <span className="shrink-0 text-[10px] text-gray-400 dark:text-white/30">
                              {les.durationMinutes}min
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {mod.hasEvaluation && (
                      <button
                        onClick={() => {
                          setEvaluationStarted(false);
                          setActiveLesson(-1);
                          handleStartEvaluation();
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                          evaluationStarted && !activeLesson && activeLesson < 0
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-gray-600 hover:bg-gray-50 dark:text-white/55 dark:hover:bg-white/5"
                        }`}
                      >
                        {mod.evaluationPassed ? (
                          <FiCheckCircle size={14} className="shrink-0 text-emerald-500" />
                        ) : (
                          <FiClipboard size={14} className="shrink-0 text-amber-500" />
                        )}
                        <span className="flex-1 truncate">
                          Evaluación
                        </span>
                        {mod.evaluationScore !== null && (
                          <span className="shrink-0 text-[10px] text-gray-400 dark:text-white/30">
                            {mod.evaluationScore}%
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6">
          {evaluationStarted && evaluation ? (
            <EvaluationView
              evaluation={evaluation}
              answers={answers}
              setAnswers={setAnswers}
              submitting={submitting}
              result={evaluationResult}
              onBack={() => {
                setEvaluationStarted(false);
                setActiveLesson(0);
              }}
              onSubmit={handleSubmitEvaluation}
              onRetry={() => {
                setAnswers({});
                setEvaluationResult(null);
                handleStartEvaluation();
              }}
            />
          ) : currentLesson ? (
            <motion.div
              key={`${activeModule}-${activeLesson}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto max-w-4xl"
            >
              {currentLesson.hlsUrl ? (
                <HlsPlayer
                  url={currentLesson.hlsUrl}
                  enrollmentId={enrollmentId}
                  moduleIndex={activeModule}
                  lessonIndex={activeLesson}
                  onComplete={() => {
                    if (!isCompleted) handleComplete();
                  }}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10">
                  <p className="text-sm text-gray-500 dark:text-white/40">
                    {currentLesson.content
                      ? "Contenido de texto"
                      : "No hay video disponible"}
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentLesson.title}
                  </h2>
                  {currentLesson.durationMinutes && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-white/45">
                      <FiClock size={14} />
                      {currentLesson.durationMinutes} minutos
                    </p>
                  )}
                </div>

                {currentLesson.content && (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-line text-gray-700 dark:text-white/70">
                      {currentLesson.content}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  {!isCompleted ? (
                    <button
                      onClick={handleComplete}
                      disabled={completing}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {completing ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <FiCheck size={16} />
                      )}
                      {completing ? "Completando..." : "Marcar como completada"}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <FiCheckCircle size={16} />
                      Completada
                    </span>
                  )}

                  {canTakeEvaluation && (
                    <button
                      onClick={handleStartEvaluation}
                      disabled={evaluationLoading}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                    >
                      {evaluationLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <FiClipboard size={16} />
                      )}
                      Tomar evaluación
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FiAward size={48} className="mb-4 text-gray-300 dark:text-white/20" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {progress === 100
                  ? "¡Curso completado!"
                  : "Selecciona una lección"}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-white/45">
                {progress === 100
                  ? "Felicidades, has completado todas las evaluaciones."
                  : "Elige una lección del menú lateral para empezar."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EvaluationView({
  evaluation,
  answers,
  setAnswers,
  submitting,
  result,
  onBack,
  onSubmit,
  onRetry,
}: {
  evaluation: ModuleEvaluationResponse;
  answers: Record<string, number | number[] | string>;
  setAnswers: (fn: (prev: Record<string, number | number[] | string>) => Record<string, number | number[] | string>) => void;
  submitting: boolean;
  result: EvaluationResultResponse | null;
  onBack: () => void;
  onSubmit: () => void;
  onRetry: () => void;
}) {
  const allAnswered = evaluation.questions.every((q) => {
    const a = answers[q.id];
    if (a === undefined) return false;
    if (q.type === "multiple-answer") return (a as number[]).length > 0;
    if (q.type === "short-answer") return typeof a === "string" && a.trim() !== "";
    return true;
  });
  const passed = result?.passed;

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <div className={`rounded-2xl p-8 text-center ${
          passed
            ? "bg-emerald-50 dark:bg-emerald-500/10"
            : "bg-red-50 dark:bg-red-500/10"
        }`}>
          {passed ? (
            <FiCheckCircle size={48} className="mx-auto text-emerald-500" />
          ) : (
            <FiX size={48} className="mx-auto text-red-500" />
          )}
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
            {passed ? "¡Evaluación aprobada!" : "Evaluación no aprobada"}
          </h2>
          <p className={`mt-2 text-lg font-semibold ${
            passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}>
            {result.score}% - {result.correctCount} de {result.totalQuestions} correctas
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/45">
            Mínimo para aprobar: {result.passingScore}%
          </p>
          <div className="mt-6 space-y-2">
            {evaluation.questions.map((q, i) => {
              const graded = result.gradedAnswers.find((a) => a.questionId === q.id);
              const userAnswer = graded?.textAnswer != null
                ? `"${graded.textAnswer}"`
                : graded?.selectedIndices
                  ? graded.selectedIndices.map((si: number) => q.options?.[si] ?? si).join(", ")
                  : q.options?.[graded?.selectedIndex ?? -1] ?? "N/A";
              return (
                <div key={q.id} className={`rounded-xl border p-4 text-left ${
                  graded?.correct
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                    : "border-red-200 bg-red-50/50 dark:border-red-500/30 dark:bg-red-500/5"
                }`}>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {i + 1}. {q.question}
                  </p>
                  <p className={`mt-1 text-xs ${
                    graded?.correct
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {graded?.correct ? "Correcta" : `Incorrecta (respuesta: ${userAnswer})`}
                  </p>
                </div>
              );
            })}
          </div>
          {passed ? (
            <button
              onClick={onBack}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={onRetry}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 cursor-pointer"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Evaluación: {evaluation.moduleTitle}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/45">
          {evaluation.totalQuestions} preguntas - Mínimo para aprobar: {evaluation.passingScore}%
        </p>
      </div>

      <div className="space-y-6">
        {evaluation.questions.map((q, i) => (
          <div key={q.id} className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {i + 1}. {q.question}
              </p>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-white/10 dark:text-white/50">
                {q.type === "multiple-choice" ? "Opción única" : q.type === "true-false" ? "V/F" : q.type === "multiple-answer" ? "Selección múltiple" : "Escrita"}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {(q.type === "multiple-choice" || q.type === "true-false") && q.options?.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    answers[q.id] === oi
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={oi}
                    checked={answers[q.id] === oi}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                    className="h-4 w-4 text-primary accent-primary"
                  />
                  <span className="text-sm text-gray-700 dark:text-white/70">{opt}</span>
                </label>
              ))}
              {q.type === "multiple-answer" && q.options?.map((opt, oi) => {
                const selected = (answers[q.id] as number[]) ?? [];
                const isChecked = selected.includes(oi);
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      isChecked
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setAnswers((prev) => {
                          const current = (prev[q.id] as number[]) ?? [];
                          const next = isChecked
                            ? current.filter((v: number) => v !== oi)
                            : [...current, oi];
                          return { ...prev, [q.id]: next };
                        });
                      }}
                      className="h-4 w-4 rounded text-primary accent-primary"
                    />
                    <span className="text-sm text-gray-700 dark:text-white/70">{opt}</span>
                  </label>
                );
              })}
              {q.type === "short-answer" && (
                <textarea
                  value={typeof answers[q.id] === "string" ? answers[q.id] as string : ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary/60 dark:text-white/70 dark:placeholder:text-white/30"
                  placeholder="Escribe tu respuesta..."
                  rows={3}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:text-white/70 dark:hover:bg-white/5 cursor-pointer"
        >
          Volver
        </button>
        <button
          onClick={onSubmit}
          disabled={!allAnswered || submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <FiCheck size={16} />
          )}
          {submitting ? "Enviando..." : "Enviar evaluación"}
        </button>
      </div>
    </motion.div>
  );
}

function findFirstIncomplete(
  modules: ModuleResponse[],
  completed: string[],
): { moduleIndex: number; lessonIndex: number } | null {
  for (let mi = 0; mi < modules.length; mi++) {
    for (let li = 0; li < modules[mi].lessons.length; li++) {
      if (!completed.includes(`${mi}-${li}`)) {
        return { moduleIndex: mi, lessonIndex: li };
      }
    }
  }
  return null;
}

function findNextLesson(
  modules: ModuleResponse[],
  completed: string[],
  currentModule: number,
  currentLesson: number,
): { moduleIndex: number; lessonIndex: number } | null {
  const key = `${currentModule}-${currentLesson}`;
  if (!completed.includes(key)) {
    return findFirstIncomplete(modules, completed);
  }
  let found = false;
  for (let mi = 0; mi < modules.length; mi++) {
    for (let li = 0; li < modules[mi].lessons.length; li++) {
      if (mi === currentModule && li === currentLesson) {
        found = true;
        continue;
      }
      if (found && !completed.includes(`${mi}-${li}`)) {
        return { moduleIndex: mi, lessonIndex: li };
      }
    }
  }
  return null;
}
