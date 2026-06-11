export interface EnrollmentResponse {
  id: string;
  productId: string;
  userId: string;
  progress: number;
  product: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    price: number;
  };
}

export async function listMyEnrollments(page = 1, limit = 20) {
  const res = await fetch(`/api/enrollments?page=${page}&limit=${limit}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}
