import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Columns3,
  LayoutGrid,
  Rows3,
} from "lucide-react";
import BriefCard, { PhaseSubhead, ProductGroupHeader } from "../components/shared/BriefCard";
import TaskBriefDetail from "../components/briefs/TaskBriefDetail";
import { TabBar } from "../components/ui/Tabs";
import ViewToggle from "../components/ui/ViewToggle";
import { useCommandCenter } from "../contexts/CommandCenterContext";
import { AD_PHASES, AD_PRIORITY_COLORS, AD_STATUS_COLORS } from "../data/adProduction";
import useAuth from "../hooks/useAuth";
import {
  findBoardItem,
  formatTaskDate,
  groupByProductThenPhase,
  isAssignedTo,
  isTaskOverdue,
  itemPeople,
  resolveViewer,
  statusBucket,
  withAlpha,
} from "../lib/adTaskBrief";

const statusTabs = [
  { id: "assigned", label: "Assigned" },
  { id: "all", label: "All" },
  { id: "review", label: "In Review" },
  { id: "done", label: "Done" },
];

const viewOptions = [
  { value: "card", icon: LayoutGrid, label: "Cards" },
  { value: "kanban", icon: Columns3, label: "Kanban" },
  { value: "table", icon: Rows3, label: "Table" },
];

function filterItems(items, tab, viewer) {
  if (tab === "assigned") return items.filter((item) => isAssignedTo(item, viewer));
  if (tab === "review") return items.filter((item) => statusBucket(item) === "review");
  if (tab === "done") return items.filter((item) => statusBucket(item) === "done");
  return items;
}

