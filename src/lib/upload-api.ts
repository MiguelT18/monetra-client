export async function requestUploadUrl() {
  const res = await fetch("/api/upload/r2/request-upload", { method: "POST" });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function startProcessing(uploadId: string) {
  const res = await fetch("/api/upload/r2/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function checkUploadStatus(uploadId: string) {
  const res = await fetch(`/api/upload/r2/upload-status/${uploadId}`);
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function confirmAsset(
  productId: string,
  moduleIndex: number,
  lessonIndex: number,
  uploadId: string,
  hlsUrl: string,
  durationMinutes?: number,
) {
  const res = await fetch("/api/upload/r2/confirm-asset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId,
      lessonIndex,
      moduleIndex,
      uploadId,
      hlsUrl,
      durationMinutes,
    }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function confirmIntroVideo(productId: string, hlsUrl: string) {
  const res = await fetch("/api/upload/r2/confirm-intro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, hlsUrl }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function confirmAffiliateVideo(productId: string, hlsUrl: string) {
  const res = await fetch("/api/upload/r2/confirm-affiliate-intro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, hlsUrl }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function uploadToR2(file: File, uploadUrl: string) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  return res.ok;
}

export async function requestAttachmentUploadUrl(fileName: string, contentType: string) {
  const res = await fetch("/api/upload/r2/attachment-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, contentType }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function confirmAttachment(
  productId: string,
  moduleIndex: number,
  lessonIndex: number,
  attachment: { id: string; name: string; url: string; type: string; size: number },
) {
  const res = await fetch("/api/upload/r2/confirm-attachment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, moduleIndex, lessonIndex, attachment }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}

export async function removeAttachment(
  productId: string,
  moduleIndex: number,
  lessonIndex: number,
  attachmentId: string,
) {
  const res = await fetch("/api/upload/r2/remove-attachment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, moduleIndex, lessonIndex, attachmentId }),
  });
  const { ok, result } = await res.json().then(r => ({ ok: res.ok, result: r }));
  return { ok, result };
}
