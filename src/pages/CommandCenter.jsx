import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Columns3,
  EyeOff,
  GripVertical,
  LayoutGrid,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Table2,
  X,
} from "lucide-react";
import { useCommandCenter } from "../contexts/CommandCenterContext";
import { EditableBoardCell } from "../components/briefs/BoardFieldMenu";
import {
  AD_ANGLE_COLORS,
  AD_BOARD_COLUMNS,
  AD_EDITING_STYLE_COLORS,
  AD_PAIN_POINT_COLORS,
  AD_PERFORMANCE_COLORS,
  AD_PHASES,
  AD_PLATFORM_COLORS,
  AD_PRIORITY_COLORS,
  AD_PRODUCT_COLORS,
  AD_STATUS_COLORS,
  parseTaskDrag,
} from "../data/adProduction";
import {
  BOARD_AD_PRODUCTION,
  COMMAND_BOARDS,
  getCommandBoard,
} from "../data/commandBoards";
import {
  WD_PLATFORM_COLORS,
  WD_STATUS_COLORS,
  WD_TYPE_COLORS,
} from "../data/productionsWebDev";
import { findWorkspaceUser, revoProducts, teamMembers } from "../data/mockData";
import { APP_CONTENT_INSET } from "../components/layout/chrome";

// v2: full column set (all visible by default) — invalidates saved v1 state
// where half the board was hidden.
const COLUMN_STORAGE_KEY = "revo.commandCenter.boardColumns.v5";
const OPEN_GROUP_STORAGE_KEY = "revo.commandCenter.lastOpenGroup.v1";
const VIEW_STORAGE_KEY = "revo.commandCenter.boardView.v1";
const BOARD_VIEWS = [
  { id: "table", label: "Table", icon: Table2 },
  { id: "kanban", label: "Kanban", icon: LayoutGrid },
];

function columnStorageKey(board) {
  return board.columnStorageKey || COLUMN_STORAGE_KEY;
}

function openGroupStorageKey(board) {
  return board.openGroupStorageKey || OPEN_GROUP_STORAGE_KEY;
}

function loadBoardView(boardId) {
  try {
    const raw = JSON.parse(localStorage.getItem(VIEW_STORAGE_KEY) || "null");
    const view = raw?.[boardId];
    if (view === "kanban" || view === "table") return view;
  } catch {
    /* ignore private mode */
  }
  return "table";
}

function persistBoardView(boardId, view) {
  try {
    const raw = JSON.parse(localStorage.getItem(VIEW_STORAGE_KEY) || "{}") || {};
    if (!raw || typeof raw !== "object") return;
    raw[boardId] = view;
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(raw));
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Groups default to collapsed; only the section the user last expanded
 * (persisted) starts open. Falls back to the first phase on first visit.
 */
function loadInitialOpenGroups(board = getCommandBoard(BOARD_AD_PRODUCTION)) {
  let lastOpen = null;
  try {
    lastOpen = localStorage.getItem(openGroupStorageKey(board));
  } catch {
    /* ignore private mode */
  }
  const phases = board.phases;
  const openId = phases.some((p) => p.id === lastOpen) ? lastOpen : phases[0]?.id;
  return Object.fromEntries(phases.map((p) => [p.id, p.id === openId]));
}

function phaseForNewTask(openGroups, board) {
  let lastOpen = null;
  try {
    lastOpen = localStorage.getItem(openGroupStorageKey(board));
  } catch {
    /* ignore private mode */
  }
  const phases = board.phases;
  if (lastOpen && phases.some((p) => p.id === lastOpen)) return lastOpen;
  return phases.find((p) => openGroups[p.id])?.id || phases[0]?.id;
}

const COLUMN_BY_ID = Object.fromEntries(AD_BOARD_COLUMNS.map((col) => [col.id, col]));
const ROLLUP_GETTERS = {
  status: (i) => [i.status],
  product: (i) => [i.product],
  priority: (i) => [i.priority],
  editor: (i) => i.editors || [],
  owner: (i) => i.editors || [],
  angle: (i) => [i.angle],
  style: (i) => [i.editingStyle],
  platform: (i) => [i.platform],
  painPoint: (i) => [i.painPoint],
  strategist: (i) => i.creativeStrategists || [],
  performance: (i) => [i.performance],
  type: (i) => [i.type],
};

const USER_ROLLUP_COLORS = Object.fromEntries(
  teamMembers.filter((m) => m.color).map((m) => [m.name, m.color]),
);

const ROLLUP_COLORS = {
  status: { ...AD_STATUS_COLORS, ...WD_STATUS_COLORS },
  product: AD_PRODUCT_COLORS,
  priority: AD_PRIORITY_COLORS,
  editor: USER_ROLLUP_COLORS,
  owner: USER_ROLLUP_COLORS,
  angle: AD_ANGLE_COLORS,
  style: AD_EDITING_STYLE_COLORS,
  platform: { ...AD_PLATFORM_COLORS, ...WD_PLATFORM_COLORS },
  painPoint: AD_PAIN_POINT_COLORS,
  strategist: USER_ROLLUP_COLORS,
  performance: AD_PERFORMANCE_COLORS,
  type: WD_TYPE_COLORS,
};
const DEFAULT_ORDER = AD_BOARD_COLUMNS.map((col) => col.id);
const DEFAULT_HIDDEN = AD_BOARD_COLUMNS.filter((col) => col.defaultHidden).map(
  (col) => col.id,
);
const DEFAULT_WIDTHS = Object.fromEntries(AD_BOARD_COLUMNS.map((col) => [col.id, col.width]));
const COL_MAX_WIDTH = 480;
const CENTERED_COLS = new Set(["product", "editor", "owner", "strategist", "platform"]);
const STICKY_BG = "#0a0b10";
const HEADER_BG = "#101218";
const ROW_HOVER = "#14161e";
const ROW_SELECTED = "#1a1d28";
const GROUP_BG = "#11131a";
const HAIRLINE = "inset 0 -1px 0 rgba(255,255,255,0.16)";

function withHairline(extra) {
  return extra ? `${extra}, ${HAIRLINE}` : HAIRLINE;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function contrastText(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
    ? "rgba(12, 12, 16, 0.9)"
    : "rgba(255, 255, 255, 0.95)";
}

const BOARD_PRODUCT_ALIASES = {
  wave: "wave",
  sculptor: "sculptor",
  "collagen jelly": "collagen-jelly",
  "face genie only": "face-genie",
  "face genie & collagen jelly": "face-genie",
  "face genie": "face-genie",
  "relief bundle": "cupper",
  "cupper mixed": "cupper",
  cupper: "cupper",
  "cellulite kit": "sculptor",
};

function resolveBoardProduct(name) {
  const key = String(name || "").trim().toLowerCase();
  if (!key) return null;
  const aliased = BOARD_PRODUCT_ALIASES[key];
  if (aliased) return revoProducts.find((p) => p.id === aliased) || null;
  return (
    revoProducts.find((p) => p.name.toLowerCase() === key) ||
    revoProducts.find((p) => key.includes(p.name.toLowerCase())) ||
    null
  );
}

function PlatformGlyph({ id, className = "h-4 w-4" }) {
  if (id === "meta") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.98 3.2c-1.66 0-3.22.78-4.98 2.5C10.24 3.98 8.68 3.2 7.02 3.2 4.2 3.2 2 5.55 2 9.05c0 3.05 1.72 6.3 4.95 9.55C8.9 20.7 10.85 22 12 22s3.1-1.3 5.05-3.4C20.28 15.35 22 12.1 22 9.05c0-3.5-2.2-5.85-5.02-5.85ZM8.4 15.7c-1.85-2.05-3.3-4.55-3.3-6.55 0-1.7.95-2.85 2.15-2.85 1.15 0 2.25.9 3.3 2.25.35.45.7 1 .98 1.55-1.15 2.15-2.25 4.15-3.13 5.6Zm7.2 0c-.88-1.45-1.98-3.45-3.13-5.6.28-.55.63-1.1.98-1.55 1.05-1.35 2.15-2.25 3.3-2.25 1.2 0 2.15 1.15 2.15 2.85 0 2-1.45 4.5-3.3 6.55Z"
        />
      </svg>
    );
  }
  if (id === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path fill="currentColor" d="M9 7.2v9.6L18.2 12 9 7.2Z" />
      </svg>
    );
  }
  if (id === "google") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.8c2.3-2.1 3.6-5.1 3.6-8.7Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 6-1.1 8-2.9l-3.8-3c-1.1.7-2.5 1.2-4.2 1.2-3.2 0-6-2.2-7-5.1H1.1v3.1C3.1 21.3 7.2 24 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5 13.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V5.7H1.1A11.96 11.96 0 0 0 0 11c0 1.9.5 3.8 1.1 5.3L5 13.2Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.1 15.2 0 12 0 7.2 0 3.1 2.7 1.1 6.7L5 9.8C6 6.9 8.8 4.8 12 4.8Z"
        />
      </svg>
    );
  }
  if (id === "applovin") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 3.2 3.4 20.8h3.6l1.5-3.2h7l1.5 3.2h3.6L12 3.2Zm0 5.4 2.4 5.2H9.6L12 8.6Z"
        />
      </svg>
    );
  }
  if (id === "vibe") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 6.5c1.6 2.4 3 4.9 4.2 7.5.8 1.8 1.5 3.6 2.1 5.5h3.4c.6-1.9 1.3-3.7 2.1-5.5 1.2-2.6 2.6-5.1 4.2-7.5h-3.6c-1.2 2-2.3 4.1-3.3 6.3h-.2C9.9 10.6 8.8 8.5 7.6 6.5H4Z"
        />
      </svg>
    );
  }
  return (
    <span className="text-[9px] font-bold uppercase tracking-wide">{id.slice(0, 2)}</span>
  );
}

