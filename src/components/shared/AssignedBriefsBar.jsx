import { useState, useRef, useEffect } from "react";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  X,
  ArrowRight,
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "../ui/Tag";
import ProgressBar from "../ui/ProgressBar";

export default function AssignedBriefsBar({ briefs = [], onBriefClick, href }) {
  const [expanded, setExpanded] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setExpanded(false);
      }
    }
    if (expanded) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setExpanded(false);
    }
    if (expanded) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [expanded]);

  if (briefs.length === 0) return null;

  const highPriority = briefs.filter((b) => b.priority === "High");
  const nextDue = briefs.reduce((a, b) =>
    new Date(a.dueDate) < new Date(b.dueDate) ? a : b
  );

  return (
    <div className="relative" ref={popupRef}>
      {/* Bar */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className={`w-full flex items-center justify-between px-5 py-2.5 rounded-2xl glass-card transition-all duration-300 group cursor-pointer ${
          expanded
            ? "border-white/[0.12] bg-white/[0.04]"
            : "hover:bg-white/[0.03] hover:border-white/[0.08]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent-red/10 flex items-center justify-center flex-shrink-0">
            <FileText size={13} className="text-accent-red" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-white/70">
              {briefs.length} Assigned Brief{briefs.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-white/20 font-mono">&middot;</span>
            {highPriority.length > 0 && (
              <span className="text-[10px] font-semibold text-accent-red/70">
                {highPriority.length} High Priority
              </span>
            )}
            <span className="text-[10px] text-white/20 font-mono">&middot;</span>
            <span className="text-[10px] text-white/25">
              <Clock size={9} className="inline mr-1" />
              Next due: {nextDue.dueDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini avatar stack */}
          <div className="flex -space-x-1.5">
            {briefs
              .slice(0, 3)
              .flatMap((b) => b.assignees || [])
              .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
              .slice(0, 4)
              .map((a) => (
                <img
                  key={a.id}
                  src={a.avatar}
                  alt=""
                  className="w-5 h-5 rounded-full ring-1 ring-black/30"
                />
              ))}
          </div>
          <div
            className={`w-6 h-6 rounded-full bg-white/[0.04] flex items-center justify-center transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <ChevronDown size={13} className="text-white/30" />
          </div>
        </div>
      </button>

      {/* Expandable popup */}
      {expanded && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 glass-panel rounded-2xl border border-white/[0.08] overflow-hidden animate-expand-popup">
          {/* Popup header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <h3 className="text-[13px] font-bold text-white/70">
              Your Active Briefs
            </h3>
            <div className="flex items-center gap-2">
              {href && (
                <a
                  href={href}
                  className="flex items-center gap-1 text-[11px] text-accent-red/60 hover:text-accent-red transition-colors font-medium"
                >
                  All Briefs <ArrowRight size={11} />
                </a>
              )}
              <button
                onClick={() => setExpanded(false)}
                className="w-6 h-6 rounded-full hover:bg-white/[0.06] flex items-center justify-center transition-colors"
              >
                <X size={12} className="text-white/30" />
              </button>
            </div>
          </div>

          {/* Brief rows */}
          <div className="max-h-[320px] overflow-y-auto">
            {briefs.map((brief) => (
              <div
                key={brief.id}
                onClick={() => {
                  onBriefClick?.(brief);
                  setExpanded(false);
                }}
                className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer group/row border-b border-white/[0.03] last:border-0"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={brief.thumbnail}
                    alt=""
                    className="w-full h-full object-cover img-cinematic"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-white/70 truncate group-hover/row:text-white transition-colors">
                    {brief.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/20">
                    <span>{brief.product}</span>
                    {brief.partner && (
                      <>
                        <span className="text-white/10">&middot;</span>
                        <span>{brief.partner}</span>
                      </>
                    )}
                    <span className="text-white/10">&middot;</span>
                    <Clock size={9} className="text-white/15" />
                    <span>{brief.dueDate}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="w-20 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-red/40 rounded-full"
                        style={{ width: `${brief.progress}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-white/20 font-mono w-7 text-right">
                      {brief.progress}%
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <PriorityBadge priority={brief.priority} />
                  <StatusBadge status={brief.status} small />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
