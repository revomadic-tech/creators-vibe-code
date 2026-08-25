import { useMemo, useState } from "react";
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
      className={`flex items-center gap-1.5 shrink-0 h-7 px-2.5 rounded-full border shadow-sm transition-all cursor-pointer text-left max-w-[min(92vw,42rem)] ${surface} ${
        selected
          ? "ring-2 ring-offset-1 ring-offset-transparent ring-white/35 scale-[1.03] z-[1]"
          : "hover:brightness-110 active:scale-[0.98]"
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
  const { open, toggle } = useCommandCenter();
  const [hovered, setHovered] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

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

  const marqueeSeconds = Math.max(28, tickerItems.length * 10);

  const activate = (entry) => {
    setSelectedKey(entryKey(entry));
    if (!open) toggle();
  };

  return (
    <div
      className="absolute top-0 inset-x-0 z-[60] overflow-hidden border-b border-white/[0.08]"
      style={{ height: "var(--app-ticker-h)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute inset-0 bg-[#0c0e12]" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[220%] -translate-x-1/2 -translate-y-1/2 opacity-50"
        style={{
          background:
            "conic-gradient(from 40deg at 50% 50%, #1a1210 0deg, rgba(232,68,46,0.28) 90deg, #0c0e12 180deg, rgba(242,107,58,0.22) 270deg, #1a1210 360deg)",
          animation: "header-swirl-spin 28s linear infinite",
        }}
      />
      <div className="absolute inset-0 bg-[#0c0e12]/45" />
      <div className="absolute left-[10px] top-[7px] bottom-[7px] w-[3px] rounded-full opacity-70 bg-gradient-to-b from-amber-400 via-orange-400 to-accent-red" />

      <div className="relative flex items-center h-full pl-6 pr-3">
        <div className="flex-1 min-w-0 overflow-hidden relative h-7">
          {tickerItems.length === 0 ? (
            <div className="h-full flex items-center px-1 text-[12px] italic text-white/40">
              You're all caught up
            </div>
          ) : (
            <>
              <div
                className="top-header-marquee-track h-full"
                data-paused={hovered || open || selectedKey ? "true" : undefined}
                style={{ animationDuration: `${marqueeSeconds}s` }}
              >
                {[0, 1].map((dup) => (
                  <div
                    key={dup}
                    className="flex items-center gap-3 px-1 h-full"
                  >
                    {tickerItems.map((entry) => {
                      const key = entryKey(entry);
                      return (
                        <TickerChip
                          key={`${dup}-${key}`}
                          entry={entry}
                          selected={selectedKey === key}
                          inertClone={dup === 1}
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
