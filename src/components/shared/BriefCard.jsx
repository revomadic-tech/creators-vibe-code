import { Clock, ChevronDown, ChevronRight } from "lucide-react";
import {
  AD_PRIORITY_COLORS,
  AD_PRODUCT_COLORS,
  AD_STATUS_COLORS,
} from "../../data/adProduction";
import { findWorkspaceUser } from "../../data/mockData";
import {
  formatTaskDate,
  isTaskOverdue,
  withAlpha,
} from "../../lib/adTaskBrief";

function AdPill({ label, color }) {
  if (!label) return null;
  return (
    <span
      className="inline-flex max-w-[140px] items-center truncate rounded-full border px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.05em]"
      style={{
        backgroundColor: color ? withAlpha(color, 0.16) : "rgba(255,255,255,0.06)",
        color: color || "rgba(255,255,255,0.55)",
        borderColor: color ? withAlpha(color, 0.35) : "rgba(255,255,255,0.08)",
      }}
      title={label}
    >
      {label}
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

function PeopleStack({ names = [], max = 3 }) {
  const people = names.map((name) => findWorkspaceUser(name) || { id: name, name, avatar: null });
  const overflow = people.length > max ? people.length - max : 0;
  if (people.length === 0) {
    return <span className="text-[10px] text-white/20">Unassigned</span>;
  }
  return (
    <div className="flex items-center -space-x-1.5">
      {people.slice(0, max).map((person) =>
        person.avatar ? (
          <img
            key={person.id}
            src={person.avatar}
            alt=""
            title={person.name}
            className="h-5 w-5 rounded-full object-cover border-[1.5px] border-surface-700"
          />
        ) : (
          <span
            key={person.id}
            title={person.name}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[8px] font-bold text-white/60 border-[1.5px] border-surface-700"
          >
            {initials(person.name)}
          </span>
        ),
      )}
      {overflow > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-600 text-[7px] font-bold text-white/50 border-[1.5px] border-surface-700">
          +{overflow}
        </span>
      )}
    </div>
  );
}

export default function BriefCard({ item, onClick, variant = "default" }) {
  if (variant === "kanban") return <KanbanCard item={item} onClick={onClick} />;
  const due = formatTaskDate(item.dueDate);
  const overdue = isTaskOverdue(item);

  return (
    <div
      className="group flex items-center gap-3 rounded-xl glass-card card-hover cursor-pointer px-3 py-2 min-h-[52px]"
      onClick={onClick}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-[12px] font-bold text-white leading-tight truncate">
            {item.name}
          </h3>
          <AdPill label={item.priority} color={AD_PRIORITY_COLORS[item.priority]} />
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 min-w-0">
          <AdPill label={item.status} color={AD_STATUS_COLORS[item.status]} />
          {item.angle && (
            <span className="text-[10px] text-white/25 truncate">{item.angle}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <PeopleStack names={item.editors} max={2} />
        {due && (
          <span className={`flex items-center gap-0.5 text-[10px] font-mono ${overdue ? "text-rose-400" : "text-white/30"}`}>
            <Clock size={9} />
            {due}
          </span>
        )}
        <ChevronRight size={13} className="text-white/15 group-hover:text-white/40 transition-colors" />
      </div>
    </div>
  );
}

function KanbanCard({ item, onClick }) {
  const due = formatTaskDate(item.dueDate);
  const overdue = isTaskOverdue(item);
  return (
    <button
      type="button"
      data-command-interactive
      onClick={onClick}
      className="rounded-2xl glass-card card-hover cursor-pointer p-3 text-left w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-xs font-bold text-white truncate">
          {item.name}
        </h3>
        <AdPill label={item.priority} color={AD_PRIORITY_COLORS[item.priority]} />
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-white/30 mb-2">
        <span
          className="truncate"
          style={{ color: AD_PRODUCT_COLORS[item.product] || "rgba(255,255,255,0.45)" }}
        >
          {item.product}
        </span>
      </div>
      <AdPill label={item.status} color={AD_STATUS_COLORS[item.status]} />
      <div className="flex items-center justify-between mt-2.5">
        <PeopleStack names={item.editors} max={2} />
        {due && (
          <span className={`text-[9px] flex items-center gap-0.5 ${overdue ? "text-rose-400" : "text-white/15"}`}>
            <Clock size={8} /> {due}
          </span>
        )}
      </div>
    </button>
  );
}

export function ProductGroupHeader({ product, count, collapsed, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2 py-1.5 text-left group"
    >
      <span
        className="h-2.5 w-2.5 rounded-full shrink-0"
        style={{ backgroundColor: AD_PRODUCT_COLORS[product] || "#78716c" }}
      />
      <span className="text-[13px] font-bold text-white/80">{product}</span>
      <span className="text-[10px] font-mono text-white/25">{count}</span>
      <span className="ml-auto text-white/20 group-hover:text-white/40 transition-colors">
        {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
      </span>
    </button>
  );
}

export function PhaseSubhead({ phase, count }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-1">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: phase.color }} />
      <span className="text-[11px] font-semibold" style={{ color: phase.color }}>
        {phase.title}
      </span>
      <span className="text-[10px] font-mono text-white/18">{count}</span>
    </div>
  );
}
