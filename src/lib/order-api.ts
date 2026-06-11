export interface OrderResponse {
  id: string;
  productId: string;
  buyerId: string;
  total: number;
  createdAt: string;
  product: {
    id: string;
    title: string;
    thumbnail: string | null;
  };
}

export async function listMyOrders(page = 1, limit = 20) {
  const res = await fetch(`/api/orders?page=${page}&limit=${limit}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function purchaseProduct(productId: string, affiliateCode?: string) {
  const res = await fetch(`/api/orders/purchase/${productId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ affiliateCode }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}
