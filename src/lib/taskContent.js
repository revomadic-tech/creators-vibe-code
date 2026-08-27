import axios from "axios";
import { createPresignedUploads } from "../api/uploads";

export { taskContentTag } from "./adTaskBrief";

function slugify(raw) {
  return (
    String(raw || "")
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "file"
  );
}

function fileExtension(file) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type.startsWith("image/")) return file.type.split("/")[1] || "png";
  if (file.type.startsWith("video/")) return file.type.split("/")[1] || "mp4";
  return "bin";
}

function uniqueFileName(file) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${slugify(file.name)}`;
}

export function detectMediaKind(file) {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("image/")) return "image";
  const ext = fileExtension(file);
  if (["mp4", "mov", "webm", "m4v"].includes(ext)) return "video";
  return "image";
}

export async function uploadFilesToLibrary(files, model, onProgress) {
  if (!files.length) return [];
  const meta = files.map((file) => ({
    fileName: uniqueFileName(file),
    fileType: fileExtension(file),
  }));
  const resp = await createPresignedUploads({ meta, model });
  const presigned = resp?.data?.data ?? [];
  if (presigned.length !== files.length) {
    throw new Error("Could not create upload URLs for all files");
  }
  await Promise.all(
    files.map((file, i) =>
      axios.put(presigned[i].url, file, {
        headers: { "Content-Type": presigned[i].contentType },
        onUploadProgress: (event) => {
          if (!onProgress) return;
          const total = event.total ?? file.size;
          if (!total) return;
          onProgress(file, Math.min(100, Math.round((event.loaded / total) * 100)));
        },
      }),
    ),
  );
  return presigned.map((row) => row.uploadURL);
}

export function mergeContentIds(existing, incoming) {
  const next = [];
  const seen = new Set();
  for (const id of [...(existing || []), ...(incoming || [])]) {
    const key = String(id);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    next.push(id);
  }
  return next;
}
