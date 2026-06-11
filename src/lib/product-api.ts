export type ProductStatus = "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";

export type ModuleData = {
  title: string;
  lessons: { title: string; durationMinutes?: number }[];
}[];

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
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
  thumbnail?: string | null;
  affiliateEnabled?: boolean;
  commissionRate?: number | null;
  affiliateCookieDays?: number;
  introVideoUrl?: string | null;
  duration?: number | null;
  rating?: number | null;
  modules?: ModuleData | null;
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
  introVideoUrl?: string | null;
  duration?: number | null;
  rating?: number | null;
  modules?: ModuleData | null;
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

export async function listCatalog(page = 1, limit = 12) {
  const res = await fetch(`/api/products/catalog?page=${page}&limit=${limit}`);
  const {ok, result} = await res.json().then(r => ({ok: res.ok, result: r}));
  return { ok, result };
}

export async function getProductPreview(productId: string) {
  const res = await fetch(`/api/products/${productId}/preview`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}
