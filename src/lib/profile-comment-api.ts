export interface ProfileComment {
  id: string;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    fullname: string | null;
    username: string | null;
    avatar: string | null;
  };
}

export interface ProfileCommentsResult {
  comments: ProfileComment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProfileCommentReport {
  id: string;
  reason: string | null;
  createdAt: string;
  comment: {
    id: string;
    comment: string;
    createdAt: string;
    user: { id: string; fullname: string | null; username: string | null; avatar: string | null };
    profile: { id: string; fullname: string | null; username: string | null };
  };
  reporter: { id: string; fullname: string | null; username: string | null };
}

export interface ProfileCommentReportsResult {
  reports: ProfileCommentReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlockedUser {
  id: string;
  createdAt: string;
  blocked: {
    id: string;
    fullname: string | null;
    username: string | null;
    avatar: string | null;
  };
}

export async function listProfileComments(profileId: string, page = 1, limit = 20) {
  const res = await fetch(`/api/profiles/${profileId}/comments?page=${page}&limit=${limit}`);
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data as ProfileCommentsResult, message: body.message };
}

export async function createProfileComment(profileId: string, comment: string) {
  const res = await fetch(`/api/profiles/${profileId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data, message: body.message };
}

export async function deleteProfileComment(profileId: string, commentId: string) {
  const res = await fetch(`/api/profiles/${profileId}/comments/${commentId}`, {
    method: "DELETE",
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data, message: body.message };
}

export async function reportProfileComment(profileId: string, commentId: string, reason?: string) {
  const res = await fetch(`/api/profiles/${profileId}/comments/${commentId}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data, message: body.message };
}

export async function blockUser(profileId: string, blockedId: string) {
  const res = await fetch(`/api/profiles/${profileId}/block`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blockedId }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data, message: body.message };
}

export async function unblockUser(profileId: string, blockedId: string) {
  const res = await fetch(`/api/profiles/${profileId}/block/${blockedId}`, {
    method: "DELETE",
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data, message: body.message };
}

export async function getBlockedUsers(profileId: string) {
  const res = await fetch(`/api/profiles/${profileId}/blocked`);
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data as { blocked: BlockedUser[] }, message: body.message };
}

export async function checkBlocked(profileId: string) {
  const res = await fetch(`/api/profiles/${profileId}/check-blocked`);
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data as { blocked: boolean }, message: body.message };
}

export async function getProfileCommentCount(profileId: string) {
  const res = await fetch(`/api/profiles/${profileId}/comments/count`);
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data as { count: number }, message: body.message };
}

export async function listReports(page = 1, limit = 20) {
  const res = await fetch(`/api/profiles/reports?page=${page}&limit=${limit}`);
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data as ProfileCommentReportsResult, message: body.message };
}

export async function dismissReport(reportId: string) {
  const res = await fetch(`/api/profiles/reports/${reportId}/dismiss`, {
    method: "POST",
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data, message: body.message };
}

export async function adminDeleteComment(reportId: string, commentId: string) {
  const res = await fetch(`/api/profiles/reports/${reportId}/comment/${commentId}`, {
    method: "DELETE",
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, data: body.data, message: body.message };
}
