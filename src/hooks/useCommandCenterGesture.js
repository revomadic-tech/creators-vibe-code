import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { APP_TICKER_H } from "../components/layout/chrome";

const SETTLE_MS = 280;
const SETTLE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const ACTIVATE_PX = 40;
const AXIS_LOCK_RATIO = 1.6;
const COMMIT_PROGRESS = 0.45;
const GESTURE_TRAVEL_PX = 480;
const WHEEL_SETTLE_MS = 220;
/** Extra overscroll past the studio top before Command Center arms. */
const OPEN_ARM_PX = 180;
/** Extra pull at the Command Center top before close arms. */
const CLOSE_ARM_PX = 96;
/** Rest at the scroll edge long enough that trackpad inertia cannot arm the gesture. */
const EDGE_READY_IDLE_MS = 480;
const HANDLE = "[data-command-gesture-handle]";
const PAGE_SCROLL = "[data-shell-page-scroll]";
const CANVAS_SCROLL = "[data-command-canvas-scroll]";

const clamp01 = (v) => Math.min(1, Math.max(0, v));

function isHandle(target) {
  return target instanceof Element && Boolean(target.closest(HANDLE));
}

function isScrollable(el) {
  const oy = getComputedStyle(el).overflowY;
  if (oy !== "auto" && oy !== "scroll" && oy !== "overlay") return false;
  return el.scrollHeight > el.clientHeight + 1;
}

function atTop(el) {
  return el.scrollTop <= 1;
}

function atBottom(el) {
  return el.scrollHeight - el.clientHeight - el.scrollTop <= 1;
}

/**
 * Only the page-level scroller gates the shell gesture. Nested lists
 * (group tables, chat, dropdowns) must not block swipe-up / swipe-down.
 * Pages with no scroller are already at the edge.
 */
function pageScrollerAtEdge(boundary, selector, edge) {
  if (!boundary) return false;
  const scrollers = [...boundary.querySelectorAll(selector)].filter(
    (el) => el instanceof HTMLElement && isScrollable(el),
  );
  if (scrollers.length === 0) return true;
  return scrollers.every(edge);
}

function ignoreTarget(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest(HANDLE)) return false;
  return Boolean(
    target.closest(
      '[role="dialog"], [role="menu"], [data-command-interactive], input, textarea, select, [contenteditable="true"]',
    ),
  );
}

function travel() {
  return Math.min(GESTURE_TRAVEL_PX, Math.max(220, window.innerHeight * 0.65));
}

function visualTravel() {
  return Math.max(160, window.innerHeight - APP_TICKER_H);
}

function wheelDeltaToPx(e) {
  let dy = e.deltaY;
  if (e.deltaMode === 1) dy *= 16;
  else if (e.deltaMode === 2) dy *= window.innerHeight;
  return dy;
}

/**
 * Swipe up at the studio top opens Command Center. Swipe down at the
 * Command Center top (touch) or past the board floor (wheel) returns to
 * studio. Nested tables do not gate either gesture. A long idle +
 * overscroll arm keeps trackpad inertia from firing it.
 */
