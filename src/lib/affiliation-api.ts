export interface AffiliationResponse {
  id: string;
  productId: string;
  affiliateId: string;
  code: string;
  commissionId: string;
  product: {
    id: string;
    title: string;
    thumbnail: string | null;
    commissionRate: number;
    affiliateCookieDays: number;
  };
}

export async function listMyAffiliations(page = 1, limit = 20) {
  const res = await fetch(`/api/affiliations?page=${page}&limit=${limit}`);
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
