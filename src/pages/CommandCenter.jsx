import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Columns3,
  EyeOff,
  GripVertical,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import StaffPanel from "../components/shared/StaffPanel";
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
} from "../data/adProduction";
import { currentUser } from "../data/mockData";

// v2: full column set (all visible by default) — invalidates saved v1 state
// where half the board was hidden.
const COLUMN_STORAGE_KEY = "revo.commandCenter.boardColumns.v2";
const OPEN_GROUP_STORAGE_KEY = "revo.commandCenter.lastOpenGroup.v1";

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
// Tag/badge cells center their chips; plain text columns stay left-aligned.
const BADGE_COLUMNS = new Set([
  "status",
  "product",
  "priority",
  "angle",
  "style",
  "platform",
  "painPoint",
  "performance",
]);
const DEFAULT_ORDER = AD_BOARD_COLUMNS.map((col) => col.id);
const DEFAULT_HIDDEN = AD_BOARD_COLUMNS.filter((col) => col.defaultHidden).map(
  (col) => col.id,
);

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

function darken(hex, factor) {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return `rgb(${clamp(r * factor)}, ${clamp(g * factor)}, ${clamp(b * factor)})`;
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

function loadColumnState() {
  try {
    const raw = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (!raw) return { order: DEFAULT_ORDER, hidden: DEFAULT_HIDDEN };
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
    return { order, hidden };
  } catch {
    return { order: DEFAULT_ORDER, hidden: DEFAULT_HIDDEN };
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
  { id: "editor", label: "Editor", values: (i) => i.editors || [] },
  { id: "strategist", label: "Strategist", values: (i) => i.creativeStrategists || [] },
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
  if (!label) return <span className="text-white/20">—</span>;
  return (
    <span
      className="inline-flex items-center h-5 max-w-full px-1.5 rounded-[4px] text-[11px] font-semibold leading-none tracking-tight text-white/95 whitespace-nowrap overflow-hidden text-ellipsis"
      style={{ backgroundColor: `${color || "#444"}cc` }}
      title={label}
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
  const list = (names || []).filter(Boolean);
  if (list.length === 0) return <span className="text-white/20">Unassigned</span>;
  const [primary, ...rest] = list;
  return (
    <span className="block truncate leading-none text-white/80" title={list.join(", ")}>
      {primary}
      {rest.length > 0 ? ` +${rest.length}` : ""}
    </span>
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
        <span className="block truncate text-[13px] font-semibold leading-none text-white" title={item.name}>
          {item.name}
        </span>
      );
    case "status":
      return <Badge label={item.status} color={AD_STATUS_COLORS[item.status]} />;
    case "product":
      return <Badge label={item.product} color={AD_PRODUCT_COLORS[item.product]} />;
    case "priority":
      return <Badge label={item.priority} color={AD_PRIORITY_COLORS[item.priority]} />;
    case "editor":
      return <PersonCell names={item.editors} />;
    case "angle":
      return <Badge label={item.angle} color={AD_ANGLE_COLORS[item.angle]} />;
    case "due": {
      const label = formatDate(item.dueDate);
      if (!label) return <span className="text-white/20">—</span>;
      return (
        <span
          className={`block truncate font-mono text-[11px] leading-none ${
            isOverdue(item) ? "text-accent-red" : "text-white/45"
          }`}
          title={item.dueDate}
        >
          {label}
        </span>
      );
    }
    case "style":
      return <Badge label={item.editingStyle} color={AD_EDITING_STYLE_COLORS[item.editingStyle]} />;
    case "platform":
      return <Badge label={item.platform} color={AD_PLATFORM_COLORS[item.platform]} />;
    case "painPoint":
      return <Badge label={item.painPoint} color={AD_PAIN_POINT_COLORS[item.painPoint]} />;
    case "strategist":
      return <PersonCell names={item.creativeStrategists} />;
    case "sendDate":
      return <CellText value={formatDate(item.sendDate)} mono />;
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
      className="absolute right-0 top-10 z-50 w-[240px] glass-panel rounded-xl border border-white/[0.1] shadow-2xl shadow-black/50 py-2 fade-in"
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
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={onToggleOpen}
        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
          count > 0
            ? "border-accent-red/30 bg-accent-red/10 text-white"
            : "border-white/[0.08] bg-white/[0.03] text-white/45 hover:text-white/75 hover:border-white/[0.15]"
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
              return (
                <li key={value}>
                  <label className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.05] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleValue(value)}
                      className="rounded border-white/20 bg-white/10"
                    />
                    {color && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <span className="truncate flex-1" title={String(label)}>
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
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState(loadInitialOpenGroups);
  const [{ order, hidden }, setColumnState] = useState(loadColumnState);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dropId, setDropId] = useState(null);
  const [facets, setFacets] = useState({});
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [openFacet, setOpenFacet] = useState(null);
  const pickerRef = useRef(null);
  const filterRailRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify({ order, hidden }));
    } catch {
      /* ignore quota / private mode */
    }
  }, [order, hidden]);

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

  const hasActiveFilters =
    overdueOnly || Object.values(facets).some((values) => values?.length > 0);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adProductionSeed.filter((item) => {
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
  }, [query, facets, overdueOnly]);

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
    () => order.map((id) => COLUMN_BY_ID[id]).filter((col) => col && !hidden.includes(col.id)),
    [order, hidden],
  );

  const tableMinWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);
  const hiddenCount = hidden.length;

  const setOrder = (next) => setColumnState((prev) => ({ ...prev, order: next }));
  const setHidden = (next) => setColumnState((prev) => ({ ...prev, hidden: next }));

  const toggleColumn = (id) => {
    if (COLUMN_BY_ID[id]?.hideable === false) return;
    setHidden(hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id]);
  };

  const handleReorder = (fromId, toId) => {
    setOrder(moveColumn(order, fromId, toId));
  };

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
    <div className="h-full flex flex-col min-h-0">
      <div className="h-full px-6 pb-16 pt-16 fade-in flex flex-col min-h-0">
        <div className="flex-1 min-h-0 flex gap-3 lg:overflow-x-auto lg:overflow-y-hidden">
          <StaffPanel className="hidden lg:flex w-[320px] xl:w-[345px] flex-shrink-0" />

          <div className="flex-1 min-w-0 flex flex-col min-h-0">
            <div className="flex items-end justify-between gap-3 mb-2.5 flex-shrink-0">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">
                  Command Center
                </p>
                <div className="flex items-baseline gap-2 min-w-0 mt-0.5">
                  <h1 className="text-lg font-semibold text-white leading-tight whitespace-nowrap">
                    Ad Production
                  </h1>
                  <p className="text-[11px] text-white/35 truncate">
                    Monday.com board replica — {items.length} ads
                    {currentUser?.name ? ` · scoped for ${firstName(currentUser.name)}` : ""}.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative" ref={pickerRef}>
                  <button
                    type="button"
                    onClick={() => setPickerOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 glass-nav rounded-xl py-2 px-3 text-[12px] text-white/70 hover:text-white"
                  >
                    <Columns3 size={13} />
                    Columns
                    {hiddenCount > 0 && (
                      <span className="text-[10px] font-mono text-white/35">{hiddenCount} hidden</span>
                    )}
                  </button>
                  {pickerOpen && (
                    <ColumnPicker
                      order={order}
                      hidden={hidden}
                      onToggle={toggleColumn}
                      onReorder={handleReorder}
                      onReset={() => {
                        setColumnState({ order: DEFAULT_ORDER, hidden: DEFAULT_HIDDEN });
                      }}
                    />
                  )}
                </div>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter ads, status, editor…"
                  className="w-[200px] xl:w-[260px] glass-nav rounded-xl py-2 px-3 text-[12px] text-white placeholder:text-white/25 outline-none"
                />
              </div>
            </div>

            <div
              ref={filterRailRef}
              data-command-interactive
              className="flex flex-wrap items-center gap-1.5 mb-2.5 flex-shrink-0"
            >
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/25 mr-0.5">
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
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors flex-shrink-0 ${
                  overdueOnly
                    ? "border-accent-red/40 bg-accent-red/15 text-accent-red"
                    : "border-white/[0.08] bg-white/[0.03] text-white/45 hover:text-white/75 hover:border-white/[0.15]"
                }`}
              >
                Overdue
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
                >
                  <X size={11} />
                  Clear all
                </button>
              )}
            </div>

            <div
              className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain space-y-2 pr-1 flex flex-col"
              data-command-canvas-scroll
            >
          {grouped.map((group) => {
            const open = openGroups[group.id] !== false;
            const color = group.color || "#84848c";
            // Translucent glass tints for the section body/header; sticky
            // surfaces (thead, pinned column) stay opaque so scrolling
            // content can't bleed through them.
            const bodyBg = withAlpha(color, 0.09);
            const headerBg = withAlpha(color, 0.2);
            // Column header row: a darker shade of the section color so it
            // sits below the group tint instead of matching it.
            const theadBg = darken(color, 0.22);
            const stickyHead = darken(color, 0.22);
            const grid = withAlpha("#ffffff", 0.12);
            const gridStrong = withAlpha("#ffffff", 0.3);
            return (
              <section
                key={group.id}
                // Sections hug their rows — no stretch, so there is no empty
                // body space; the "Add new" placeholder row closes each table.
                className={`rounded-2xl overflow-hidden border backdrop-blur-xl flex-shrink-0 ${
                  open ? "flex flex-col" : ""
                }`}
                style={{
                  backgroundColor: bodyBg,
                  borderColor: withAlpha(color, 0.28),
                  boxShadow: `inset 3px 0 0 ${color}`,
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleGroup(group.id, !open)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleGroup(group.id, !open);
                    }
                  }}
                  className="w-full flex items-center gap-1.5 px-2.5 py-2 text-left hover:brightness-110 transition-[filter] flex-shrink-0 cursor-pointer select-none"
                  style={{ backgroundColor: headerBg }}
                >
                  <ChevronDown
                    size={12}
                    className={`text-white/50 transition-transform ${open ? "" : "-rotate-90"}`}
                  />
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[13px] font-semibold text-white">
                    {group.title}
                  </span>
                  <span
                    className="text-[11px] font-mono px-1.5 py-0.5 rounded-md"
                    style={{ backgroundColor: withAlpha(color, 0.22), color }}
                  >
                    {group.rows.length}
                  </span>
                </div>
                {open && (
                  <div className="overflow-auto max-h-[60vh]">
                    <table
                      className="w-full text-left table-fixed border-separate border-spacing-0"
                      style={{ minWidth: tableMinWidth }}
                    >
                      <colgroup>
                        {visibleColumns.map((col) => (
                          <col key={col.id} style={{ width: col.width }} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wide text-white/40 border-t border-white/[0.06]">
                          {visibleColumns.map((col) => {
                            const pinned = Boolean(col.pinned);
                            const isDrop = dropId === col.id && dragId && dragId !== col.id;
                            return (
                              <th
                                key={col.id}
                                draggable={!pinned}
                                data-command-interactive={!pinned ? "" : undefined}
                                title={pinned ? undefined : "Drag to reorder"}
                                onDragStart={(e) => {
                                  if (pinned) return;
                                  setDragId(col.id);
                                  e.dataTransfer.setData("text/plain", col.id);
                                  e.dataTransfer.effectAllowed = "move";
                                }}
                                onDragOver={(e) => {
                                  if (pinned) return;
                                  e.preventDefault();
                                  if (dropId !== col.id) setDropId(col.id);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const from = e.dataTransfer.getData("text/plain") || dragId;
                                  handleReorder(from, col.id);
                                  setDragId(null);
                                  setDropId(null);
                                }}
                                onDragEnd={() => {
                                  setDragId(null);
                                  setDropId(null);
                                }}
                                className={`group/th px-2.5 py-2 font-semibold ${
                                  pinned
                                    ? "sticky left-0 top-0 z-30"
                                    : "sticky top-0 z-20 cursor-grab active:cursor-grabbing"
                                } ${dragId === col.id ? "opacity-40" : ""} ${
                                  isDrop ? "shadow-[inset_2px_0_0_0_rgba(255,255,255,0.7)]" : ""
                                }`}
                                style={{
                                  backgroundColor: pinned ? stickyHead : theadBg,
                                  width: col.width,
                                  minWidth: col.width,
                                  borderBottom: `1px solid ${gridStrong}`,
                                  borderRight: `1px solid ${gridStrong}`,
                                  boxShadow: `inset -1px 0 0 ${gridStrong}`,
                                }}
                              >
                                <div className="flex items-center gap-1 min-w-0">
                                  {!pinned && (
                                    <GripVertical size={10} className="flex-shrink-0 text-white/25" />
                                  )}
                                  <span className="truncate">{col.label}</span>
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
                                      className="ml-auto flex-shrink-0 rounded text-white/0 group-hover/th:text-white/35 hover:!text-white/70"
                                    >
                                      <EyeOff size={10} />
                                    </button>
                                  )}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={visibleColumns.length}
                              className="px-2.5 py-4 text-[12px] text-white/25"
                            >
                              No ads in this phase.
                            </td>
                          </tr>
                        ) : (
                          group.rows.map((item, rowIdx) => (
                            <tr key={item.id} className="group/row">
                              {visibleColumns.map((col) => (
                                <td
                                  key={col.id}
                                  className={`px-2.5 py-2 text-[13px] leading-none whitespace-nowrap align-middle ${
                                    col.pinned ? "sticky left-0 z-10" : ""
                                  } ${BADGE_COLUMNS.has(col.id) ? "text-center" : ""}`}
                                  style={{
                                    backgroundColor: col.pinned
                                      ? mixOnDark(color, rowIdx % 2 ? 0.26 : 0.2)
                                      : rowIdx % 2
                                        ? "rgba(0,0,0,0.14)"
                                        : undefined,
                                    width: col.width,
                                    minWidth: col.width,
                                    borderTop: `1px solid ${grid}`,
                                    borderRight: `1px solid ${grid}`,
                                    boxShadow: `inset -1px 0 0 ${grid}`,
                                  }}
                                >
                                  {renderCell(col.id, item)}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                        {/* Placeholder row — Monday-style "+ Add new" at the
                            bottom of every group. */}
                        <tr>
                          <td
                            className="sticky left-0 z-10 px-2.5 py-1.5 whitespace-nowrap"
                            style={{
                              backgroundColor: mixOnDark(color, 0.2),
                              borderTop: `1px solid ${grid}`,
                              borderRight: `1px solid ${grid}`,
                              boxShadow: `inset -1px 0 0 ${grid}`,
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
                    </table>
                  </div>
                )}
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
