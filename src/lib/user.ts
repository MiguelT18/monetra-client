export const ROLE_ROUTES: Record<string, string[]> = {
  "/user/settings": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/dashboard": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/explore": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/courses": ["STUDENT"],
  "/user/achievements": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/affiliations": ["AFFILIATE"],
  "/user/products": ["CREATOR"],
};

export interface PublicProfile {
  id: string;
  username: string | null;
  fullname: string | null;
  bio: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  gamifications: { xp: number; level: number } | null;
  _count: {
    enrollments: number;
    products: number;
    affiliations: number;
  };
}

export async function getPublicProfile(username: string) {
  const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}