export default function Briefs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { boardItems } = useCommandCenter();
  const { user } = useAuth();
  const viewer = useMemo(() => resolveViewer(user), [user]);
  const [viewMode, setViewMode] = useState("card");
  const [collapsedProducts, setCollapsedProducts] = useState(() => new Set());

  const assignedItems = useMemo(
    () => boardItems.filter((item) => isAssignedTo(item, viewer)),
    [boardItems, viewer],
  );

  const [activeTab, setActiveTab] = useState(null);
  const resolvedTab = activeTab ?? (assignedItems.length > 0 ? "assigned" : "all");

  const filtered = useMemo(
    () => filterItems(boardItems, resolvedTab, viewer),
    [boardItems, resolvedTab, viewer],
  );

  const grouped = useMemo(() => groupByProductThenPhase(filtered), [filtered]);

  const tabsWithCounts = statusTabs.map((t) => ({
    ...t,
    count: filterItems(boardItems, t.id, viewer).length,
  }));

  const taskParam = searchParams.get("task") || searchParams.get("briefId");
  const fullItem = useMemo(
    () => (taskParam ? findBoardItem(taskParam, boardItems) : null),
    [taskParam, boardItems],
  );

  const openFull = (item) => {
    setSearchParams({ task: String(item.name || "").replace(/^#/, "") });
  };

  const closeFull = () => {
    setSearchParams({});
  };

  const toggleProduct = (product) => {
    setCollapsedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(product)) next.delete(product);
      else next.add(product);
      return next;
    });
  };

  const highPriorityAssigned = assignedItems.filter((item) => item.priority === "High").length;
  const nextDue = assignedItems.reduce((best, item) => {
    if (!item.dueDate) return best;
    if (!best) return item;
    return item.dueDate < best.dueDate ? item : best;
  }, null);

  if (fullItem) {
    return (
      <BriefFullPage item={fullItem} onBack={closeFull} />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 pb-6 pt-16 fade-in">
        {assignedItems.length > 0 && (
          <div className="mb-5 flex items-center justify-between rounded-2xl glass-card px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
              <span className="text-[12px] font-bold text-white/70">
                {assignedItems.length} assigned brief{assignedItems.length === 1 ? "" : "s"}
              </span>
              {highPriorityAssigned > 0 && (
                <>
                  <span className="text-white/15">·</span>
                  <span className="text-[10px] font-semibold text-accent-red/70">
                    {highPriorityAssigned} high priority
                  </span>
                </>
              )}
              {nextDue?.dueDate && (
                <>
                  <span className="text-white/15">·</span>
                  <span className="text-[10px] text-white/30 flex items-center gap-1">
                    <Clock size={9} />
                    Next due {formatTaskDate(nextDue.dueDate)}
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] text-white/25">
              Scoped for {viewer.name?.split(" ")[0] || "you"}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <TabBar
            tabs={tabsWithCounts}
            active={resolvedTab}
            onChange={setActiveTab}
          />
          <ViewToggle
            options={viewOptions}
            value={viewMode}
            onChange={setViewMode}
          />
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
            <p className="text-[13px] text-white/40">No briefs in this view.</p>
            {resolvedTab === "assigned" && (
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="mt-3 text-[12px] font-semibold text-white/60 hover:text-white"
              >
                Show all briefs
              </button>
            )}
          </div>
        )}

        {viewMode === "card" && filtered.length > 0 && (
          <div className="space-y-5">
            {grouped.map((group) => {
              const collapsed = collapsedProducts.has(group.product);
              return (
                <section key={group.product}>
                  <ProductGroupHeader
                    product={group.product}
                    count={group.count}
                    collapsed={collapsed}
                    onToggle={() => toggleProduct(group.product)}
                  />
                  {!collapsed && (
                    <div className="space-y-3 mt-1.5">
                      {group.phases.map((phaseGroup) => (
                        <div key={phaseGroup.phaseId}>
                          <PhaseSubhead phase={phaseGroup.phase} count={phaseGroup.items.length} />
                          <div className="grid grid-cols-2 gap-2">
                            {phaseGroup.items.map((item) => (
                              <BriefCard
                                key={item.id}
                                item={item}
                                onClick={() => openFull(item)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {viewMode === "kanban" && filtered.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {AD_PHASES.map((phase) => {
              const items = filtered.filter((item) => item.phase === phase.id);
              return (
                <div key={phase.id} className="flex-shrink-0 w-72">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: phase.color }} />
                    <span className="text-xs font-semibold text-white/60">{phase.title}</span>
                    <span className="text-[10px] text-white/18 font-mono">{items.length}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <BriefCard
                        key={item.id}
                        item={item}
                        onClick={() => openFull(item)}
                        variant="kanban"
                      />
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-8 text-[11px] text-white/12 border border-dashed border-white/[0.06] rounded-xl">
                        No briefs
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "table" && filtered.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-4 py-2 text-[10px] text-white/18 font-semibold uppercase tracking-wider">
              <span className="flex-1">Brief</span>
              <span className="w-28">Product</span>
              <span className="w-36">Phase</span>
              <span className="w-28">Editor</span>
              <span className="w-20">Priority</span>
              <span className="w-24">Due</span>
              <span className="w-32 text-right">Status</span>
            </div>
            {filtered.map((item) => {
              const phase = AD_PHASES.find((p) => p.id === item.phase);
              const overdue = isTaskOverdue(item);
              const people = itemPeople(item);
              return (
                <div
                  key={item.id}
                  onClick={() => openFull(item)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.04] hover:border-white/[0.06] cursor-pointer transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                    {item.angle && (
                      <p className="text-[10px] text-white/25 mt-0.5 truncate">{item.angle}</p>
                    )}
                  </div>
                  <span className="w-28 text-[11px] text-white/40 truncate">{item.product}</span>
                  <span className="w-36 text-[11px] truncate" style={{ color: phase?.color || "rgba(255,255,255,0.35)" }}>
                    {phase?.title || "—"}
                  </span>
                  <span className="w-28 text-[11px] text-white/35 truncate">
                    {people[0]?.name || "Unassigned"}
                  </span>
                  <span className="w-20">
                    <TablePill label={item.priority} color={AD_PRIORITY_COLORS[item.priority]} />
                  </span>
                  <span className={`w-24 text-[11px] font-mono ${overdue ? "text-rose-400" : "text-white/35"}`}>
                    {formatTaskDate(item.dueDate) || "—"}
                  </span>
                  <div className="w-32 flex justify-end">
                    <TablePill label={item.status} color={AD_STATUS_COLORS[item.status]} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TablePill({ label, color }) {
  if (!label) return <span className="text-[11px] text-white/20">—</span>;
  return (
    <span
      className="inline-flex max-w-full items-center truncate rounded-full border px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.04em]"
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

function BriefFullPage({ item, onBack }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 pb-6 pt-16 fade-in">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/55 transition-colors mb-5"
        >
          <ArrowLeft size={14} /> Back to Briefs
        </button>

        <div className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-[#F9F8F6] text-stone-800 shadow-2xl">
          <TaskBriefDetail
            key={item.id}
            item={item}
            density="page"
            titleId="brief-full-title"
            idPrefix="brief"
          />
        </div>
      </div>
    </div>
  );
}
