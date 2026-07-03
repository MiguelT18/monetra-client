export interface EnrollmentResponse {
  id: string;
  productId: string;
  userId: string;
  progress: number;
  completedLessons?: string[];
  product: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    price: number;
  };
}

export interface LessonResponse {
  title: string;
  durationMinutes?: number;
  hlsUrl?: string | null;
  content?: string | null;
  completed: boolean;
}

export interface ModuleResponse {
  title: string;
  lessons: LessonResponse[];
}

export type QuestionType = "multiple-choice" | "true-false" | "multiple-answer" | "short-answer";

export interface EvaluationQuestionResponse {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
}

export interface GradedAnswerResponse {
  questionId: string;
  selectedIndex?: number;
  selectedIndices?: number[];
  textAnswer?: string;
  correct: boolean;
  userCorrectAnswer?: string;
}

export interface ModuleEvaluationResponse {
  moduleTitle: string;
  passingScore: number;
  questions: EvaluationQuestionResponse[];
  totalQuestions: number;
  previousAttempt: {
    score: number;
    passed: boolean;
    answers: GradedAnswerResponse[];
    attemptedAt: string;
  } | null;
}

export interface EvaluationResultResponse {
  score: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  gradedAnswers: GradedAnswerResponse[];
}

export interface CourseContentResponse {
  enrollment: {
    id: string;
    progress: number;
    completedLessons: string[];
    moduleResults: Record<string, { score: number; passed: boolean; attemptedAt: string }>;
  };
  product: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    modules: (ModuleResponse & {
      hasEvaluation: boolean;
      evaluationPassed: boolean;
      evaluationScore: number | null;
    })[];
  };
}

export async function listMyEnrollments(page = 1, limit = 20) {
  const res = await fetch(`/api/enrollments?page=${page}&limit=${limit}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function getCourseContent(enrollmentId: string) {
  const res = await fetch(`/api/enrollments/${enrollmentId}/content`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function completeLesson(
  enrollmentId: string,
  moduleIndex: number,
  lessonIndex: number,
) {
  const res = await fetch(`/api/enrollments/${enrollmentId}/complete-lesson`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleIndex, lessonIndex }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function getVideoToken(
  enrollmentId: string,
  moduleIndex: number,
  lessonIndex: number,
) {
  const res = await fetch(`/api/enrollments/${enrollmentId}/video-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleIndex, lessonIndex }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function getModuleEvaluation(
  enrollmentId: string,
  moduleIndex: number,
) {
  const res = await fetch(
    `/api/enrollments/${enrollmentId}/evaluation/${moduleIndex}`,
  );
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export interface SubmitEvaluationAnswer {
  questionId: string;
  selectedIndex?: number;
  selectedIndices?: number[];
  textAnswer?: string;
}

export async function submitModuleEvaluation(
  enrollmentId: string,
  moduleIndex: number,
  answers: SubmitEvaluationAnswer[],
) {
  const res = await fetch(
    `/api/enrollments/${enrollmentId}/evaluation/${moduleIndex}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    },
  );
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}
