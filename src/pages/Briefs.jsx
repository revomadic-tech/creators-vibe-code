import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import BriefCard from "../components/shared/BriefCard";
import TaskBriefDetail from "../components/briefs/TaskBriefDetail";
import EditorBriefWorkspace from "../components/briefs/EditorBriefWorkspace";
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
import { useGetAssignedEditorBriefs, useGetBrief } from "../api/briefs/hooks";
import {
  isAssignedEditor,
  mapEditorBriefDetail,
  mapEditorBriefList,
} from "../lib/mapEditorBrief";

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
  const assignedQuery = useGetAssignedEditorBriefs();

  const editorBriefs = useMemo(() => {
    const all = mapEditorBriefList(assignedQuery.data);
    return all.filter(
      (brief) => brief.briefType !== "partner" && isAssignedEditor(brief, user),
    );
  }, [assignedQuery.data, user]);

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

  const liveParam = searchParams.get("brief");
  const taskParam = searchParams.get("task") || searchParams.get("briefId");
  const liveFromList = useMemo(
    () => editorBriefs.find((b) => String(b.uuid) === String(liveParam) || String(b.id) === String(liveParam)),
    [editorBriefs, liveParam],
  );
  const liveDetailQuery = useGetBrief(liveParam && !liveFromList ? liveParam : null);
  const liveBrief = liveFromList || mapEditorBriefDetail(liveDetailQuery.data);

  const fullItem = useMemo(
    () => (taskParam ? findBoardItem(taskParam, boardItems) : null),
    [taskParam, boardItems],
  );

  const closeFull = () => setSearchParams({});

  if (liveParam && liveBrief) {
    return (
      <div className="flex-1 overflow-y-auto" data-shell-page-scroll>
        <div className="px-6 pb-6 fade-in" style={{ paddingTop: APP_CONTENT_INSET }}>
          <div className="flex h-[calc(100vh-9rem)] flex-col">
            <EditorBriefWorkspace brief={liveBrief} onBack={closeFull} />
          </div>
        </div>
      </div>
    );
  }

  if (liveParam && liveDetailQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-white/40" style={{ paddingTop: APP_CONTENT_INSET }}>
        <Loader2 size={14} className="mr-2 animate-spin" /> Opening brief…
      </div>
    );
  }

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
              {editorBriefs.length} editor brief{editorBriefs.length === 1 ? "" : "s"}
            </span>
            {assignedQuery.isFetching && (
              <Loader2 size={11} className="animate-spin text-white/30" />
            )}
            {nextDue?.dueDate && (
              <>
                <span className="text-white/15">·</span>
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <Clock size={9} />
                  Next board due {formatTaskDate(nextDue.dueDate)}
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] text-white/25 shrink-0">
            Assigned on admin · {viewer.name?.split(" ")[0] || "you"}
          </span>
        </div>

        {assignedQuery.isError ? (
          <div className="mb-6 rounded-2xl border border-dashed border-white/[0.08] px-4 py-8 text-center">
            <p className="text-[13px] text-white/50">
              Couldn&apos;t load editor briefs from admin yet. Auth is the same REVO account —
              briefs appear here once they&apos;re shared to you as an editor.
            </p>
          </div>
        ) : editorBriefs.length === 0 && !assignedQuery.isLoading ? (
          <div className="mb-6 rounded-2xl border border-dashed border-white/[0.08] py-12 text-center">
            <p className="text-[13px] text-white/40">No editor briefs assigned to you.</p>
            <p className="mt-1 text-[11px] text-white/25">
              Admins share them from Campaigns → Briefs (Editor Brief).
            </p>
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {editorBriefs.map((brief) => (
              <button
                key={brief.uuid}
                type="button"
                onClick={() => setSearchParams({ brief: brief.uuid })}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] text-left transition-colors hover:border-white/[0.16]"
              >
                {brief.thumbnail ? (
                  <img src={brief.thumbnail} alt="" className="h-28 w-full object-cover" />
                ) : (
                  <div className="h-28 bg-white/[0.04]" />
                )}
                <div className="space-y-1 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                    {brief.campaign}
                  </p>
                  <p className="text-[14px] font-semibold text-white">{brief.title}</p>
                  <p className="text-[11px] text-white/40">
                    {brief.deliverables.length} deliverable
                    {brief.deliverables.length === 1 ? "" : "s"}
                    {brief.dueDate ? ` · due ${brief.dueDate}` : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
          Quick tasks
          {highPriority > 0 ? ` · ${highPriority} high priority` : ""}
        </p>
        {myTasks.length === 0 ? (
          <p className="text-[12px] text-white/30">No board tasks assigned to you.</p>
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