export function useCommandCenterGesture(open, setOpen, shellRef, canvasRef) {
  const [progress, setProgress] = useState(open ? 1 : 0);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);

  const progressRef = useRef(progress);
  const openRef = useRef(open);
  const sessionRef = useRef(null);
  const activeRef = useRef(false);
  const settleTimer = useRef(null);
  const wheelTimer = useRef(null);
  const wheelOrigin = useRef(null);
  const overscrollArmRef = useRef(0);
  const edgeReadyRef = useRef(true);
  const edgeReadyTimer = useRef(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    openRef.current = open;
    if (!activeRef.current && !settling) setProgress(open ? 1 : 0);
  }, [open, settling]);

  const clearEdgeReadyTimer = useCallback(() => {
    if (edgeReadyTimer.current != null) {
      window.clearTimeout(edgeReadyTimer.current);
      edgeReadyTimer.current = null;
    }
  }, []);

  const invalidateEdgeReady = useCallback(() => {
    edgeReadyRef.current = false;
    overscrollArmRef.current = 0;
    clearEdgeReadyTimer();
  }, [clearEdgeReadyTimer]);

  const scheduleEdgeReady = useCallback(() => {
    clearEdgeReadyTimer();
    edgeReadyTimer.current = window.setTimeout(() => {
      edgeReadyTimer.current = null;
      edgeReadyRef.current = true;
    }, EDGE_READY_IDLE_MS);
  }, [clearEdgeReadyTimer]);

  const writeClip = useCallback(
    (next, animate) => {
      const el = canvasRef.current;
      if (!el) return;
      const p = clamp01(next);
      const hidden = Math.max(0, visualTravel() - p * visualTravel());
      el.style.setProperty(
        "transition",
        animate ? `clip-path ${SETTLE_MS}ms ${SETTLE_EASE}` : "none",
      );
      el.style.setProperty("clip-path", `inset(0 0 ${hidden}px 0)`);
      el.style.setProperty("-webkit-clip-path", `inset(0 0 ${hidden}px 0)`);
    },
    [canvasRef],
  );

  const writeShell = useCallback(
    (next, animate) => {
      const el = shellRef.current;
      if (!el) return;
      const p = clamp01(next);
      el.style.setProperty(
        "transition",
        animate ? `transform ${SETTLE_MS}ms ${SETTLE_EASE}` : "none",
        "important",
      );
      el.style.setProperty(
        "transform",
        `translate3d(0, ${p * visualTravel()}px, 0) scale(${1 - p * 0.015})`,
        "important",
      );
      writeClip(p, animate);
    },
    [shellRef, writeClip],
  );

  const commit = useCallback(
    (nextOpen) => {
      const target = nextOpen ? 1 : 0;
      activeRef.current = false;
      sessionRef.current = null;
      wheelOrigin.current = null;
      overscrollArmRef.current = 0;
      edgeReadyRef.current = false;
      setDragging(false);
      setSettling(true);
      writeShell(target, true);
      setProgress(target);
      setOpen(nextOpen);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        setSettling(false);
        settleTimer.current = null;
      }, SETTLE_MS);
      scheduleEdgeReady();
    },
    [setOpen, writeShell, scheduleEdgeReady],
  );

  const release = useCallback(
    (origin) => {
      const p = progressRef.current;
      if (Math.abs(p - origin) >= COMMIT_PROGRESS) {
        commit(p > origin);
        return;
      }
      commit(openRef.current);
    },
    [commit],
  );

  const setLive = useCallback(
    (next) => {
      const p = clamp01(next);
      progressRef.current = p;
      setProgress(p);
      writeShell(p, false);
    },
    [writeShell],
  );

  const applyWheel = useCallback(
    (deltaY, event) => {
      if (!activeRef.current) {
        activeRef.current = true;
        wheelOrigin.current = progressRef.current;
        setDragging(true);
      }
      event.preventDefault();
      setLive(progressRef.current + -deltaY / travel());
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => {
        release(wheelOrigin.current ?? (openRef.current ? 1 : 0));
        wheelTimer.current = null;
      }, WHEEL_SETTLE_MS);
    },
    [setLive, release],
  );

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX) * 1.1) return;
      if (ignoreTarget(e.target) || settleTimer.current != null) return;
      if (activeRef.current && wheelOrigin.current != null) {
        applyWheel(e.deltaY, e);
        return;
      }
      if (openRef.current) return;

      if (isHandle(e.target)) {
        applyWheel(-Math.abs(e.deltaY), e);
        return;
      }

      const pageAtTop = pageScrollerAtEdge(shell, PAGE_SCROLL, atTop);
      if (e.deltaY >= 0) {
        overscrollArmRef.current = 0;
        if (pageAtTop) scheduleEdgeReady();
        else invalidateEdgeReady();
        return;
      }
      if (!pageAtTop) {
        invalidateEdgeReady();
        return;
      }
      if (!edgeReadyRef.current) {
        overscrollArmRef.current = 0;
        scheduleEdgeReady();
        return;
      }
      overscrollArmRef.current += -wheelDeltaToPx(e);
      if (overscrollArmRef.current < OPEN_ARM_PX) {
        e.preventDefault();
        return;
      }
      applyWheel(e.deltaY, e);
    };

    shell.addEventListener("wheel", onWheel, { passive: false });
    return () => shell.removeEventListener("wheel", onWheel);
  }, [shellRef, applyWheel, scheduleEdgeReady, invalidateEdgeReady]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const onScroll = (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.matches(PAGE_SCROLL) && !isScrollable(t)) return;
      if (!atTop(t)) invalidateEdgeReady();
      else if (!edgeReadyRef.current && !activeRef.current) scheduleEdgeReady();
    };
    shell.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => shell.removeEventListener("scroll", onScroll, true);
  }, [shellRef, invalidateEdgeReady, scheduleEdgeReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX) * 1.1) return;
      if (ignoreTarget(e.target) || settleTimer.current != null) return;
      if (activeRef.current && wheelOrigin.current != null) {
        applyWheel(e.deltaY, e);
        return;
      }
      if (progressRef.current < 0.5) return;

      if (isHandle(e.target)) {
        applyWheel(Math.abs(e.deltaY), e);
        return;
      }

      const canvasAtBottom = pageScrollerAtEdge(canvas, CANVAS_SCROLL, atBottom);
      if (e.deltaY <= 0) {
        overscrollArmRef.current = 0;
        if (canvasAtBottom) scheduleEdgeReady();
        else invalidateEdgeReady();
        return;
      }
      // Downward wheel goes to studio, but never by stealing board scroll.
      if (!canvasAtBottom) {
        invalidateEdgeReady();
        return;
      }
      if (!edgeReadyRef.current) {
        overscrollArmRef.current = 0;
        scheduleEdgeReady();
        return;
      }
      overscrollArmRef.current += wheelDeltaToPx(e);
      if (overscrollArmRef.current < CLOSE_ARM_PX) {
        e.preventDefault();
        return;
      }
      applyWheel(e.deltaY, e);
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [canvasRef, applyWheel, open, scheduleEdgeReady, invalidateEdgeReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onScroll = (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.matches(CANVAS_SCROLL) && !isScrollable(t)) return;
      if (!atBottom(t)) invalidateEdgeReady();
      else if (!edgeReadyRef.current && !activeRef.current) scheduleEdgeReady();
    };
    canvas.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => canvas.removeEventListener("scroll", onScroll, true);
  }, [canvasRef, open, invalidateEdgeReady, scheduleEdgeReady]);

  useEffect(
    () => () => {
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
      clearEdgeReadyTimer();
    },
    [clearEdgeReadyTimer],
  );

  const begin = useCallback((e) => {
    if (ignoreTarget(e.target)) return;
    const fromHandle = isHandle(e.target);
    if (e.pointerType === "mouse" && !fromHandle) return;
    sessionRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startX: e.clientX,
      origin: progressRef.current,
      activated: false,
      fromHandle,
    };
  }, []);

  const move = useCallback(
    (e) => {
      const session = sessionRef.current;
      if (!session || session.pointerId !== e.pointerId) return;
      const dy = e.clientY - session.startY;
      const dx = e.clientX - session.startX;

      if (!session.activated) {
        if (Math.abs(dy) < ACTIVATE_PX && Math.abs(dx) < ACTIVATE_PX) return;
        if (Math.abs(dx) * AXIS_LOCK_RATIO > Math.abs(dy)) {
          sessionRef.current = null;
          return;
        }

        if (!session.fromHandle) {
          const opening = dy < 0;
          if (opening && openRef.current) {
            sessionRef.current = null;
            return;
          }
          if (!opening && !openRef.current) {
            sessionRef.current = null;
            return;
          }
          const ok = opening
            ? pageScrollerAtEdge(shellRef.current, PAGE_SCROLL, atTop)
            : pageScrollerAtEdge(canvasRef.current, CANVAS_SCROLL, atTop);
          if (!ok) {
            sessionRef.current = null;
            return;
          }
          if (opening && -dy < OPEN_ARM_PX) return;
          if (!opening && dy < CLOSE_ARM_PX) return;
        }

        session.activated = true;
        activeRef.current = true;
        setDragging(true);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
      if (session.fromHandle) {
        const signed = openRef.current ? Math.abs(dy) : -Math.abs(dy);
        setLive(session.origin + -signed / travel());
        return;
      }
      setLive(session.origin + -dy / travel());
    },
    [setLive, canvasRef, shellRef],
  );

  const end = useCallback(
    (e) => {
      const session = sessionRef.current;
      if (!session || session.pointerId !== e.pointerId) return;
      if (!session.activated) {
        sessionRef.current = null;
        overscrollArmRef.current = 0;
        return;
      }
      release(session.origin);
    },
    [release],
  );

  const p = clamp01(progress);
  const live = dragging || settling || activeRef.current;
  const y = typeof window === "undefined" ? 0 : p * visualTravel();
  const canvasMounted = open || p > 0.001 || live;
  const hiddenBelow =
    typeof window === "undefined" ? 0 : Math.max(0, visualTravel() - y);

  const shellStyle = live
    ? {
        transformOrigin: "top center",
        willChange: "transform",
        pointerEvents: p > 0.98 ? "none" : undefined,
        backgroundColor: canvasMounted ? "rgba(22, 22, 24, 0.88)" : undefined,
      }
    : {
        transform: `translate3d(0, ${y}px, 0) scale(${1 - p * 0.015})`,
        transformOrigin: "top center",
        transition: `transform ${SETTLE_MS}ms ${SETTLE_EASE}`,
        borderTopLeftRadius: p * 24,
        borderTopRightRadius: p * 24,
        boxShadow: p > 0.02 ? "0 -24px 60px -16px rgba(0,0,0,0.45)" : "none",
        pointerEvents: p > 0.98 ? "none" : undefined,
        backgroundColor: canvasMounted ? "rgba(22, 22, 24, 0.88)" : undefined,
      };

  const canvasStyle = live
    ? { willChange: "clip-path" }
    : {
        clipPath: `inset(0 0 ${hiddenBelow}px 0)`,
        WebkitClipPath: `inset(0 0 ${hiddenBelow}px 0)`,
      };

  useLayoutEffect(() => {
    if (!canvasMounted) return;
    writeClip(progressRef.current, false);
  }, [canvasMounted, writeClip]);

  return {
    progress: p,
    dragging: live,
    settling,
    canvasMounted,
    isOpenVisual: p > 0.45,
    shellStyle,
    canvasStyle,
    pointerBind: {
      onPointerDown: begin,
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
    },
    toggle: () => {
      if (activeRef.current || settleTimer.current) return;
      commit(!openRef.current);
    },
    setOpen: (next) => commit(Boolean(next)),
  };
}
