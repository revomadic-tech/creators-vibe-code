import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  MessageSquare,
  SendHorizontal,
} from "lucide-react";
import {
  AD_ANGLE_COLORS,
  AD_EDITING_STYLE_COLORS,
  AD_PAIN_POINT_COLORS,
  AD_PERFORMANCE_COLORS,
  AD_PLATFORM_COLORS,
  AD_PRIORITY_COLORS,
  AD_PRODUCT_COLORS,
  AD_STATUS_COLORS,
} from "../../data/adProduction";
import { currentUser, findWorkspaceUser, teamMembers } from "../../data/mockData";
import { staffActivity, taskThreads } from "../../data/staffPanel";
import {
  PHASE_BY_ID,
  formatTaskDate,
  isTaskOverdue,
  withAlpha,
} from "../../lib/adTaskBrief";

const MEMBER_BY_ID = Object.fromEntries(teamMembers.map((m) => [m.id, m]));

const TASK_TABS = [
  { id: "details", label: "Details" },
  { id: "adCopy", label: "Ad Copy" },
];

function isUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdReadPill({ label, color }) {
  if (!label) return null;
  return (
    <span
      className="inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em]"
      style={{
        backgroundColor: color ? withAlpha(color, 0.18) : "#f5f5f4",
        color: color || "#44403c",
        borderColor: color ? withAlpha(color, 0.4) : "#e7e5e4",
      }}
      title={label}
    >
      {label}
    </span>
  );
}

function PersonChip({ name }) {
  const member = findWorkspaceUser(name);
  const label = member?.name || name;
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      {member?.avatar ? (
        <img src={member.avatar} alt="" className="h-5 w-5 rounded-full object-cover ring-1 ring-stone-200" />
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-[8px] font-bold text-stone-600">
          {initials(name)}
        </span>
      )}
      <span className="truncate text-[12px] text-stone-700" title={member?.role}>
        {label}
      </span>
    </span>
  );
}

function MetaCell({ label, children }) {
  return (
    <div className="min-w-0 bg-white px-3 py-2">
      <div className="mb-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </div>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-stone-400">
      {children}
    </div>
  );
}

function LongText({ value, empty = "No brief yet." }) {
  if (!value) return <p className="text-[12.5px] italic text-stone-400">{empty}</p>;
  if (isUrl(value)) {
    return (
      <a
        href={value.trim()}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-stone-800 hover:text-stone-950"
      >
        <Link2 size={12} />
        Open doc
        <ExternalLink size={10} className="opacity-50" />
      </a>
    );
  }
  return (
    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-stone-700">{value}</p>
  );
}

function buildTimeline(item) {
  const events = [];
  const phase = PHASE_BY_ID[item.phase];
  if (item.sendDate) {
    events.push({
      id: "sent",
      kind: "system",
      text: `Moved into ${phase?.title || "production"}`,
      time: formatTaskDate(item.sendDate),
    });
  }
  for (const a of staffActivity.filter((row) => row.target === item.name)) {
    const member = MEMBER_BY_ID[a.memberId];
    events.push({
      id: a.id,
      kind: a.kind,
      text: `${member?.name || "Teammate"} ${a.text} ${a.target}`,
      time: a.time,
      avatar: member?.avatar,
      name: member?.name,
    });
  }
  const thread = taskThreads.find((t) => t.taskRef === item.name);
  if (thread?.lastMessage) {
    const member = MEMBER_BY_ID[thread.lastMessage.memberId];
    events.push({
      id: `${thread.id}-last`,
      kind: "comment",
      text: thread.lastMessage.text,
      time: thread.lastMessage.time,
      avatar: member?.avatar,
      name: member?.name,
    });
  }
  if (events.length === 0) {
    events.push({
      id: "status",
      kind: "system",
      text: `Status is ${item.status}`,
      time: formatTaskDate(item.dueDate) || "Now",
    });
  }
  return events;
}

