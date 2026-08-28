import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, X } from "lucide-react";
import { taskRef } from "../../lib/adTaskBrief";
import { APP_GUTTER, APP_NAV_H, APP_TICKER_H } from "./chrome";
import TaskBriefDetail from "../briefs/TaskBriefDetail";

const WIDTH_KEY = "revo.taskWidget.width.v2";
const MIN_WIDTH = 420;
const DEFAULT_WIDTH = 1060;

function clampWidth(width) {
  const max = Math.max(MIN_WIDTH, window.innerWidth - APP_GUTTER * 2);
  return Math.min(max, Math.max(MIN_WIDTH, width));
}

function loadWidth() {
  try {
    const n = Number(localStorage.getItem(WIDTH_KEY));
    if (Number.isFinite(n)) return clampWidth(n);
  } catch {
    /* ignore */
  }
  return DEFAULT_WIDTH;
}

export default function TaskWidget({ item, onClose }) {
  const [copied, setCopied] = useState(false);
  const [width, setWidth] = useState(loadWidth);
  const dragRef = useRef(null);
  const widthRef = useRef(width);
  const widgetRef = useRef(null);

  useEffect(() => {
    widthRef.current = width;
  }, [width]);

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

  useEffect(() => {
    if (!item) return undefined;
    const onPointerDown = (event) => {
      if (widgetRef.current?.contains(event.target)) return;
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [item, onClose]);

  useEffect(() => {
    const onResize = () => setWidth((w) => clampWidth(w));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const persistWidth = (next) => {
    try {
      localStorage.setItem(WIDTH_KEY, String(next));
    } catch {
      /* ignore */
    }
  };

  const onResizePointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startW: width };
  };

  const onResizePointerMove = (event) => {
    if (!dragRef.current) return;
    const next = clampWidth(dragRef.current.startW + (dragRef.current.startX - event.clientX));
    widthRef.current = next;
    setWidth(next);
  };

  const onResizePointerUp = (event) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    persistWidth(widthRef.current);
  };

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

  return (
    <div
      ref={widgetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-widget-title"
      data-command-interactive
      className="fixed z-[70] flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-[#F9F8F6] text-stone-800 shadow-2xl"
      style={{
        top: `calc(${APP_TICKER_H}px + ${APP_NAV_H}px + ${APP_GUTTER}px)`,
        bottom: `calc(${APP_NAV_H}px + ${APP_GUTTER}px)`,
        right: APP_GUTTER,
        width,
        maxWidth: `calc(100vw - ${APP_GUTTER * 2}px)`,
      }}
    >
      <button
        type="button"
        aria-label="Drag to expand task widget"
        title="Drag to expand"
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        onPointerCancel={onResizePointerUp}
        data-command-interactive
        className="absolute inset-y-0 left-0 z-20 w-3 cursor-ew-resize touch-none group/resize"
      >
        <span className="absolute inset-y-8 left-[5px] w-px rounded-full bg-stone-300/80 group-hover/resize:bg-stone-500 group-active/resize:bg-stone-700" />
        <span className="absolute left-1/2 top-1/2 flex h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full bg-stone-200/90 ring-1 ring-stone-300/80 group-hover/resize:bg-stone-300">
          <span className="h-0.5 w-0.5 rounded-full bg-stone-500" />
          <span className="h-0.5 w-0.5 rounded-full bg-stone-500" />
          <span className="h-0.5 w-0.5 rounded-full bg-stone-500" />
        </span>
      </button>

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
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100"
        >
          <X size={12} />
          Close
        </button>
      </footer>
    </div>
  );
}
