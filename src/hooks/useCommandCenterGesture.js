import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { APP_TICKER_H, SETTLE_MS, SETTLE_EASE } from "../components/layout/chrome";

const ACTIVATE_PX = 16;
const DOCK_PROGRESS = 0.45;
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
  const [hasOpened, setHasOpened] = useState(Boolean(open));
  const [docked, setDocked] = useState(open);

  const progressRef = useRef(progress);
  const openRef = useRef(open);
  const hasOpenedRef = useRef(Boolean(open));
  const dockedRef = useRef(open);
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
      el.style.pointerEvents = p < 0.02 ? "none" : "";
      // Keep content visible whenever the canvas is mounted; clip-path hides it.
      el.style.removeProperty("content-visibility");
    },
    [canvasRef],
  );

  const writeRoot = useCallback((p, { animate = false, live = false, committedOpen } = {}) => {
    const root = document.documentElement;
    root.style.setProperty("--cc-progress", String(p));
    root.dataset.ccDocked = p > DOCK_PROGRESS ? "true" : "false";
    root.dataset.ccSettling = animate ? "true" : "false";
    root.dataset.ccDragging = live ? "true" : "false";
    if (committedOpen != null) {
      root.dataset.ccOpen = committedOpen ? "true" : "false";
    }
  }, []);

  const syncDocked = useCallback((p) => {
    const next = p > DOCK_PROGRESS;
    if (next === dockedRef.current) return;
    dockedRef.current = next;
    setDocked(next);
  }, []);

  const markOpened = useCallback(() => {
    if (hasOpenedRef.current) return;
    hasOpenedRef.current = true;
    setHasOpened(true);
  }, []);

  useEffect(() => {
    openRef.current = open;
    if (!activeRef.current && !settling) {
      const p = open ? 1 : 0;
      setProgress(p);
      syncDocked(p);
      writeRoot(p, { committedOpen: open });
    }
  }, [open, settling, syncDocked, writeRoot]);

  const writeShell = useCallback(
    (next, animate, live = false) => {
      const p = clamp01(next);
      progressRef.current = p;
      writeRoot(p, { animate, live });
      const el = shellRef.current;
      if (!el) {
        writeClip(p, animate);
        return;
      }
      const radius = `${p * 24}px`;
      const shadow = p > 0.02 ? "0 -24px 60px -16px rgba(0,0,0,0.45)" : "none";
      el.style.setProperty(
        "transition",
        animate
          ? `transform ${SETTLE_MS}ms ${SETTLE_EASE}, border-radius ${SETTLE_MS}ms ${SETTLE_EASE}, box-shadow ${SETTLE_MS}ms ${SETTLE_EASE}`
          : "none",
        "important",
      );
      el.style.setProperty(
        "transform",
        `translate3d(0, ${p * visualTravel()}px, 0) scale(${1 - p * 0.015})`,
        "important",
      );
      el.style.borderTopLeftRadius = radius;
      el.style.borderTopRightRadius = radius;
      el.style.boxShadow = shadow;
      el.style.pointerEvents = p > 0.98 ? "none" : "";
      writeClip(p, animate);
    },
    [shellRef, writeClip, writeRoot],
  );

  const commit = useCallback(
    (nextOpen) => {
      const target = nextOpen ? 1 : 0;
      progressRef.current = target;
      openRef.current = nextOpen;
      activeRef.current = false;
      sessionRef.current = null;
      wheelOrigin.current = null;
      overscrollArmRef.current = 0;
      bounceArmRef.current = 0;
      edgeReadyRef.current = false;
      writeBounce(0, false);
      if (nextOpen) markOpened();
      setDragging(false);
      setSettling(true);
      writeShell(target, true, false);
      writeRoot(target, { animate: true, live: false, committedOpen: nextOpen });
      setProgress(target);
      syncDocked(target);
      setOpen(nextOpen);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        setSettling(false);
        settleTimer.current = null;
        writeRoot(progressRef.current, {
          animate: false,
          live: false,
          committedOpen: openRef.current,
        });
      }, SETTLE_MS);
      scheduleEdgeReady();
    },
    [setOpen, writeShell, writeBounce, writeRoot, scheduleEdgeReady, markOpened, syncDocked],
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
      if (p > 0.001) markOpened();
      writeShell(p, false, true);
      syncDocked(p);
    },
    [writeShell, markOpened, syncDocked],
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
    hasOpened,
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
  }, [canvasRef, open, hasOpened, invalidateEdgeReady, scheduleEdgeReady]);

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
        markOpened();
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
    [setLive, canvasRef, shellRef, writeBounce, markOpened],
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
  const canvasMounted = hasOpened || open || live;

  // Keep transform/clip-path off the React style object. Switching that object
  // when `live` flips would wipe the imperative writes from setLive/commit.
  const shellStyle = {
    transformOrigin: "top center",
    willChange: live ? "transform" : undefined,
    backgroundColor: canvasMounted ? "#050506" : undefined,
  };

  const canvasStyle = {
    willChange: live ? "clip-path" : undefined,
  };

  useLayoutEffect(() => {
    const initial = openRef.current ? 1 : 0;
    writeRoot(initial, { committedOpen: openRef.current });
    writeShell(initial, false, false);
    // Initial chrome only — live updates go through setLive/commit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    writeShell(progressRef.current, settling && !dragging, dragging);
  }, [canvasMounted, settling, dragging, writeShell]);

  const toggle = useCallback(() => {
    if (activeRef.current) return;
    commit(!openRef.current);
  }, [commit]);

  const setOpenCommit = useCallback((next) => commit(Boolean(next)), [commit]);

  return {
    progress: p,
    dragging: live,
    settling,
    canvasMounted,
    isOpenVisual: docked,
    shellStyle,
    canvasStyle,
    pointerBind: {
      onPointerDown: begin,
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
    },
    toggle,
    setOpen: setOpenCommit,
  };
}
