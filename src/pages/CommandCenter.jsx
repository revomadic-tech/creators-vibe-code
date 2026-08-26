import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Columns3,
  EyeOff,
  GripVertical,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Table2,
  X,
} from "lucide-react";
import StaffPanel from "../components/shared/StaffPanel";
import { useCommandCenter } from "../contexts/CommandCenterContext";
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
  adProductionSeed,
  parseTaskDrag,
} from "../data/adProduction";
import { currentUser, findWorkspaceUser, revoProducts, teamMembers } from "../data/mockData";

// v2: full column set (all visible by default) — invalidates saved v1 state
// where half the board was hidden.
const COLUMN_STORAGE_KEY = "revo.commandCenter.boardColumns.v4";
const OPEN_GROUP_STORAGE_KEY = "revo.commandCenter.lastOpenGroup.v1";
const FOOTER_METRIC_KEY = "revo.commandCenter.footerMetric.v1";

const FOOTER_METRICS = [
  { id: "mix", label: "Mix", hint: "Color bar by tag" },
  { id: "percent", label: "Percentage", hint: "Share of each tag" },
  { id: "count", label: "Total", hint: "Count of each tag" },
  { id: "complete", label: "Complete", hint: "Done or filled rate" },
];

/**
 * Groups default to collapsed; only the section the user last expanded
 * (persisted) starts open. Falls back to the first phase on first visit.
 */
function loadInitialOpenGroups() {
  let lastOpen = null;
  try {
    lastOpen = localStorage.getItem(OPEN_GROUP_STORAGE_KEY);
  } catch {
    /* ignore private mode */
  }
  const openId = AD_PHASES.some((p) => p.id === lastOpen)
    ? lastOpen
    : AD_PHASES[0].id;
  return Object.fromEntries(AD_PHASES.map((p) => [p.id, p.id === openId]));
}
const COLUMN_BY_ID = Object.fromEntries(AD_BOARD_COLUMNS.map((col) => [col.id, col]));

// Categorical columns get a Monday-style segmented rollup on the group header.
const ROLLUP_GETTERS = {
  status: (i) => [i.status],
  product: (i) => [i.product],
  priority: (i) => [i.priority],
  editor: (i) => i.editors || [],
  angle: (i) => [i.angle],
  style: (i) => [i.editingStyle],
  platform: (i) => [i.platform],
  painPoint: (i) => [i.painPoint],
  strategist: (i) => i.creativeStrategists || [],
  performance: (i) => [i.performance],
};

const USER_ROLLUP_COLORS = Object.fromEntries(
  teamMembers.filter((m) => m.color).map((m) => [m.name, m.color]),
);

const ROLLUP_COLORS = {
  status: AD_STATUS_COLORS,
  product: AD_PRODUCT_COLORS,
  priority: AD_PRIORITY_COLORS,
  editor: USER_ROLLUP_COLORS,
  angle: AD_ANGLE_COLORS,
  style: AD_EDITING_STYLE_COLORS,
  platform: AD_PLATFORM_COLORS,
  painPoint: AD_PAIN_POINT_COLORS,
  strategist: USER_ROLLUP_COLORS,
  performance: AD_PERFORMANCE_COLORS,
};
const DEFAULT_ORDER = AD_BOARD_COLUMNS.map((col) => col.id);
const DEFAULT_HIDDEN = AD_BOARD_COLUMNS.filter((col) => col.defaultHidden).map(
  (col) => col.id,
);
const DEFAULT_WIDTHS = Object.fromEntries(AD_BOARD_COLUMNS.map((col) => [col.id, col.width]));
const COL_MAX_WIDTH = 480;

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixOnDark(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  const blend = (c) => Math.round(c * alpha + 16 * (1 - alpha));
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
}

function contrastText(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
    ? "rgba(12, 12, 16, 0.9)"
    : "rgba(255, 255, 255, 0.95)";
}

const TAG_FIELDS = {
  status: (i) => [i.status, AD_STATUS_COLORS[i.status]],
  product: (i) => [i.product, AD_PRODUCT_COLORS[i.product]],
  priority: (i) => [i.priority, AD_PRIORITY_COLORS[i.priority]],
  angle: (i) => [i.angle, AD_ANGLE_COLORS[i.angle]],
  style: (i) => [i.editingStyle, AD_EDITING_STYLE_COLORS[i.editingStyle]],
  platform: (i) => [i.platform, AD_PLATFORM_COLORS[i.platform]],
  painPoint: (i) => [i.painPoint, AD_PAIN_POINT_COLORS[i.painPoint]],
  performance: (i) => [i.performance, AD_PERFORMANCE_COLORS[i.performance]],
};

