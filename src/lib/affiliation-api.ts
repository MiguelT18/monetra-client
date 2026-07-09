export interface AffiliationResponse {
  id: string;
  productId: string;
  affiliateId: string;
  code: string;
  commissionId: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    commissionRate: number;
    affiliateCookieDays: number;
  };
}

export interface AffiliationProductStat {
  id: string;
  code: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    commissionRate: number;
    affiliateCookieDays: number;
  };
  stats: {
    sales: number;
    paid: number;
    pending: number;
    returns: number;
  };
}

export interface AffiliationDetailProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string | null;
  affiliateEnabled: boolean;
  commissionRate: number;
  affiliateCookieDays: number;
  affiliateDescription: string | null;
  affiliateVideoUrl: string | null;
  producerId: string;
}

export interface AffiliationDetailResponse {
  id: string;
  productId: string;
  affiliateId: string;
  code: string;
  commissionId: string;
  product: AffiliationDetailProduct;
}

export async function listMyAffiliations(page = 1, limit = 20) {
  const res = await fetch(`/api/affiliations?page=${page}&limit=${limit}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function listMyAffiliationProducts(page = 1, limit = 50) {
  const res = await fetch(`/api/affiliations/products?page=${page}&limit=${limit}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function joinProductAsAffiliate(productId: string) {
  const res = await fetch(`/api/products/${productId}/affiliate`, {
    method: "POST",
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function checkAffiliateEligibility(productId: string) {
  const res = await fetch(`/api/products/${productId}/affiliate-eligibility`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function getAffiliation(id: string) {
  try {
    const res = await fetch(`/api/affiliations/${id}`);
    const result = await res.json();
    return { ok: res.ok, result };
  } catch {
    return { ok: false, result: null };
  }
}
