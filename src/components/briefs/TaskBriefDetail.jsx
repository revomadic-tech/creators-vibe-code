import { Component, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MessageSquare,
  SendHorizontal,
} from "lucide-react";
import {
  AD_ANGLE_COLORS,
  AD_ANGLE_OPTIONS,
  AD_EDITING_STYLE_COLORS,
  AD_EDITING_STYLE_OPTIONS,
  AD_PAIN_POINT_COLORS,
  AD_PAIN_POINT_OPTIONS,
  AD_PERFORMANCE_COLORS,
  AD_PERFORMANCE_OPTIONS,
  AD_PHASES,
  AD_PLATFORM_COLORS,
  AD_PLATFORM_OPTIONS,
  AD_PRIORITY_COLORS,
  AD_PRIORITY_OPTIONS,
  AD_PRODUCT_COLORS,
  AD_PRODUCT_OPTIONS,
  AD_STATUS_COLORS,
  AD_STATUS_OPTIONS,
} from "../../data/adProduction";
import { currentUser, findWorkspaceUser, teamMembers } from "../../data/mockData";
import { staffActivity, taskThreads } from "../../data/staffPanel";
import { useCommandCenter } from "../../contexts/CommandCenterContext";
import {
  PHASE_BY_ID,
  formatTaskDate,
  isTaskOverdue,
  withAlpha,
} from "../../lib/adTaskBrief";
import { resolveAdminBrief } from "../../lib/resolveAdminBrief";
import { resolveAdCopyDoc } from "../../lib/resolveAdCopyDoc";
import AdminBriefPanel from "./AdminBriefPanel";
import AdCopyDoc from "./AdCopyDoc";
import BoardFieldMenu from "./BoardFieldMenu";
import ContentReviewWidget from "./ContentReviewWidget";
import TaskSubmissions from "./TaskSubmissions";

const MEMBER_BY_ID = Object.fromEntries(teamMembers.map((m) => [m.id, m]));

const TASK_TABS = [
  { id: "details", label: "Task Details" },
  { id: "brief", label: "Brief" },
  { id: "submissions", label: "Submissions" },
];

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

function EditablePill({ value, options, colors, onChange, ariaLabel }) {
  return (
    <BoardFieldMenu
      value={value}
      options={options}
      colors={colors}
      onChange={onChange}
      ariaLabel={ariaLabel}
    >
      {value ? (
        <AdReadPill label={value} color={colors[value]} />
      ) : (
        <span className="text-[12px] text-stone-400">Set</span>
      )}
    </BoardFieldMenu>
  );
}

function EditablePeople({ names, onChange, ariaLabel }) {
  const list = names || [];
  return (
    <BoardFieldMenu
      value={list}
      people
      multiple
      onChange={onChange}
      ariaLabel={ariaLabel}
    >
      {list.length > 0 ? (
        <span className="flex flex-wrap gap-1.5">
          {list.map((name) => (
            <PersonChip key={name} name={name} />
          ))}
        </span>
      ) : (
        <span className="text-[12px] text-stone-400">Unassigned</span>
      )}
    </BoardFieldMenu>
  );
}

