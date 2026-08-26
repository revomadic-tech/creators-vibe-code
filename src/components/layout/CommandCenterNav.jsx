import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarOff,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  MapPin,
  Pause,
  Play,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { currentUser, notifications } from "../../data/mockData";
import { APP_GUTTER } from "./chrome";
import { useCommandCenter } from "../../contexts/CommandCenterContext";
import {
  myTimeTracking,
  timeOffBalance,
  timeOffRequests as seedRequests,
} from "../../data/staffPanel";

const PTO_TYPES = ["Vacation", "Sick", "Personal", "Unpaid"];

const STATUS_STYLE = {
  Approved: "text-accent-teal bg-accent-teal/10 border-accent-teal/20",
  Pending: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  Denied: "text-accent-red bg-accent-red/10 border-accent-red/20",
};

function firstName(name) {
  return (name || "").split(" ")[0] || name;
}

function fmtMinutes(min) {
  if (!min) return "0m";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatRange(start, end) {
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  const opts = { month: "short", day: "numeric" };
  if (start === end) return a.toLocaleDateString("en-US", opts);
  return `${a.toLocaleDateString("en-US", opts)} – ${b.toLocaleDateString("en-US", opts)}`;
}

function iconBtn(active) {
  return `w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
    active
      ? "bg-white/[0.12] text-white"
      : "text-white/40 hover:text-white hover:bg-white/[0.08]"
  }`;
}

function navChip(active) {
  return `flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 ${
    active
      ? "bg-white/[0.12] text-white"
      : "text-white/50 hover:text-white hover:bg-white/[0.06]"
  }`;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-white/30">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function inputClass() {
  return "w-full rounded-xl bg-white/[0.04] border border-white/[0.08] py-2 px-3 text-[12px] text-white placeholder:text-white/25 outline-none focus:border-white/15";
}

function TimeStats() {
  const { todayMinutes, activityPct, streakDays } = myTimeTracking;
  return (
    <div className="grid grid-cols-3 gap-1.5">
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-2 py-1.5">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-white/30">Today</p>
        <p className="text-[13px] font-bold font-mono text-white mt-0.5">{fmtMinutes(todayMinutes)}</p>
      </div>
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-2 py-1.5">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-white/30">Activity</p>
        <p className="text-[13px] font-bold font-mono text-accent-teal mt-0.5">{activityPct}%</p>
      </div>
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-2 py-1.5">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-white/30">Streak</p>
        <p className="text-[13px] font-bold font-mono text-white mt-0.5">{streakDays}d</p>
      </div>
    </div>
  );
}

function TrackingBar({ clockedIn }) {
  const { currentTask } = myTimeTracking;
  if (!clockedIn) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] px-2.5 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white/25 flex-shrink-0" />
        <p className="text-[10px] text-white/45 truncate">Clocked out</p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-xl bg-accent-teal/[0.08] border border-accent-teal/20 px-2.5 py-2">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-teal pulse-dot flex-shrink-0" />
      <p className="text-[10px] text-white/70 truncate">
        Tracking <span className="font-mono text-accent-teal">{currentTask.ref}</span> ·{" "}
        {currentTask.title}
      </p>
      <span className="ml-auto font-mono text-[10px] text-accent-teal flex-shrink-0">
        {currentTask.elapsed}
      </span>
    </div>
  );
}

