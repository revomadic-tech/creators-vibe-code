import { myTimeTracking } from "../../data/staffPanel";
import TeamChat from "./TeamChat";

function fmtMinutes(min) {
  if (!min) return "0m";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function TimeSnapshot() {
  const { week, todayMinutes, weeklyGoalHours, activityPct, streakDays, currentTask } =
    myTimeTracking;
  const weekMinutes = week.reduce((sum, d) => sum + d.minutes, 0);
  const maxDay = Math.max(...week.map((d) => d.minutes), 1);
  const goalPct = Math.min(100, Math.round((weekMinutes / (weeklyGoalHours * 60)) * 100));

  return (
    <div className="p-3 space-y-2.5">
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

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30">
            This week
          </p>
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
    </div>
  );
}

/**
 * Command Center staff column: time snapshot on top, Team Chat underneath.
 * Identity / clock live in CommandCenterNav — not repeated here.
 */
export default function StaffPanel({ className = "" }) {
  return (
    <aside
      className={`glass-panel rounded-2xl border border-white/[0.08] flex-col min-h-0 overflow-hidden ${className}`}
    >
      <div className="shrink-0 border-b border-white/[0.06]">
        <TimeSnapshot />
      </div>
      <TeamChat />
    </aside>
  );
}
