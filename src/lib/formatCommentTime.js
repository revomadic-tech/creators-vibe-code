/** Relative timestamp for comment threads; older than a week uses a short date. */
export function formatCommentTime(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string" && !/^\d{4}-\d{2}/.test(value) && Number.isNaN(Date.parse(value))) {
    return value;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatCommentTimeFull(value) {
  if (value == null || value === "") return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function commentTimestamp(note) {
  if (!note || typeof note !== "object") return "";
  return (
    note.createdAt ||
    note.created_at ||
    note.timestamp ||
    note.time ||
    note.date ||
    note.updatedAt ||
    ""
  );
}
