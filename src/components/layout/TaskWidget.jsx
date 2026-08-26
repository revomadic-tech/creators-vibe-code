import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Maximize2, X } from "lucide-react";
import { useCommandCenter } from "../../contexts/CommandCenterContext";
import { taskRef } from "../../lib/adTaskBrief";
import { APP_GUTTER, APP_NAV_H, APP_TICKER_H } from "./chrome";
import TaskBriefDetail from "../briefs/TaskBriefDetail";

export default function TaskWidget({ item, onClose }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { setOpen } = useCommandCenter();

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!item) return undefined;
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown, item]);

  if (!item) return null;

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#task/${taskRef(item)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  const openFullBrief = () => {
    onClose();
    setOpen(false);
    navigate({
      pathname: "/briefs",
      search: `?task=${encodeURIComponent(taskRef(item))}`,
      hash: "",
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-widget-title"
      data-command-interactive
      className="fixed z-[70] flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-[#F9F8F6] text-stone-800 shadow-2xl"
      style={{
        top: `calc(${APP_TICKER_H}px + ${APP_NAV_H}px + ${APP_GUTTER}px)`,
        bottom: `calc(${APP_NAV_H}px + ${APP_GUTTER}px)`,
        right: APP_GUTTER,
        width: `min(540px, calc(100vw - ${APP_GUTTER * 2}px))`,
      }}
    >
      <TaskBriefDetail
        key={item.id}
        item={item}
        density="compact"
        titleId="task-widget-title"
        idPrefix="task"
        headerActions={
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            title="Close (Esc)"
          >
            <X size={14} />
          </button>
        }
      />

      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-stone-200/80 bg-white/90 px-5 py-3">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-400 hover:bg-stone-100"
          title={copied ? "Copied" : "Copy link"}
        >
          <Copy size={12} />
          {copied ? "Copied" : "Copy link"}
        </button>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openFullBrief}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-400 hover:bg-stone-100"
          >
            <Maximize2 size={12} />
            Open full brief
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100"
          >
            <X size={12} />
            Close
          </button>
        </div>
      </footer>
    </div>
  );
}
