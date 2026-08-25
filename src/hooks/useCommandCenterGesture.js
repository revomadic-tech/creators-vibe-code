import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { APP_TICKER_H } from "../components/layout/chrome";

const SETTLE_MS = 280;
const SETTLE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const ACTIVATE_PX = 16;
const AXIS_LOCK_RATIO = 1.35;
const COMMIT_PROGRESS = 0.32;
const GESTURE_TRAVEL_PX = 420;
const WHEEL_SETTLE_MS = 180;
/** Extra overscroll at an edge before the shell gesture arms. */
const OVERSCROLL_ARM_PX = 80;
/** Must rest at the scroll edge before overscroll can arm. */
const EDGE_READY_IDLE_MS = 180;
const BOUNCE_MAX_PX = 56;
const HANDLE = "[data-command-gesture-handle]";
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

function chainAtTop(from, boundary) {
  let node =
    from instanceof Element
      ? from
      : from instanceof Node
        ? from.parentElement
        : null;
  while (node) {
    if (node instanceof HTMLElement && isScrollable(node) && node.scrollTop > 1) {
      return false;
    }
    if (node === boundary) break;
    node = node.parentElement;
  }
  return true;
}

function chainAtBottom(from, boundary) {
  let node =
    from instanceof Element
      ? from
      : from instanceof Node
        ? from.parentElement
        : null;
  while (node) {
    if (node instanceof HTMLElement && isScrollable(node)) {
      const room = node.scrollHeight - node.clientHeight - node.scrollTop;
      if (room > 1) return false;
    }
    if (node === boundary) break;
    node = node.parentElement;
  }
  return true;
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

function canvasScroller(canvas) {
  if (!canvas) return null;
  return canvas.querySelector(CANVAS_SCROLL) || canvas;
}

function rubber(px) {
  if (!px) return 0;
  return BOUNCE_MAX_PX * (1 - Math.exp(-Math.abs(px) / 90)) * Math.sign(px);
}

/**
 * Admin.revo polarity: the studio shell slides DOWN to reveal Command Center
 * behind it. Scroll/swipe up (deltaY < 0) at the page top opens it.
 * On the open canvas, wheel-down scrolls the board; dismissal arms only once
 * the scroll chain is at its bottom (past the scroll floor) or the content
 * cannot scroll. The handles accept either direction so the gesture is
 * always reachable.
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
  const bounceArmRef = useRef(0);
  const edgeReadyRef = useRef(true);
  const edgeReadyTimer = useRef(null);
  const bounceTimer = useRef(null);

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

  const writeBounce = useCallback(
    (y, animate) => {
      const el = canvasScroller(canvasRef.current);
      if (!el) return;
      el.style.transition = animate
        ? `transform ${SETTLE_MS}ms ${SETTLE_EASE}`
        : "none";
      el.style.transform = y ? `translate3d(0, ${y}px, 0)` : "";
      el.style.willChange = y ? "transform" : "";
    },
    [canvasRef],
  );

  const releaseBounce = useCallback(() => {
    bounceArmRef.current = 0;
    if (bounceTimer.current) window.clearTimeout(bounceTimer.current);
    writeBounce(0, true);
    bounceTimer.current = window.setTimeout(() => {
      bounceTimer.current = null;
      writeBounce(0, false);
    }, SETTLE_MS);
  }, [writeBounce]);

  const pulseBounce = useCallback(
    (y) => {
      writeBounce(y, false);
      if (bounceTimer.current) window.clearTimeout(bounceTimer.current);
      bounceTimer.current = window.setTimeout(() => {
        bounceTimer.current = null;
        bounceArmRef.current = 0;
        writeBounce(0, true);
      }, WHEEL_SETTLE_MS);
    },
    [writeBounce],
  );

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
      bounceArmRef.current = 0;
      edgeReadyRef.current = false;
      writeBounce(0, false);
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
    [setOpen, writeShell, writeBounce, scheduleEdgeReady],
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
        writeBounce(0, false);
      }
      event.preventDefault();
      setLive(progressRef.current + -deltaY / travel());
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => {
        release(wheelOrigin.current ?? (openRef.current ? 1 : 0));
        wheelTimer.current = null;
      }, WHEEL_SETTLE_MS);
    },
    [setLive, release, writeBounce],
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
      if (e.deltaY >= 0) {
        overscrollArmRef.current = 0;
        if (chainAtTop(e.target, shell)) scheduleEdgeReady();
        else invalidateEdgeReady();
        return;
      }
      if (!chainAtTop(e.target, shell)) {
        invalidateEdgeReady();
        return;
      }
      if (!edgeReadyRef.current) {
        overscrollArmRef.current = 0;
        scheduleEdgeReady();
        return;
      }
      overscrollArmRef.current += -wheelDeltaToPx(e);
      if (overscrollArmRef.current < OVERSCROLL_ARM_PX) {
        e.preventDefault();
        return;
      }
      applyWheel(e.deltaY, e);
    };

    shell.addEventListener("wheel", onWheel, { passive: false });
    return () => shell.removeEventListener("wheel", onWheel);
  }, [shellRef, applyWheel, scheduleEdgeReady, invalidateEdgeReady]);

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

      if (e.deltaY < 0) {
        overscrollArmRef.current = 0;
        if (chainAtTop(e.target, canvas)) {
          // Nothing above can consume the wheel — rubber-band cue only.
          e.preventDefault();
          bounceArmRef.current += -wheelDeltaToPx(e);
          pulseBounce(rubber(bounceArmRef.current));
        } else {
          bounceArmRef.current = 0;
        }
        invalidateEdgeReady();
        return;
      }

      bounceArmRef.current = 0;
      if (!chainAtBottom(e.target, canvas)) {
        // The board can still scroll down — let the wheel move content
        // natively. Dismissal only arms once the chain is overscrolled
        // past the scroll floor.
        invalidateEdgeReady();
        return;
      }
      if (!edgeReadyRef.current) {
        overscrollArmRef.current = 0;
        scheduleEdgeReady();
        return;
      }
      overscrollArmRef.current += wheelDeltaToPx(e);
      if (overscrollArmRef.current < OVERSCROLL_ARM_PX) {
        e.preventDefault();
        pulseBounce(-rubber(overscrollArmRef.current));
        return;
      }
      applyWheel(e.deltaY, e);
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [
    canvasRef,
    applyWheel,
    open,
    scheduleEdgeReady,
    invalidateEdgeReady,
    pulseBounce,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onScroll = (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (!t.matches(CANVAS_SCROLL) && !isScrollable(t)) return;
      if (t.scrollTop > 1) invalidateEdgeReady();
      else if (!edgeReadyRef.current && !activeRef.current) scheduleEdgeReady();
    };
    canvas.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => canvas.removeEventListener("scroll", onScroll, true);
  }, [canvasRef, open, invalidateEdgeReady, scheduleEdgeReady]);

  useEffect(
    () => () => {
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
      if (bounceTimer.current) window.clearTimeout(bounceTimer.current);
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
      kind: "undecided",
    };
  }, []);

  const move = useCallback(
    (e) => {
      const session = sessionRef.current;
      if (!session || session.pointerId !== e.pointerId) return;
      const dy = e.clientY - session.startY;
      const dx = e.clientX - session.startX;
      const canvas = canvasRef.current;
      const shell = shellRef.current;

      if (session.kind === "bounce") {
        writeBounce(-rubber(Math.max(0, -dy)), false);
        return;
      }

      if (!session.activated) {
        if (Math.abs(dy) < ACTIVATE_PX && Math.abs(dx) < ACTIVATE_PX) return;
        if (Math.abs(dx) * AXIS_LOCK_RATIO > Math.abs(dy)) {
          sessionRef.current = null;
          return;
        }

        if (!session.fromHandle) {
          if (openRef.current) {
            if (dy < 0) {
              if (canvas && chainAtBottom(e.target, canvas)) {
                session.kind = "bounce";
                writeBounce(-rubber(-dy), false);
                return;
              }
              sessionRef.current = null;
              return;
            }
            if (canvas && !chainAtTop(e.target, canvas)) {
              sessionRef.current = null;
              return;
            }
            if (dy < OVERSCROLL_ARM_PX) {
              writeBounce(rubber(dy), false);
              return;
            }
          } else if (dy > 0 || (shell && !chainAtTop(e.target, shell))) {
            sessionRef.current = null;
            return;
          } else if (-dy < OVERSCROLL_ARM_PX) {
            return;
          }
        }

        session.activated = true;
        session.kind = "gesture";
        activeRef.current = true;
        writeBounce(0, false);
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
    [setLive, canvasRef, shellRef, writeBounce],
  );

  const end = useCallback(
    (e) => {
      const session = sessionRef.current;
      if (!session || session.pointerId !== e.pointerId) return;
      if (session.kind === "bounce" || !session.activated) {
        sessionRef.current = null;
        overscrollArmRef.current = 0;
        releaseBounce();
        return;
      }
      release(session.origin);
    },
    [release, releaseBounce],
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
        backgroundColor: canvasMounted ? "#050506" : undefined,
      }
    : {
        transform: `translate3d(0, ${y}px, 0) scale(${1 - p * 0.015})`,
        transformOrigin: "top center",
        transition: `transform ${SETTLE_MS}ms ${SETTLE_EASE}`,
        borderTopLeftRadius: p * 24,
        borderTopRightRadius: p * 24,
        boxShadow: p > 0.02 ? "0 -24px 60px -16px rgba(0,0,0,0.45)" : "none",
        pointerEvents: p > 0.98 ? "none" : undefined,
        backgroundColor: canvasMounted ? "#050506" : undefined,
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
