export type ProductStatus = "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";

export type LessonData = {
  title: string;
  durationMinutes?: number;
  hlsUrl?: string;
  content?: string;
};

export type QuestionType = "multiple-choice" | "true-false" | "multiple-answer" | "short-answer";

export type EvaluationQuestionData = {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctIndex?: number;
  correctIndices?: number[];
  correctAnswer?: string;
};

export type ModuleEvaluationData = {
  passingScore: number;
  questions: EvaluationQuestionData[];
};

export type ModuleData = {
  title: string;
  lessons: LessonData[];
  evaluation?: ModuleEvaluationData;
}[];

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  category?: string;
  thumbnail?: string | null;
  affiliateEnabled?: boolean;
  commissionRate?: number | null;
  affiliateCookieDays?: number;
  introVideoUrl?: string | null;
  duration?: number | null;
  rating?: number | null;
  modules?: ModuleData | null;
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  price?: number;
  category?: string | null;
  thumbnail?: string | null;
  affiliateEnabled?: boolean;
  commissionRate?: number | null;
  affiliateCookieDays?: number;
  introVideoUrl?: string | null;
  duration?: number | null;
  rating?: number | null;
  modules?: ModuleData | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draftChanges?: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previousValues?: Record<string, any> | null;
}

export interface ProductResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string | null;
  status: ProductStatus;
  producerId: string;
  affiliateEnabled: boolean;
  commissionRate: number | null;
  affiliateCookieDays: number;
  affiliateDescription?: string | null;
  affiliateVideoUrl?: string | null;
  introVideoUrl?: string | null;
  category?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draftChanges?: Record<string, any> | null;
  duration?: number | null;
  rating?: number | null;
  modules?: ModuleData | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previousValues?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  producer?: {
    id: string;
    fullname: string | null;
    username: string | null;
    avatar: string | null;
  };
  _count?: {
    affiliations: number;
    enrollments: number;
    orders: number;
  };
}

export interface ProductPreviewResponse {
  product: ProductResponse;
  temperature: number;
  temperatureLabel: string;
  recentSales: number;
  recentEnrollments: number;
}

export async function submitForReview(productId: string) {
  const res = await fetch(`/api/products/${productId}/submit-review`, { method: "POST" });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function createProduct(data: CreateProductInput) {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const {ok, result} = await res.json().then(r => ({ok: res.ok, result: r}));
  return { ok, result };
}

export interface MyProductsResult {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listMyProducts(page = 1, limit = 10) {
  const res = await fetch(`/api/products/mine?page=${page}&limit=${limit}`);
  const {ok, result} = await res.json().then(r => ({ok: res.ok, result: r}));
  return { ok, result };
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const {ok, result} = await res.json().then(r => ({ok: res.ok, result: r}));
  return { ok, result };
}

export async function deleteProduct(id: string) {
  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  const {ok, result} = await res.json().then(r => ({ok: res.ok, result: r}));
  return { ok, result };
}

export interface CatalogResult {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type RecommendationMode = "interests" | "best_sellers" | "recent";

export interface RecommendationResult {
  mode: RecommendationMode;
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listCatalog(page = 1, limit = 12) {
  const res = await fetch(`/api/products/catalog?page=${page}&limit=${limit}`);
  const {ok, result} = await res.json().then(r => ({ok: res.ok, result: r}));
  return { ok, result };
}

export async function getRecommendations(page = 1, limit = 10) {
  const res = await fetch(`/api/products/recommendations?page=${page}&limit=${limit}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result: (result?.data ?? result) as RecommendationResult };
}

export async function getProductPreview(productId: string) {
  const res = await fetch(`/api/products/${productId}/preview`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export interface ProductAnalytics {
  dailyActivity: { date: string; orders: number; enrollments: number }[];
  totalAffiliates: number;
  totalOrders: number;
  totalEnrollments: number;
}

export async function getProductAnalytics(productId: string) {
  const res = await fetch(`/api/products/${productId}/analytics`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function getProduct(productId: string) {
  const res = await fetch(`/api/products/${productId}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function reviewProduct(productId: string, action: "PUBLISHED" | "REJECTED") {
  const res = await fetch(`/api/products/${productId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export type ProducerReviewStats = {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalCount: number;
  profileCommentCount: number;
  recentComments: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    product: { title: string };
    user: { id: string; fullname: string | null; username: string | null; avatar: string | null };
  }>;
};

export async function getProducerReviewStats(producerId: string) {
  const res = await fetch(`/api/profiles/${producerId}/review-stats`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result: result as ProducerReviewStats };
}

export async function getLessonHlsUrl(productId: string, moduleIndex: number, lessonIndex: number) {
  const res = await fetch(`/api/products/${productId}/preview-video-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleIndex, lessonIndex }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}
