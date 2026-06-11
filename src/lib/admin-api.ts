import type { Achievement } from "@/types/user";

export async function getAllTemplates(): Promise<{
  ok: boolean;
  data?: Achievement[];
  message?: string;
}> {
  const res = await fetch("/api/achievements/templates");
  const json = await res.json();
  return { ok: res.ok, data: json.data, message: json.message };
}

export async function createTemplate(data: {
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  role: string;
}): Promise<{ ok: boolean; data?: Achievement; message?: string }> {
  const res = await fetch("/api/achievements/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return { ok: res.ok, data: json.data, message: json.message };
}

export async function updateTemplate(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    role: string;
  }>,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(`/api/achievements/templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return { ok: res.ok, message: json.message };
}

export async function deleteTemplate(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(`/api/achievements/templates/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  return { ok: res.ok, message: json.message };
}

export async function getXpRecommendation(
  difficulty: "easy" | "medium" | "hard" | "epic",
): Promise<{ ok: boolean; data?: { difficulty: string; xp: number }; message?: string }> {
  const res = await fetch(`/api/gamification/xp-recommendation?difficulty=${difficulty}`);
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