export default function TaskBriefDetail({
  item,
  density = "compact",
  titleId,
  headerActions,
  idPrefix = "task",
}) {
  const [draft, setDraft] = useState("");
  const [copiedCopy, setCopiedCopy] = useState(false);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const page = density === "page";

  const phase = item ? PHASE_BY_ID[item.phase] : null;
  const timeline = useMemo(() => (item ? buildTimeline(item) : []), [item]);
  const overdue = item ? isTaskOverdue(item) : false;

  if (!item) return null;

  const copyAdCopy = async () => {
    const text = String(item.adCopy || "").trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCopy(true);
      window.setTimeout(() => setCopiedCopy(false), 1400);
    } catch {
      /* ignore */
    }
  };

  const sendNote = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [
      {
        id: `note-${Date.now()}`,
        text,
        time: "Just now",
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      ...prev,
    ]);
    setDraft("");
  };

  const dueLabel = formatTaskDate(item.dueDate);
  const sendLabel = formatTaskDate(item.sendDate);
  const metaCols = page ? "sm:grid-cols-4" : "grid-cols-2";

  return (
    <div className="flex min-h-0 flex-1 flex-col text-stone-800">
      <header className={`flex shrink-0 flex-col space-y-2 border-b border-stone-200/80 bg-white/90 ${page ? "px-6 pt-5" : "px-5 pt-4"}`}>
        <div className="flex items-start gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-2">
            <h2
              id={titleId}
              className={`font-semibold leading-snug tracking-tight text-stone-900 ${page ? "text-[26px]" : "text-[18px]"}`}
            >
              {item.name}
              {item.product ? (
                <span className="font-semibold text-stone-400"> · {item.product}</span>
              ) : null}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <AdReadPill label={item.status} color={AD_STATUS_COLORS[item.status]} />
              <AdReadPill label={item.priority} color={AD_PRIORITY_COLORS[item.priority]} />
              <AdReadPill label={item.product} color={AD_PRODUCT_COLORS[item.product]} />
            </div>
          </div>
          {headerActions}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-stone-600">
          <span className="inline-flex items-center gap-1 min-w-0 truncate">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">
              In
            </span>
            <span className="font-medium text-stone-700">Ad Production</span>
            {phase && (
              <>
                <span className="text-stone-300">›</span>
                <span className="truncate font-medium" style={{ color: phase.color }}>
                  {phase.title}
                </span>
              </>
            )}
          </span>
        </div>

        <div
          className={`flex items-center gap-0.5 pt-1 ${page ? "-mx-6 px-6" : "-mx-5 px-5"}`}
          role="tablist"
          aria-label="Brief sections"
          data-command-interactive
        >
          {TASK_TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`${idPrefix}-tab-${tab.id}`}
                aria-controls={`${idPrefix}-panel-${tab.id}`}
                data-command-interactive
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px border-b-2 px-3 pb-2.5 text-[12px] font-semibold transition-colors ${
                  selected
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={`space-y-4 ${page ? "p-6" : "p-4 sm:p-5"}`}>
          {activeTab === "details" && (
            <div
              id={`${idPrefix}-panel-details`}
              role="tabpanel"
              aria-labelledby={`${idPrefix}-tab-details`}
              className="space-y-4"
            >
              <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
                <div className={`grid grid-cols-2 ${metaCols} gap-px bg-stone-100/80`}>
                  <MetaCell label="Editor">
                    {(item.editors || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.editors.map((name) => (
                          <PersonChip key={name} name={name} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[12px] text-stone-400">Unassigned</span>
                    )}
                  </MetaCell>
                  <MetaCell label="Strategist">
                    {(item.creativeStrategists || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.creativeStrategists.map((name) => (
                          <PersonChip key={name} name={name} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[12px] text-stone-400">Unassigned</span>
                    )}
                  </MetaCell>
                  <MetaCell label="Timeline">
                    <span
                      className={`inline-flex items-center gap-1 truncate text-[12px] ${
                        overdue ? "text-rose-600" : "text-stone-700"
                      }`}
                    >
                      <CalendarDays size={12} className="shrink-0 text-stone-400" />
                      {dueLabel ? `${dueLabel}${overdue ? " · Overdue" : ""}` : "No date set"}
                    </span>
                  </MetaCell>
                  <MetaCell label="Send date">
                    <span className="inline-flex items-center gap-1 text-[12px] text-stone-700">
                      <Clock3 size={12} className="shrink-0 text-stone-400" />
                      {sendLabel || "Not set"}
                    </span>
                  </MetaCell>
                  <MetaCell label="Angle">
                    <AdReadPill label={item.angle} color={AD_ANGLE_COLORS[item.angle]} />
                  </MetaCell>
                  <MetaCell label="Style">
                    <AdReadPill label={item.editingStyle} color={AD_EDITING_STYLE_COLORS[item.editingStyle]} />
                  </MetaCell>
                  <MetaCell label="Platform">
                    <AdReadPill label={item.platform} color={AD_PLATFORM_COLORS[item.platform]} />
                  </MetaCell>
                  <MetaCell label="Pain point">
                    <AdReadPill label={item.painPoint} color={AD_PAIN_POINT_COLORS[item.painPoint]} />
                  </MetaCell>
                  <MetaCell label="Performance">
                    <AdReadPill
                      label={item.performance}
                      color={AD_PERFORMANCE_COLORS[item.performance]}
                    />
                  </MetaCell>
                  <MetaCell label="Priority">
                    <AdReadPill label={item.priority} color={AD_PRIORITY_COLORS[item.priority]} />
                  </MetaCell>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
                <div className="px-3.5 py-3">
                  <SectionLabel>Summary</SectionLabel>
                  <LongText value={item.summary} />
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
                <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-4 py-2.5">
                  <MessageSquare size={13} className="text-stone-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
                    Discussion
                  </span>
                  {notes.length > 0 && (
                    <span className="ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-stone-900 px-1 text-[9.5px] font-bold tabular-nums text-white">
                      {notes.length}
                    </span>
                  )}
                </div>
                <div className={`flex flex-col ${page ? "min-h-[320px]" : "min-h-[220px]"}`}>
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                    {notes.map((note) => (
                      <div key={note.id} className="flex gap-2.5">
                        {note.avatar ? (
                          <img
                            src={note.avatar}
                            alt=""
                            className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover"
                          />
                        ) : null}
                        <div className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                          <p className="text-[11px] font-semibold text-stone-800">{note.name}</p>
                          <p className="mt-0.5 text-[12.5px] leading-relaxed text-stone-700">
                            {note.text}
                          </p>
                          <p className="mt-1 text-[10px] text-stone-400">{note.time}</p>
                        </div>
                      </div>
                    ))}
                    {timeline.map((event) => (
                      <div key={event.id} className="flex gap-2.5">
                        {event.avatar ? (
                          <img
                            src={event.avatar}
                            alt=""
                            className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[9px] font-bold text-stone-500">
                            {event.name ? initials(event.name) : "•"}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] leading-snug text-stone-700">{event.text}</p>
                          <p className="mt-1 text-[10px] text-stone-400">{event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-stone-100 p-2.5">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendNote();
                          }
                        }}
                        rows={2}
                        placeholder={`Update on ${item.name}…`}
                        className="min-h-[44px] flex-1 resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-[12.5px] text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-400"
                      />
                      <button
                        type="button"
                        onClick={sendNote}
                        disabled={!draft.trim()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-opacity disabled:opacity-35"
                        title="Send update"
                      >
                        <SendHorizontal size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "adCopy" && (
            <section
              id={`${idPrefix}-panel-adCopy`}
              role="tabpanel"
              aria-labelledby={`${idPrefix}-tab-adCopy`}
              className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]"
            >
              <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-4 py-2.5">
                <FileText size={13} className="text-stone-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
                  Ad Copy
                </span>
                {item.adCopy ? (
                  <button
                    type="button"
                    onClick={copyAdCopy}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  >
                    <Copy size={11} />
                    {copiedCopy ? "Copied" : "Copy"}
                  </button>
                ) : null}
              </div>
              <div className="px-4 py-4">
                <LongText value={item.adCopy} empty="No ad copy yet." />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