function cellTagColor(columnId, item) {
  // Product and platform use custom cells (thumb / logos), not a fill block.
  if (columnId === "product" || columnId === "platform") return null;
  const get = TAG_FIELDS[columnId];
  if (!get) return null;
  const [label, color] = get(item);
  if (!label) return null;
  return color || hashHueColor(label);
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

function ColumnRollupBar({ segments, compact = false, valueMode = null }) {
  if (segments == null) return compact ? null : <div className="h-2 mt-1.5" />;
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const showValues = valueMode === "percent" || valueMode === "count";
  if (total === 0) {
    return (
      <div
        className={`${showValues ? "h-5" : "h-2"} rounded-sm bg-white/[0.08] ${compact ? "" : "mt-1.5"}`}
      />
    );
  }
  const tip = segments
    .map((s) => `${s.label} · ${s.count} (${Math.round((s.count / total) * 100)}%)`)
    .join("  ·  ");
  return (
    <div
      className={`${showValues ? "h-5" : "h-2"} rounded-sm overflow-hidden flex w-full gap-px bg-black/40 ${
        compact ? "" : "mt-1.5"
      }`}
      title={tip}
    >
      {segments.map((s) => {
        const value =
          valueMode === "percent"
            ? `${Math.round((s.count / total) * 100)}%`
            : valueMode === "count"
              ? String(s.count)
              : null;
        return (
          <span
            key={s.label}
            className="flex h-full min-w-[2px] items-center justify-center overflow-hidden text-[8px] font-bold tabular-nums leading-none"
            style={{
              flex: `${s.count} 0 0`,
              backgroundColor: s.color,
              color: value ? contrastText(s.color) : undefined,
            }}
            title={`${s.label}: ${s.count} (${Math.round((s.count / total) * 100)}%)`}
          >
            {value}
          </span>
        );
      })}
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

function firstName(name) {
  return (name || "").split(" ")[0] || name;
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
  "done",
  "cancelled",
]);

function isOverdue(item) {
  if (!item.dueDate || CLOSED_STATUSES.has(item.status)) return false;
  const due = new Date(`${item.dueDate}T23:59:59`);
  return !Number.isNaN(due.getTime()) && due < new Date();
}

function columnKind(columnId) {
  if (columnId === "item") return "item";
  if (columnId === "due" || columnId === "sendDate") return "date";
  if (columnId === "summary" || columnId === "adCopy") return "text";
  if (ROLLUP_GETTERS[columnId]) return "tag";
  return "text";
}

function rowHasValue(row, columnId) {
  switch (columnId) {
    case "item":
      return true;
    case "editor":
      return (row.editors || []).length > 0;
    case "strategist":
      return (row.creativeStrategists || []).length > 0;
    case "due":
      return Boolean(row.dueDate);
    case "sendDate":
      return Boolean(row.sendDate);
    case "style":
      return Boolean(row.editingStyle);
    case "summary":
      return Boolean(row.summary);
    case "adCopy":
      return Boolean(row.adCopy);
    default:
      return Boolean(row[columnId]);
  }
}

function rowIsComplete(row, columnId) {
  if (columnId === "status") return CLOSED_STATUSES.has(row.status);
  if (columnId === "due") {
    if (CLOSED_STATUSES.has(row.status)) return true;
    if (!row.dueDate) return false;
    return !isOverdue(row);
  }
  return rowHasValue(row, columnId);
}

function dateExtent(rows, field) {
  const dates = rows.map((r) => r[field]).filter(Boolean).sort();
  if (!dates.length) return null;
  return { min: dates[0], max: dates[dates.length - 1] };
}

function loadFooterMetric() {
  try {
    const v = localStorage.getItem(FOOTER_METRIC_KEY);
    if (FOOTER_METRICS.some((m) => m.id === v)) return v;
  } catch {
    /* ignore private mode */
  }
  return "mix";
}

function CompleteMeter({ pct, color, title }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0" title={title}>
      <div className="flex-1 h-1.5 rounded-sm bg-black/40 overflow-hidden min-w-0">
        <div
          className="h-full rounded-sm"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color || "#00c875" }}
        />
      </div>
      <span className="shrink-0 text-[10px] font-mono tabular-nums text-white/70">{pct}%</span>
    </div>
  );
}

function FillBar({ filled, total, color }) {
  const empty = Math.max(0, total - filled);
  return (
    <ColumnRollupBar
      compact
      segments={[
        { label: "Set", count: filled, color: color || "#579bfc" },
        { label: "Empty", count: empty, color: "rgba(255,255,255,0.14)" },
      ].filter((s) => s.count > 0)}
    />
  );
}

