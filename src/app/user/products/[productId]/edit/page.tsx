"use client";

import { useState, useEffect, use, useRef, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useNotification } from "@/hooks/useNotification";
import type { Role } from "@/types/user";
import {
  getProduct,
  updateProduct,
  submitForReview,
  type ProductResponse,
  type ModuleData,
} from "@/lib/product-api";
import { UserPageHeader } from "@/components/user/userShell";
import { CATEGORIES } from "@/lib/categories";
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
  FiLink,
  FiUploadCloud,
  FiCheckCircle,
  FiInfo,
  FiRotateCcw,
  FiAlertTriangle,
} from "react-icons/fi";
import { Modal } from "@/components/UI/Modal";
import { Select } from "@/components/UI/Select";
import { resizeThumbnailFile } from "@/lib/resizeImage";
import {
  requestUploadUrl,
  uploadToR2,
  startProcessing,
  checkUploadStatus,
  confirmAsset,
  confirmIntroVideo,
  confirmAffiliateVideo,
  requestAttachmentUploadUrl,
  confirmAttachment,
  removeAttachment,
} from "@/lib/upload-api";

type QuestionType = "multiple-choice" | "true-false" | "multiple-answer" | "short-answer";

interface EvaluationQuestionForm {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctIndex: number;
  correctIndices: number[];
  correctAnswer: string;
}

interface ModuleEvaluationForm {
  enabled: boolean;
  passingScore: number;
  questions: EvaluationQuestionForm[];
}

interface LessonForm {
  title: string;
  durationMinutes: string;
  content?: string;
  hlsUrl?: string;
  uploading?: boolean;
  attachments?: { id: string; name: string; url: string; type: string; size: number }[];
}

interface ModuleForm {
  title: string;
  lessons: LessonForm[];
  evaluation?: ModuleEvaluationForm;
}

let questionIdCounter = 0;
function newQuestionId() {
  return `q_${Date.now()}_${++questionIdCounter}`;
}

function emptyQuestion(type: QuestionType = "multiple-choice"): EvaluationQuestionForm {
  return {
    id: newQuestionId(),
    type,
    question: "",
    options: type === "true-false" ? ["Verdadero", "Falso"] : ["", ""],
    correctIndex: 0,
    correctIndices: [],
    correctAnswer: "",
  };
}

