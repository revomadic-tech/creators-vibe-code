import { findAdTask } from "../data/adProduction";
import { ALL_PHASES } from "../data/commandBoards";
import { WD_CLOSED_STATUSES } from "../data/productionsWebDev";
import { currentUser, findWorkspaceUser } from "../data/mockData";

export const CLOSED_STATUSES = new Set([
  "Approved",
  "Launched",
  "Applovin Launched",
  "Shipped",
  "Live",
  "done",
  "cancelled",
  ...WD_CLOSED_STATUSES,
]);

export const REVIEW_STATUSES = new Set([
  "Ready For Review",
  "Narek Reviewing",
  "Revisions Needed",
  "Ready For Second Review",
  "Final Revisions Needed",
  "Final Review",
  "Danilo Review",
  "Reviewing - Vlad",
  "John Review",
  "Design review",
]);

export const PHASE_BY_ID = Object.fromEntries(ALL_PHASES.map((p) => [p.id, p]));

export function hexToRgb(hex) {
  const h = (hex || "").replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  if (!Number.isFinite(n)) return { r: 255, g: 255, b: 255 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatTaskDate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function isTaskOverdue(item) {
  if (!item?.dueDate || CLOSED_STATUSES.has(item.status)) return false;
  const due = new Date(`${item.dueDate}T23:59:59`);
  return !Number.isFinite(due.getTime()) ? false : due < new Date();
}

export function taskRef(item) {
  return String(item?.name || "").replace(/^#/, "");
}

export function taskContentTag(item) {
  return `task:${taskRef(item)}`;
}

export function briefPath(item) {
  return `/briefs?task=${encodeURIComponent(taskRef(item))}`;
}

function namesEqual(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

export function resolveViewer(authUser) {
  const name =
    authUser?.name ||
    authUser?.fullName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ");
  if (name) return findWorkspaceUser(name) || currentUser;
  return currentUser;
}

export function isAssignedTo(item, viewer) {
  if (!item || !viewer) return false;
  const viewerName = typeof viewer === "string" ? viewer : viewer.name;
  const viewerUser =
    typeof viewer === "object" && viewer.id != null
      ? viewer
      : findWorkspaceUser(viewerName);
  const names = [...(item.editors || []), ...(item.creativeStrategists || [])];
  return names.some((n) => {
    const assigned = findWorkspaceUser(n);
    if (viewerUser && assigned) {
      return String(viewerUser.id) === String(assigned.id) || namesEqual(viewerUser.name, assigned.name);
    }
    return namesEqual(n, viewerName);
  });
}

export function statusBucket(item) {
  const status = item?.status;
  if (CLOSED_STATUSES.has(status)) return "done";
  if (REVIEW_STATUSES.has(status)) return "review";
  return "open";
}

export function itemPeople(item) {
  const names = [...new Set([...(item?.editors || []), ...(item?.creativeStrategists || [])])];
  return names.map((name) => findWorkspaceUser(name) || { id: name, name, avatar: null });
}

export function groupByProductThenPhase(items) {
  const phaseOrder = Object.fromEntries(ALL_PHASES.map((p, i) => [p.id, i]));
  const byProduct = new Map();
  for (const item of items) {
    const product = item.product || "Unassigned";
    if (!byProduct.has(product)) byProduct.set(product, []);
    byProduct.get(product).push(item);
  }
  return [...byProduct.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([product, productItems]) => {
      const byPhase = new Map();
      for (const item of productItems) {
        const phaseId = item.phase || "_none";
        if (!byPhase.has(phaseId)) byPhase.set(phaseId, []);
        byPhase.get(phaseId).push(item);
      }
      const phases = [...byPhase.entries()]
        .sort(([a], [b]) => (phaseOrder[a] ?? 99) - (phaseOrder[b] ?? 99))
        .map(([phaseId, phaseItems]) => ({
          phaseId,
          phase: PHASE_BY_ID[phaseId] || { id: phaseId, title: "Unphased", color: "#78716c" },
          items: phaseItems,
        }));
      return { product, count: productItems.length, phases };
    });
}

export { findAdTask as findBoardItem };