function DateInput({ value, onChange, overdue }) {
  return (
    <label className="relative inline-flex min-w-0 cursor-pointer items-center">
      <span className={`text-[12px] ${overdue ? "text-rose-600" : "text-stone-700"}`}>
        {formatTaskDate(value) || "Not set"}
      </span>
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}

function MetaCell({ label, children }) {
  return (
    <div className="min-w-0 bg-white px-3 py-1.5">
      <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-stone-400">
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

class PanelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <p className="px-1 text-[12px] text-rose-600">
          {this.state.error.message || String(this.state.error)}
        </p>
      );
    }
    return this.props.children;
  }
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
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState(
    item?.sampleSimulation ? "submissions" : "details",
  );
  const [reviewAsset, setReviewAsset] = useState(null);
  const [summaryDraft, setSummaryDraft] = useState(item?.summary || "");
  const page = density === "page";
  const { updateTask, moveTask, setOpen, openTask } = useCommandCenter();

  const phase = item ? PHASE_BY_ID[item.phase] : null;
  const timeline = useMemo(() => (item ? buildTimeline(item) : []), [item]);
  const adminBrief = useMemo(() => (item ? resolveAdminBrief(item) : null), [item]);
  const adCopyDoc = useMemo(
    () => (item ? resolveAdCopyDoc(item, adminBrief) : null),
    [item, adminBrief],
  );
  const overdue = item ? isTaskOverdue(item) : false;

  useEffect(() => {
    setSummaryDraft(item?.summary || "");
  }, [item?.id, item?.summary]);

  useEffect(() => {
    setReviewAsset(null);
    setActiveTab(item?.sampleSimulation ? "submissions" : "details");
  }, [item?.id, item?.sampleSimulation]);

  if (!item) return null;

  const patch = (fields) => updateTask(item.id, fields);
  const openOnBoard = () => {
    openTask(item.id);
    setOpen(true);
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

  const selectTab = (id) => {
    setActiveTab(id);
    setReviewAsset(null);
  };

  const headerCols = page ? "sm:grid-cols-4" : "grid-cols-2 min-[480px]:grid-cols-4";
  const detailCols = page ? "sm:grid-cols-5" : "grid-cols-2 min-[480px]:grid-cols-5";

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
              <EditablePill
                value={item.status}
                options={AD_STATUS_OPTIONS}
                colors={AD_STATUS_COLORS}
                ariaLabel="Status"
                onChange={(status) => patch({ status })}
              />
              <EditablePill
                value={item.priority}
                options={AD_PRIORITY_OPTIONS}
                colors={AD_PRIORITY_COLORS}
                ariaLabel="Priority"
                onChange={(priority) => patch({ priority })}
              />
              <EditablePill
                value={item.product}
                options={AD_PRODUCT_OPTIONS}
                colors={AD_PRODUCT_COLORS}
                ariaLabel="Product"
                onChange={(product) => patch({ product })}
              />
            </div>
          </div>
          {headerActions}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-stone-600">
          <span className="inline-flex items-center gap-1 min-w-0 truncate">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">
              In
            </span>
            <button
              type="button"
              data-command-interactive
              onClick={openOnBoard}
              className="font-medium text-stone-700 hover:text-stone-950"
              title="Open this row on Ad Production"
            >
              Ad Production
            </button>
            {phase && (
              <>
                <span className="text-stone-300">›</span>
                <BoardFieldMenu
                  value={item.phase}
                  options={AD_PHASES.map((p) => ({
                    value: p.id,
                    label: p.title,
                    color: p.color,
                  }))}
                  onChange={(phaseId) => {
                    if (phaseId) moveTask(item.id, phaseId);
                  }}
                  ariaLabel="Phase"
                >
                  <span className="truncate font-medium" style={{ color: phase.color }}>
                    {phase.title}
                  </span>
                </BoardFieldMenu>
              </>
            )}
          </span>
        </div>

        <section className="overflow-hidden rounded-xl border border-stone-200/80 bg-white">
          <div className={`grid ${headerCols} gap-px bg-stone-100/80`}>
            <MetaCell label="Editor">
              <EditablePeople
                names={item.editors}
                ariaLabel="Editor"
                onChange={(editors) => patch({ editors })}
              />
            </MetaCell>
            <MetaCell label="Strategist">
              <EditablePeople
                names={item.creativeStrategists}
                ariaLabel="Strategist"
                onChange={(creativeStrategists) => patch({ creativeStrategists })}
              />
            </MetaCell>
            <MetaCell label="Timeline">
              <span
                className={`inline-flex items-center gap-1 truncate text-[12px] ${
                  overdue ? "text-rose-600" : "text-stone-700"
                }`}
              >
                <CalendarDays size={12} className="shrink-0 text-stone-400" />
                <DateInput
                  value={item.dueDate}
                  overdue={overdue}
                  onChange={(dueDate) => patch({ dueDate })}
                />
                {overdue ? <span className="text-[11px]">· Overdue</span> : null}
              </span>
            </MetaCell>
            <MetaCell label="Send date">
              <span className="inline-flex items-center gap-1 text-[12px] text-stone-700">
                <Clock3 size={12} className="shrink-0 text-stone-400" />
                <DateInput
                  value={item.sendDate}
                  onChange={(sendDate) => patch({ sendDate })}
                />
              </span>
            </MetaCell>
          </div>
        </section>

        <div
          className={`relative z-10 flex items-center gap-0.5 pt-1 ${page ? "-mx-6 px-6" : "-mx-5 px-5"}`}
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
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  selectTab(tab.id);
                }}
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
        {reviewAsset ? (
          <ContentReviewWidget
            asset={reviewAsset}
            taskItem={item}
            onBack={() => setReviewAsset(null)}
            onUpdated={(next) => {
              if (next) setReviewAsset(next);
            }}
          />
        ) : (
          <div className={`space-y-4 ${page ? "p-6" : "p-4 sm:p-5"}`}>
            {activeTab === "details" && (
              <div
                id={`${idPrefix}-panel-details`}
                role="tabpanel"
                aria-labelledby={`${idPrefix}-tab-details`}
                className="space-y-4"
              >
                <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
                  <div className={`grid ${detailCols} gap-px bg-stone-100/80`}>
                    <MetaCell label="Angle">
                      <EditablePill
                        value={item.angle}
                        options={AD_ANGLE_OPTIONS}
                        colors={AD_ANGLE_COLORS}
                        ariaLabel="Angle"
                        onChange={(angle) => patch({ angle })}
                      />
                    </MetaCell>
                    <MetaCell label="Style">
                      <EditablePill
                        value={item.editingStyle}
                        options={AD_EDITING_STYLE_OPTIONS}
                        colors={AD_EDITING_STYLE_COLORS}
                        ariaLabel="Style"
                        onChange={(editingStyle) => patch({ editingStyle })}
                      />
                    </MetaCell>
                    <MetaCell label="Platform">
                      <EditablePill
                        value={item.platform}
                        options={AD_PLATFORM_OPTIONS}
                        colors={AD_PLATFORM_COLORS}
                        ariaLabel="Platform"
                        onChange={(platform) => patch({ platform })}
                      />
                    </MetaCell>
                    <MetaCell label="Pain point">
                      <EditablePill
                        value={item.painPoint}
                        options={AD_PAIN_POINT_OPTIONS}
                        colors={AD_PAIN_POINT_COLORS}
                        ariaLabel="Pain point"
                        onChange={(painPoint) => patch({ painPoint })}
                      />
                    </MetaCell>
                    <MetaCell label="Performance">
                      <EditablePill
                        value={item.performance}
                        options={AD_PERFORMANCE_OPTIONS}
                        colors={AD_PERFORMANCE_COLORS}
                        ariaLabel="Performance"
                        onChange={(performance) => patch({ performance })}
                      />
                    </MetaCell>
                  </div>
                </section>

                {adminBrief?.title ? (
                  <p className="px-0.5 text-[12px] text-stone-500">
                    Formed from <span className="font-semibold text-stone-700">{adminBrief.title}</span>
                    <span className="text-stone-400"> · campaign guidelines stay on Brief · edits update Ad Production</span>
                  </p>
                ) : (
                  <p className="px-0.5 text-[12px] text-stone-400">
                    Edits here update the Ad Production board.
                  </p>
                )}

                <AdCopyDoc doc={adCopyDoc} page={page} />

                <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
                  <div className="px-3.5 py-3">
                    <SectionLabel>Task notes</SectionLabel>
                    <textarea
                      value={summaryDraft}
                      onChange={(e) => setSummaryDraft(e.target.value)}
                      onBlur={() => {
                        const next = summaryDraft.trim() || null;
                        if ((item.summary || null) !== next) patch({ summary: next });
                      }}
                      rows={3}
                      placeholder="No task notes on this board item."
                      className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-stone-700 outline-none placeholder:italic placeholder:text-stone-400"
                    />
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

            {activeTab === "brief" && (
              <div
                id={`${idPrefix}-panel-brief`}
                role="tabpanel"
                aria-labelledby={`${idPrefix}-tab-brief`}
              >
                <PanelErrorBoundary>
                  {adminBrief ? (
                    <AdminBriefPanel brief={adminBrief} page={page} idPrefix={idPrefix} />
                  ) : (
                    <p className="text-[12px] text-stone-400">No parent campaign brief on this task.</p>
                  )}
                </PanelErrorBoundary>
              </div>
            )}

            {activeTab === "submissions" && (
              <div
                id={`${idPrefix}-panel-submissions`}
                role="tabpanel"
                aria-labelledby={`${idPrefix}-tab-submissions`}
              >
                <TaskSubmissions
                  item={item}
                  page={page}
                  onOpenAsset={(asset) => setReviewAsset(asset)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