function emptyEvaluation(): ModuleEvaluationForm {
  return {
    enabled: false,
    passingScore: 60,
    questions: [emptyQuestion()],
  };
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
  const [originalProduct, setOriginalProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetModuleModal, setResetModuleModal] = useState<number | null>(null);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [confirmLeaveModal, setConfirmLeaveModal] = useState(false);
  const errorsRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [affiliateEnabled, setAffiliateEnabled] = useState(false);
  const [commissionRate, setCommissionRate] = useState("");
  const [affiliateCookieDays, setAffiliateCookieDays] = useState("30");
  const {
    register: registerCookie,
    setValue: setCookieValue,
    formState: { errors: cookieErrors },
  } = useForm({
    defaultValues: { affiliateCookieDays: "30" },
    mode: "onChange",
  });
  const {
    setError: setHighlightError,
    clearErrors: clearHighlightErrors,
    formState: { errors: highlightErrors },
  } = useForm<{ category: string }>({
    defaultValues: { category: "" },
  });
  const [missingField, setMissingField] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const field = params.get("highlight");
    if (field === "category") {
      setMissingField("category");
      setHighlightError("category", {
        type: "manual",
        message: "Campo obligatorio: este producto necesita una categoría para poder publicarse.",
      });
      requestAnimationFrame(() => {
        document.querySelector("[data-field='category']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [setHighlightError]);
  useEffect(() => {
    if (missingField === "category" && category) {
      clearHighlightErrors("category");
      setMissingField(null);
    }
  }, [category, missingField, clearHighlightErrors]);
  const [affiliateDescription, setAffiliateDescription] = useState("");
  const [affiliateVideoUrl, setAffiliateVideoUrl] = useState("");
  const [uploadingAffiliateVideo, setUploadingAffiliateVideo] = useState(false);

  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [uploadingIntro, setUploadingIntro] = useState(false);
  const [introPlaybackToken, setIntroPlaybackToken] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleForm[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set()
  );
  const [draftRestored, setDraftRestored] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [loadedFromDraft, setLoadedFromDraft] = useState(false);

  const STORAGE_KEY = `edit_product_${productId}`;

  const saveToDraft = useCallback(() => {
    try {
      const data = {
        title,
        description,
        price,
        category,
        thumbnailPreview,
        affiliateEnabled,
        commissionRate,
        affiliateCookieDays,
        affiliateDescription,
        affiliateVideoUrl,
        introVideoUrl,
        modules: modules as ModuleForm[],
        expandedModules: [...expandedModules],
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [title, description, price, category, thumbnailPreview, affiliateEnabled, commissionRate, affiliateCookieDays, affiliateDescription, affiliateVideoUrl, introVideoUrl, modules, expandedModules, STORAGE_KEY]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setHasDraft(false);
    setLoadedFromDraft(false);
  }, [STORAGE_KEY]);

  const hasUnsavedChanges = useCallback(() => {
    if (!product) return false;
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    try {
      const saved = JSON.parse(data);
      return saved.savedAt > new Date(product.updatedAt).getTime();
    } catch {
      return false;
    }
  }, [STORAGE_KEY, product]);

  useEffect(() => {
    if (profileLoading || role !== "CREATOR") return;

    const loadProduct = async () => {
      const { ok, result } = await getProduct(productId);
      if (ok && result.data?.product) {
        const p = result.data.product;
        setProduct(p);
        setOriginalProduct(p);

        // Merge server-side draftChanges into form if present
        let hasServerDraft = false;
        if (p.draftChanges) {
          hasServerDraft = true;
          const d = p.draftChanges;
          if (d.title) setTitle(d.title);
          if (d.description) setDescription(d.description);
          if (d.price != null) setPrice(String(d.price));
          if (d.category !== undefined) setCategory(d.category ?? "");
          if (d.thumbnail !== undefined) setThumbnailPreview(d.thumbnail ?? null);
          if (d.affiliateEnabled !== undefined) setAffiliateEnabled(d.affiliateEnabled);
          if (d.commissionRate !== undefined) setCommissionRate(d.commissionRate != null ? String(d.commissionRate) : "");
          if (d.affiliateCookieDays !== undefined) setAffiliateCookieDays(String(d.affiliateCookieDays));
          if (d.affiliateCookieDays !== undefined) setCookieValue("affiliateCookieDays", String(d.affiliateCookieDays));
          if (d.affiliateDescription !== undefined) setAffiliateDescription(d.affiliateDescription ?? "");
          if (d.affiliateVideoUrl !== undefined) setAffiliateVideoUrl(d.affiliateVideoUrl ?? "");
          if (d.introVideoUrl !== undefined) setIntroVideoUrl(d.introVideoUrl ?? "");
          if (d.modules && Array.isArray(d.modules)) {
            setModules(
              (d.modules as ModuleData).map((m: any) => ({
                title: m.title,
                lessons: m.lessons.map((l: any) => ({
                  title: l.title,
                  durationMinutes: l.durationMinutes != null ? String(l.durationMinutes) : "",
                  content: l.content || "",
                  hlsUrl: l.hlsUrl || undefined,
                  attachments: l.attachments || [],
                })),
                evaluation: m.evaluation
                  ? {
                      enabled: true,
                      passingScore: m.evaluation.passingScore ?? 60,
                      questions: m.evaluation.questions.map((q: any) => ({
                        id: q.id,
                        type: q.type ?? "multiple-choice",
                        question: q.question,
                        options: q.options ?? [],
                        correctIndex: q.correctIndex ?? 0,
                        correctIndices: q.correctIndices ?? [],
                        correctAnswer: q.correctAnswer ?? "",
                      })),
                    }
                  : undefined,
              }))
            );
          }
        }

        const draftData = localStorage.getItem(STORAGE_KEY);
        let useDraft = false;
        if (draftData) {
          try {
            const parsed = JSON.parse(draftData);
            // localStorage draft overrides server draft if newer
            if (parsed.savedAt > new Date(p.updatedAt).getTime()) {
              useDraft = true;
              setLoadedFromDraft(true);
              setTitle(parsed.title);
              setDescription(parsed.description);
              setPrice(parsed.price);
              if (parsed.category !== undefined) setCategory(parsed.category);
              setThumbnailPreview(parsed.thumbnailPreview ?? null);
              setAffiliateEnabled(parsed.affiliateEnabled);
              setCommissionRate(parsed.commissionRate ?? "");
              setAffiliateCookieDays(parsed.affiliateCookieDays ?? "30");
              setCookieValue("affiliateCookieDays", parsed.affiliateCookieDays ?? "30");
              setAffiliateDescription(parsed.affiliateDescription ?? "");
              setAffiliateVideoUrl(parsed.affiliateVideoUrl ?? "");
              setIntroVideoUrl(parsed.introVideoUrl ?? "");
              if (parsed.modules) setModules(parsed.modules as ModuleForm[]);
              if (parsed.expandedModules) setExpandedModules(new Set(parsed.expandedModules as number[]));
              setHasDraft(true);
            }
          } catch {}
        }

        if (!useDraft && hasServerDraft) {
          setLoadedFromDraft(true);
          setHasDraft(true);
        }

        if (!useDraft && !hasServerDraft) {
          setTitle(p.title);
          setDescription(p.description);
          setPrice(String(p.price));
          setCategory(p.category ?? "");
          setThumbnailPreview(p.thumbnail ?? null);
          setAffiliateEnabled(p.affiliateEnabled);
          setCommissionRate(p.commissionRate != null ? String(p.commissionRate) : "");
          setAffiliateCookieDays(String(p.affiliateCookieDays || 30));
          setCookieValue("affiliateCookieDays", String(p.affiliateCookieDays || 30));
          setAffiliateDescription(p.affiliateDescription ?? "");
          setAffiliateVideoUrl(p.affiliateVideoUrl ?? "");
          setIntroVideoUrl(p.introVideoUrl ?? "");

          if (p.modules && Array.isArray(p.modules)) {
            setModules(
              (p.modules as ModuleData).map((m: any) => ({
                title: m.title,
                lessons: m.lessons.map((l: any) => ({
                  title: l.title,
                  durationMinutes: l.durationMinutes != null ? String(l.durationMinutes) : "",
                  content: l.content || "",
                  hlsUrl: l.hlsUrl || undefined,
                  attachments: l.attachments || [],
                })),
                evaluation: m.evaluation
                  ? {
                      enabled: true,
                      passingScore: m.evaluation.passingScore ?? 60,
                      questions: m.evaluation.questions.map((q: any) => ({
                        id: q.id,
                        type: q.type ?? "multiple-choice",
                        question: q.question,
                        options: q.options ?? [],
                        correctIndex: q.correctIndex ?? 0,
                        correctIndices: q.correctIndices ?? [],
                        correctAnswer: q.correctAnswer ?? "",
                      })),
                    }
                  : undefined,
              }))
            );
          }
        }
      }
      setLoading(false);
    };

    loadProduct();
  }, [productId, profileLoading, role, STORAGE_KEY]);

  useEffect(() => {
    if (loading || !product) return;
    saveToDraft();
  }, [title, description, price, thumbnailPreview, affiliateEnabled, commissionRate, affiliateCookieDays, affiliateDescription, affiliateVideoUrl, introVideoUrl, modules, expandedModules, loading, product, saveToDraft]);

  useEffect(() => {
    if (!loadedFromDraft || !product) return;
    setDraftRestored(true);
    const timer = setTimeout(() => setDraftRestored(false), 6000);
    return () => clearTimeout(timer);
  }, [loadedFromDraft, product]);

  useEffect(() => {
    if (!introVideoUrl) { setIntroPlaybackToken(null); return; }
    if (introVideoUrl.match(/\.m3u8/)) {
      setIntroPlaybackToken(introVideoUrl);
    }
  }, [introVideoUrl]);

  const handleIntroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024 * 1024) {
      notify("error", "El video no puede superar los 2GB");
      return;
    }

    if (file.type !== "video/mp4") {
      notify("error", "Solo se aceptan archivos MP4");
      return;
    }

    setUploadingIntro(true);
    notify("info", "Preparando subida...");

    try {
      const uploadRes = await requestUploadUrl();
      if (!uploadRes.ok) throw new Error("Error al solicitar URL de subida");

      const { url: uploadUrl, uploadId } = uploadRes.result.data;

      notify("info", "Subiendo video a R2...");
      const uploaded = await uploadToR2(file, uploadUrl);
      if (!uploaded) throw new Error("Error al subir el video");

      notify("info", "Iniciando procesamiento...");
      const processRes = await startProcessing(uploadId);
      if (!processRes.ok) throw new Error("Error al iniciar procesamiento");

      notify("info", "Transcodificando video...");
      let hlsUrl: string | null = null;
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 5000));
        const statusRes = await checkUploadStatus(uploadId);
        if (statusRes.ok && statusRes.result.data?.status === "completed") {
          hlsUrl = statusRes.result.data.hlsUrl;
          break;
        }
        if (statusRes.ok && statusRes.result.data?.status === "failed") {
          throw new Error(statusRes.result.data.error || "Error en la transcodificación");
        }
      }

      if (!hlsUrl) throw new Error("El video no se procesó a tiempo");

      const confirmRes = await confirmIntroVideo(productId, hlsUrl);
      if (!confirmRes.ok) throw new Error("Error al confirmar video");

      setIntroVideoUrl(hlsUrl);
      notify("success", "Video subido correctamente");
    } catch {
      notify("error", "Error al subir el video. Verifica e inténtalo de nuevo.");
    } finally {
      setUploadingIntro(false);
    }
  };

  const handleAffiliateVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024 * 1024) {
      notify("error", "El video no puede superar los 2GB");
      return;
    }

    if (file.type !== "video/mp4") {
      notify("error", "Solo se aceptan archivos MP4");
      return;
    }

    setUploadingAffiliateVideo(true);
    notify("info", "Preparando subida...");

    try {
      const uploadRes = await requestUploadUrl();
      if (!uploadRes.ok) throw new Error("Error al solicitar URL de subida");

      const { url: uploadUrl, uploadId } = uploadRes.result.data;

      notify("info", "Subiendo video a R2...");
      const uploaded = await uploadToR2(file, uploadUrl);
      if (!uploaded) throw new Error("Error al subir el video");

      notify("info", "Iniciando procesamiento...");
      const processRes = await startProcessing(uploadId);
      if (!processRes.ok) throw new Error("Error al iniciar procesamiento");

      notify("info", "Transcodificando video...");
      let hlsUrl: string | null = null;
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 5000));
        const statusRes = await checkUploadStatus(uploadId);
        if (statusRes.ok && statusRes.result.data?.status === "completed") {
          hlsUrl = statusRes.result.data.hlsUrl;
          break;
        }
        if (statusRes.ok && statusRes.result.data?.status === "failed") {
          throw new Error(statusRes.result.data.error || "Error en la transcodificación");
        }
      }

      if (!hlsUrl) throw new Error("El video no se procesó a tiempo");

      const confirmRes = await confirmAffiliateVideo(productId, hlsUrl);
      if (!confirmRes.ok) throw new Error("Error al confirmar video");

      setAffiliateVideoUrl(hlsUrl);
      notify("success", "Video subido correctamente");
    } catch {
      notify("error", "Error al subir el video. Verifica e inténtalo de nuevo.");
    } finally {
      setUploadingAffiliateVideo(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setThumbnailFile(file);
      const dataUrl = await resizeThumbnailFile(file);
      setThumbnailPreview(dataUrl);
    } catch (err: any) {
      const msg = err.message ?? "Error al procesar la imagen";
      setError(msg);
      notify("error", msg);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
    setThumbnailFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addModule = () => {
    setModules([...modules, { title: "", lessons: [{ title: "", durationMinutes: "", content: "", attachments: [] }], evaluation: emptyEvaluation() }]);
    setExpandedModules(new Set([...expandedModules, modules.length]));
  };

  const updateModuleEvaluation = <K extends keyof ModuleEvaluationForm>(
    mIndex: number,
    field: K,
    value: ModuleEvaluationForm[K],
  ) => {
    setModules((prev) => {
      const updated = [...prev];
      const mod = { ...updated[mIndex] };
      mod.evaluation = mod.evaluation ? { ...mod.evaluation, [field]: value } : { ...emptyEvaluation(), [field]: value };
      updated[mIndex] = mod;
      return updated;
    });
  };

  const addEvaluationQuestion = (mIndex: number) => {
    setModules((prev) => {
      const updated = [...prev];
      const mod = { ...updated[mIndex] };
      const ev = mod.evaluation || emptyEvaluation();
      mod.evaluation = {
        ...ev,
        enabled: true,
        questions: [...ev.questions, emptyQuestion()],
      };
      updated[mIndex] = mod;
      return updated;
    });
  };

  const addQuestionOption = (mIndex: number, qIndex: number) => {
    setModules((prev) => {
      const updated = [...prev];
      const mod = { ...updated[mIndex] };
      if (!mod.evaluation) return prev;
      const questions = [...mod.evaluation.questions];
      questions[qIndex] = { ...questions[qIndex], options: [...questions[qIndex].options, ""] };
      mod.evaluation = { ...mod.evaluation, questions };
      updated[mIndex] = mod;
      return updated;
    });
  };

  const changeQuestionType = (mIndex: number, qIndex: number, newType: QuestionType) => {
    setModules((prev) => {
      const updated = [...prev];
      const mod = { ...updated[mIndex] };
      if (!mod.evaluation) return prev;
      const questions = [...mod.evaluation.questions];
      const q = { ...questions[qIndex], type: newType };
      if (newType === "true-false") {
        q.options = ["Verdadero", "Falso"];
        q.correctIndex = 0;
        q.correctIndices = [];
        q.correctAnswer = "";
      } else if (newType === "multiple-choice") {
        if (q.options.length < 2) q.options = ["", ""];
        q.correctIndex = 0;
        q.correctIndices = [];
        q.correctAnswer = "";
      } else if (newType === "multiple-answer") {
        if (q.options.length < 2) q.options = ["", ""];
        q.correctIndices = [0];
        q.correctIndex = 0;
        q.correctAnswer = "";
      } else if (newType === "short-answer") {
        q.options = [];
        q.correctIndex = 0;
        q.correctIndices = [];
        q.correctAnswer = "";
      }
      questions[qIndex] = q;
      mod.evaluation = { ...mod.evaluation, questions };
      updated[mIndex] = mod;
      return updated;
    });
  };

  const removeQuestionOption = (mIndex: number, qIndex: number, oIndex: number) => {
    setModules((prev) => {
      const updated = [...prev];
      const mod = { ...updated[mIndex] };
      if (!mod.evaluation) return prev;
      const questions = [...mod.evaluation.questions];
      const q = { ...questions[qIndex] };
      const newOptions = q.options.filter((_, i) => i !== oIndex);
      if (newOptions.length < 2) return prev;
      q.options = newOptions;
      if (q.correctIndex === oIndex) {
        q.correctIndex = 0;
      } else if (q.correctIndex > oIndex) {
        q.correctIndex--;
      }
      questions[qIndex] = q;
      mod.evaluation = { ...mod.evaluation, questions };
      updated[mIndex] = mod;
      return updated;
    });
  };

  const removeEvaluationQuestion = (mIndex: number, qIndex: number) => {
    setModules((prev) => {
      const updated = [...prev];
      const mod = { ...updated[mIndex] };
      if (!mod.evaluation) return prev;
      mod.evaluation = {
        ...mod.evaluation,
        questions: mod.evaluation.questions.filter((_, i) => i !== qIndex),
      };
      updated[mIndex] = mod;
      return updated;
    });
  };

  const updateEvaluationQuestion = (
    mIndex: number,
    qIndex: number,
    field: string,
    value: any,
  ) => {
    setModules((prev) => {
      const updated = [...prev];
      const mod = { ...updated[mIndex] };
      if (!mod.evaluation) return prev;
      const questions = [...mod.evaluation.questions];
      questions[qIndex] = { ...questions[qIndex], [field]: value } as EvaluationQuestionForm;
      mod.evaluation = { ...mod.evaluation, questions };
      updated[mIndex] = mod;
      return updated;
    });
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
    updated[moduleIndex].lessons.push({ title: "", durationMinutes: "", content: "", attachments: [] });
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
    field: string,
    value: any,
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
        .map((l) => {
          const { uploading, ...lesson } = l;
          const dur = Number(lesson.durationMinutes);
          return {
            ...lesson,
            title: lesson.title.trim(),
            durationMinutes: lesson.durationMinutes && dur > 0 ? dur : undefined,
          };
        }),
      evaluation: m.evaluation?.enabled && m.evaluation.questions.some((q) => q.question.trim())
        ? {
            passingScore: m.evaluation.passingScore,
            questions: m.evaluation.questions
              .filter((q) => q.question.trim())
              .map((q) => {
                const base: any = {
                  id: q.id,
                  type: q.type,
                  question: q.question.trim(),
                };
                if (q.type === "short-answer") {
                  base.correctAnswer = q.correctAnswer.trim();
                } else if (q.type === "multiple-answer") {
                  base.options = q.options;
                  base.correctIndices = q.correctIndices;
                } else {
                  base.options = q.options;
                  base.correctIndex = q.correctIndex;
                }
                return base;
              }),
          }
        : undefined,
    }));
  };

  const handleVideoUpload = async (
    mi: number,
    li: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024 * 1024) {
      notify("error", "El video no puede superar los 2GB");
      return;
    }

    if (file.type !== "video/mp4") {
      notify("error", "Solo se aceptan archivos MP4");
      return;
    }

    updateLesson(mi, li, "uploading", true);
    notify("info", "Preparando subida...");

    try {
      const uploadRes = await requestUploadUrl();
      if (!uploadRes.ok) throw new Error("Error al solicitar URL de subida");

      const { url: uploadUrl, uploadId } = uploadRes.result.data;

      notify("info", "Subiendo video a R2...");
      const uploaded = await uploadToR2(file, uploadUrl);
      if (!uploaded) throw new Error("Error al subir el video");

      notify("info", "Iniciando procesamiento...");
      const processRes = await startProcessing(uploadId);
      if (!processRes.ok) throw new Error("Error al iniciar procesamiento");

      notify("info", "Transcodificando video...");
      let hlsUrl: string | null = null;
      let durationMins: number | null = null;
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 5000));
        const statusRes = await checkUploadStatus(uploadId);
        if (statusRes.ok && statusRes.result.data?.status === "completed") {
          hlsUrl = statusRes.result.data.hlsUrl;
          durationMins = statusRes.result.data.durationMinutes ?? null;
          break;
        }
        if (statusRes.ok && statusRes.result.data?.status === "failed") {
          throw new Error(statusRes.result.data.error || "Error en la transcodificación");
        }
      }

      if (!hlsUrl) throw new Error("El video no se procesó a tiempo");

      const modulesPayload = buildModulesPayload();
      const { ok: saveOk } = await updateProduct(productId, { modules: modulesPayload });
      if (!saveOk) throw new Error("Error al guardar módulos");
      setProduct((prev) => prev ? { ...prev, modules: modulesPayload as any } : prev);
      setOriginalProduct((prev) => prev ? { ...prev, modules: modulesPayload as any } : prev);

      await confirmAsset(
        productId,
        mi,
        li,
        uploadId,
        hlsUrl,
        durationMins ?? undefined,
      );

      updateLesson(mi, li, "hlsUrl", hlsUrl);
      if (durationMins !== null) {
        updateLesson(mi, li, "durationMinutes", String(Math.round(durationMins)));
      }
      updateLesson(mi, li, "uploading", false);

      notify("success", "Video subido correctamente");
    } catch {
      updateLesson(mi, li, "uploading", false);
      notify("error", "Error al subir el video. Verifica e inténtalo de nuevo.");
    }
  };

  const handleAttachmentUpload = async (
    mi: number,
    li: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      notify("error", "El archivo no puede superar los 50MB");
      return;
    }

    notify("info", "Guardando módulos...");

    const modulesPayload = buildModulesPayload();
    const { ok: saveOk } = await updateProduct(productId, { modules: modulesPayload });
    if (!saveOk) {
      notify("error", "Guarda el producto antes de adjuntar archivos");
      return;
    }
    setProduct((prev) => prev ? { ...prev, modules: modulesPayload as any } : prev);
    setOriginalProduct((prev) => prev ? { ...prev, modules: modulesPayload as any } : prev);

    notify("info", "Subiendo archivo...");

    try {
      const uploadRes = await requestAttachmentUploadUrl(file.name, file.type);
      if (!uploadRes.ok) throw new Error("Error al solicitar URL de subida");

      const { url: uploadUrl, fileId, publicUrl } = uploadRes.result.data;

      const uploaded = await uploadToR2(file, uploadUrl);
      if (!uploaded) throw new Error("Error al subir el archivo");

      const attachment = {
        id: fileId,
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size,
      };

      const confirmRes = await confirmAttachment(productId, mi, li, attachment);
      if (!confirmRes.ok) throw new Error("Error al confirmar el archivo");

      const updated = [...modules];
      const lesson = updated[mi].lessons[li];
      if (!Array.isArray(lesson.attachments)) {
        lesson.attachments = [];
      }
      lesson.attachments.push(attachment);
      setModules(updated);

      notify("success", "Archivo adjuntado");
    } catch {
      notify("error", "Error al adjuntar archivo");
    }
  };

  const handleRemoveAttachment = async (
    mi: number,
    li: number,
    attachmentId: string,
  ) => {
    try {
      const res = await removeAttachment(productId, mi, li, attachmentId);
      if (!res.ok) throw new Error("Error al eliminar archivo");

      const updated = [...modules];
      const lesson = updated[mi].lessons[li];
      if (Array.isArray(lesson.attachments)) {
        lesson.attachments = lesson.attachments.filter((a) => a.id !== attachmentId);
      }
      setModules(updated);

      notify("success", "Archivo eliminado");
    } catch {
      notify("error", "Error al eliminar archivo");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category || null,
      thumbnail: thumbnailPreview || null,
      affiliateEnabled,
      commissionRate: affiliateEnabled && commissionRate ? Number(commissionRate) : null,
      affiliateCookieDays: affiliateEnabled ? Number(affiliateCookieDays) : undefined,
      affiliateDescription: affiliateEnabled ? affiliateDescription.trim() || undefined : undefined,
      affiliateVideoUrl: affiliateEnabled && affiliateVideoUrl ? affiliateVideoUrl.trim() || null : null,
      introVideoUrl: introVideoUrl.trim() || null,
      modules: buildModulesPayload(),
    };

    if (thumbnailPreview === null && product?.thumbnail) {
      payload.thumbnail = null;
    }

    const { ok, result } = await updateProduct(productId, payload);
    if (!ok) {
      const msg = result.message ?? "Error al guardar";
      setError(msg);
      notify("error", msg);
      setSaving(false);
      return;
    }

    const updatedProduct = result.data?.product;
    if (updatedProduct) {
      setProduct((prev) => prev ? { ...prev, ...updatedProduct } : prev);
      setOriginalProduct(updatedProduct);
    }

    clearDraft();
    notify("success", "Producto guardado");
    setSaving(false);
  };

  const validateForReview = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "El título del producto es obligatorio";
    if (!description.trim()) errors.description = "La descripción del producto es obligatoria";
    if (!price || Number(price) <= 0) errors.price = "El precio debe ser mayor a 0";
    if (!thumbnailPreview) errors.thumbnail = "Debes subir una miniatura para el producto";
    if (!category) errors.category = "Debes seleccionar una categoría para el producto";

    const intro = introVideoUrl.trim();
    if (!intro) errors.introVideo = "Debes agregar un video de introducción (URL o archivo MP4)";

    const validModules = modules.filter(
      (m) => m.title.trim() !== "" && m.lessons.some((l) => l.title.trim() !== "")
    );
    if (validModules.length === 0) {
      errors.modules = "Debes agregar al menos un módulo con una clase";
    }

    return errors;
  };

  const handleSubmitReview = async () => {
    setValidationErrors(null);
    setError(null);

    const errors = validateForReview();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      requestAnimationFrame(() => {
        const firstField = document.querySelector("[data-field-error]") as HTMLElement | null;
        firstField?.scrollIntoView({ behavior: "smooth", block: "center" });
        (firstField?.querySelector("input, textarea") as HTMLElement | null)?.focus();
      });
      return;
    }

    setSubmittingReview(true);

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category || null,
      thumbnail: thumbnailPreview || null,
      affiliateEnabled,
      commissionRate: affiliateEnabled && commissionRate ? Number(commissionRate) : null,
      affiliateCookieDays: affiliateEnabled ? Number(affiliateCookieDays) : undefined,
      affiliateDescription: affiliateEnabled ? affiliateDescription.trim() || undefined : undefined,
      affiliateVideoUrl: affiliateEnabled && affiliateVideoUrl ? affiliateVideoUrl.trim() || null : null,
      introVideoUrl: introVideoUrl.trim() || null,
      modules: buildModulesPayload(),
    };

    if (thumbnailPreview === null && product?.thumbnail) {
      payload.thumbnail = null;
    }

    const { ok: updateOk, result: updateResult } = await updateProduct(productId, payload);
    if (!updateOk) {
      const msg = updateResult?.message ?? "Error al guardar los cambios";
      setError(msg);
      notify("error", msg);
      setSubmittingReview(false);
      return;
    }

    clearDraft();
    const { ok: reviewOk, result: reviewResult } = await submitForReview(productId);
    if (!reviewOk) {
      const msg = reviewResult?.message ?? "Error al enviar a revisión";
      setError(msg);
      notify("error", msg);
      setSubmittingReview(false);
      return;
    }

    notify("success", "Producto enviado a revisión correctamente");
    router.push("/user/products");
  };

  const inputBase =
    "w-full rounded-xl border border-border bg-background/40 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary/60 focus:bg-background focus:shadow-[0_0_0_3px] focus:shadow-primary/10 dark:placeholder:text-white/30";

  const labelBase = "text-sm font-semibold text-gray-700 dark:text-white/80";

  const canSubmitReview = !!product && (product.status === "DRAFT" || product.status === "REJECTED" || (product.status === "PUBLISHED" && product.draftChanges));

  const changedFields = useMemo(() => {
    if (!originalProduct) return {};
    const o = originalProduct;
    const changes: Record<string, boolean> = {};
    if (title !== o.title) changes.title = true;
    if (description !== o.description) changes.description = true;
    if (Number(price) !== o.price) changes.price = true;
    if (category !== (o.category ?? "")) changes.category = true;
    if ((thumbnailPreview ?? null) !== (o.thumbnail ?? null)) changes.thumbnail = true;
    if (affiliateEnabled !== o.affiliateEnabled) changes.affiliateEnabled = true;
    if ((commissionRate || "") !== String(o.commissionRate ?? "")) changes.commissionRate = true;
    if (affiliateCookieDays !== String(o.affiliateCookieDays)) changes.affiliateCookieDays = true;
    if (affiliateDescription !== (o.affiliateDescription ?? "")) changes.affiliateDescription = true;
    if (affiliateVideoUrl !== (o.affiliateVideoUrl ?? "")) changes.affiliateVideoUrl = true;
    if (introVideoUrl !== (o.introVideoUrl ?? "")) changes.introVideoUrl = true;
    const payloadModules = JSON.stringify(buildModulesPayload());
    if (payloadModules !== JSON.stringify(o.modules)) changes.modules = true;
    return changes;
  }, [title, description, price, category, thumbnailPreview, affiliateEnabled, commissionRate, affiliateCookieDays, affiliateDescription, affiliateVideoUrl, introVideoUrl, modules, originalProduct]);

  const changedModules = useMemo(() => {
    if (!originalProduct) return [] as boolean[];
    return modules.map((mod, i) => {
      const oMod = originalProduct.modules?.[i];
      if (!oMod) return true;
      return JSON.stringify(mod) !== JSON.stringify(oMod);
    });
  }, [modules, originalProduct]);

  const resetField = useCallback((field: string) => {
    if (!originalProduct) return;
    switch (field) {
      case "title": setTitle(originalProduct.title); break;
      case "description": setDescription(originalProduct.description); break;
      case "price": setPrice(String(originalProduct.price)); break;
      case "category": setCategory(originalProduct.category ?? ""); break;
      case "thumbnail": setThumbnailPreview(originalProduct.thumbnail ?? null); setThumbnailFile(null); break;
      case "affiliateEnabled": setAffiliateEnabled(originalProduct.affiliateEnabled); break;
      case "commissionRate": setCommissionRate(String(originalProduct.commissionRate ?? "")); break;
      case "affiliateCookieDays": setAffiliateCookieDays(String(originalProduct.affiliateCookieDays)); break;
      case "affiliateDescription": setAffiliateDescription(originalProduct.affiliateDescription ?? ""); break;
      case "affiliateVideoUrl": setAffiliateVideoUrl(originalProduct.affiliateVideoUrl ?? ""); break;
      case "introVideoUrl": setIntroVideoUrl(originalProduct.introVideoUrl ?? ""); break;
    }
  }, [originalProduct]);

  const resetModule = useCallback((mIndex: number) => {
    if (!originalProduct?.modules?.[mIndex]) return;
    const oMod = JSON.parse(JSON.stringify(originalProduct.modules[mIndex]));
    setModules((prev) => {
      const next = [...prev];
      next[mIndex] = oMod as ModuleForm;
      return next;
    });
  }, [originalProduct]);

  const handleLeavePage = () => {
    if (Object.keys(changedFields).length > 0 || hasDraft) {
      setConfirmLeaveModal(true);
    } else {
      router.push("/user/products");
    }
  };

  const handleConfirmLeavePage = () => {
    setConfirmLeaveModal(false);
    router.push("/user/products");
  };

  const handleConfirmSubmitReview = () => {
    setConfirmSubmitModal(false);
    handleSubmitReview();
  };

  const resetAllFields = useCallback(() => {
    if (!originalProduct) return;
    setTitle(originalProduct.title);
    setDescription(originalProduct.description);
    setPrice(String(originalProduct.price));
    setCategory(originalProduct.category ?? "");
    setThumbnailPreview(originalProduct.thumbnail ?? null);
    setThumbnailFile(null);
    setAffiliateEnabled(originalProduct.affiliateEnabled);
    setCommissionRate(String(originalProduct.commissionRate ?? ""));
    setAffiliateCookieDays(String(originalProduct.affiliateCookieDays));
    setAffiliateDescription(originalProduct.affiliateDescription ?? "");
    setAffiliateVideoUrl(originalProduct.affiliateVideoUrl ?? "");
    setIntroVideoUrl(originalProduct.introVideoUrl ?? "");
    setModules(JSON.parse(JSON.stringify(originalProduct.modules ?? [])));
    setResetModalOpen(false);
  }, [originalProduct]);

  const hasAffiliateChanges = changedFields.affiliateEnabled || changedFields.commissionRate || changedFields.affiliateCookieDays || changedFields.affiliateDescription || changedFields.affiliateVideoUrl;

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

  return (
    <div className="space-y-6">
      <button
        onClick={handleLeavePage}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-white/45 dark:hover:text-white cursor-pointer"
      >
        <FiArrowLeft size={14} />
        Mis productos
      </button>

      <UserPageHeader
        title="Editar producto"
        description={product.title}
        badge={
          <div className="flex items-center gap-1.5">
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
            {product.draftChanges && (
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                Cambios sin publicar
              </span>
            )}
          </div>
        }
      />

      {draftRestored && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          Se restauraron cambios no guardados de tu sesión anterior.
        </div>
      )}
      {hasDraft && !draftRestored && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          Hay cambios sin guardar. Guarda el producto para no perderlos.
        </div>
      )}
      {validationErrors && Object.keys(validationErrors).length > 0 && (
        <div ref={errorsRef} className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/10">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            Corrige los siguientes errores antes de enviar a revisión:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-600 dark:text-red-300">
            {Object.values(validationErrors).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
              Información básica
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5" data-field-error={validationErrors?.title ? "" : undefined}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className={labelBase}>Título</label>
                  {changedFields.title && (
                    <>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Modificado</span>
                      <button onClick={() => resetField("title")} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer" title="Restaurar valor original"><FiRotateCcw size={11} />Restaurar</button>
                    </>
                  )}
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`${inputBase} ${validationErrors?.title ? "border-red-400 focus:border-red-500 focus:shadow-red-500/20" : ""}`}
                  placeholder="Ej: Curso avanzado de React"
                />
                {validationErrors?.title && (
                  <p className="text-xs text-red-500">{validationErrors.title}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5" data-field-error={validationErrors?.description ? "" : undefined}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className={labelBase}>Descripción</label>
                  {changedFields.description && (
                    <>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Modificado</span>
                      <button onClick={() => resetField("description")} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer" title="Restaurar valor original"><FiRotateCcw size={11} />Restaurar</button>
                    </>
                  )}
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputBase} min-h-[140px] resize-y ${validationErrors?.description ? "border-red-400 focus:border-red-500 focus:shadow-red-500/20" : ""}`}
                  placeholder="Describe tu producto en detalle..."
                />
                {validationErrors?.description && (
                  <p className="text-xs text-red-500">{validationErrors.description}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5" data-field-error={validationErrors?.price ? "" : undefined}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className={labelBase}>Precio ($)</label>
                  {changedFields.price && (
                    <>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Modificado</span>
                      <button onClick={() => resetField("price")} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer" title="Restaurar valor original"><FiRotateCcw size={11} />Restaurar</button>
                    </>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`${inputBase} pl-7 ${validationErrors?.price ? "border-red-400 focus:border-red-500 focus:shadow-red-500/20" : ""}`}
                    placeholder="0.00"
                  />
                </div>
                {validationErrors?.price && (
                  <p className="text-xs text-red-500">{validationErrors.price}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5" data-field="category" data-field-error={validationErrors?.category ? "" : undefined}>
                {highlightErrors.category && (
                  <div className="mb-2 rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 dark:border-red-500/20 dark:bg-red-500/10">
                    <div className="flex items-center gap-2">
                      <FiInfo size={14} className="shrink-0 text-red-500" />
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">
                        {highlightErrors.category.message}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className={labelBase}>Categoría</label>
                  {missingField === "category" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-500/15 dark:text-red-400">
                      <FiInfo size={10} />
                    </span>
                  )}
                  {category && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Seleccionada</span>
                  )}
                  {changedFields.category && (
                    <>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Modificado</span>
                      <button onClick={() => resetField("category")} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer" title="Restaurar valor original"><FiRotateCcw size={11} />Restaurar</button>
                    </>
                  )}
                </div>
                <div className={`flex flex-wrap gap-1.5 ${highlightErrors.category ? "rounded-lg border border-red-300 bg-red-50/30 p-2 dark:border-red-500/20 dark:bg-red-500/5" : ""}`}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(category === cat.id ? "" : cat.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        category === cat.id
                          ? "bg-primary text-white shadow-sm"
                          : highlightErrors.category
                            ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                {validationErrors?.category && (
                  <p className="text-xs text-red-500">{validationErrors.category}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm" data-field-error={validationErrors?.introVideo ? "" : undefined}>
            <div className="mb-4 flex items-center gap-2">
              <FiVideo size={16} className="text-gray-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Video de introducción
              </h2>
              {changedFields.introVideoUrl && (
                <>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Modificado</span>
                  <button onClick={() => resetField("introVideoUrl")} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer" title="Restaurar valor original"><FiRotateCcw size={11} />Restaurar</button>
                </>
              )}
            </div>
            {validationErrors?.introVideo && (
              <p className="mb-2 text-xs text-red-500">{validationErrors.introVideo}</p>
            )}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelBase}>URL del video (YouTube / Vimeo)</label>
                <div className="relative">
                  <FiLink
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={introVideoUrl}
                    onChange={(e) => setIntroVideoUrl(e.target.value)}
                    className={`${inputBase} pl-9 ${validationErrors?.introVideo ? "border-red-400 focus:border-red-500 focus:shadow-red-500/20" : ""}`}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-white/35">
                  O sube un archivo MP4 desde tu dispositivo
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-medium text-gray-400 dark:text-white/35">o</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div>
                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background/40 px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary ${uploadingIntro ? "pointer-events-none opacity-50" : "text-gray-600 dark:text-white/60 dark:hover:text-primary"}`}>
                  {uploadingIntro ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <FiUploadCloud size={16} />
                  )}
                  {uploadingIntro ? "Subiendo..." : "Subir archivo MP4"}
                  <span className="text-xs text-gray-400 dark:text-white/35">(máx. 2GB)</span>
                  <input
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                    onChange={handleIntroVideoUpload}
                    disabled={uploadingIntro}
                  />
                </label>
              </div>
            </div>
            {introVideoUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-border">
                {introVideoUrl.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/) ? (
                  <iframe
                    src={
                      introVideoUrl.includes("youtube.com/watch?v=")
                        ? `https://www.youtube.com/embed/${new URL(introVideoUrl).searchParams.get("v")}`
                        : introVideoUrl.includes("youtu.be/")
                          ? `https://www.youtube.com/embed/${introVideoUrl.split("youtu.be/")[1]?.split("?")[0]}`
                          : introVideoUrl.includes("vimeo.com/")
                            ? `https://player.vimeo.com/video/${introVideoUrl.match(/vimeo\.com\/(\d+)/)?.[1]}`
                            : introVideoUrl
                    }
                    className="aspect-video w-full cursor-pointer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : introVideoUrl.match(/\.m3u8/) ? (
                  <div className="overflow-hidden rounded-xl border border-border bg-black">
                    <video
                      src={introVideoUrl}
                      className="aspect-video w-full cursor-pointer"
                      controls
                      playsInline
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-gray-100 dark:bg-white/5">
                    <div className="text-center">
                      <FiVideo size={24} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-white/45">
                        Video cargado correctamente
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm" data-field-error={validationErrors?.modules ? "" : undefined}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiFileText size={16} className="text-gray-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Contenido del curso
                </h2>
                {changedFields.modules && (
                  <>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Modificado</span>
                    <button onClick={() => { setResetModalOpen(true); }} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer" title="Restaurar todos los módulos"><FiRotateCcw size={11} />Restaurar todo</button>
                  </>
                )}
              </div>
              {validationErrors?.modules && (
                <p className="text-xs text-red-500">{validationErrors.modules}</p>
              )}
              <button
                onClick={addModule}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary/40 hover:text-primary dark:text-white/60 cursor-pointer"
              >
                <FiPlus size={12} />
                Módulo
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center dark:bg-white/2">
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
                      {changedModules[mIndex] && originalProduct && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setResetModuleModal(mIndex);
                          }}
                          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer"
                          title="Restaurar módulo"
                        >
                          <FiRotateCcw size={13} />
                        </button>
                      )}
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
                      <div className="border-t border-border/50 px-4 py-4 space-y-4">
                        {mod.lessons.map((lesson, lIndex) => (
                          <div
                            key={lIndex}
                            className="flex gap-4 rounded-xl border border-border bg-background/40 p-4"
                          >
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                  {lIndex + 1}
                                </div>
                                <input
                                  value={lesson.title}
                                  onChange={(e) =>
                                    updateLesson(mIndex, lIndex, "title", e.target.value)
                                  }
                                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-white/30"
                                  placeholder="Título de la clase"
                                />
                              </div>
                              <textarea
                                value={lesson.content ?? ""}
                                onChange={(e) =>
                                  updateLesson(mIndex, lIndex, "content", e.target.value)
                                }
                                className="flex-1 w-full rounded-lg border border-border bg-background/40 px-3 py-1.5 text-xs text-gray-600 outline-none placeholder:text-gray-400 resize-none dark:text-white/60 dark:placeholder:text-white/30"
                                placeholder="Descripción breve de la clase (opcional)"
                              />
                              <div className="flex items-center gap-3">
                                {lesson.hlsUrl && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                    <FiCheckCircle size={10} />
                                    Video listo
                                  </span>
                                )}
                              </div>
                              {lesson.attachments && lesson.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {lesson.attachments.map((att) => (
                                    <div
                                      key={att.id}
                                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background/40 px-2 py-1 text-[11px] text-gray-500 dark:text-white/50"
                                    >
                                      <FiFileText size={11} />
                                      <span className="max-w-28 truncate">{att.name}</span>
                                      <button
                                        onClick={() => handleRemoveAttachment(mIndex, lIndex, att.id)}
                                        className="ml-0.5 text-gray-400 hover:text-red-500 cursor-pointer"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <label className="inline-flex cursor-pointer items-center gap-1 self-start rounded-md border border-dashed border-border px-2.5 py-1 text-[11px] text-gray-400 transition-colors hover:border-primary/40 hover:text-primary dark:text-white/40 dark:hover:text-primary">
                                <FiUploadCloud size={11} />
                                Adjuntar archivo
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleAttachmentUpload(mIndex, lIndex, e)
                                  }
                                />
                              </label>
                            </div>
                            <div className="w-44 shrink-0">
                              {lesson.hlsUrl ? (
                                <div className="overflow-hidden rounded-lg border border-border bg-black">
                                  <video
                                    src={lesson.hlsUrl}
                                    className="aspect-video w-full cursor-pointer"
                                    controls
                                    playsInline
                                    preload="metadata"
                                  />
                                  <label className="flex cursor-pointer items-center justify-center gap-1.5 border-t border-border bg-background/40 px-2 py-1.5 text-[11px] text-gray-500 transition-colors hover:bg-primary/5 hover:text-primary dark:text-white/50 dark:hover:text-primary">
                                    <FiUploadCloud size={12} />
                                    Cambiar video
                                    <input
                                      type="file"
                                      accept="video/mp4"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleVideoUpload(mIndex, lIndex, e)
                                      }
                                    />
                                  </label>
                                </div>
                              ) : lesson.uploading ? (
                                <div className="flex aspect-video items-center justify-center rounded-lg bg-amber-500/5 border border-amber-500/20">
                                  <div className="text-center">
                                    <span className="mx-auto mb-1 block h-6 w-6 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
                                    <p className="text-xs text-amber-600 dark:text-amber-400">Procesando...</p>
                                  </div>
                                </div>
                              ) : (
                                <label className="flex aspect-video cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-background/40 transition-colors hover:border-primary/40 hover:bg-primary/5">
                                  <div className="text-center">
                                    <FiUploadCloud size={22} className="mx-auto mb-1 text-gray-300 dark:text-white/25" />
                                    <p className="text-[11px] font-medium text-gray-500 dark:text-white/45">Subir video</p>
                                    <p className="mt-0.5 text-[10px] text-gray-400 dark:text-white/30">MP4</p>
                                  </div>
                                  <input
                                    type="file"
                                    accept="video/mp4"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleVideoUpload(mIndex, lIndex, e)
                                    }
                                  />
                                </label>
                              )}
                              <button
                                onClick={() => removeLesson(mIndex, lIndex)}
                                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer"
                              >
                                <FiTrash2 size={12} />
                                Eliminar clase
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => addLesson(mIndex)}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-background/40 px-4 py-3 text-xs font-medium text-gray-500 transition-colors hover:border-primary/40 hover:text-primary dark:text-white/50 dark:hover:text-primary cursor-pointer"
                        >
                          <FiPlus size={12} />
                          Agregar clase
                        </button>

                        <div className="mt-4 border-t border-border/30 pt-4">
                          <div className="flex items-center justify-between">
                            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white/80">
                              <input
                                type="checkbox"
                                checked={mod.evaluation?.enabled ?? false}
                                onChange={(e) =>
                                  updateModuleEvaluation(mIndex, "enabled", e.target.checked)
                                }
                                className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                              />
                              Evaluación del módulo
                            </label>
                            {mod.evaluation?.enabled && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 dark:text-white/35">
                                  Aprobación:
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={mod.evaluation.passingScore}
                                  onChange={(e) =>
                                    updateModuleEvaluation(mIndex, "passingScore", Number(e.target.value))
                                  }
                                  className="w-16 rounded-lg border border-border bg-background/40 px-2 py-1 text-xs text-gray-700 outline-none dark:text-white/70"
                                />
                                <span className="text-xs text-gray-400 dark:text-white/35">%</span>
                              </div>
                            )}
                          </div>

                          {mod.evaluation?.enabled && (
                            <div className="mt-3 space-y-3">
                              {mod.evaluation.questions.map((q, qIndex) => (
                                <div
                                  key={q.id}
                                  className="rounded-lg border border-border bg-background/40 p-3"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <Select
                                      value={q.type}
                                      onChange={(value) => changeQuestionType(mIndex, qIndex, value as QuestionType)}
                                      options={[
                                        { value: "multiple-choice", label: "Opción múltiple" },
                                        { value: "true-false", label: "Verdadero / Falso" },
                                        { value: "multiple-answer", label: "Selección múltiple" },
                                        { value: "short-answer", label: "Respuesta escrita" },
                                      ]}
                                      className="w-44"
                                    />
                                    <button
                                      onClick={() => removeEvaluationQuestion(mIndex, qIndex)}
                                      className="rounded-md p-1 text-gray-400 transition-colors hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                                    >
                                      <FiTrash2 size={11} />
                                    </button>
                                  </div>
                                  <input
                                    value={q.question}
                                    onChange={(e) =>
                                      updateEvaluationQuestion(mIndex, qIndex, "question", e.target.value)
                                    }
                                    className="mt-1 w-full bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400 dark:text-white/70 dark:placeholder:text-white/30"
                                    placeholder="Escribe la pregunta..."
                                  />

                                  {(q.type === "multiple-choice" || q.type === "true-false") && (
                                    <div className="mt-2 space-y-1.5">
                                      {q.options.map((opt, oi) => (
                                        <div key={oi} className="flex items-center gap-1">
                                          <label
                                            className={`flex flex-1 cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 ${
                                              q.correctIndex === oi
                                                ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                                                : "border-border hover:bg-gray-50 dark:hover:bg-white/5"
                                            }`}
                                          >
                                            <input
                                              type="radio"
                                              name={`${q.id}_correct`}
                                              checked={q.correctIndex === oi}
                                              onChange={() =>
                                                updateEvaluationQuestion(mIndex, qIndex, "correctIndex", oi)
                                              }
                                              className="h-3 w-3 text-emerald-500 accent-emerald-500"
                                            />
                                            {q.type === "true-false" ? (
                                              <span className="min-w-0 flex-1 text-xs text-gray-600 dark:text-white/60">
                                                {opt}
                                              </span>
                                            ) : (
                                              <input
                                                value={opt}
                                                onChange={(e) => {
                                                  const newOptions = [...q.options];
                                                  newOptions[oi] = e.target.value;
                                                  updateEvaluationQuestion(mIndex, qIndex, "options", newOptions);
                                                }}
                                                className="min-w-0 flex-1 bg-transparent text-xs text-gray-600 outline-none placeholder:text-gray-400 dark:text-white/60 dark:placeholder:text-white/30"
                                                placeholder={`Opción ${oi + 1}`}
                                              />
                                            )}
                                            {q.correctIndex === oi && (
                                              <span className="shrink-0 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                                Correcta
                                              </span>
                                            )}
                                          </label>
                                          {q.type !== "true-false" && q.options.length > 2 && (
                                            <button
                                              onClick={() => removeQuestionOption(mIndex, qIndex, oi)}
                                              className="rounded-md p-1 text-gray-400 transition-colors hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                                              title="Eliminar opción"
                                            >
                                              <FiTrash2 size={11} />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                      {q.type !== "true-false" && (
                                        <button
                                          onClick={() => addQuestionOption(mIndex, qIndex)}
                                          className="inline-flex items-center gap-1 text-[10px] font-medium text-primary transition-colors hover:text-primary/80 cursor-pointer"
                                        >
                                          <FiPlus size={9} />
                                          Agregar opción
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {q.type === "multiple-answer" && (
                                    <div className="mt-2 space-y-1.5">
                                      {q.options.map((opt, oi) => (
                                        <div key={oi} className="flex items-center gap-1">
                                          <label
                                            className={`flex flex-1 cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 ${
                                              q.correctIndices.includes(oi)
                                                ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                                                : "border-border hover:bg-gray-50 dark:hover:bg-white/5"
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={q.correctIndices.includes(oi)}
                                              onChange={() => {
                                                const newCorrect = q.correctIndices.includes(oi)
                                                  ? q.correctIndices.filter((i: number) => i !== oi)
                                                  : [...q.correctIndices, oi];
                                                updateEvaluationQuestion(mIndex, qIndex, "correctIndices", newCorrect);
                                              }}
                                              className="h-3 w-3 rounded text-emerald-500 accent-emerald-500"
                                            />
                                            <input
                                              value={opt}
                                              onChange={(e) => {
                                                const newOptions = [...q.options];
                                                newOptions[oi] = e.target.value;
                                                updateEvaluationQuestion(mIndex, qIndex, "options", newOptions);
                                              }}
                                              className="min-w-0 flex-1 bg-transparent text-xs text-gray-600 outline-none placeholder:text-gray-400 dark:text-white/60 dark:placeholder:text-white/30"
                                              placeholder={`Opción ${oi + 1}`}
                                            />
                                            {q.correctIndices.includes(oi) && (
                                              <span className="shrink-0 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                                Correcta
                                              </span>
                                            )}
                                          </label>
                                          {q.options.length > 2 && (
                                            <button
                                              onClick={() => removeQuestionOption(mIndex, qIndex, oi)}
                                              className="rounded-md p-1 text-gray-400 transition-colors hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                                              title="Eliminar opción"
                                            >
                                              <FiTrash2 size={11} />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                      <button
                                        onClick={() => addQuestionOption(mIndex, qIndex)}
                                        className="inline-flex items-center gap-1 text-[10px] font-medium text-primary transition-colors hover:text-primary/80 cursor-pointer"
                                      >
                                        <FiPlus size={9} />
                                        Agregar opción
                                      </button>
                                    </div>
                                  )}

                                  {q.type === "short-answer" && (
                                    <div className="mt-2">
                                      <label className="text-[10px] font-medium text-gray-500 dark:text-white/40">
                                        Respuesta correcta:
                                      </label>
                                      <input
                                        value={q.correctAnswer}
                                        onChange={(e) =>
                                          updateEvaluationQuestion(mIndex, qIndex, "correctAnswer", e.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border border-border bg-background/40 px-2.5 py-1.5 text-xs text-gray-700 outline-none placeholder:text-gray-400 dark:text-white/70 dark:placeholder:text-white/30"
                                        placeholder="Escribe la respuesta exacta..."
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                              <button
                                onClick={() => addEvaluationQuestion(mIndex)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary transition-colors hover:text-primary/80 cursor-pointer"
                              >
                                <FiPlus size={10} />
                                Agregar pregunta
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {modules.length > 0 && (
              <button
                onClick={addModule}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-background/40 px-4 py-3 text-xs font-medium text-gray-500 transition-colors hover:border-primary/40 hover:text-primary dark:text-white/50 dark:hover:text-primary cursor-pointer"
              >
                <FiPlus size={12} />
                Añadir módulo
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm" data-field-error={validationErrors?.thumbnail ? "" : undefined}>
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Miniatura
              </h2>
              {changedFields.thumbnail && (
                <>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Modificado</span>
                  <button onClick={() => resetField("thumbnail")} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer" title="Restaurar miniatura original"><FiRotateCcw size={11} />Restaurar</button>
                </>
              )}
            </div>
            {validationErrors?.thumbnail && (
              <p className="mb-2 text-xs text-red-500">{validationErrors.thumbnail}</p>
            )}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-background/40 transition-all hover:border-primary/50 hover:bg-primary/5 ${validationErrors?.thumbnail ? "border-red-400" : "border-border"}`}
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
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Afiliados
              </h2>
              {hasAffiliateChanges && (
                <>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Modificado</span>
                  <button onClick={() => { resetField("affiliateEnabled"); resetField("commissionRate"); resetField("affiliateCookieDays"); resetField("affiliateDescription"); resetField("affiliateVideoUrl"); }} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer" title="Restaurar valores de afiliados"><FiRotateCcw size={11} />Restaurar todo</button>
                </>
              )}
            </div>
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
                  <div className="flex items-center gap-1.5">
                    <label className={labelBase}>Cookie days</label>
                    <div className="group relative">
                      <FiInfo size={13} className="text-gray-400 cursor-pointer hover:text-gray-500" />
                      <div className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-gray-600 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 dark:text-white/60 pointer-events-none z-10">
                        Define cuántos días después de hacer clic en tu link el afiliado aún recibe comisión si el usuario compra. Por ejemplo, con 30 días: si alguien hace clic hoy y compra en 20 días, el afiliado gana su comisión.
                      </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    {...registerCookie("affiliateCookieDays", {
                      min: { value: 1, message: "Mínimo 1 día" },
                      max: { value: 365, message: "Máximo 365 días" },
                      onChange: (e) => setAffiliateCookieDays(e.target.value),
                    })}
                    className={`${inputBase} max-w-32 ${cookieErrors.affiliateCookieDays ? "border-red-400 focus:border-red-500 focus:shadow-red-500/20" : ""}`}
                    placeholder="30"
                  />
                  {cookieErrors.affiliateCookieDays ? (
                    <p className="text-[11px] text-red-500">{cookieErrors.affiliateCookieDays.message}</p>
                  ) : (
                    <p className="text-[11px] text-gray-400 dark:text-white/35">Máximo 365 días</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelBase}>Descripción para afiliados</label>
                  <textarea
                    value={affiliateDescription}
                    onChange={(e) => setAffiliateDescription(e.target.value)}
                    className={`${inputBase} min-h-[80px] resize-none`}
                    placeholder="Describe los beneficios de promocionar este curso para los afiliados..."
                    rows={3}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelBase}>Video de introducción para afiliados</label>
                  <p className="text-[11px] text-gray-400 dark:text-white/35 mb-1">
                    Video que verán los afiliados al considerar promocionar tu producto
                  </p>
                  <div className="flex items-center gap-3">
                    <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background/40 px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary ${uploadingAffiliateVideo ? "pointer-events-none opacity-50" : "text-gray-600 dark:text-white/60 dark:hover:text-primary"}`}>
                      {uploadingAffiliateVideo ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <FiUploadCloud size={16} />
                      )}
                      {uploadingAffiliateVideo ? "Subiendo..." : "Subir video MP4"}
                      <input
                        type="file"
                        accept="video/mp4"
                        className="hidden"
                        onChange={handleAffiliateVideoUpload}
                        disabled={uploadingAffiliateVideo}
                      />
                    </label>
                    {affiliateVideoUrl && (
                      <button
                        onClick={() => setAffiliateVideoUrl("")}
                        className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  {affiliateVideoUrl && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-border bg-black">
                      <video
                        src={affiliateVideoUrl}
                        className="aspect-video w-full cursor-pointer"
                        controls
                        playsInline
                        preload="metadata"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-9999 -mx-1 rounded-2xl border border-primary/20 bg-surface/95 bg-linear-to-r from-primary/5 via-surface/95 to-primary/5 px-5 py-4 shadow-lg shadow-primary/5 backdrop-blur-md sm:px-6 dark:border-primary/10 dark:from-primary/10 dark:via-surface/95 dark:to-primary/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLeavePage}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:text-white/45 cursor-pointer"
            >
              Cancelar
            </button>
            {Object.keys(changedFields).length > 0 && (
              <button
                onClick={() => setResetModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
              >
                <FiAlertTriangle size={14} />
                Revertir cambios
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || submittingReview}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/80 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-50 dark:text-white/80 cursor-pointer"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              ) : (
                <FiSave size={16} className="shrink-0" />
              )}
              {saving ? "Guardando..." : "Guardar como borrador"}
            </button>
            <button
              onClick={() => setConfirmSubmitModal(true)}
              disabled={saving || submittingReview}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
            >
              {submittingReview ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FiSend size={16} className="shrink-0" />
              )}
              {submittingReview ? "Enviando..." : "Enviar a producción"}
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      >
        <div className="px-6 py-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Revertir cambios
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-white/60">
            ¿Estás seguro de que deseas revertir todos los cambios? Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={() => setResetModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={resetAllFields}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 cursor-pointer"
            >
              Revertir todo
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={resetModuleModal !== null}
        onClose={() => setResetModuleModal(null)}
      >
        <div className="px-6 py-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Restaurar módulo
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-white/60">
            ¿Restaurar este módulo a su estado original?
          </p>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={() => setResetModuleModal(null)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => { if (resetModuleModal !== null) resetModule(resetModuleModal); setResetModuleModal(null); }}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 cursor-pointer"
            >
              Restaurar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={confirmSubmitModal}
        onClose={() => setConfirmSubmitModal(false)}
      >
        <div className="px-6 py-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Enviar a producción
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-white/60">
            ¿Estás seguro de que deseas enviar este producto a revisión? Una vez aprobado, estará visible para todos los usuarios. Asegúrate de que todos los campos estén completos.
          </p>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={() => setConfirmSubmitModal(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmSubmitReview}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 cursor-pointer"
            >
              <FiSend size={14} />
              Enviar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={confirmLeaveModal}
        onClose={() => setConfirmLeaveModal(false)}
      >
        <div className="px-6 py-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Salir de la edición
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-white/60">
            Tienes cambios sin guardar. Si sales ahora, se perderán los cambios. ¿Estás seguro de que deseas salir?
          </p>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={() => setConfirmLeaveModal(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Seguir editando
            </button>
            <button
              onClick={handleConfirmLeavePage}
              className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 cursor-pointer"
            >
              Salir sin guardar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
