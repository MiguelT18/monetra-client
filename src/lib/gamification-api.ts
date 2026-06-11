export interface GamificationProgress {
  userId: string;
  xp: number;
  level: number;
}

export interface LeaderboardEntry {
  userId: string;
  xp: number;
  level: number;
  user: {
    id: string;
    username: string | null;
    avatar: string | null;
  };
}

export async function getMyGamificationProgress() {
  const res = await fetch("/api/gamification/progress");
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, data: result.data as GamificationProgress | undefined };
}

export async function getLeaderboard(limit = 10) {
  const res = await fetch(`/api/gamification/leaderboard?limit=${limit}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, data: result.data as LeaderboardEntry[] | undefined };
}
