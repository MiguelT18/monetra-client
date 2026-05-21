import { apiUrl } from "@/lib/api";

export type OAuthProvider = "google" | "github";

export async function requestForgotPassword(email: string) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json() as Promise<{ message: string }>;
}

export async function requestOAuthUrl(provider: OAuthProvider) {
  const res = await fetch(`/api/auth/oauth/${provider}`);
  const result = (await res.json()) as {
    message: string;
    data?: { url: string };
  };
  if (!res.ok || !result.data?.url) {
    throw new Error(result.message ?? "No se pudo conectar con el proveedor");
  }
  return result.data.url;
}

export async function completeOAuthCallback(code: string) {
  const res = await fetch("/api/auth/oauth/callback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const result = await res.json();
  return { ok: res.ok, result };
}

export async function establishRecoverySession(
  access_token: string,
  refresh_token: string,
) {
  const res = await fetch("/api/auth/recovery-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token, refresh_token }),
  });
  const result = await res.json();
  return { ok: res.ok, result };
}

export async function updatePassword(password: string) {
  const res = await fetch("/api/auth/update-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const result = await res.json();
  return { ok: res.ok, result };
}

/** Solo para rutas API internas que reenvían al backend */
export { apiUrl };