function FooterMetricCell({ columnId, rows, metric, color }) {
  const kind = columnKind(columnId);
  const total = rows.length;
  if (total === 0) return <span className="block h-2" />;

  if (kind === "tag") {
    const segments = columnSegments(rows, columnId);
    if (metric === "complete") {
      const done = rows.filter((r) => rowIsComplete(r, columnId)).length;
      const pct = Math.round((done / total) * 100);
      return (
        <CompleteMeter
          pct={pct}
          color={columnId === "status" ? "#00c875" : color}
          title={`${done} of ${total} complete`}
        />
      );
    }
    if (metric === "percent") {
      return <ColumnRollupBar compact segments={segments} valueMode="percent" />;
    }
    if (metric === "count") {
      return <ColumnRollupBar compact segments={segments} valueMode="count" />;
    }
    return <ColumnRollupBar compact segments={segments} />;
  }

  const filled = rows.filter((r) => rowHasValue(r, columnId)).length;
  const fillPct = Math.round((filled / total) * 100);

  if (kind === "date") {
    if (metric === "complete") {
      const done = rows.filter((r) => rowIsComplete(r, columnId)).length;
      const pct = Math.round((done / total) * 100);
      return (
        <CompleteMeter
          pct={pct}
          color="#00c875"
          title={
            columnId === "due"
              ? `${done} of ${total} on track`
              : `${done} of ${total} dated`
          }
        />
      );
    }
    if (metric === "count") {
      const field = columnId === "due" ? "dueDate" : "sendDate";
      const extent = dateExtent(rows, field);
      if (!extent) {
        return (
          <span className="block text-[10px] font-mono tabular-nums text-white/35">
            0/{total}
          </span>
        );
      }
      const range = `${formatDate(extent.min)} – ${formatDate(extent.max)}`;
      return (
        <span
          className="block truncate text-[10px] font-mono text-white/55"
          title={`${filled} dated · ${range}`}
        >
          {range}
        </span>
      );
    }
    if (metric === "percent") {
      return (
        <CompleteMeter
          pct={fillPct}
          color={color}
          title={`${filled} of ${total} dated`}
        />
      );
    }
    return <FillBar filled={filled} total={total} color={color} />;
  }

  if (metric === "count") {
    return (
      <span className="block text-[10px] font-mono tabular-nums text-white/55">
        {filled}/{total}
      </span>
    );
  }
  if (metric === "percent" || metric === "complete") {
    return (
      <CompleteMeter
        pct={fillPct}
        color={metric === "complete" ? "#00c875" : color}
        title={`${filled} of ${total} filled`}
      />
    );
  }
  return <FillBar filled={filled} total={total} color={color} />;
}

