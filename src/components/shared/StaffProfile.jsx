import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Clock, LogOut, Mail, MapPin, Settings } from "lucide-react";
import { currentUser } from "../../data/mockData";
import useAuth from "../../hooks/useAuth";
import { useLogout } from "../../api/auth/hooks";
import {
  ACCOUNT_TYPES,
  resolveAccountType,
  subscribeAccountType,
  writeAccountTypeOverride,
} from "../../lib/accountType";
import {
  myTimeTracking,
  timeOffBalance,
  timeOffRequests as seedRequests,
} from "../../data/staffPanel";

const PTO_TYPES = ["Vacation", "Sick", "Personal", "Unpaid"];
const MENU_GAP = 8;

const STATUS_STYLE = {
  Approved: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Pending: "text-amber-800 bg-amber-50 border-amber-200",
  Denied: "text-rose-700 bg-rose-50 border-rose-200",
};

const MENU_SHELL =
  "fixed z-[80] overflow-hidden rounded-2xl border border-stone-200 bg-[#F9F8F6] text-stone-800 shadow-2xl fade-in";

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

function navChip() {
  return "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 text-stone-500 hover:text-stone-800 hover:bg-stone-900/[0.05]";
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function inputClass() {
  return "w-full rounded-xl border border-stone-200 bg-white py-2 px-3 text-[12px] text-stone-800 placeholder:text-stone-400 outline-none focus:border-stone-400";
}

function TimeStats() {
  const { todayMinutes, activityPct, streakDays } = myTimeTracking;
  return (
    <div className="grid grid-cols-3 gap-1.5">
      <div className="rounded-xl border border-stone-200 bg-white px-2 py-1.5">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-stone-400">Today</p>
        <p className="text-[13px] font-bold font-mono text-stone-800 mt-0.5">{fmtMinutes(todayMinutes)}</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white px-2 py-1.5">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-stone-400">Activity</p>
        <p className="text-[13px] font-bold font-mono text-emerald-700 mt-0.5">{activityPct}%</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white px-2 py-1.5">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-stone-400">Streak</p>
        <p className="text-[13px] font-bold font-mono text-stone-800 mt-0.5">{streakDays}d</p>
      </div>
    </div>
  );
}

function TrackingBar({ clockedIn, onToggle }) {
  const { currentTask } = myTimeTracking;
  if (!clockedIn) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-left"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-stone-300 flex-shrink-0" />
        <p className="text-[10px] text-stone-500 truncate">Clocked out — tap to clock in</p>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-left"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 pulse-dot flex-shrink-0" />
      <p className="text-[10px] text-stone-700 truncate">
        Tracking <span className="font-mono text-emerald-700">{currentTask.ref}</span> ·{" "}
        {currentTask.title}
      </p>
      <span className="ml-auto font-mono text-[10px] text-emerald-700 flex-shrink-0">
        {currentTask.elapsed}
      </span>
    </button>
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
        <p className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">This week</p>
        <p className="text-[9px] font-mono text-stone-500">
          {fmtMinutes(weekMinutes)} <span className="text-stone-400">/ {weeklyGoalHours}h goal</span>
        </p>
      </div>
      <div className="flex items-end gap-1 h-12">
        {week.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1 min-w-0 h-full justify-end">
            <div
              className={`w-full rounded-[3px] ${d.today ? "bg-rose-500" : d.minutes ? "bg-stone-300" : "bg-stone-100"}`}
              style={{ height: `${Math.max(6, (d.minutes / maxDay) * 100)}%` }}
              title={`${d.day} · ${fmtMinutes(d.minutes)}`}
            />
            <span className={`text-[8px] font-mono ${d.today ? "text-rose-600" : "text-stone-400"}`}>
              {d.day[0]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-stone-200 overflow-hidden">
        <div className="h-full rounded-full bg-accent-teal/70" style={{ width: `${goalPct}%` }} />
      </div>
    </div>
  );
}

function profileFromAuth(user) {
  const name =
    user?.name ||
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    currentUser.name;
  return {
    name,
    email: user?.email || currentUser.email,
    avatar: user?.avatar || user?.image || currentUser.avatar,
    role: user?.role || user?.title || "",
    workspace: user?.workspace || currentUser.workspace,
    timezone: user?.timezone || currentUser.timezone,
  };
}

function menuPosition(anchor, width) {
  if (!anchor) return { top: 12, left: 12 };
  const r = anchor.getBoundingClientRect();
  const maxLeft = window.innerWidth - width - 12;
  const top = Math.max(12, Math.min(r.top, window.innerHeight - 24));
  const left = Math.max(12, Math.min(r.right + MENU_GAP, maxLeft));
  return { top, left };
}

export default function StaffProfile({ variant = "rail" }) {
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const [panel, setPanel] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 12, left: 12 });
  const { user } = useAuth();
  const { mutate: signOut, isPending: signingOut } = useLogout();
  const profile = profileFromAuth(user);
  const [accountType, setAccountType] = useState(() => resolveAccountType(user));
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

  useEffect(() => {
    const sync = () => setAccountType(resolveAccountType(user));
    sync();
    return subscribeAccountType(sync);
  }, [user]);

  const usedPto = Object.values(timeOffBalance).reduce((n, b) => n + b.used, 0);
  const totalPto = Object.values(timeOffBalance).reduce((n, b) => n + b.total, 0);
  const menuWidth = panel === "timeoff" ? 380 : panel === "settings" ? 320 : 340;

  const syncPos = () => {
    setMenuPos(menuPosition(btnRef.current, menuWidth));
  };

  useEffect(() => {
    if (!panel) return undefined;
    syncPos();
    const onReposition = () => syncPos();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [panel, menuWidth]);

  useEffect(() => {
    const handler = (e) => {
      if (btnRef.current?.contains(e.target) || rootRef.current?.contains(e.target)) return;
      setPanel(null);
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

  const rail = variant === "rail";

  const menu = panel
    ? createPortal(
        <div ref={rootRef} data-command-interactive>
          {panel === "profile" && (
            <div className={`${MENU_SHELL} w-[340px]`} style={menuPos}>
              <div className="px-4 py-3.5 border-b border-stone-200/80 flex items-center gap-3">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-11 h-11 rounded-full object-cover border border-stone-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-stone-900 truncate">{profile.name}</p>
                  <p className="text-[11px] text-stone-500 truncate">
                    {accountType}{profile.role ? ` · ${profile.role}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPanel("settings")}
                  className={navChip()}
                >
                  <Settings size={14} />
                  Settings
                </button>
              </div>
              <dl className="px-4 py-2.5 space-y-2.5">
                <div className="flex items-center gap-2.5 text-[12px] text-stone-700">
                  <Mail size={13} className="text-stone-400 flex-shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[12px] text-stone-700">
                  <MapPin size={13} className="text-stone-400 flex-shrink-0" />
                  <span>
                    {profile.workspace}
                    {profile.timezone ? ` · ${profile.timezone}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[12px] text-stone-700">
                  <Clock size={13} className="text-stone-400 flex-shrink-0" />
                  <span>
                    {clockedIn ? "Clocked in" : "Clocked out"} · {fmtMinutes(myTimeTracking.todayMinutes)} today
                  </span>
                </div>
              </dl>
              <div className="px-4 pb-3 space-y-2">
                <TimeStats />
                <TrackingBar clockedIn={clockedIn} onToggle={() => setClockedIn((v) => !v)} />
              </div>
              <div className="px-4 py-3 border-t border-stone-200/80 flex items-center justify-between">
                <p className="text-[10px] text-stone-400">
                  {usedPto} of {totalPto} PTO days used
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPanel("timeoff")}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Request time off
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    disabled={signingOut}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                  >
                    <LogOut size={11} />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {panel === "timeoff" && (
            <div className={`${MENU_SHELL} w-[380px]`} style={menuPos}>
              <div className="px-4 py-3 border-b border-stone-200/80">
                <p className="text-[13px] font-semibold text-stone-900">Request time off</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Balances reset January 1.</p>
              </div>
              <div className="px-4 pt-3">
                <WeekHours />
              </div>
              <div className="grid grid-cols-3 gap-1.5 px-4 pt-3">
                {Object.entries(timeOffBalance).map(([key, bal]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-stone-200 bg-white px-2 py-1.5"
                  >
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-stone-400">
                      {key}
                    </p>
                    <p className="text-[13px] font-bold font-mono text-stone-800 mt-0.5">
                      {bal.total - bal.used}
                      <span className="text-stone-400 text-[10px] font-medium">/{bal.total}d</span>
                    </p>
                  </div>
                ))}
              </div>
              <form onSubmit={submitPto} className="px-4 py-3 space-y-2.5 border-b border-stone-200/80">
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Type">
                    <select
                      value={ptoType}
                      onChange={(e) => setPtoType(e.target.value)}
                      className={inputClass()}
                    >
                      {PTO_TYPES.map((t) => (
                        <option key={t} value={t}>
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
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 bg-white border border-stone-200"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-stone-800 truncate">
                        {req.type}
                        <span className="text-stone-400 font-medium"> · {req.days}d</span>
                      </p>
                      <p className="text-[10px] text-stone-400 truncate">
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
            <div className={`${MENU_SHELL} w-[320px]`} style={menuPos}>
              <div className="px-4 py-3 border-b border-stone-200/80">
                <p className="text-[13px] font-semibold text-stone-900">Profile settings</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Staff preferences for this workspace.</p>
              </div>
              <div className="px-4 py-3 space-y-2 border-b border-stone-200/80">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">
                  Account type
                </p>
                <div className="flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-white p-1">
                  {ACCOUNT_TYPES.map((type) => {
                    const selected = accountType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setAccountType(type);
                          writeAccountTypeOverride(type);
                        }}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                          selected
                            ? "bg-stone-900 text-white"
                            : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-stone-400">
                  Manager sees Admin and Review Pipeline decisions. Member is the default account type.
                </p>
              </div>
              <div className="px-4 py-3 space-y-2 border-b border-stone-200/80">
                <TimeStats />
                <TrackingBar clockedIn={clockedIn} onToggle={() => setClockedIn((v) => !v)} />
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
                    className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-stone-100 text-left"
                  >
                    <span
                      className={`w-8 h-[18px] rounded-full relative flex-shrink-0 transition-colors ${
                        prefs[item.id] ? "bg-emerald-600" : "bg-stone-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          prefs[item.id] ? "left-[16px]" : "left-0.5"
                        }`}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold text-stone-800">{item.label}</span>
                      <span className="block text-[10px] text-stone-400">{item.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-stone-200/80 flex items-center justify-between gap-2">
                <p className="text-[11px] text-stone-400">
                  Workspace <span className="text-stone-700 font-medium">{profile.workspace}</span>
                </p>
                <button
                  type="button"
                  onClick={() => signOut()}
                  disabled={signingOut}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  <LogOut size={12} />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => togglePanel("profile")}
        aria-expanded={panel === "profile"}
        aria-label={`${profile.name} profile`}
        title={profile.name}
        className={
          rail
            ? `relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                panel ? "bg-white/10" : "hover:bg-white/10"
              }`
            : `relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg overflow-hidden transition-colors ${
                panel ? "ring-1 ring-[#E8C4A0]/50" : "hover:bg-[#E8C4A0]/15"
              }`
        }
      >
        <img
          src={profile.avatar}
          alt=""
          className={
            rail
              ? "h-8 w-8 rounded-full object-cover border border-[#E8C4A0]/35"
              : "h-7 w-7 rounded-lg object-cover"
          }
        />
      </button>
      {menu}
    </>
  );
}
