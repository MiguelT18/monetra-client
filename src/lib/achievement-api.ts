import type { Achievement } from "@/types/user";

export async function getMyAchievements(): Promise<{
  ok: boolean;
  data?: Achievement[];
  message?: string;
}> {
  const res = await fetch("/api/achievements/user");
  const json = await res.json();
  return { ok: res.ok, data: json.data, message: json.message };
}

export async function updateAchievementProgress(
  achievementKey: string,
  progress: number,
  status?: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch("/api/achievements/progress", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ achievementKey, progress, status }),
  });
  const json = await res.json();
  return { ok: res.ok, message: json.message };
}
