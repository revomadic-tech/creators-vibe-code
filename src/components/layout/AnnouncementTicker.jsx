import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Megaphone,
  MessageSquare,
  Pin,
  Target,
} from "lucide-react";
import { announcements, notifications } from "../../data/mockData";
import { useCommandCenter } from "../../contexts/CommandCenterContext";

const KIND_ICON = {
  review: Clock,
  comment: MessageSquare,
  approval: CheckCircle2,
  assignment: Target,
  delivery: CheckCircle2,
};

const KIND_SURFACE = {
  review: "bg-amber-400/22 text-amber-50 border-amber-300/35",
  comment: "bg-blue-400/22 text-blue-50 border-blue-300/35",
  approval: "bg-emerald-400/22 text-emerald-50 border-emerald-300/35",
  assignment: "bg-sky-400/22 text-sky-50 border-sky-300/35",
  delivery: "bg-teal-400/22 text-teal-50 border-teal-300/35",
};

const MARQUEE_PX_PER_SEC = 34;

function entryKey(entry) {
  return entry.kind === "announcement"
    ? `ann:${entry.announcement.id}`
    : `notif:${entry.notification.id}`;
}

function TickerChip({ entry, selected, inertClone, onSelect }) {
  const isAnn = entry.kind === "announcement";
  const urgent = isAnn && entry.announcement.priority === "urgent";
  const surface = isAnn
    ? urgent
      ? "bg-rose-400/25 text-rose-50 border-rose-300/40"
      : "bg-accent-red/20 text-white border-accent-red/35"
    : KIND_SURFACE[entry.notification.type] ||
      "bg-white/10 text-white border-white/20";

  const Icon = isAnn
    ? urgent
      ? AlertTriangle
      : Megaphone
    : KIND_ICON[entry.notification.type] || Megaphone;

  const title = isAnn ? entry.announcement.title : entry.notification.message;

  return (
    <button
      type="button"
      title={title}
      tabIndex={inertClone ? -1 : 0}
      aria-pressed={selected}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(entry);
      }}
      className={`flex items-center gap-1.5 shrink-0 h-7 px-2.5 rounded-full border shadow-sm cursor-pointer text-left max-w-[min(92vw,42rem)] transition-[filter,box-shadow] duration-150 ${surface} ${
        selected
          ? "ring-2 ring-offset-1 ring-offset-transparent ring-white/35 z-[1]"
          : "hover:brightness-110"
      }`}
    >
      <Icon size={10} className="shrink-0 opacity-85" />
      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider opacity-80">
        {isAnn ? (urgent ? "Urgent" : "Announce") : entry.notification.type}
      </span>
      {isAnn && entry.announcement.pinned && (
        <Pin size={10} className="shrink-0 opacity-70" strokeWidth={2.4} />
      )}
      <span className="min-w-0 truncate whitespace-nowrap text-[12px] font-medium">
        {isAnn ? (
          <>
            <span className="font-semibold">{entry.announcement.title}</span>
            {entry.announcement.body && (
              <>
                <span className="mx-1 opacity-45">·</span>
                {entry.announcement.body}
              </>
            )}
          </>
        ) : (
          entry.notification.message
        )}
      </span>
    </button>
  );
}

export default function AnnouncementTicker() {
  const { open, toggle, selectedTaskId, openTask, findTask } = useCommandCenter();
  const [selectedKey, setSelectedKey] = useState(null);
  const [copies, setCopies] = useState(2);

  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const setRef = useRef(null);
  const hoverRef = useRef(false);
  const pauseRef = useRef(false);

  const tickerItems = useMemo(() => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length > 0) {
      return unread.map((n) => ({ kind: "notification", notification: n }));
    }
    const now = Date.now();
    return announcements
      .filter((a) => !a.expiresAt || a.expiresAt > now)
      .map((a) => ({ kind: "announcement", announcement: a }));
  }, []);

  pauseRef.current = hoverRef.current || open;

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const firstSet = setRef.current;
    if (!viewport || !track || !firstSet || tickerItems.length === 0) return;

    let x = 0;
    let last = performance.now();
    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncCopies = () => {
      const setW = firstSet.offsetWidth;
      const viewW = viewport.offsetWidth;
      if (setW <= 0) return;
      const needed = Math.max(2, Math.ceil(viewW / setW) + 1);
      setCopies((c) => (c === needed ? c : needed));
    };

    syncCopies();
    const ro = new ResizeObserver(syncCopies);
    ro.observe(viewport);
    ro.observe(firstSet);

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (reduced.matches) {
        track.style.transform = "translate3d(0,0,0)";
        last = now;
        return;
      }
      const dt = Math.min(0.048, (now - last) / 1000);
      last = now;
      if (pauseRef.current) return;
      const w = firstSet.offsetWidth;
      if (w <= 0) return;
      x -= MARQUEE_PX_PER_SEC * dt;
      while (x <= -w) x += w;
      track.style.transform = `translate3d(${x}px,0,0)`;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [tickerItems]);

  const activate = (entry) => {
    setSelectedKey(entryKey(entry));
    const taskRef =
      entry.kind === "notification" ? entry.notification.taskRef : null;
    if (taskRef && openTask(taskRef)) {
      if (!open) toggle();
      return;
    }
    if (!open) toggle();
  };

  return (
    <div
      className="absolute top-0 inset-x-0 z-[60] overflow-hidden border-b border-white/[0.08]"
      style={{ height: "var(--app-ticker-h)" }}
      onMouseEnter={() => {
        hoverRef.current = true;
        pauseRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
        pauseRef.current = open;
      }}
    >
      <div className="absolute inset-0 bg-[#0c0e12]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-[-80%] opacity-50"
          style={{
            background:
              "conic-gradient(from 40deg at 50% 50%, #1a1210 0deg, rgba(232,68,46,0.28) 90deg, #0c0e12 180deg, rgba(242,107,58,0.22) 270deg, #1a1210 360deg)",
            animation: "header-swirl-spin 28s linear infinite",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-[#0c0e12]/45" />
      <div className="absolute left-[10px] top-[7px] bottom-[7px] w-[3px] rounded-full opacity-70 bg-gradient-to-b from-amber-400 via-orange-400 to-accent-red" />

      <div className="relative flex items-center h-full pl-6 pr-3">
        <div
          ref={viewportRef}
          className="flex-1 min-w-0 overflow-hidden relative h-7"
        >
          {tickerItems.length === 0 ? (
            <div className="h-full flex items-center px-1 text-[12px] italic text-white/40">
              You're all caught up
            </div>
          ) : (
            <>
              <div ref={trackRef} className="top-header-marquee-track h-full">
                {Array.from({ length: copies }, (_, dup) => (
                  <div
                    key={dup}
                    ref={dup === 0 ? setRef : undefined}
                    className="top-header-marquee-set"
                  >
                    {tickerItems.map((entry) => {
                      const key = entryKey(entry);
                      const linkedTask =
                        entry.kind === "notification"
                          ? findTask(entry.notification.taskRef)
                          : null;
                      return (
                        <TickerChip
                          key={`${dup}-${key}`}
                          entry={entry}
                          selected={
                            linkedTask
                              ? linkedTask.id === selectedTaskId
                              : selectedKey === key
                          }
                          inertClone={dup > 0}
                          onSelect={activate}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#0c0e12] to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#0c0e12] to-transparent"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
