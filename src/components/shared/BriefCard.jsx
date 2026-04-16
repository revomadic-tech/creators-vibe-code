import { Clock, ChevronRight, MessageSquare } from "lucide-react";
import { StatusBadge, PriorityBadge, DeliverableTag } from "../ui/Tag";
import ProgressBar from "../ui/ProgressBar";
import AvatarStack from "../ui/AvatarStack";

export default function BriefCard({
  brief,
  onClick,
  onFullView,
  variant = "default",
}) {
  if (variant === "kanban") return <KanbanCard brief={brief} onClick={onClick} />;
  if (variant === "assigned") return <AssignedCard brief={brief} onClick={onClick} />;
  if (variant === "compact") return <CompactCard brief={brief} onClick={onClick} />;

  return (
    <div
      className="group flex gap-4 rounded-2xl overflow-hidden glass-card card-hover cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-48 flex-shrink-0 overflow-hidden">
        <img
          src={brief.thumbnail}
          alt=""
          className="w-full h-full object-cover img-cinematic transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 gradient-overlay-full" />
        <div className="absolute bottom-2.5 left-2.5">
          <PriorityBadge priority={brief.priority} />
        </div>
      </div>
      <div className="flex-1 py-3.5 pr-4 min-w-0">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="text-[13px] font-bold text-white leading-tight truncate pr-2">
            {brief.title}
          </h3>
          <StatusBadge status={brief.status} />
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/30 mb-2.5">
          <span className="text-white/45">{brief.product}</span>
          <span className="text-white/12">·</span>
          <span>{brief.partner}</span>
          <span className="text-white/12">·</span>
          <span>{brief.campaign}</span>
          <span className="text-white/12">·</span>
          <span className="flex items-center gap-0.5">
            <Clock size={9} /> {brief.dueDate}
          </span>
        </div>

        <div className="mb-3 max-w-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/20">
              {brief.tasksCompleted}/{brief.tasks} tasks
            </span>
            <span className="text-[10px] font-bold text-white/40">
              {brief.progress}%
            </span>
          </div>
          <ProgressBar value={brief.progress} colorByValue />
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {brief.deliverables.slice(0, 3).map((d) => (
            <DeliverableTag key={d.id} deliverable={d} />
          ))}
          {brief.deliverables.length > 3 && (
            <span className="text-[9px] text-white/15 self-center">
              +{brief.deliverables.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AvatarStack users={brief.assignees} max={3} />
            <span className="text-[10px] text-white/15">
              {brief.assignees.length} assigned
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/15">
            <span className="flex items-center gap-0.5">
              <MessageSquare size={9} /> {brief.comments}
            </span>
            {onFullView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFullView();
                }}
                className="p-1 rounded text-white/25 hover:text-white/60 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ brief, onClick }) {
  return (
    <div
      onClick={onClick}
      className="rounded-2xl glass-card card-hover cursor-pointer overflow-hidden"
    >
      <div className="relative h-24 overflow-hidden">
        <img
          src={brief.thumbnail}
          alt=""
          className="w-full h-full object-cover img-cinematic"
        />
        <div className="absolute inset-0 gradient-overlay-full" />
      </div>
      <div className="p-3">
        <h3 className="text-xs font-bold text-white mb-1.5 truncate">
          {brief.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-white/25 mb-2.5">
          <span>{brief.product}</span>
          <span className="text-white/10">·</span>
          <span>{brief.partner}</span>
        </div>
        <ProgressBar value={brief.progress} size="xs" />
        <div className="flex items-center justify-between mt-2.5">
          <AvatarStack users={brief.assignees} max={2} size="xs" />
          <span className="text-[9px] text-white/15 flex items-center gap-0.5">
            <Clock size={8} /> {brief.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
}

function AssignedCard({ brief, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group rounded-2xl overflow-hidden glass-card card-hover cursor-pointer"
    >
      <div className="relative h-28 overflow-hidden">
        <img
          src={brief.thumbnail}
          alt=""
          className="w-full h-full object-cover img-cinematic transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 gradient-overlay-full" />
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={brief.status} small />
        </div>
        <div className="absolute top-2.5 left-2.5">
          <PriorityBadge priority={brief.priority} />
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="text-[13px] font-bold text-white leading-tight truncate mb-1.5">
          {brief.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-white/30 mb-3">
          <span className="text-white/50">{brief.product}</span>
          <span className="text-white/12">·</span>
          <span>{brief.partner}</span>
          <span className="text-white/12">·</span>
          <span className="flex items-center gap-0.5">
            <Clock size={9} /> Due {brief.dueDate}
          </span>
        </div>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/25">
              {brief.tasksCompleted}/{brief.tasks} tasks
            </span>
            <span className="text-[10px] font-bold text-white/50">
              {brief.progress}%
            </span>
          </div>
          <ProgressBar value={brief.progress} size="xs" />
        </div>
        <div className="flex items-center justify-between">
          <AvatarStack users={brief.assignees} max={3} />
          <span className="text-[10px] text-white/20">
            {brief.deliverables.length} deliverables
          </span>
        </div>
      </div>
    </div>
  );
}

function CompactCard({ brief, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group rounded-2xl overflow-hidden glass-card card-hover cursor-pointer p-3.5"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xs font-bold text-white leading-tight truncate pr-2">
          {brief.title}
        </h3>
        <StatusBadge status={brief.status} small />
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-white/25 mb-2.5">
        <span>{brief.product}</span>
        <span className="text-white/10">·</span>
        <span>{brief.partner}</span>
      </div>
      <ProgressBar value={brief.progress} size="xs" />
      <div className="flex items-center justify-between mt-2.5">
        <AvatarStack users={brief.assignees} max={2} size="xs" />
        <span className="text-[9px] text-white/15">{brief.progress}%</span>
      </div>
    </div>
  );
}
