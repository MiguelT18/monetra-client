export interface CommissionResponse {
  id: string;
  orderId: string;
  affiliationId: string;
  amount: number;
  status: "PENDING" | "PAID" | "REJECTED" | "CANCELED";
  order: {
    id: string;
    total: number;
    createdAt: string;
    product: { id: string; title: string };
  };
  affiliation: { code: string };
}

export interface CommissionStats {
  pending: { total: number; count: number };
  paid: { total: number; count: number };
  rejected: { total: number; count: number };
  canceled: { total: number; count: number };
}

export async function listMyCommissions(page = 1, limit = 20) {
  const res = await fetch(`/api/commissions?page=${page}&limit=${limit}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export interface CommissionByProduct {
  product: string;
  total: number;
  count: number;
}

export interface CommissionHistory {
  month: string;
  pending: number;
  paid: number;
}

export async function getCommissionStats() {
  const res = await fetch("/api/commissions/stats");
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, data: result.data as CommissionStats | undefined };
}

export async function fetchCommissionByProduct() {
  const res = await fetch("/api/commissions/by-product");
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, data: result.data as CommissionByProduct[] | undefined };
}

export async function fetchCommissionHistory(months = 6) {
  const res = await fetch(`/api/commissions/history?months=${months}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, data: result.data as CommissionHistory[] | undefined };
}