const PLATFORM_MARKS = {
  Meta: { id: "meta", bg: "#0668E1", fg: "#fff" },
  YouTube: { id: "youtube", bg: "#FF0000", fg: "#fff" },
  Google: { id: "google", bg: "#fff", fg: "#4285F4" },
  AppLovin: { id: "applovin", bg: "#0B1220", fg: "#5CE1E6" },
  Vibe: { id: "vibe", bg: "#6D28D9", fg: "#fff" },
};

function parsePlatforms(value) {
  return String(value || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

function clampColWidth(col, next) {
  const min = col?.minWidth || 80;
  return Math.max(min, Math.min(COL_MAX_WIDTH, Math.round(next)));
}

function hashHueColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 33 + str.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 62% 52%)`;
}

function columnSegments(rows, columnId) {
  const getValues = ROLLUP_GETTERS[columnId];
  if (!getValues) return null;
  const colors = ROLLUP_COLORS[columnId];
  const counts = new Map();
  for (const row of rows) {
    for (const raw of getValues(row)) {
      const v = raw == null ? "" : String(raw).trim();
      if (!v) continue;
      counts.set(v, (counts.get(v) || 0) + 1);
    }
  }
  const entries = [...counts.entries()];
  if (colors) {
    const order = Object.keys(colors);
    entries.sort((a, b) => {
      const ia = order.indexOf(a[0]);
      const ib = order.indexOf(b[0]);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || b[1] - a[1];
    });
  } else {
    entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }
  return entries.map(([label, count]) => ({
    label,
    count,
    color: colors?.[label] || hashHueColor(label),
  }));
}

function ColumnRollupBar({ segments, className = "h-2 mt-1.5", light = false }) {
  if (segments == null) return <div className={className} />;
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) {
    return (
      <div
        className={`rounded-sm ${light ? "bg-stone-400/35" : "bg-white/[0.08]"} ${className}`}
      />
    );
  }
  const tip = segments
    .map((s) => `${s.label} · ${s.count} (${Math.round((s.count / total) * 100)}%)`)
    .join("  ·  ");
  return (
    <div
      className={`rounded-sm overflow-hidden flex w-full gap-px ${light ? "bg-stone-400/40" : "bg-black/40"} ${className}`}
      title={tip}
    >
      {segments.map((s) => (
        <span
          key={s.label}
          className="flex h-full min-w-[2px] items-center justify-center overflow-hidden text-[8px] font-bold tabular-nums leading-none"
          style={{
            flex: `${s.count} 0 0`,
            backgroundColor: s.color,
          }}
          title={`${s.label}: ${s.count} (${Math.round((s.count / total) * 100)}%)`}
        />
      ))}
    </div>
  );
}

function ColumnResizeHandle({ onResizeStart }) {
  return (
    <span
      role="separator"
      aria-orientation="vertical"
      title="Drag to resize"
      data-command-interactive
      onMouseDown={onResizeStart}
      onClick={(e) => e.stopPropagation()}
      className="absolute top-0 -right-px z-40 h-full w-2 cursor-col-resize touch-none group/resize"
    >
      <span className="absolute inset-y-1 right-[3px] w-px rounded-full bg-white/0 group-hover/th:bg-white/25 group-hover/resize:bg-white/70 group-active/resize:bg-white" />
    </span>
  );
}

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const CLOSED_STATUSES = new Set([
  "Approved",
  "Launched",
  "Applovin Launched",
  "Shipped",
  "Live",
  "done",
  "cancelled",
]);

function isOverdue(item) {
  if (!item.dueDate || CLOSED_STATUSES.has(item.status)) return false;
  const due = new Date(`${item.dueDate}T23:59:59`);
  return !Number.isNaN(due.getTime()) && due < new Date();
}

function columnMeta(board) {
  const columns = board?.columns || AD_BOARD_COLUMNS;
  return {
    byId: Object.fromEntries(columns.map((col) => [col.id, col])),
    order: columns.map((col) => col.id),
    hidden: columns.filter((col) => col.defaultHidden).map((col) => col.id),
    widths: Object.fromEntries(columns.map((col) => [col.id, col.width])),
  };
}

function loadColumnState(board = getCommandBoard(BOARD_AD_PRODUCTION)) {
  const meta = columnMeta(board);
  try {
    const raw = localStorage.getItem(columnStorageKey(board));
    if (!raw) return { order: meta.order, hidden: meta.hidden, widths: meta.widths };
    const parsed = JSON.parse(raw);
    const savedOrder = Array.isArray(parsed.order) ? parsed.order : [];
    const known = new Set(meta.order);
    const order = [
      "item",
      ...savedOrder.filter((id) => id !== "item" && known.has(id)),
      ...meta.order.filter((id) => id !== "item" && !savedOrder.includes(id)),
    ];
    const hidden = (Array.isArray(parsed.hidden) ? parsed.hidden : meta.hidden).filter(
      (id) => known.has(id) && meta.byId[id]?.hideable !== false,
    );
    const savedWidths = parsed.widths && typeof parsed.widths === "object" ? parsed.widths : {};
    const widths = { ...meta.widths };
    for (const id of meta.order) {
      const w = Number(savedWidths[id]);
      if (Number.isFinite(w)) widths[id] = clampColWidth(meta.byId[id], w);
    }
    return { order, hidden, widths };
  } catch {
    return { order: meta.order, hidden: meta.hidden, widths: meta.widths };
  }
}

// Master filter facets — every labeled field on the board is filterable.
function facetDefsFor(board) {
  const phases = board.phases || AD_PHASES;
  const shared = [
    {
      id: "phase",
      label: "Phase",
      values: (item) => [item.phase],
      colors: Object.fromEntries(phases.map((p) => [p.id, p.color])),
      format: (v) => phases.find((p) => p.id === v)?.title || v,
      order: phases.map((p) => p.id),
    },
    { id: "status", label: "Status", values: (i) => [i.status], colors: board.statusColors || AD_STATUS_COLORS },
    { id: "product", label: "Product", values: (i) => [i.product], colors: AD_PRODUCT_COLORS },
    { id: "priority", label: "Priority", values: (i) => [i.priority], colors: AD_PRIORITY_COLORS },
  ];
  if (board.id !== BOARD_AD_PRODUCTION) {
    return [
      ...shared,
      {
        id: "type",
        label: "Type",
        values: (i) => [i.type],
        colors: WD_TYPE_COLORS,
      },
      {
        id: "owner",
        label: "Owner",
        values: (i) => i.editors || [],
        people: true,
        format: (v) => findWorkspaceUser(v)?.name || v,
      },
      {
        id: "platform",
        label: "Channel",
        values: (i) => [i.platform],
        colors: board.platformColors || AD_PLATFORM_COLORS,
      },
    ];
  }
  return [
    ...shared,
    {
      id: "editor",
      label: "Editor",
      values: (i) => i.editors || [],
      people: true,
      format: (v) => findWorkspaceUser(v)?.name || v,
    },
    {
      id: "strategist",
      label: "Strategist",
      values: (i) => i.creativeStrategists || [],
      people: true,
      format: (v) => findWorkspaceUser(v)?.name || v,
    },
    { id: "angle", label: "Angle", values: (i) => [i.angle], colors: AD_ANGLE_COLORS },
    { id: "style", label: "Style", values: (i) => [i.editingStyle], colors: AD_EDITING_STYLE_COLORS },
    { id: "platform", label: "Platform", values: (i) => [i.platform], colors: AD_PLATFORM_COLORS },
    { id: "painPoint", label: "Pain Point", values: (i) => [i.painPoint], colors: AD_PAIN_POINT_COLORS },
    { id: "performance", label: "Performance", values: (i) => [i.performance], colors: AD_PERFORMANCE_COLORS },
  ];
}

function facetOptionsFor(board) {
  const seed = board.seed || [];
  return Object.fromEntries(
    facetDefsFor(board).map((def) => {
      const counts = new Map();
      seed.forEach((item) => {
        def.values(item)
          .filter(Boolean)
          .forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
      });
      const options = [...counts.entries()].map(([value, count]) => ({ value, count }));
      if (def.order) {
        options.sort((a, b) => def.order.indexOf(a.value) - def.order.indexOf(b.value));
      } else {
        options.sort(
          (a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)),
        );
      }
      return [def.id, options];
    }),
  );
}

function moveColumn(order, fromId, toId) {
  if (!fromId || fromId === "item" || fromId === toId) return order;
  const next = order.filter((id) => id !== fromId);
  let insertAt = next.indexOf(toId);
  if (toId === "item" || insertAt <= 0) insertAt = 1;
  if (insertAt < 0) insertAt = next.length;
  next.splice(insertAt, 0, fromId);
  const itemIdx = next.indexOf("item");
  if (itemIdx > 0) {
    next.splice(itemIdx, 1);
    next.unshift("item");
  }
  return next;
}

function StatusPill({ label, color }) {
  if (!label) return <span className="text-white/20">—</span>;
  return (
    <span
      className="inline-flex max-w-full items-center truncate rounded-full border px-2 py-[3px] text-[10px] font-semibold leading-none"
      style={{
        backgroundColor: color ? withAlpha(color, 0.16) : "rgba(255,255,255,0.06)",
        color: color || "rgba(255,255,255,0.7)",
        borderColor: color ? withAlpha(color, 0.32) : "rgba(255,255,255,0.08)",
      }}
      title={label}
    >
      {label}
    </span>
  );
}

function DotLabel({ label, color }) {
  if (!label) return <span className="text-white/20">—</span>;
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5" title={label}>
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color || "#74747e" }}
      />
      <span className="truncate text-[12px] leading-none text-white/70">{label}</span>
    </span>
  );
}

function TintedText({ label, color }) {
  if (!label) return <span className="text-white/20">—</span>;
  return (
    <span
      className="block truncate text-[12px] leading-none text-white/55"
      style={color ? { color: withAlpha(color, 0.9) } : undefined}
      title={label}
    >
      {label}
    </span>
  );
}

function ProductCell({ name }) {
  if (!name) return <span className="text-white/20">—</span>;
  const product = resolveBoardProduct(name);
  const swatch = AD_PRODUCT_COLORS[name];
  return (
    <div className="flex items-center justify-center" title={name}>
      {product?.thumbnail ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-white/12">
          <img src={product.thumbnail} alt="" className="h-[86%] w-[86%] object-contain" />
        </span>
      ) : (
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[8px] font-bold ring-1 ring-white/10"
          style={{
            backgroundColor: swatch || "#4b5563",
            color: contrastText(swatch || "#4b5563"),
          }}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}

function PlatformCell({ value }) {
  const names = parsePlatforms(value);
  if (names.length === 0) return <span className="text-white/20">—</span>;
  return (
    <div className="flex items-center justify-center gap-1" title={names.join(" / ")}>
      {names.map((name) => {
        const mark = PLATFORM_MARKS[name];
        if (!mark) {
          return (
            <span
              key={name}
              className="text-[9px] font-bold uppercase tracking-wide text-white/45"
            >
              {name.slice(0, 2)}
            </span>
          );
        }
        return (
          <span
            key={name}
            className="flex h-5 w-5 items-center justify-center text-white/70"
            title={name}
          >
            <PlatformGlyph id={mark.id} className="h-3.5 w-3.5" />
          </span>
        );
      })}
    </div>
  );
}

function DateCell({ iso, overdue = false }) {
  const label = formatDate(iso);
  if (!label) return <span className="text-white/20">—</span>;
  return (
    <span
      className={`block truncate font-mono text-[11px] leading-none tabular-nums ${
        overdue ? "text-rose-400" : "text-white/55"
      }`}
      title={iso}
    >
      {label}
    </span>
  );
}

function CellText({ value, mono = false, muted = false }) {
  if (!value) return <span className="text-white/20">—</span>;
  return (
    <span
      className={`block truncate leading-none ${mono ? "font-mono text-[11px] text-white/45" : muted ? "text-[12px] text-white/45" : "text-[12px] text-white/70"}`}
      title={String(value)}
    >
      {value}
    </span>
  );
}

function PersonCell({ names }) {
  const people = (names || [])
    .filter(Boolean)
    .map((name) => findWorkspaceUser(name) || { name });
  if (people.length === 0) return <span className="text-white/20">—</span>;
  const shown = people.slice(0, 3);
  const extra = people.length - shown.length;
  const title = people
    .map((p) => (p.role ? `${p.name} · ${p.role}` : p.name))
    .join(", ");
  return (
    <div className="flex min-w-0 items-center justify-center" title={title}>
      <div className="flex -space-x-1.5">
        {shown.map((person) =>
          person.avatar ? (
            <img
              key={person.id || person.name}
              src={person.avatar}
              alt={person.name}
              className="h-5 w-5 rounded-full object-cover ring-2 ring-[#0a0b10]"
            />
          ) : (
            <span
              key={person.name}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[8px] font-bold text-white/80 ring-2 ring-[#0a0b10]"
            >
              {initials(person.name)}
            </span>
          ),
        )}
        {extra > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[8px] font-bold text-white/70 ring-2 ring-[#0a0b10]">
            +{extra}
          </span>
        )}
      </div>
    </div>
  );
}

/** Long-text cell — board fields like Summary/Ad Copy sometimes hold a doc URL. */
function LinkableText({ value }) {
  if (!value) return <span className="text-white/20">—</span>;
  if (/^https?:\/\//i.test(value.trim())) {
    return (
      <a
        href={value.trim()}
        target="_blank"
        rel="noreferrer noopener"
        data-command-interactive
        onClick={(e) => e.stopPropagation()}
        className="text-[11px] font-medium text-accent-blue/80 hover:text-accent-blue underline underline-offset-2"
        title={value}
      >
        Doc
      </a>
    );
  }
  return <CellText value={value} muted />;
}

function renderCell(columnId, item) {
  switch (columnId) {
    case "item":
      return (
        <div className="flex min-w-0 items-center justify-start gap-1.5 text-left">
          <GripVertical
            size={12}
            className="shrink-0 text-white/0 group-hover/row:text-white/35"
          />
          <span
            className={`truncate text-left text-[12px] font-medium leading-none ${
              item.name?.trim() ? "text-white" : "text-white/35 italic"
            }`}
            title={item.name?.trim() || "Untitled ad"}
          >
            {item.name?.trim() || "Untitled ad"}
          </span>
        </div>
      );
    case "status":
      return (
        <StatusPill
          label={item.status}
          color={AD_STATUS_COLORS[item.status] || WD_STATUS_COLORS[item.status]}
        />
      );
    case "product":
      return <ProductCell name={item.product} />;
    case "priority":
      return <DotLabel label={item.priority} color={AD_PRIORITY_COLORS[item.priority]} />;
    case "editor":
    case "owner":
      return <PersonCell names={item.editors} />;
    case "type":
      return <TintedText label={item.type} color={WD_TYPE_COLORS[item.type]} />;
    case "link":
      return <LinkableText value={item.link} />;
    case "angle":
      return <TintedText label={item.angle} color={AD_ANGLE_COLORS[item.angle]} />;
    case "due":
      return <DateCell iso={item.dueDate} overdue={isOverdue(item)} />;
    case "style":
      return <TintedText label={item.editingStyle} color={AD_EDITING_STYLE_COLORS[item.editingStyle]} />;
    case "platform":
      return <PlatformCell value={item.platform} />;
    case "painPoint":
      return <TintedText label={item.painPoint} color={AD_PAIN_POINT_COLORS[item.painPoint]} />;
    case "strategist":
      return <PersonCell names={item.creativeStrategists} />;
    case "sendDate":
      return <DateCell iso={item.sendDate} />;
    case "performance":
      return <TintedText label={item.performance} color={AD_PERFORMANCE_COLORS[item.performance]} />;
    case "summary":
      return <LinkableText value={item.summary} />;
    case "adCopy":
      return <LinkableText value={item.adCopy} />;
    default:
      return <span className="text-white/20">—</span>;
  }
}

function ItemNameCell({ item, renaming, onStartRename, onCommitRename }) {
  const [draft, setDraft] = useState(item.name);
  const inputRef = useRef(null);
  const skipCommitRef = useRef(false);

  useEffect(() => {
    if (renaming) {
      skipCommitRef.current = false;
      setDraft(item.name);
    }
  }, [renaming, item.name]);

  useEffect(() => {
    if (!renaming) return;
    const node = inputRef.current;
    if (!node) return;
    node.focus();
    node.select();
  }, [renaming]);

  const commit = () => {
    if (skipCommitRef.current) {
      skipCommitRef.current = false;
      onStartRename(null);
      return;
    }
    const next = draft.trim();
    if (next && next !== item.name) onCommitRename(item.id, next);
    onStartRename(null);
  };

  return (
    <div className="flex min-w-0 items-center justify-start gap-1.5 text-left">
      <GripVertical
        size={12}
        className="shrink-0 text-white/0 group-hover/row:text-white/35"
      />
      {renaming ? (
        <input
          ref={inputRef}
          data-command-interactive
          value={draft}
          aria-label="Ad name"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            } else if (e.key === "Escape") {
              e.preventDefault();
              skipCommitRef.current = true;
              setDraft(item.name);
              onStartRename(null);
            }
          }}
          className="min-w-0 flex-1 bg-transparent py-0.5 text-[12px] font-medium leading-none text-white outline-none border-b border-white/35"
        />
      ) : (
        <button
          type="button"
          data-command-interactive
          title={`${item.name?.trim() || "Untitled ad"} — click to rename`}
          onClick={(e) => {
            e.stopPropagation();
            onStartRename(item.id);
          }}
          className={`min-w-0 truncate text-left text-[12px] font-medium leading-none ${
            item.name?.trim() ? "text-white hover:text-white/90" : "text-white/35 italic"
          }`}
        >
          {item.name?.trim() || "Untitled ad"}
        </button>
      )}
    </div>
  );
}

function cellAlign(columnId) {
  return CENTERED_COLS.has(columnId) ? "text-center" : "text-left";
}

function ColumnPicker({ order, hidden, onToggle, onReorder, onReset, columnsById = COLUMN_BY_ID }) {
  const [dragId, setDragId] = useState(null);

  return (
    <div
      role="menu"
      data-command-interactive
      className="absolute right-0 top-full mt-1 z-50 w-[240px] rounded-xl border border-white/[0.12] bg-[#161618] text-white/90 shadow-xl py-2 fade-in"
    >
      <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
        Columns
      </p>
      <ul className="max-h-[320px] overflow-y-auto">
        {order.map((id) => {
          const col = columnsById[id];
          if (!col) return null;
          const locked = col.hideable === false;
          const checked = locked || !hidden.includes(id);
          return (
            <li
              key={id}
              onDragOver={(e) => {
                if (locked) return;
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const from = e.dataTransfer.getData("text/plain") || dragId;
                onReorder(from, id);
                setDragId(null);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 text-[12px] ${
                locked ? "text-white/35" : "text-white/80 hover:bg-white/[0.06]"
              } ${dragId === id ? "opacity-40" : ""}`}
            >
              {locked ? (
                <GripVertical size={12} className="text-white/25 flex-shrink-0" />
              ) : (
                <span
                  draggable
                  title="Drag to reorder"
                  onDragStart={(e) => {
                    setDragId(id);
                    e.dataTransfer.setData("text/plain", id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDragId(null)}
                  className="text-white/35 hover:text-white/70 cursor-grab active:cursor-grabbing flex-shrink-0"
                >
                  <GripVertical size={12} />
                </span>
              )}
              <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={locked}
                  onChange={() => onToggle(id)}
                  className="rounded border-white/20 bg-white/10"
                />
                <span className="truncate">{col.label}</span>
                {locked && <span className="text-[9px] uppercase tracking-wide text-white/30">Fixed</span>}
              </label>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-1.5 w-full px-3 pt-2 mt-1 border-t border-white/[0.08] text-[11px] text-white/45 hover:text-white"
      >
        <RotateCcw size={11} />
        Reset columns
      </button>
    </div>
  );
}