function FooterMetricSelector({ value, onChange, rowCount }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const ref = useRef(null);
  const menuRef = useRef(null);
  const current = FOOTER_METRICS.find((m) => m.id === value) || FOOTER_METRICS[0];

  useLayoutEffect(() => {
    if (!open || !ref.current) {
      setMenuPos(null);
      return;
    }
    const place = () => {
      const r = ref.current.getBoundingClientRect();
      setMenuPos({
        left: Math.max(8, r.left),
        bottom: window.innerHeight - r.top + 6,
      });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      const t = e.target;
      if (ref.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative flex items-center gap-1.5 min-w-0"
      data-command-interactive
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 min-w-0 rounded-md border border-white/20 bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/85 hover:text-white hover:bg-white/[0.12]"
      >
        <span className="truncate">{current.label}</span>
        <ChevronDown
          size={10}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <span className="shrink-0 text-[10px] font-mono tabular-nums text-white/35">
        {rowCount}
      </span>
      {open &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            data-command-interactive
            className="fixed z-[80] w-[196px] glass-panel rounded-xl border border-white/[0.12] shadow-2xl shadow-black/60 py-1 fade-in"
            style={{ left: menuPos.left, bottom: menuPos.bottom }}
          >
            {FOOTER_METRICS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className={`flex w-full flex-col items-start px-3 py-1.5 text-left ${
                  m.id === value
                    ? "bg-white/[0.08] text-white"
                    : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span className="text-[12px] font-medium">{m.label}</span>
                <span className="text-[10px] text-white/35">{m.hint}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

function loadColumnState() {
  try {
    const raw = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (!raw) return { order: DEFAULT_ORDER, hidden: DEFAULT_HIDDEN, widths: DEFAULT_WIDTHS };
    const parsed = JSON.parse(raw);
    const savedOrder = Array.isArray(parsed.order) ? parsed.order : [];
    const known = new Set(DEFAULT_ORDER);
    const order = [
      "item",
      ...savedOrder.filter((id) => id !== "item" && known.has(id)),
      ...DEFAULT_ORDER.filter((id) => id !== "item" && !savedOrder.includes(id)),
    ];
    const hidden = (Array.isArray(parsed.hidden) ? parsed.hidden : DEFAULT_HIDDEN).filter(
      (id) => known.has(id) && COLUMN_BY_ID[id]?.hideable !== false,
    );
    const savedWidths = parsed.widths && typeof parsed.widths === "object" ? parsed.widths : {};
    const widths = { ...DEFAULT_WIDTHS };
    for (const id of DEFAULT_ORDER) {
      const w = Number(savedWidths[id]);
      if (Number.isFinite(w)) widths[id] = clampColWidth(COLUMN_BY_ID[id], w);
    }
    return { order, hidden, widths };
  } catch {
    return { order: DEFAULT_ORDER, hidden: DEFAULT_HIDDEN, widths: DEFAULT_WIDTHS };
  }
}

// Master filter facets — every labeled field on the board is filterable.
const FACET_DEFS = [
  {
    id: "phase",
    label: "Phase",
    values: (item) => [item.phase],
    colors: Object.fromEntries(AD_PHASES.map((p) => [p.id, p.color])),
    format: (v) => AD_PHASES.find((p) => p.id === v)?.title || v,
    order: AD_PHASES.map((p) => p.id),
  },
  { id: "status", label: "Status", values: (i) => [i.status], colors: AD_STATUS_COLORS },
  { id: "product", label: "Product", values: (i) => [i.product], colors: AD_PRODUCT_COLORS },
  { id: "priority", label: "Priority", values: (i) => [i.priority], colors: AD_PRIORITY_COLORS },
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

// Options with row counts, computed once from the static seed.
const FACET_OPTIONS = Object.fromEntries(
  FACET_DEFS.map((def) => {
    const counts = new Map();
    adProductionSeed.forEach((item) => {
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

function Badge({ label, color }) {
  if (!label) return <span className="text-white/25">—</span>;
  return (
    <span
      className="block w-full truncate text-center text-[13px] font-semibold leading-none tracking-tight"
      style={{ color: color ? contrastText(color) : undefined }}
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
    <div className="flex min-w-0 max-w-full items-center gap-2 overflow-hidden" title={name}>
      {product?.thumbnail ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-white/15">
          <img
            src={product.thumbnail}
            alt=""
            className="h-[86%] w-[86%] object-contain"
          />
        </span>
      ) : (
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ring-1 ring-white/10"
          style={{
            backgroundColor: swatch || "#4b5563",
            color: contrastText(swatch || "#4b5563"),
          }}
        >
          {initials(name)}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium leading-none text-white">
        {name}
      </span>
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
              className="flex h-7 min-w-7 items-center justify-center rounded-md bg-white/10 px-1 text-[9px] font-bold text-white/80"
            >
              {name.slice(0, 2).toUpperCase()}
            </span>
          );
        }
        return (
          <span
            key={name}
            className="flex h-7 w-7 items-center justify-center rounded-md shadow-sm ring-1 ring-white/15"
            style={{ backgroundColor: mark.bg, color: mark.fg }}
            title={name}
          >
            <PlatformGlyph id={mark.id} className="h-[16px] w-[16px]" />
          </span>
        );
      })}
    </div>
  );
}

function DateCell({ iso }) {
  const label = formatDate(iso);
  if (!label) return <span className="block text-center text-white/20">—</span>;
  return (
    <span
      className="block truncate text-center font-mono text-[12px] leading-none text-white"
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
      className={`block truncate leading-none ${mono ? "font-mono text-[11px] text-white/45" : muted ? "text-white/50" : "text-white/70"}`}
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
    <div className="flex items-center justify-center min-w-0" title={title}>
      <div className="flex -space-x-1.5">
        {shown.map((person) =>
          person.avatar ? (
            <img
              key={person.id || person.name}
              src={person.avatar}
              alt={person.name}
              className="h-7 w-7 rounded-full object-cover ring-2 ring-[#0c0e12]"
            />
          ) : (
            <span
              key={person.name}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[9px] font-bold text-white/80 ring-2 ring-[#0c0e12]"
            >
              {initials(person.name)}
            </span>
          ),
        )}
        {extra > 0 && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[9px] font-bold text-white/70 ring-2 ring-[#0c0e12]">
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
        className="text-[12px] font-semibold text-accent-blue/80 hover:text-accent-blue underline underline-offset-2"
        title={value}
      >
        Open doc
      </a>
    );
  }
  return <CellText value={value} muted />;
}

function renderCell(columnId, item) {
  switch (columnId) {
    case "item":
      return (
        <div className="flex items-center justify-start min-w-0 gap-1.5 text-left">
          <GripVertical
            size={12}
            className="shrink-0 text-white/0 group-hover/row:text-white/40"
          />
          <span className="truncate text-left text-[13px] font-semibold leading-none text-white" title={item.name}>
            {item.name}
          </span>
        </div>
      );
    case "status":
      return <Badge label={item.status} color={AD_STATUS_COLORS[item.status]} />;
    case "product":
      return <ProductCell name={item.product} />;
    case "priority":
      return <Badge label={item.priority} color={AD_PRIORITY_COLORS[item.priority]} />;
    case "editor":
      return <PersonCell names={item.editors} />;
    case "angle":
      return <Badge label={item.angle} color={AD_ANGLE_COLORS[item.angle]} />;
    case "due":
      return <DateCell iso={item.dueDate} />;
    case "style":
      return <Badge label={item.editingStyle} color={AD_EDITING_STYLE_COLORS[item.editingStyle]} />;
    case "platform":
      return <PlatformCell value={item.platform} />;
    case "painPoint":
      return <Badge label={item.painPoint} color={AD_PAIN_POINT_COLORS[item.painPoint]} />;
    case "strategist":
      return <PersonCell names={item.creativeStrategists} />;
    case "sendDate":
      return <DateCell iso={item.sendDate} />;
    case "performance":
      return <Badge label={item.performance} color={AD_PERFORMANCE_COLORS[item.performance]} />;
    case "summary":
      return <LinkableText value={item.summary} />;
    case "adCopy":
      return <LinkableText value={item.adCopy} />;
    default:
      return <span className="text-white/20">—</span>;
  }
}

function ColumnPicker({ order, hidden, onToggle, onReorder, onReset }) {
  const [dragId, setDragId] = useState(null);

  return (
    <div
      role="menu"
      data-command-interactive
      className="absolute right-0 top-full mt-1 z-50 w-[240px] glass-panel rounded-xl border border-white/[0.1] shadow-2xl shadow-black/50 py-2 fade-in"
    >
      <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
        Columns
      </p>
      <ul className="max-h-[320px] overflow-y-auto">
        {order.map((id) => {
          const col = COLUMN_BY_ID[id];
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
                locked ? "text-white/40" : "text-white/70 hover:bg-white/[0.05]"
              } ${dragId === id ? "opacity-40" : ""}`}
            >
              {locked ? (
                <GripVertical size={12} className="text-white/10 flex-shrink-0" />
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
                  className="text-white/25 hover:text-white/55 cursor-grab active:cursor-grabbing flex-shrink-0"
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
                {locked && <span className="text-[9px] uppercase tracking-wide text-white/25">Fixed</span>}
              </label>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-1.5 w-full px-3 pt-2 mt-1 border-t border-white/[0.06] text-[11px] text-white/40 hover:text-white/70"
      >
        <RotateCcw size={11} />
        Reset columns
      </button>
    </div>
  );
}

function FacetFilter({ def, selected, open, onToggleOpen, onToggleValue, onClear }) {
  const options = FACET_OPTIONS[def.id] || [];
  const count = selected.length;
  return (
    <div className="relative flex-shrink-0 border-r border-white/10">
      <button
        type="button"
        onClick={onToggleOpen}
        className={`inline-flex items-center gap-1 px-2.5 py-2 text-[11px] font-medium whitespace-nowrap transition-colors ${
          count > 0
            ? "text-white"
            : open
              ? "text-white/80"
              : "text-white/45 hover:text-white/75"
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
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-[250px] glass-panel rounded-xl border border-white/[0.1] shadow-2xl shadow-black/50 py-2 fade-in"
        >
          <div className="flex items-center justify-between px-3 pb-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
              {def.label}
            </p>
            {count > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-[10px] text-white/35 hover:text-white/70"
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
                  <label className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.05] cursor-pointer">
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
                    <span className="text-[10px] font-mono text-white/25">
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

export default function CommandCenter() {
  const { selectedTaskId, openTask, closeTask, boardItems, moveTask } = useCommandCenter();
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState(loadInitialOpenGroups);
  const [{ order, hidden, widths }, setColumnState] = useState(loadColumnState);
  const [pickerOpen, setPickerOpen] = useState(false);
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
  const [footerMetric, setFooterMetric] = useState(loadFooterMetric);
  const pickerRef = useRef(null);
  const filterRailRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify({ order, hidden, widths }));
    } catch {
      /* ignore quota / private mode */
    }
  }, [order, hidden, widths]);

  useEffect(() => {
    try {
      localStorage.setItem(FOOTER_METRIC_KEY, footerMetric);
    } catch {
      /* ignore quota / private mode */
    }
  }, [footerMetric]);

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
    const item = boardItems.find((row) => row.id === selectedTaskId);
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
  }, [selectedTaskId]);

  const hasActiveFilters =
    overdueOnly || Object.values(facets).some((values) => values?.length > 0);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return boardItems.filter((item) => {
      if (
        q &&
        ![
          item.name,
          item.status,
          item.product,
          item.editors?.join(" "),
          item.creativeStrategists?.join(" "),
          item.angle,
          item.editingStyle,
          item.platform,
          item.painPoint,
          item.adCopy,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      ) {
        return false;
      }
      if (overdueOnly && !isOverdue(item)) return false;
      for (const def of FACET_DEFS) {
        const selected = facets[def.id];
        if (!selected?.length) continue;
        const values = def.values(item).filter(Boolean);
        if (!selected.some((s) => values.includes(s))) return false;
      }
      return true;
    });
  }, [boardItems, query, facets, overdueOnly]);

  const grouped = useMemo(
    () =>
      AD_PHASES.map((phase) => ({
        ...phase,
        rows: items.filter((item) => item.phase === phase.id),
      })).filter((g) => g.rows.length > 0 || (!query.trim() && !hasActiveFilters)),
    [items, query, hasActiveFilters],
  );

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
        .map((id) => COLUMN_BY_ID[id])
        .filter((col) => col && !hidden.includes(col.id))
        .map((col) => ({ ...col, width: widths?.[col.id] ?? col.width })),
    [order, hidden, widths],
  );

  const tableMinWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
  const hiddenCount = hidden.length;

  const setOrder = (next) => setColumnState((prev) => ({ ...prev, order: next }));
  const setHidden = (next) => setColumnState((prev) => ({ ...prev, hidden: next }));
  const setColWidth = (id, next) => {
    setColumnState((prev) => ({
      ...prev,
      widths: { ...prev.widths, [id]: clampColWidth(COLUMN_BY_ID[id], next) },
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
    if (COLUMN_BY_ID[id]?.hideable === false) return;
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
        localStorage.setItem(OPEN_GROUP_STORAGE_KEY, groupId);
      } catch {
        /* ignore private mode */
      }
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 min-w-0 overflow-hidden">
      <div className="h-full px-6 pb-16 pt-16 fade-in flex flex-col min-h-0 min-w-0 overflow-hidden">
        <div className="flex-1 min-h-0 min-w-0 flex gap-3 overflow-hidden">
          <StaffPanel className="hidden lg:flex flex-shrink-0" />

          <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
            <div
              className="flex items-center justify-between gap-3 h-[52px] px-3 mb-2.5 flex-shrink-0 rounded-xl border border-white/10"
              style={{ background: "#191e29" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Table2 size={13} className="text-[#E8C4A0] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8C4A0]">
                    Command Center
                  </p>
                  <div className="flex items-baseline gap-2 min-w-0 mt-0.5">
                    <h1 className="text-[13px] font-semibold text-[#F7F5F2] leading-tight whitespace-nowrap">
                      Ad Production
                    </h1>
                    <p className="text-[11px] text-white/40 truncate">
                      Monday.com board replica — {items.length} ads
                      {currentUser?.name ? ` · scoped for ${firstName(currentUser.name)}` : ""}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={filterRailRef}
              data-command-interactive
              className="flex items-center mb-2.5 flex-shrink-0 min-w-0 overflow-x-auto border-y border-white/10"
            >
              <span className="inline-flex items-center gap-1 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/35 border-r border-white/10 flex-shrink-0">
                <SlidersHorizontal size={11} />
                Filters
              </span>
              {FACET_DEFS.map((def) => (
                <FacetFilter
                  key={def.id}
                  def={def}
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
                className={`inline-flex items-center gap-1 px-2.5 py-2 text-[11px] font-medium whitespace-nowrap transition-colors flex-shrink-0 border-r border-white/10 ${
                  overdueOnly
                    ? "text-accent-red"
                    : "text-white/45 hover:text-white/75"
                }`}
              >
                Overdue
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-2 text-[11px] font-medium text-white/40 hover:text-white/80 transition-colors flex-shrink-0 border-r border-white/10"
                >
                  <X size={11} />
                  Clear all
                </button>
              )}
              <div className="flex items-center ml-auto flex-shrink-0 border-l border-white/10">
                <div className="relative flex-shrink-0 border-r border-white/10" ref={pickerRef}>
                  <button
                    type="button"
                    onClick={() => setPickerOpen((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-2 text-[11px] font-medium whitespace-nowrap transition-colors ${
                      pickerOpen || hiddenCount > 0
                        ? "text-white"
                        : "text-white/45 hover:text-white/75"
                    }`}
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
                      onToggle={toggleColumn}
                      onReorder={handleReorder}
                      onReset={() => {
                        setColumnState({
                          order: DEFAULT_ORDER,
                          hidden: DEFAULT_HIDDEN,
                          widths: DEFAULT_WIDTHS,
                        });
                      }}
                    />
                  )}
                </div>
                <div className="relative flex-shrink-0">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter ads…"
                    className="w-[160px] xl:w-[200px] h-full py-2 pl-7 pr-3 bg-transparent text-[11px] text-white placeholder:text-white/30 outline-none"
                  />
                </div>
              </div>
            </div>

            <div
              className="flex-1 min-h-0 min-w-0 overflow-auto overscroll-contain space-y-2 pr-1 flex flex-col"
              data-command-canvas-scroll
            >
          {grouped.map((group) => {
            const open = openGroups[group.id] !== false;
            const color = group.color || "#84848c";
            // Translucent glass tints for the section body/header; sticky
            // surfaces (thead, pinned column) stay opaque so scrolling
            // content can't bleed through them.
            const bodyBg = withAlpha(color, 0.09);
            // Opaque mix so sticky header + pinned item column don't let
            // scrolling rows bleed through.
            const headerBg = mixOnDark(color, 0.3);
            const grid = withAlpha("#ffffff", 0.12);
            const gridStrong = withAlpha("#ffffff", 0.3);
            return (
              <section
                key={group.id}
                className={`rounded-2xl overflow-hidden border backdrop-blur-xl flex-shrink-0 ${
                  open ? "flex flex-col" : ""
                } ${
                  taskDragId && taskDrop?.groupId === group.id
                    ? "ring-2 ring-white/40"
                    : ""
                }`}
                style={{
                  minWidth: tableMinWidth,
                  backgroundColor: bodyBg,
                  borderColor: withAlpha(color, 0.28),
                  boxShadow: `inset 3px 0 0 ${color}`,
                }}
                onDragOver={(e) => {
                  if (!draggingTask() || dragId) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setTaskDrop((prev) =>
                    prev?.groupId === group.id ? prev : { groupId: group.id },
                  );
                  if (!open) toggleGroup(group.id, true);
                }}
                onDrop={(e) => {
                  if (dragId) return;
                  e.preventDefault();
                  const id =
                    parseTaskDrag(e.dataTransfer.getData("text/plain")) ||
                    draggingTask();
                  if (id) {
                    const before =
                      taskDrop?.groupId === group.id
                        ? taskDrop.atEnd
                          ? null
                          : taskDrop.beforeId
                        : undefined;
                    moveTask(id, group.id, before);
                    if (!open) toggleGroup(group.id, true);
                  }
                  clearTaskDrag();
                }}
                onDragLeave={(e) => {
                  const next = e.relatedTarget;
                  if (next instanceof Node && e.currentTarget.contains(next)) return;
                  setTaskDrop((prev) => (prev?.groupId === group.id ? null : prev));
                }}
              >
                <div className={open ? "overflow-y-auto max-h-[60vh]" : ""}>
                    <table
                      className="text-left table-fixed border-separate border-spacing-0"
                      style={{ width: tableMinWidth }}
                    >
                      <colgroup>
                        {visibleColumns.map((col) => (
                          <col key={col.id} style={{ width: col.width }} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr
                          className="text-[10px] uppercase tracking-wide text-white/45 hover:brightness-110 transition-[filter] cursor-pointer select-none"
                          onClick={(e) => {
                            if (e.target.closest("button, a, input, [role='separator']")) return;
                            toggleGroup(group.id, !open);
                          }}
                        >
                          {visibleColumns.map((col) => {
                            const pinned = Boolean(col.pinned);
                            const isDrop = dropId === col.id && dragId && dragId !== col.id;
                            return (
                              <th
                                key={col.id}
                                draggable={!pinned}
                                data-command-interactive={!pinned ? "" : undefined}
                                title={pinned ? undefined : "Drag name to reorder, edge to resize"}
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
                                  if (draggingTask()) {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = "move";
                                    setTaskDrop({ groupId: group.id });
                                    return;
                                  }
                                  if (pinned) return;
                                  e.preventDefault();
                                  if (dropId !== col.id) setDropId(col.id);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const payload = e.dataTransfer.getData("text/plain");
                                  const droppedTask =
                                    parseTaskDrag(payload) || draggingTask();
                                  if (droppedTask) {
                                    dropTaskOnGroup(group.id, undefined, droppedTask);
                                    clearTaskDrag();
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
                                className={`group/th relative px-3 py-3 font-semibold align-top ${
                                  pinned
                                    ? "sticky left-0 top-0 z-30"
                                    : "sticky top-0 z-20 cursor-grab active:cursor-grabbing"
                                } ${dragId === col.id ? "opacity-40" : ""} ${
                                  isDrop ? "shadow-[inset_2px_0_0_0_rgba(255,255,255,0.7)]" : ""
                                }`}
                                style={{
                                  backgroundColor: headerBg,
                                  width: col.width,
                                  minWidth: col.width,
                                  borderBottom: `1px solid ${gridStrong}`,
                                  borderRight: `1px solid ${grid}`,
                                }}
                              >
                                {pinned ? (
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={open}
                                    data-command-interactive
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        toggleGroup(group.id, !open);
                                      }
                                    }}
                                    className="flex flex-col min-w-0 text-left normal-case tracking-normal"
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 h-[18px] border-b border-white/15">
                                      <ChevronDown
                                        size={12}
                                        className={`flex-shrink-0 text-white/50 transition-transform ${
                                          open ? "" : "-rotate-90"
                                        }`}
                                      />
                                      <span
                                        className="block truncate text-[13px] font-semibold leading-none"
                                        style={{ color }}
                                      >
                                        {group.title}
                                      </span>
                                    </div>
                                    <span className="mt-1.5 block truncate text-[10px] font-medium leading-none text-white/40">
                                      {group.rows.length}{" "}
                                      {group.rows.length === 1 ? "ad" : "ads"}
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="relative flex items-center min-w-0 h-[18px] border-b border-white/15">
                                      <GripVertical
                                        size={10}
                                        className="absolute -left-0.5 text-white/0 group-hover/th:text-white/35 pointer-events-none"
                                      />
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
                                          className="absolute right-0 top-1/2 -translate-y-1/2 rounded text-white/0 group-hover/th:text-white/35 hover:!text-white/70"
                                        >
                                          <EyeOff size={10} />
                                        </button>
                                      )}
                                    </div>
                                    {!open && (
                                      <ColumnRollupBar
                                        segments={columnSegments(group.rows, col.id)}
                                      />
                                    )}
                                  </>
                                )}
                                <ColumnResizeHandle onResizeStart={(e) => startResize(col, e)} />
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      {open && (
                      <>
                      <tbody>
                        {group.rows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={visibleColumns.length}
                              className="px-3 py-4 text-[12px] text-white/25"
                            >
                              No ads in this phase.
                            </td>
                          </tr>
                        ) : (
                          group.rows.map((item, rowIdx) => {
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
                                if (id && id !== item.id) {
                                  moveTask(id, group.id, item.id);
                                }
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
                              {visibleColumns.map((col) => {
                                const tagColor = cellTagColor(col.id, item);
                                const centered =
                                  Boolean(tagColor) ||
                                  col.id === "due" ||
                                  col.id === "sendDate" ||
                                  col.id === "platform" ||
                                  col.id === "editor" ||
                                  col.id === "strategist";
                                return (
                                <td
                                  key={col.id}
                                  className={`relative px-2 py-2.5 text-[13px] leading-none whitespace-nowrap align-middle overflow-hidden ${
                                    centered ? "text-center" : "text-left"
                                  } ${
                                    col.pinned
                                      ? "sticky left-0 z-10"
                                      : rowIdx % 2
                                        ? "bg-black/[0.14] group-hover/row:bg-white/[0.07]"
                                        : "group-hover/row:bg-white/[0.05]"
                                  }`}
                                  style={{
                                    backgroundColor: col.pinned
                                      ? mixOnDark(color, rowIdx % 2 ? 0.26 : 0.2)
                                      : undefined,
                                    width: col.width,
                                    minWidth: col.width,
                                    borderTop: `1px solid ${grid}`,
                                    borderRight: `1px solid ${grid}`,
                                    boxShadow: dropBefore
                                      ? "inset 0 2px 0 0 rgba(255,255,255,0.85)"
                                      : selected
                                        ? col.pinned
                                          ? `inset 3px 0 0 ${color}, inset 0 0 0 1px rgba(255,255,255,0.35)`
                                          : "inset 0 0 0 1px rgba(255,255,255,0.35)"
                                        : undefined,
                                  }}
                                >
                                  {tagColor ? (
                                    <>
                                      <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-1 rounded-[3px]"
                                        style={{ backgroundColor: tagColor }}
                                      />
                                      <div className="relative z-[1] flex min-h-[36px] items-center justify-center px-1">
                                        {renderCell(col.id, item)}
                                      </div>
                                    </>
                                  ) : (
                                    renderCell(col.id, item)
                                  )}
                                </td>
                                );
                              })}
                            </tr>
                            );
                          })
                        )}
                        {/* Placeholder row — Monday-style "+ Add new" at the
                            bottom of every group. */}
                        <tr
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
                            className="sticky left-0 z-10 px-2 py-3 whitespace-nowrap"
                            style={{
                              backgroundColor: mixOnDark(color, 0.2),
                              borderTop: `1px solid ${
                                taskDragId && taskDrop?.groupId === group.id && taskDrop.atEnd
                                  ? "rgba(255,255,255,0.85)"
                                  : grid
                              }`,
                              borderRight: `1px solid ${grid}`,
                            }}
                          >
                            <button
                              type="button"
                              data-command-interactive
                              className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[12px] font-medium text-white/35 hover:text-white/80 transition-colors"
                            >
                              <Plus size={12} />
                              Add new
                            </button>
                          </td>
                          {visibleColumns.length > 1 && (
                            <td
                              colSpan={visibleColumns.length - 1}
                              style={{ borderTop: `1px solid ${grid}` }}
                            />
                          )}
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          {visibleColumns.map((col) => {
                            const pinned = Boolean(col.pinned);
                            return (
                              <td
                                key={col.id}
                                className={`sticky bottom-0 px-2 py-1.5 ${
                                  pinned ? "left-0 z-30" : "z-20"
                                }`}
                                style={{
                                  backgroundColor: pinned
                                    ? mixOnDark(color, 0.22)
                                    : headerBg,
                                  width: col.width,
                                  minWidth: col.width,
                                  borderTop: `1px solid ${gridStrong}`,
                                  borderRight: `1px solid ${grid}`,
                                }}
                              >
                                {pinned ? (
                                  <FooterMetricSelector
                                    value={footerMetric}
                                    onChange={setFooterMetric}
                                    rowCount={group.rows.length}
                                  />
                                ) : (
                                  <FooterMetricCell
                                    columnId={col.id}
                                    rows={group.rows}
                                    metric={footerMetric}
                                    color={color}
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </tfoot>
                      </>
                      )}
                    </table>
                  </div>
              </section>
            );
          })}
          <div
            data-command-scroll-floor
            aria-hidden="true"
            className="h-10 shrink-0 flex items-end justify-center pb-2 pointer-events-none"
          >
            <span className="w-12 h-1 rounded-full bg-white/20" />
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
