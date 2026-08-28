import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import BriefCard from "../components/shared/BriefCard";
import TaskBriefDetail from "../components/briefs/TaskBriefDetail";
import { useCommandCenter } from "../contexts/CommandCenterContext";
import useAuth from "../hooks/useAuth";
import {
  findBoardItem,
  formatTaskDate,
  isAssignedTo,
  isTaskOverdue,
  resolveViewer,
} from "../lib/adTaskBrief";
import { APP_CONTENT_INSET } from "../components/layout/chrome";

const PRIORITY_RANK = { High: 1, Medium: 2, Low: 3 };

function priorityRank(priority) {
  if (String(priority || "").toLowerCase().startsWith("critical")) return 0;
  return PRIORITY_RANK[priority] ?? 4;
}

function sortMyTasks(items) {
  return [...items].sort((a, b) => {
    const overdueDelta = (isTaskOverdue(a) ? 0 : 1) - (isTaskOverdue(b) ? 0 : 1);
    if (overdueDelta) return overdueDelta;
    const dueA = a.dueDate || "9999-99-99";
    const dueB = b.dueDate || "9999-99-99";
    if (dueA !== dueB) return dueA.localeCompare(dueB);
    return priorityRank(a.priority) - priorityRank(b.priority);
  });
}

export default function Briefs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { boardItems, openTask } = useCommandCenter();
  const { user } = useAuth();
  const viewer = useMemo(() => resolveViewer(user), [user]);

  const myTasks = useMemo(
    () => sortMyTasks(boardItems.filter((item) => isAssignedTo(item, viewer))),
    [boardItems, viewer],
  );

  const highPriority = myTasks.filter((item) => item.priority === "High").length;
  const nextDue = myTasks.reduce((best, item) => {
    if (!item.dueDate) return best;
    if (!best) return item;
    return item.dueDate < best.dueDate ? item : best;
  }, null);

  const taskParam = searchParams.get("task") || searchParams.get("briefId");
  const fullItem = useMemo(
    () => (taskParam ? findBoardItem(taskParam, boardItems) : null),
    [taskParam, boardItems],
  );

  const closeFull = () => {
    setSearchParams({});
  };

  if (fullItem) {
    return <BriefFullPage item={fullItem} onBack={closeFull} />;
  }

  return (
    <div className="flex-1 overflow-y-auto" data-shell-page-scroll>
      <div className="px-6 pb-6 fade-in" style={{ paddingTop: APP_CONTENT_INSET }}>
        <div className="mb-5 flex items-center justify-between rounded-2xl glass-card px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
            <span className="text-[12px] font-bold text-white/70">
              {myTasks.length} assigned brief{myTasks.length === 1 ? "" : "s"}
            </span>
            {highPriority > 0 && (
              <>
                <span className="text-white/15">·</span>
                <span className="text-[10px] font-semibold text-accent-red/70">
                  {highPriority} high priority
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
          <span className="text-[10px] text-white/25 shrink-0">
            Your tasks · {viewer.name?.split(" ")[0] || "you"}
          </span>
        </div>

        {myTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
            <p className="text-[13px] text-white/40">No briefs assigned to you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {myTasks.map((item) => (
              <BriefCard
                key={item.id}
                item={item}
                variant="kanban"
                onClick={() => openTask(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BriefFullPage({ item, onBack }) {
  return (
    <div className="flex-1 overflow-y-auto" data-shell-page-scroll>
      <div className="px-6 pb-6 fade-in" style={{ paddingTop: APP_CONTENT_INSET }}>
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