function FacetFilter({ def, selected, open, onToggleOpen, onToggleValue, onClear, options = [] }) {
  const count = selected.length;
  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={onToggleOpen}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 ${
          count > 0 || open
            ? "bg-white/[0.12] text-white"
            : "text-white/50 hover:text-white hover:bg-white/[0.06]"
        }`}
      >
        {def.label}
        {count > 0 && (
          <span className="text-[10px] font-mono text-accent-red">{count}</span>
        )}
        <ChevronDown
          size={10}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          data-command-interactive
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-[250px] rounded-xl border border-white/[0.12] bg-[#161618] text-white/90 shadow-xl py-2 fade-in"
        >
          <div className="flex items-center justify-between px-3 pb-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
              {def.label}
            </p>
            {count > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-[10px] text-white/40 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="max-h-[260px] overflow-y-auto">
            {options.map(({ value, count: optionCount }) => {
              const checked = selected.includes(value);
              const color = def.colors?.[value];
              const label = def.format ? def.format(value) : value;
              const person = def.people ? findWorkspaceUser(value) : null;
              return (
                <li key={value}>
                  <label className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-white/75 hover:bg-white/[0.06] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleValue(value)}
                      className="rounded border-white/20 bg-white/10"
                    />
                    {person?.avatar ? (
                      <img
                        src={person.avatar}
                        alt=""
                        className="h-4 w-4 rounded-full object-cover shrink-0"
                      />
                    ) : color ? (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    ) : null}
                    <span className="truncate flex-1" title={person?.role || String(label)}>
                      {label}
                    </span>
                    <span className="text-[10px] font-mono text-white/35">
                      {optionCount}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function AdProductionTable({
  grouped,
  openGroups,
  visibleColumns,
  tableMinWidth,
  selectedTaskId,
  dragId,
  dropId,
  taskDragId,
  taskDrop,
  resizeRef,
  skipRowClickRef,
  taskDragIdRef,
  setDragId,
  setDropId,
  setTaskDragId,
  setTaskDrop,
  toggleGroup,
  toggleColumn,
  handleReorder,
  startResize,
  moveTask,
  dropTaskOnGroup,
  clearTaskDrag,
  draggingTask,
  openTask,
  closeTask,
  updateTask,
  renamingId,
  setRenamingId,
  onAddTask,
}) {
  const rowTdClass = (col, selected) => {
    const pinned = Boolean(col.pinned);
    return [
      "relative h-10 px-2.5 align-middle overflow-hidden whitespace-nowrap",
      cellAlign(col.id),
      pinned ? "sticky left-0 z-10" : "",
      selected ? "bg-[#1a1d28]" : pinned ? "bg-[#0a0b10]" : "",
      selected ? "group-hover/row:bg-[#1e2230]" : "group-hover/row:bg-[#14161e]",
    ].join(" ");
  };

  return (
    <table
      className="text-left table-fixed border-separate border-spacing-0"
      style={{ width: tableMinWidth, minWidth: tableMinWidth }}
    >
      <colgroup>
        {visibleColumns.map((col) => (
          <col key={col.id} style={{ width: col.width }} />
        ))}
      </colgroup>
      <thead>
        <tr className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
          {visibleColumns.map((col) => {
            const pinned = Boolean(col.pinned);
            const isDrop = dropId === col.id && dragId && dragId !== col.id;
            return (
              <th
                key={col.id}
                draggable={!pinned}
                data-command-interactive={!pinned ? "" : undefined}
                title={pinned ? col.label : "Drag to reorder, edge to resize"}
                onDragStart={(e) => {
                  if (pinned || resizeRef.current || draggingTask()) {
                    e.preventDefault();
                    return;
                  }
                  setDragId(col.id);
                  e.dataTransfer.setData("text/plain", col.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (draggingTask() || pinned) return;
                  e.preventDefault();
                  if (dropId !== col.id) setDropId(col.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const payload = e.dataTransfer.getData("text/plain");
                  if (parseTaskDrag(payload) || draggingTask()) {
                    setDragId(null);
                    setDropId(null);
                    return;
                  }
                  handleReorder(payload || dragId, col.id);
                  setDragId(null);
                  setDropId(null);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setDropId(null);
                }}
                className={`group/th relative px-2.5 py-2.5 font-semibold ${
                  pinned ? "sticky left-0 top-0 z-30" : "sticky top-0 z-20 cursor-grab active:cursor-grabbing"
                } ${dragId === col.id ? "opacity-40" : ""} ${
                  isDrop ? "shadow-[inset_2px_0_0_0_rgba(255,255,255,0.55)]" : ""
                }`}
                style={{
                  backgroundColor: HEADER_BG,
                  width: col.width,
                  minWidth: col.width,
                  boxShadow: HAIRLINE,
                }}
              >
                <div className="relative flex h-4 min-w-0 items-center">
                  {!pinned && (
                    <GripVertical
                      size={10}
                      className="pointer-events-none absolute -left-0.5 text-white/0 group-hover/th:text-white/30"
                    />
                  )}
                  <span className="truncate pr-3.5">{col.label}</span>
                  {col.hideable !== false && (
                    <button
                      type="button"
                      title={`Hide ${col.label}`}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColumn(col.id);
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 rounded text-white/0 group-hover/th:text-white/30 hover:!text-white/70"
                    >
                      <EyeOff size={10} />
                    </button>
                  )}
                </div>
                <ColumnResizeHandle onResizeStart={(e) => startResize(col, e)} />
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {grouped.length === 0 && (
          <tr>
            <td
              colSpan={visibleColumns.length}
              className="px-3 py-10 text-[12px] text-white/30"
            >
              No ads match these filters.
            </td>
          </tr>
        )}
        {grouped.map((group) => {
          const open = openGroups[group.id] !== false;
          const color = group.color || "#84848c";
          const droppingOnGroup = Boolean(taskDragId && taskDrop?.groupId === group.id);
          const droppingOnHeader =
            droppingOnGroup && !taskDrop?.beforeId && !taskDrop?.atEnd;
          return (
            <Fragment key={group.id}>
              <tr
                data-command-interactive
                onClick={(e) => {
                  if (e.target.closest("button, a, input, [role='separator']")) return;
                  toggleGroup(group.id, !open);
                }}
                onDragOver={(e) => {
                  if (!draggingTask() || dragId) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setTaskDrop((prev) =>
                    prev?.groupId === group.id && !prev.beforeId && !prev.atEnd
                      ? prev
                      : { groupId: group.id },
                  );
                  if (!open) toggleGroup(group.id, true);
                }}
                onDrop={(e) => {
                  if (dragId) return;
                  e.preventDefault();
                  const id =
                    parseTaskDrag(e.dataTransfer.getData("text/plain")) ||
                    draggingTask();
                  if (id) dropTaskOnGroup(group.id, undefined, id);
                  clearTaskDrag();
                }}
                className={`cursor-pointer select-none ${
                  droppingOnHeader ? "bg-white/[0.06]" : ""
                }`}
              >
                {visibleColumns.map((col, idx) => {
                  const pinned = Boolean(col.pinned);
                  return (
                    <td
                      key={col.id}
                      className={`h-9 px-2.5 align-middle whitespace-nowrap ${
                        pinned ? "sticky left-0 z-[11]" : ""
                      }`}
                      style={{
                        backgroundColor: GROUP_BG,
                        boxShadow: withHairline(
                          idx === 0
                            ? `inset 2px 0 0 ${color}${
                                droppingOnHeader
                                  ? ", inset 0 1px 0 rgba(255,255,255,0.25)"
                                  : ""
                              }`
                            : droppingOnHeader
                              ? "inset 0 1px 0 rgba(255,255,255,0.25)"
                              : undefined,
                        ),
                      }}
                    >
                      {idx === 0 ? (
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGroup(group.id, !open);
                          }}
                          className="flex min-w-0 items-center gap-2 bg-transparent text-left"
                        >
                          <ChevronDown
                            size={13}
                            className={`shrink-0 text-white/35 transition-transform ${
                              open ? "" : "-rotate-90"
                            }`}
                          />
                          <span
                            className="truncate text-[12px] font-semibold leading-none"
                            style={{ color }}
                          >
                            {group.title}
                          </span>
                          <span className="shrink-0 text-[10px] font-mono text-white/30">
                            {group.rows.length}
                          </span>
                        </button>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
              {open && group.rows.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="px-3 py-3 text-[12px] text-white/25"
                    style={{ backgroundColor: STICKY_BG, boxShadow: HAIRLINE }}
                  >
                    No ads in this phase.
                  </td>
                </tr>
              )}
              {open &&
                group.rows.map((item) => {
                  const selected = selectedTaskId === item.id;
                  const dropBefore =
                    taskDragId &&
                    taskDragId !== item.id &&
                    taskDrop?.groupId === group.id &&
                    taskDrop.beforeId === item.id;
                  return (
                    <tr
                      key={item.id}
                      data-task-row={item.id}
                      data-command-interactive
                      draggable
                      aria-selected={selected}
                      onDragStart={(e) => {
                        if (e.target.closest("a, button, input, [role='separator']")) {
                          e.preventDefault();
                          return;
                        }
                        skipRowClickRef.current = true;
                        taskDragIdRef.current = item.id;
                        setTaskDragId(item.id);
                        e.dataTransfer.setData("text/plain", `task:${item.id}`);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        const dragging = draggingTask();
                        if (!dragging || dragging === item.id || dragId) return;
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "move";
                        setTaskDrop((prev) =>
                          prev?.groupId === group.id && prev.beforeId === item.id
                            ? prev
                            : { groupId: group.id, beforeId: item.id },
                        );
                      }}
                      onDrop={(e) => {
                        if (dragId) return;
                        e.preventDefault();
                        e.stopPropagation();
                        const id =
                          parseTaskDrag(e.dataTransfer.getData("text/plain")) ||
                          draggingTask();
                        if (id && id !== item.id) moveTask(id, group.id, item.id);
                        clearTaskDrag();
                      }}
                      onDragEnd={() => {
                        clearTaskDrag();
                        window.setTimeout(() => {
                          skipRowClickRef.current = false;
                        }, 0);
                      }}
                      onClick={(e) => {
                        if (e.target.closest("a, button, input, [role='separator']")) return;
                        if (skipRowClickRef.current) return;
                        if (selected) closeTask();
                        else openTask(item.id);
                      }}
                      className={`group/row cursor-grab active:cursor-grabbing ${
                        selected ? "relative z-[1]" : ""
                      } ${taskDragId === item.id ? "opacity-40" : ""}`}
                      title="Drag to another section"
                    >
                      {visibleColumns.map((col) => (
                        <td
                          key={col.id}
                          className={rowTdClass(col, selected)}
                          style={{
                            width: col.width,
                            minWidth: col.width,
                            boxShadow: withHairline(
                              dropBefore ? "inset 0 2px 0 0 rgba(255,255,255,0.7)" : undefined,
                            ),
                          }}
                        >
                          {col.id === "item" ? (
                            <ItemNameCell
                              item={item}
                              renaming={renamingId === item.id}
                              onStartRename={setRenamingId}
                              onCommitRename={(id, name) => updateTask(id, { name })}
                            />
                          ) : (
                            <EditableBoardCell
                              columnId={col.id}
                              item={item}
                              onPatch={updateTask}
                              centered={CENTERED_COLS.has(col.id)}
                            >
                              {renderCell(col.id, item)}
                            </EditableBoardCell>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              {open && (
                <tr
                  data-command-interactive
                  onDragOver={(e) => {
                    if (!draggingTask() || dragId) return;
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = "move";
                    setTaskDrop((prev) =>
                      prev?.groupId === group.id && prev.atEnd
                        ? prev
                        : { groupId: group.id, atEnd: true },
                    );
                  }}
                  onDrop={(e) => {
                    if (dragId) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const id =
                      parseTaskDrag(e.dataTransfer.getData("text/plain")) ||
                      draggingTask();
                    if (id) moveTask(id, group.id, null);
                    clearTaskDrag();
                  }}
                >
                  <td
                    className="sticky left-0 z-10 h-9 px-2.5 align-middle whitespace-nowrap"
                    style={{
                      backgroundColor: STICKY_BG,
                      boxShadow: withHairline(
                        taskDragId && taskDrop?.groupId === group.id && taskDrop.atEnd
                          ? "inset 0 2px 0 0 rgba(255,255,255,0.7)"
                          : undefined,
                      ),
                    }}
                  >
                    <button
                      type="button"
                      data-command-interactive
                      aria-label={`Add new item to ${group.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTask(group.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[11px] font-medium text-white/25 hover:text-white/70 transition-colors"
                    >
                      <Plus size={11} />
                      Add new
                    </button>
                  </td>
                  {visibleColumns.length > 1 && (
                    <td
                      colSpan={visibleColumns.length - 1}
                      className="h-9 cursor-pointer"
                      onClick={() => onAddTask(group.id)}
                      style={{
                        boxShadow: withHairline(
                          taskDragId && taskDrop?.groupId === group.id && taskDrop.atEnd
                            ? "inset 0 2px 0 0 rgba(255,255,255,0.7)"
                            : undefined,
                        ),
                      }}
                    />
                  )}
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function kanbanStatusColor(item, board) {
  return (
    board?.statusColors?.[item.status] ||
    AD_STATUS_COLORS[item.status] ||
    WD_STATUS_COLORS[item.status]
  );
}

function KanbanTaskCard({
  item,
  groupId,
  board,
  selected,
  dragging,
  dropBefore,
  skipRowClickRef,
  taskDragIdRef,
  setTaskDragId,
  setTaskDrop,
  moveTask,
  clearTaskDrag,
  draggingTask,
  openTask,
  closeTask,
}) {
  const overdue = isOverdue(item);
  const subtitle = item.type || item.angle;
  const subtitleColor =
    WD_TYPE_COLORS[item.type] ||
    AD_PRODUCT_COLORS[item.product] ||
    AD_ANGLE_COLORS[item.angle];

  return (
    <div
      data-task-row={item.id}
      data-command-interactive
      draggable
      aria-selected={selected}
      onDragStart={(e) => {
        if (e.target.closest("a, button, input, [role='separator']")) {
          e.preventDefault();
          return;
        }
        skipRowClickRef.current = true;
        taskDragIdRef.current = item.id;
        setTaskDragId(item.id);
        e.dataTransfer.setData("text/plain", `task:${item.id}`);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        const draggingId = draggingTask();
        if (!draggingId || draggingId === item.id) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        setTaskDrop((prev) =>
          prev?.groupId === groupId && prev.beforeId === item.id
            ? prev
            : { groupId, beforeId: item.id },
        );
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = parseTaskDrag(e.dataTransfer.getData("text/plain")) || draggingTask();
        if (id && id !== item.id) moveTask(id, groupId, item.id);
        clearTaskDrag();
      }}
      onDragEnd={() => {
        clearTaskDrag();
        window.setTimeout(() => {
          skipRowClickRef.current = false;
        }, 0);
      }}
      onClick={(e) => {
        if (e.target.closest("a, button, input, [role='separator']")) return;
        if (skipRowClickRef.current) return;
        if (selected) closeTask();
        else openTask(item.id);
      }}
      title="Drag to another column"
      className={`cursor-grab rounded-xl border p-2.5 text-left transition-colors active:cursor-grabbing ${
        selected
          ? "border-[#E8C4A0]/45 bg-white/[0.08]"
          : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.16] hover:bg-white/[0.05]"
      } ${dragging ? "opacity-40" : ""} ${
        dropBefore ? "shadow-[inset_0_2px_0_0_rgba(255,255,255,0.7)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-[12px] font-semibold leading-tight text-white">
          {item.name}
        </p>
        {item.priority ? (
          <StatusPill label={item.priority} color={AD_PRIORITY_COLORS[item.priority]} />
        ) : null}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <StatusPill label={item.status} color={kanbanStatusColor(item, board)} />
      </div>
      <div className="mt-2 flex items-center gap-2 min-w-0">
        {item.product ? <ProductCell name={item.product} /> : null}
        {subtitle ? (
          <span
            className="truncate text-[11px] leading-none text-white/45"
            style={subtitleColor ? { color: withAlpha(subtitleColor, 0.9) } : undefined}
            title={subtitle}
          >
            {subtitle}
          </span>
        ) : null}
        {item.platform ? <div className="ml-auto shrink-0"><PlatformCell value={item.platform} /></div> : null}
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <PersonCell names={item.editors} />
        <DateCell iso={item.dueDate} overdue={overdue} />
      </div>
    </div>
  );
}

function AdProductionKanban({
  grouped,
  board,
  selectedTaskId,
  taskDragId,
  taskDrop,
  skipRowClickRef,
  taskDragIdRef,
  setTaskDragId,
  setTaskDrop,
  dropTaskOnGroup,
  clearTaskDrag,
  draggingTask,
  moveTask,
  openTask,
  closeTask,
  onAddTask,
}) {
  const noun = board.nounPlural?.toLowerCase() || "items";

  return (
    <div className="flex h-full min-h-0 gap-3 overflow-x-auto overflow-y-hidden p-3">
      {grouped.map((group) => {
        const color = group.color || "#74747e";
        const dropping =
          Boolean(taskDragId) &&
          taskDrop?.groupId === group.id &&
          (taskDrop.atEnd || !taskDrop.beforeId);
        return (
          <section
            key={group.id}
            className="flex w-[272px] shrink-0 flex-col min-h-0 max-h-full rounded-xl border border-white/[0.08] bg-[#101114]"
            onDragOver={(e) => {
              if (!draggingTask()) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (e.target.closest("[data-task-row]")) return;
              setTaskDrop((prev) =>
                prev?.groupId === group.id && prev.atEnd
                  ? prev
                  : { groupId: group.id, atEnd: true },
              );
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = parseTaskDrag(e.dataTransfer.getData("text/plain")) || draggingTask();
              if (id) dropTaskOnGroup(group.id, null, id);
              clearTaskDrag();
            }}
          >
            <header
              className="flex shrink-0 items-center gap-2 px-3 py-2.5"
              style={{
                backgroundColor: withAlpha(color, 0.12),
                boxShadow: `inset 3px 0 0 ${color}`,
              }}
            >
              <span
                className="truncate text-[12px] font-semibold leading-none"
                style={{ color }}
              >
                {group.title}
              </span>
              <span className="shrink-0 text-[10px] font-mono text-white/30">
                {group.rows.length}
              </span>
            </header>
            <div
              className={`flex-1 min-h-0 space-y-2 overflow-y-auto overscroll-contain px-2 py-2 ${
                dropping ? "bg-white/[0.04]" : ""
              }`}
            >
              {group.rows.length === 0 && (
                <p className="px-1 py-6 text-center text-[11px] text-white/20">
                  No {noun} in this phase.
                </p>
              )}
              {group.rows.map((item) => (
                <KanbanTaskCard
                  key={item.id}
                  item={item}
                  groupId={group.id}
                  board={board}
                  selected={selectedTaskId === item.id}
                  dragging={taskDragId === item.id}
                  dropBefore={
                    Boolean(taskDragId) &&
                    taskDragId !== item.id &&
                    taskDrop?.groupId === group.id &&
                    taskDrop.beforeId === item.id
                  }
                  skipRowClickRef={skipRowClickRef}
                  taskDragIdRef={taskDragIdRef}
                  setTaskDragId={setTaskDragId}
                  setTaskDrop={setTaskDrop}
                  moveTask={moveTask}
                  clearTaskDrag={clearTaskDrag}
                  draggingTask={draggingTask}
                  openTask={openTask}
                  closeTask={closeTask}
                />
              ))}
            </div>
            <div className="shrink-0 border-t border-white/[0.06] px-2 py-1.5">
              <button
                type="button"
                data-command-interactive
                aria-label={`Add new item to ${group.title}`}
                onClick={() => onAddTask(group.id)}
                className="inline-flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-medium text-white/25 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
              >
                <Plus size={11} />
                Add new
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function CommandCenter() {
  const {
    selectedTaskId,
    openTask,
    closeTask,
    activeBoardItems,
    boardItems,
    moveTask,
    updateTask,
    addTask,
    activeBoardId,
    setActiveBoardId,
  } = useCommandCenter();
  const board = getCommandBoard(activeBoardId);
  const tableItems = activeBoardItems || boardItems;
  const facetDefs = useMemo(() => facetDefsFor(board), [board]);
  const facetOptions = useMemo(() => facetOptionsFor(board), [board]);
  const columnsById = useMemo(() => columnMeta(board).byId, [board]);
  const columnDefaults = useMemo(() => columnMeta(board), [board]);
  const [query, setQuery] = useState("");
  const [boardView, setBoardView] = useState(() => loadBoardView(board.id));
  const [openGroups, setOpenGroups] = useState(() => loadInitialOpenGroups(board));
  const [{ order, hidden, widths }, setColumnState] = useState(() => loadColumnState(board));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersSettled, setFiltersSettled] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dropId, setDropId] = useState(null);
  const [taskDragId, setTaskDragId] = useState(null);
  const [taskDrop, setTaskDrop] = useState(null);
  const resizeRef = useRef(null);
  const skipRowClickRef = useRef(false);
  const taskDragIdRef = useRef(null);
  const [facets, setFacets] = useState({});
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [openFacet, setOpenFacet] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [pinnedIds, setPinnedIds] = useState([]);
  const pickerRef = useRef(null);
  const filterRailRef = useRef(null);
  const skipBoardReset = useRef(true);
  const persistedBoardId = useRef(board.id);

  useEffect(() => {
    if (skipBoardReset.current) {
      skipBoardReset.current = false;
      return;
    }
    setOpenGroups(loadInitialOpenGroups(board));
    setColumnState(loadColumnState(board));
    setBoardView(loadBoardView(board.id));
    setFacets({});
    setOverdueOnly(false);
    setOpenFacet(null);
    setQuery("");
    setFiltersOpen(false);
    setPickerOpen(false);
    setRenamingId(null);
  }, [board.id]);

  useEffect(() => {
    if (persistedBoardId.current !== board.id) {
      persistedBoardId.current = board.id;
      return;
    }
    try {
      localStorage.setItem(columnStorageKey(board), JSON.stringify({ order, hidden, widths }));
    } catch {
      /* ignore quota / private mode */
    }
  }, [board, order, hidden, widths]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onPointer = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  useEffect(() => {
    if (!filtersOpen) {
      setFiltersSettled(false);
      setOpenFacet(null);
      return;
    }
    const t = window.setTimeout(() => setFiltersSettled(true), 300);
    return () => window.clearTimeout(t);
  }, [filtersOpen]);

  useEffect(() => {
    if (!openFacet) return;
    const onPointer = (e) => {
      if (filterRailRef.current && !filterRailRef.current.contains(e.target)) {
        setOpenFacet(null);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpenFacet(null);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openFacet]);

  useEffect(() => {
    if (!selectedTaskId) return;
    const item = tableItems.find((row) => row.id === selectedTaskId);
    if (!item) return;
    setOpenGroups((prev) => {
      if (prev[item.phase]) return prev;
      return { ...prev, [item.phase]: true };
    });
    const t = window.setTimeout(() => {
      document
        .querySelector(`[data-task-row="${selectedTaskId}"]`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 60);
    return () => window.clearTimeout(t);
  }, [selectedTaskId, tableItems]);

  useEffect(() => {
    if (!renamingId) return;
    const t = window.setTimeout(() => {
      document
        .querySelector(`[data-task-row="${renamingId}"]`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 60);
    return () => window.clearTimeout(t);
  }, [renamingId]);

  const hasActiveFilters =
    overdueOnly || Object.values(facets).some((values) => values?.length > 0);
  const activeFilterCount =
    (overdueOnly ? 1 : 0) +
    Object.values(facets).reduce((n, values) => n + (values?.length || 0), 0);

  const toolbarChip = (active) =>
    `flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 ${
      active
        ? "bg-white/[0.12] text-white"
        : "text-white/50 hover:text-white hover:bg-white/[0.06]"
    }`;

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tableItems.filter((item) => {
      if (pinnedIds.includes(item.id)) return true;
      if (
        q &&
        ![
          item.name,
          item.status,
          item.product,
          item.type,
          item.editors?.join(" "),
          item.creativeStrategists?.join(" "),
          item.angle,
          item.editingStyle,
          item.platform,
          item.painPoint,
          item.adCopy,
          item.summary,
          item.link,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      ) {
        return false;
      }
      if (overdueOnly && !isOverdue(item)) return false;
      for (const def of facetDefs) {
        const selected = facets[def.id];
        if (!selected?.length) continue;
        const values = def.values(item).filter(Boolean);
        if (!selected.some((s) => values.includes(s))) return false;
      }
      return true;
    });
  }, [tableItems, query, facets, overdueOnly, pinnedIds, facetDefs]);

  const grouped = useMemo(
    () =>
      board.phases.map((phase) => ({
        ...phase,
        rows: items.filter((item) => item.phase === phase.id),
      })).filter((g) => g.rows.length > 0 || (!query.trim() && !hasActiveFilters)),
    [items, query, hasActiveFilters, board.phases],
  );

  const kanbanGrouped = useMemo(
    () =>
      board.phases.map((phase) => ({
        ...phase,
        rows: items.filter((item) => item.phase === phase.id),
      })),
    [items, board.phases],
  );

  const boardStats = useMemo(() => {
    const total = items.length;
    const complete = items.filter((i) => CLOSED_STATUSES.has(i.status)).length;
    const overdue = items.filter(isOverdue).length;
    const pct = total ? Math.round((complete / total) * 100) : 0;
    return {
      total,
      complete,
      overdue,
      pct,
      statusSegments: columnSegments(items, "status"),
    };
  }, [items]);

  const toggleFacetValue = (facetId, value) => {
    setFacets((prev) => {
      const current = prev[facetId] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [facetId]: next };
    });
  };

  const clearAllFilters = () => {
    setFacets({});
    setOverdueOnly(false);
    setOpenFacet(null);
  };

  const visibleColumns = useMemo(
    () =>
      order
        .map((id) => columnsById[id])
        .filter((col) => col && !hidden.includes(col.id))
        .map((col) => ({ ...col, width: widths?.[col.id] ?? col.width })),
    [order, hidden, widths, columnsById],
  );

  const tableMinWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
  const hiddenCount = hidden.length;

  const setOrder = (next) => setColumnState((prev) => ({ ...prev, order: next }));
  const setHidden = (next) => setColumnState((prev) => ({ ...prev, hidden: next }));
  const setColWidth = (id, next) => {
    setColumnState((prev) => ({
      ...prev,
      widths: { ...prev.widths, [id]: clampColWidth(columnsById[id], next) },
    }));
  };

  const startResize = (col, event) => {
    event.preventDefault();
    event.stopPropagation();
    resizeRef.current = { id: col.id, startX: event.clientX, startW: col.width };
    const onMove = (e) => {
      const r = resizeRef.current;
      if (!r) return;
      setColWidth(r.id, r.startW + e.clientX - r.startX);
    };
    const onUp = () => {
      resizeRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const toggleColumn = (id) => {
    if (columnsById[id]?.hideable === false) return;
    setHidden(hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id]);
  };

  const handleReorder = (fromId, toId) => {
    setOrder(moveColumn(order, fromId, toId));
  };

  const dropTaskOnGroup = (groupId, beforeId, explicitId) => {
    const id = explicitId || taskDragIdRef.current || taskDragId;
    if (!id) return;
    moveTask(id, groupId, beforeId);
    setOpenGroups((prev) => (prev[groupId] ? prev : { ...prev, [groupId]: true }));
  };

  const clearTaskDrag = () => {
    taskDragIdRef.current = null;
    setTaskDragId(null);
    setTaskDrop(null);
  };

  const draggingTask = () => taskDragIdRef.current || taskDragId;

  const toggleGroup = (groupId, willOpen) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: willOpen }));
    if (willOpen) {
      try {
        localStorage.setItem(openGroupStorageKey(board), groupId);
      } catch {
        /* ignore private mode */
      }
    }
  };

  const handleAddTask = (phaseId) => {
    const created = addTask(phaseId);
    if (!created) return;
    setPinnedIds((prev) => (prev.includes(created.id) ? prev : [...prev, created.id]));
    setOpenGroups((prev) => (prev[phaseId] ? prev : { ...prev, [phaseId]: true }));
    openTask(created.id);
    try {
      localStorage.setItem(openGroupStorageKey(board), phaseId);
    } catch {
      /* ignore private mode */
    }
  };

  const addPhaseId = phaseForNewTask(openGroups, board);
  const addPhase = board.phases.find((p) => p.id === addPhaseId);
  const newNoun = board.noun || "ad";
  const ViewIcon = boardView === "kanban" ? LayoutGrid : Table2;

  const selectBoardView = (view) => {
    if (view !== "table" && view !== "kanban") return;
    setBoardView(view);
    persistBoardView(board.id, view);
    if (view === "kanban") setPickerOpen(false);
  };

  return (
    <div className="h-full flex flex-col min-h-0 min-w-0 overflow-hidden">
      <div
        className="h-full pr-3 pb-[72px] fade-in flex flex-col min-h-0 min-w-0 overflow-hidden"
        style={{ paddingTop: APP_CONTENT_INSET }}
      >
        <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
            <div ref={filterRailRef} className="mb-2.5 flex-shrink-0">
              <div
                data-command-interactive
                className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 h-[52px] px-3 rounded-2xl border border-[#E8C4A0]/20 bg-[#161618]/78 text-white/90 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ViewIcon size={13} className="text-[#E8C4A0] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8C4A0]">
                      Command Center
                    </p>
                    <div
                      role="tablist"
                      aria-label="Boards"
                      className="mt-0.5 flex items-center gap-0.5 min-w-0"
                    >
                      {COMMAND_BOARDS.map((tab) => {
                        const selected = tab.id === board.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            title={tab.label}
                            onClick={() => setActiveBoardId(tab.id)}
                            className={`truncate max-w-[160px] px-1.5 py-0.5 rounded-md text-[13px] font-semibold leading-tight transition-colors ${
                              selected
                                ? "text-white bg-white/[0.08]"
                                : "text-white/40 hover:text-white/75"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="leading-tight">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">{board.nounPlural}</p>
                      <p className="text-[13px] font-bold font-mono text-white tabular-nums">{boardStats.total}</p>
                    </div>
                    <div className="leading-tight">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">Complete</p>
                      <p className="text-[13px] font-bold font-mono text-emerald-400 tabular-nums">
                        {boardStats.complete}
                        <span className="text-[10px] font-semibold text-white/40 ml-1">{boardStats.pct}%</span>
                      </p>
                    </div>
                    <div className="leading-tight">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">Overdue</p>
                      <p className={`text-[13px] font-bold font-mono tabular-nums ${boardStats.overdue ? "text-rose-400" : "text-white"}`}>
                        {boardStats.overdue}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block w-[160px] xl:w-[220px]">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-white/40">Status mix</p>
                    <ColumnRollupBar segments={boardStats.statusSegments} className="h-2 mt-1" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 min-w-0">
                  <div
                    role="tablist"
                    aria-label="Board view"
                    className="flex items-center rounded-full bg-white/[0.04] p-0.5"
                  >
                    {BOARD_VIEWS.map((view) => {
                      const Icon = view.icon;
                      const selected = boardView === view.id;
                      return (
                        <button
                          key={view.id}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          title={`${view.label} view`}
                          onClick={() => selectBoardView(view.id)}
                          className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold whitespace-nowrap transition-all duration-200 ${
                            selected
                              ? "bg-white/[0.12] text-white"
                              : "text-white/40 hover:text-white hover:bg-white/[0.06]"
                          }`}
                        >
                          <Icon size={11} />
                          <span className="hidden xl:inline">{view.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    title={addPhase ? `Add ${newNoun} to ${addPhase.title}` : `Add ${newNoun}`}
                    onClick={() => {
                      setPickerOpen(false);
                      handleAddTask(addPhaseId);
                    }}
                    className={toolbarChip(false)}
                  >
                    <Plus size={12} />
                    New {newNoun}
                  </button>
                  <button
                    type="button"
                    aria-expanded={filtersOpen}
                    onClick={() => {
                      setPickerOpen(false);
                      setFiltersOpen((open) => !open);
                    }}
                    className={toolbarChip(filtersOpen || hasActiveFilters)}
                  >
                    <SlidersHorizontal size={12} />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="text-[10px] font-mono text-accent-red">{activeFilterCount}</span>
                    )}
                    <ChevronDown
                      size={11}
                      className={`transition-transform duration-300 ${filtersOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {boardView === "table" && (
                  <div className="relative" ref={pickerRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setFiltersOpen(false);
                        setPickerOpen((v) => !v);
                      }}
                      className={toolbarChip(pickerOpen || hiddenCount > 0)}
                    >
                      <Columns3 size={11} />
                      Columns
                      {hiddenCount > 0 && (
                        <span className="text-[10px] font-mono text-accent-red">{hiddenCount}</span>
                      )}
                    </button>
                    {pickerOpen && (
                      <ColumnPicker
                        order={order}
                        hidden={hidden}
                        columnsById={columnsById}
                        onToggle={toggleColumn}
                        onReorder={handleReorder}
                        onReset={() => {
                          setColumnState({
                            order: columnDefaults.order,
                            hidden: columnDefaults.hidden,
                            widths: columnDefaults.widths,
                          });
                        }}
                      />
                    )}
                  </div>
                  )}
                </div>
              </div>

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div
                  className={filtersSettled ? "min-h-0 overflow-visible" : "min-h-0 overflow-hidden"}
                  inert={!filtersOpen ? true : undefined}
                  aria-hidden={!filtersOpen}
                >
                  <div
                    data-command-interactive
                    className="flex flex-wrap items-center gap-0.5 mt-2 px-2 py-1.5 rounded-2xl border border-[#E8C4A0]/20 bg-[#161618]/78 text-white/90 shadow-2xl backdrop-blur-xl"
                  >
                    {facetDefs.map((def) => (
                      <FacetFilter
                        key={def.id}
                        def={def}
                        options={facetOptions[def.id] || []}
                        selected={facets[def.id] || []}
                        open={openFacet === def.id}
                        onToggleOpen={() =>
                          setOpenFacet((prev) => (prev === def.id ? null : def.id))
                        }
                        onToggleValue={(value) => toggleFacetValue(def.id, value)}
                        onClear={() => setFacets((prev) => ({ ...prev, [def.id]: [] }))}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setOverdueOnly((v) => !v)}
                      className={toolbarChip(overdueOnly)}
                    >
                      Overdue
                    </button>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-semibold text-white/45 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                      >
                        <X size={11} />
                        Clear all
                      </button>
                    )}
                    <div className="relative flex-shrink-0 ml-auto">
                      <Search
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                      />
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Filter ${board.nounPlural.toLowerCase()}…`}
                        className="w-[160px] xl:w-[200px] h-8 py-1.5 pl-7 pr-3 bg-transparent text-[12px] text-white placeholder:text-white/30 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`flex-1 min-h-0 min-w-0 overscroll-contain rounded-2xl border border-white/[0.14] bg-[#0a0b10] ${
                boardView === "kanban" ? "overflow-hidden" : "overflow-auto"
              }`}
              data-command-canvas-scroll
            >
              {boardView === "kanban" ? (
                <AdProductionKanban
                  grouped={kanbanGrouped}
                  board={board}
                  selectedTaskId={selectedTaskId}
                  taskDragId={taskDragId}
                  taskDrop={taskDrop}
                  skipRowClickRef={skipRowClickRef}
                  taskDragIdRef={taskDragIdRef}
                  setTaskDragId={setTaskDragId}
                  setTaskDrop={setTaskDrop}
                  dropTaskOnGroup={dropTaskOnGroup}
                  clearTaskDrag={clearTaskDrag}
                  draggingTask={draggingTask}
                  moveTask={moveTask}
                  openTask={openTask}
                  closeTask={closeTask}
                  onAddTask={handleAddTask}
                />
              ) : (
              <AdProductionTable
                grouped={grouped}
                openGroups={openGroups}
                visibleColumns={visibleColumns}
                tableMinWidth={tableMinWidth}
                selectedTaskId={selectedTaskId}
                dragId={dragId}
                dropId={dropId}
                taskDragId={taskDragId}
                taskDrop={taskDrop}
                resizeRef={resizeRef}
                skipRowClickRef={skipRowClickRef}
                taskDragIdRef={taskDragIdRef}
                setDragId={setDragId}
                setDropId={setDropId}
                setTaskDragId={setTaskDragId}
                setTaskDrop={setTaskDrop}
                toggleGroup={toggleGroup}
                toggleColumn={toggleColumn}
                handleReorder={handleReorder}
                startResize={startResize}
                moveTask={moveTask}
                dropTaskOnGroup={dropTaskOnGroup}
                clearTaskDrag={clearTaskDrag}
                draggingTask={draggingTask}
                openTask={openTask}
                closeTask={closeTask}
                updateTask={updateTask}
                renamingId={renamingId}
                setRenamingId={setRenamingId}
                onAddTask={handleAddTask}
              />
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
