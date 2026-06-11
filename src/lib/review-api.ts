export interface ReviewUser {
  id: string;
  fullname: string | null;
  username: string | null;
  avatar: string | null;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

export interface ReviewsResult {
  reviews: ReviewResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listProductReviews(productId: string, page = 1, limit = 20) {
  const res = await fetch(`/api/products/${productId}/reviews?page=${page}&limit=${limit}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function createProductReview(
  productId: string,
  data: { rating: number; comment?: string }
) {
  const res = await fetch(`/api/products/${productId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}