function WeekHours() {
  const { week, weeklyGoalHours } = myTimeTracking;
  const weekMinutes = week.reduce((sum, d) => sum + d.minutes, 0);
  const maxDay = Math.max(...week.map((d) => d.minutes), 1);
  const goalPct = Math.min(100, Math.round((weekMinutes / (weeklyGoalHours * 60)) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30">This week</p>
        <p className="text-[9px] font-mono text-white/40">
          {fmtMinutes(weekMinutes)} <span className="text-white/20">/ {weeklyGoalHours}h goal</span>
        </p>
      </div>
      <div className="flex items-end gap-1 h-12">
        {week.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1 min-w-0 h-full justify-end">
            <div
              className={`w-full rounded-[3px] ${d.today ? "bg-accent-red/80" : d.minutes ? "bg-white/25" : "bg-white/[0.06]"}`}
              style={{ height: `${Math.max(6, (d.minutes / maxDay) * 100)}%` }}
              title={`${d.day} · ${fmtMinutes(d.minutes)}`}
            />
            <span className={`text-[8px] font-mono ${d.today ? "text-accent-red" : "text-white/25"}`}>
              {d.day[0]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full bg-accent-teal/70" style={{ width: `${goalPct}%` }} />
      </div>
    </div>
  );
}

const SETTLE_MS = 280;
const SETTLE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function CommandCenterNav({ progress = 0, settling = false }) {
  const navRef = useRef(null);
  const { setOpen, openTask } = useCommandCenter();
  const [panel, setPanel] = useState(null);
  const [clockedIn, setClockedIn] = useState(true);
  const [requests, setRequests] = useState(seedRequests);
  const [ptoType, setPtoType] = useState("Vacation");
  const [ptoStart, setPtoStart] = useState("");
  const [ptoEnd, setPtoEnd] = useState("");
  const [ptoNote, setPtoNote] = useState("");
  const [ptoSent, setPtoSent] = useState(false);
  const [prefs, setPrefs] = useState({
    mentions: true,
    digest: true,
    timeReminders: false,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const usedPto = Object.values(timeOffBalance).reduce((n, b) => n + b.used, 0);
  const totalPto = Object.values(timeOffBalance).reduce((n, b) => n + b.total, 0);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setPanel(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (progress < 0.4) setPanel(null);
  }, [progress]);

  const togglePanel = (id) => setPanel((prev) => (prev === id ? null : id));

  const submitPto = (e) => {
    e.preventDefault();
    if (!ptoStart || !ptoEnd) return;
    const start = new Date(`${ptoStart}T00:00:00`);
    const end = new Date(`${ptoEnd}T00:00:00`);
    const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
    setRequests((prev) => [
      {
        id: `pto-${Date.now()}`,
        type: ptoType,
        start: ptoStart,
        end: ptoEnd,
        days,
        status: "Pending",
        note: ptoNote.trim() || "—",
      },
      ...prev,
    ]);
    setPtoNote("");
    setPtoSent(true);
    window.setTimeout(() => setPtoSent(false), 2400);
  };

  const live = progress > 0.08;
  const interactive = progress > 0.35;

  return (
    <div
      ref={navRef}
      data-command-interactive
      className="command-center-nav absolute top-0 z-20"
      style={{
        left: APP_GUTTER,
        right: APP_GUTTER,
        opacity: Math.min(1, progress * 1.35),
        pointerEvents: interactive ? "auto" : "none",
        visibility: live ? "visible" : "hidden",
        transition: settling ? `opacity ${SETTLE_MS}ms ${SETTLE_EASE}` : "none",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 w-full min-w-0 px-4 py-1.5 glass-nav shadow-lg shadow-black/30 rounded-xl overflow-hidden"
        style={{ backgroundColor: "rgba(25, 30, 41, 0.42)" }}
      >
        <div className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto">
        <button
          type="button"
          data-command-gesture-handle
          onClick={() => setOpen(false)}
          aria-label="Go down to studio"
          title="Studio"
          className="flex flex-col items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white/70 hover:text-white hover:bg-white/[0.1] transition-all duration-200 touch-none cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <ChevronUp size={11} strokeWidth={2.6} className="text-white/30 -mb-0.5" />
          <ChevronDown size={11} strokeWidth={2.6} />
        </button>
        <div className="flex items-center gap-2 pl-0.5 pr-1.5 flex-shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-white/[0.08]"
          />
          <div className="leading-tight pr-1 hidden sm:block">
            <p className="text-[11px] font-semibold text-white">{firstName(currentUser.name)}</p>
            <p className="text-[9px] text-white/35">Command Center</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => togglePanel("profile")}
          className={navChip(panel === "profile")}
        >
          <UserIcon size={14} strokeWidth={panel === "profile" ? 2.2 : 1.5} />
          Profile
        </button>
        <button
          type="button"
          onClick={() => togglePanel("timeoff")}
          className={navChip(panel === "timeoff")}
        >
          <CalendarOff size={14} strokeWidth={panel === "timeoff" ? 2.2 : 1.5} />
          Time off
        </button>
        <button
          type="button"
          onClick={() => togglePanel("settings")}
          className={navChip(panel === "settings")}
        >
          <Settings size={14} strokeWidth={panel === "settings" ? 2.2 : 1.5} />
          Settings
        </button>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => {
            setClockedIn((v) => !v);
            setPanel(null);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-200 ${
            clockedIn
              ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/20"
              : "text-white/45 hover:text-white hover:bg-white/[0.06]"
          }`}
          aria-label={clockedIn ? "Clock out" : "Clock in"}
        >
          {clockedIn ? <Pause size={11} /> : <Play size={11} />}
          <span className="font-mono">{fmtMinutes(myTimeTracking.todayMinutes)}</span>
          <span className="text-[9px] font-medium opacity-70 hidden md:inline">
            {clockedIn ? "tracking" : "clocked out"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => togglePanel("alerts")}
          className={`${iconBtn(panel === "alerts")} relative`}
          aria-label="Notifications"
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent-red rounded-full pulse-dot" />
          )}
        </button>
        </div>
      </div>

      {panel === "profile" && (
        <div className="absolute left-4 top-full mt-2 w-[340px] glass-panel rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden fade-in">
          <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover border border-white/10"
            />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[11px] text-white/40 truncate">{currentUser.role}</p>
            </div>
          </div>
          <dl className="px-4 py-2.5 space-y-2.5">
            <div className="flex items-center gap-2.5 text-[12px] text-white/65">
              <Mail size={13} className="text-white/30 flex-shrink-0" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[12px] text-white/65">
              <MapPin size={13} className="text-white/30 flex-shrink-0" />
              <span>
                {currentUser.workspace}
                {currentUser.timezone ? ` · ${currentUser.timezone}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[12px] text-white/65">
              <Clock size={13} className="text-white/30 flex-shrink-0" />
              <span>
                {clockedIn ? "Clocked in" : "Clocked out"} · {fmtMinutes(myTimeTracking.todayMinutes)} today
              </span>
            </div>
          </dl>
          <div className="px-4 pb-3 space-y-2">
            <TimeStats />
            <TrackingBar clockedIn={clockedIn} />
          </div>
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-[10px] text-white/30">
              {usedPto} of {totalPto} PTO days used
            </p>
            <button
              type="button"
              onClick={() => setPanel("timeoff")}
              className="text-[11px] font-semibold text-accent-red/80 hover:text-accent-red"
            >
              Request time off
            </button>
          </div>
        </div>
      )}

      {panel === "timeoff" && (
        <div className="absolute left-4 top-full mt-2 w-[380px] glass-panel rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden fade-in">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-[13px] font-semibold text-white">Request time off</p>
            <p className="text-[11px] text-white/35 mt-0.5">Balances reset January 1.</p>
          </div>
          <div className="px-4 pt-3">
            <WeekHours />
          </div>
          <div className="grid grid-cols-3 gap-1.5 px-4 pt-3">
            {Object.entries(timeOffBalance).map(([key, bal]) => (
              <div
                key={key}
                className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-2 py-1.5"
              >
                <p className="text-[8px] font-semibold uppercase tracking-wider text-white/30">
                  {key}
                </p>
                <p className="text-[13px] font-bold font-mono text-white mt-0.5">
                  {bal.total - bal.used}
                  <span className="text-white/30 text-[10px] font-medium">/{bal.total}d</span>
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={submitPto} className="px-4 py-3 space-y-2.5 border-b border-white/[0.06]">
            <div className="grid grid-cols-3 gap-2">
              <Field label="Type">
                <select
                  value={ptoType}
                  onChange={(e) => setPtoType(e.target.value)}
                  className={inputClass()}
                >
                  {PTO_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#121214]">
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="From">
                <input
                  type="date"
                  required
                  value={ptoStart}
                  onChange={(e) => {
                    setPtoStart(e.target.value);
                    if (!ptoEnd) setPtoEnd(e.target.value);
                  }}
                  className={inputClass()}
                />
              </Field>
              <Field label="To">
                <input
                  type="date"
                  required
                  min={ptoStart || undefined}
                  value={ptoEnd}
                  onChange={(e) => setPtoEnd(e.target.value)}
                  className={inputClass()}
                />
              </Field>
            </div>
            <Field label="Note">
              <input
                type="text"
                value={ptoNote}
                onChange={(e) => setPtoNote(e.target.value)}
                placeholder="Optional note for your lead…"
                className={inputClass()}
              />
            </Field>
            <button
              type="submit"
              className="w-full h-9 rounded-xl bg-accent-red text-white text-[12px] font-bold hover:bg-accent-red/90 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              {ptoSent ? (
                <>
                  <Check size={13} /> Request sent
                </>
              ) : (
                "Submit request"
              )}
            </button>
          </form>
          <div className="max-h-[180px] overflow-y-auto p-2 space-y-1">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 bg-white/[0.03] border border-white/[0.05]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-white/85 truncate">
                    {req.type}
                    <span className="text-white/30 font-medium"> · {req.days}d</span>
                  </p>
                  <p className="text-[10px] text-white/35 truncate">
                    {formatRange(req.start, req.end)}
                    {req.note ? ` · ${req.note}` : ""}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 px-1.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${
                    STATUS_STYLE[req.status] || STATUS_STYLE.Pending
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {panel === "settings" && (
        <div className="absolute left-4 top-full mt-2 w-[320px] glass-panel rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden fade-in">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-[13px] font-semibold text-white">Profile settings</p>
            <p className="text-[11px] text-white/35 mt-0.5">Staff preferences for this workspace.</p>
          </div>
          <div className="px-4 py-3 space-y-2 border-b border-white/[0.06]">
            <TimeStats />
            <TrackingBar clockedIn={clockedIn} />
          </div>
          <div className="p-3 space-y-1">
            {[
              { id: "mentions", label: "Mention notifications", hint: "Threads and board @mentions" },
              { id: "digest", label: "Daily activity digest", hint: "Weekday morning summary" },
              { id: "timeReminders", label: "Time tracking reminders", hint: "Nudge if idle over 15m" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPrefs((p) => ({ ...p, [item.id]: !p[item.id] }))}
                className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-white/[0.04] text-left"
              >
                <span
                  className={`w-8 h-[18px] rounded-full relative flex-shrink-0 transition-colors ${
                    prefs[item.id] ? "bg-accent-teal" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      prefs[item.id] ? "left-[16px]" : "left-0.5"
                    }`}
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-white/80">{item.label}</span>
                  <span className="block text-[10px] text-white/30">{item.hint}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-white/[0.06] text-[11px] text-white/35">
            Workspace <span className="text-white/60 font-medium">{currentUser.workspace}</span>
          </div>
        </div>
      )}

      {panel === "alerts" && (
        <div className="absolute right-4 top-full mt-2 w-80 glass-panel rounded-2xl shadow-2xl shadow-black/40 overflow-hidden fade-in">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-[13px] font-semibold text-white">Notifications</span>
            <span className="text-[10px] text-accent-red font-semibold px-2 py-0.5 bg-accent-red/10 rounded-full">
              {unreadCount} new
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <button
                type="button"
                key={n.id}
                onClick={() => {
                  if (n.taskRef) openTask(n.taskRef);
                  setPanel(null);
                }}
                className={`w-full text-left px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${
                  !n.read ? "bg-white/[0.015]" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {!n.read && (
                    <div className="w-1.5 h-1.5 bg-accent-red rounded-full mt-1.5 flex-shrink-0" />
                  )}
                  <div className={!n.read ? "" : "pl-[18px]"}>
                    <p className="text-[13px] text-white/70 leading-snug">{n.message}</p>
                    <p className="text-[11px] text-white/25 mt-1">{n.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
