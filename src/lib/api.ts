const API_BASE =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export function apiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export function authHeaders(accessToken: string, refreshToken?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  if (refreshToken) {
    headers["x-refresh-token"] = refreshToken;
  }
  return headers;
}

export function forwardSetCookies(
  upstream: Response,
  response: { headers: { append: (name: string, value: string) => void } },
) {
  const cookies = upstream.headers.getSetCookie?.();
  if (cookies?.length) {
    cookies.forEach((cookie) => response.headers.append("Set-Cookie", cookie));
    return;
  }
  const raw = upstream.headers.get("set-cookie");
  if (raw) response.headers.append("Set-Cookie", raw);
}
