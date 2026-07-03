export const ROLE_ROUTES: Record<string, string[]> = {
  "/user/settings": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/dashboard": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/explore": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/courses": ["STUDENT"],
  "/user/achievements": ["STUDENT", "AFFILIATE", "CREATOR", "ADMIN"],
  "/user/affiliations": ["AFFILIATE"],
  "/user/products": ["CREATOR"],
};

export interface ProfileProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string | null;
  category: string | null;
  rating: number | null;
  duration: number | null;
  createdAt: string;
}

export interface ProfileAchievement {
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  status: string;
  progress: number;
  unlockedAt: string | null;
}

export interface PublicProfile {
  id: string;
  username: string | null;
  fullname: string | null;
  bio: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  gamifications: { xp: number; level: number } | null;
  products: ProfileProduct[];
  achievements: ProfileAchievement[];
  _count: {
    enrollments: number;
    products: number;
    affiliations: number;
    reviews: number;
  };
}

export async function getPublicProfile(username: string) {
  const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}
