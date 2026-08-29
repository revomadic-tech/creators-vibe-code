import { useCallback, useEffect, useRef, useState } from "react";
import {
  Expand,
  GripVertical,
  Lock,
  LockOpen,
  Maximize2,
  Minimize2,
  Shrink,
  X,
} from "lucide-react";
import { APP_CONTENT_INSET, APP_GUTTER, APP_NAV_H } from "./chrome";

const GUTTER = APP_GUTTER;
const MIN_W = 360;
const MIN_H = 320;
const MINIMIZED_H = 36;
const MINIMIZED_W = 280;
const DEFAULT_W = 520;

function chromeBtn(active) {
  return `size-7 rounded-full border flex items-center justify-center transition-colors ${
    active
      ? "bg-[#E8C4A0] text-[#161618] border-[#E8C4A0]"
      : "bg-white/[0.04] border-white/[0.1] text-white/45 hover:text-white hover:border-white/20"
  }`;
}

export default function HoveringWidget({
  open,
  onClose,
  children,
  ariaLabel = "Details",
  defaultWidth = DEFAULT_W,
  stack = 0,
  zIndex = 55,
}) {
  const asideRef = useRef(null);
  const drag = useRef(null);
  const [locked, setLocked] = useState(false);
  const [docked, setDocked] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [geo, setGeo] = useState(() => {
    const h = Math.round(window.innerHeight * 0.8);
    return {
      right: GUTTER * 2 + stack * 28,
      bottom: APP_NAV_H + GUTTER + stack * 28,
      w: defaultWidth,
      h,
    };
  });
  const geoRef = useRef(geo);
  geoRef.current = geo;

  const topOffset = APP_CONTENT_INSET;

  const clampGeo = useCallback((next) => {
    const maxW = Math.max(MIN_W, window.innerWidth - GUTTER * 2);
    const maxH = Math.max(MIN_H, window.innerHeight - topOffset - GUTTER);
    const w = Math.min(maxW, Math.max(MIN_W, next.w));
    const h = Math.min(maxH, Math.max(MIN_H, next.h));
    const maxRight = Math.max(GUTTER, window.innerWidth - w - GUTTER);
    const maxBottom = Math.max(GUTTER, window.innerHeight - topOffset - h);
    return {
      w,
      h,
      right: Math.min(maxRight, Math.max(GUTTER, next.right)),
      bottom: Math.min(maxBottom, Math.max(GUTTER, next.bottom)),
    };
  }, [topOffset]);

  useEffect(() => {
    const onResize = () => setGeo((g) => clampGeo(g));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampGeo]);

  useEffect(() => {
    if (!open || locked) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, locked, onClose]);

  useEffect(() => {
    if (!open || locked) return undefined;
    const onPointerDown = (e) => {
      if (asideRef.current?.contains(e.target)) return;
      if (
        e.target.closest?.(
          "[data-hovering-widget],[data-command-interactive],[data-widget-chrome]",
        )
      ) {
        return;
      }
      onClose?.();
    };
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown, true);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open, locked, onClose]);

  const startMove = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("button")) return;
    e.preventDefault();
    const g = geoRef.current;
    drag.current = {
      mode: "move",
      startX: e.clientX,
      startY: e.clientY,
      startRight: g.right,
      startBottom: g.bottom,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const startResize = (axis) => (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const g = geoRef.current;
    drag.current = {
      mode: "resize",
      axis,
      startX: e.clientX,
      startY: e.clientY,
      startW: g.w,
      startH: g.h,
      startRight: g.right,
      startBottom: g.bottom,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    if (d.mode === "move") {
      setGeo((g) =>
        clampGeo({
          ...g,
          right: d.startRight - (e.clientX - d.startX),
          bottom: d.startBottom - (e.clientY - d.startY),
        }),
      );
      return;
    }
    const nw =
      d.axis === "y" ? d.startW : d.startW + (d.startX - e.clientX);
    const nh =
      d.axis === "x" ? d.startH : d.startH + (d.startY - e.clientY);
    setGeo(
      clampGeo({
        right: d.startRight,
        bottom: d.startBottom,
        w: nw,
        h: nh,
      }),
    );
  };

  const onPointerUp = (e) => {
    if (!drag.current) return;
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  if (!open) return null;

  const canInteract = !fullscreen && !docked && !minimized;
  const style = fullscreen
    ? {
        top: topOffset,
        right: GUTTER,
        bottom: APP_NAV_H + GUTTER,
        left: GUTTER,
        width: "auto",
        height: "auto",
      }
    : docked
      ? {
          top: topOffset,
          right: GUTTER,
          bottom: APP_NAV_H + GUTTER,
          width: Math.min(1100, Math.max(MIN_W, window.innerWidth - 220)),
          height: "auto",
        }
      : minimized
        ? {
            right: geo.right,
            bottom: geo.bottom,
            width: MINIMIZED_W,
            height: MINIMIZED_H,
          }
        : {
            right: geo.right,
            bottom: geo.bottom,
            width: geo.w,
            height: geo.h,
          };

  const hint = minimized
    ? "Minimized · double-click to expand"
    : docked
      ? "Split view · page stays on the left"
      : fullscreen
        ? "Fullscreen · click shrink to restore"
        : locked
          ? "Locked · drag to move"
          : "Drag to move · edges to resize";

  return (
    <>
      {!locked && !docked && !fullscreen && (
        <div className="fixed inset-0 z-[45] pointer-events-none" />
      )}
      <aside
        ref={asideRef}
        data-hovering-widget
        role="dialog"
        aria-label={ariaLabel}
        aria-modal={!locked}
        className="fixed flex flex-col glass-panel rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden"
        style={{ ...style, zIndex }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {canInteract && (
          <>
            <div
              onPointerDown={startResize("x")}
              className="hidden md:flex absolute top-9 left-0 bottom-0 w-2.5 z-30 cursor-ew-resize items-center justify-center group/rx"
              aria-hidden
            >
              <span className="h-10 w-1 rounded-full bg-white/0 group-hover/rx:bg-white/25 transition-colors" />
            </div>
            <div
              onPointerDown={startResize("y")}
              className="hidden md:flex absolute top-0 left-0 right-0 h-2.5 z-30 cursor-ns-resize items-center justify-center group/ry"
              aria-hidden
            >
              <span className="w-10 h-1 rounded-full bg-white/0 group-hover/ry:bg-white/25 transition-colors" />
            </div>
            <div
              onPointerDown={startResize("xy")}
              className="hidden md:block absolute top-0 left-0 size-4 z-40 cursor-nwse-resize"
              aria-hidden
            />
          </>
        )}

        <div
          onPointerDown={canInteract ? startMove : undefined}
          onDoubleClick={(e) => {
            if (e.target.closest("button")) return;
            e.preventDefault();
            setMinimized((v) => !v);
          }}
          className={`flex items-center justify-between gap-2 h-9 pl-3 pr-2 border-b border-white/[0.06] bg-black/20 shrink-0 select-none ${
            canInteract ? "cursor-move touch-none" : ""
          } ${minimized ? "border-b-0" : ""}`}
        >
          <span className="inline-flex items-center gap-1.5 text-white/30 min-w-0">
            <GripVertical size={13} className="shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35 truncate">
              {hint}
            </span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDocked((v) => !v);
                if (!docked) setFullscreen(false);
              }}
              aria-pressed={docked}
              title={
                docked
                  ? "Exit split view — return panel to floating"
                  : "Open in split view — page stays on the left; this panel fills the right"
              }
              className={`${chromeBtn(docked)} text-[15px] font-semibold leading-none`}
            >
              +
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreen((v) => !v);
                if (!fullscreen) setDocked(false);
              }}
              aria-pressed={fullscreen}
              title={fullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
              className={chromeBtn(fullscreen)}
            >
              {fullscreen ? <Shrink size={12} /> : <Expand size={12} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMinimized((v) => !v);
              }}
              aria-pressed={minimized}
              title={minimized ? "Expand panel" : "Minimize to bottom"}
              className={chromeBtn(false)}
            >
              {minimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLocked((v) => !v);
              }}
              aria-pressed={locked}
              title={
                locked
                  ? "Unlock — outside click and Esc will dismiss again"
                  : "Lock — keep open; ignore outside clicks"
              }
              className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                locked
                  ? "bg-[#E8C4A0] text-[#161618] border-[#E8C4A0]"
                  : "bg-white/[0.04] text-white/55 border-white/[0.1] hover:border-white/20 hover:text-white"
              }`}
            >
              {locked ? <Lock size={12} /> : <LockOpen size={12} />}
              {locked ? "Locked" : "Lock"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              title="Close"
              className={chromeBtn(false)}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
            {children}
          </div>
        )}
      </aside>
    </>
  );
}
