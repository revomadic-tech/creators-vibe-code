import { Children, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  AtSign,
  Bell,
  ChevronDown,
  ChevronRight,
  Hash,
  Inbox,
  MessageSquare,
  Paperclip,
  PanelLeftClose,
  PenSquare,
  Search,
  Send,
  Smile,
  User,
  Users,
  X,
} from "lucide-react";
import { currentUser, notifications, teamMembers } from "../../data/mockData";
import { teamChatSeed } from "../../data/teamChat";
import { useCommandCenter } from "../../contexts/CommandCenterContext";
import StaffProfile from "./StaffProfile";

const GOLD = "#E8C4A0";
const INK = "#161618";
const GOLD_LINE = "rgba(232, 196, 160, 0.18)";

const SECTION_TONE = {
  unread: {
    bg: "rgba(232, 196, 160, 0.14)",
    header: "rgba(232, 196, 160, 0.20)",
    line: "rgba(232, 196, 160, 0.32)",
    accent: GOLD,
  },
  channel: {
    bg: "rgba(20, 184, 166, 0.13)",
    header: "rgba(20, 184, 166, 0.20)",
    line: "rgba(45, 212, 191, 0.32)",
    accent: "#5eead4",
  },
  group: {
    bg: "rgba(139, 92, 246, 0.14)",
    header: "rgba(139, 92, 246, 0.22)",
    line: "rgba(167, 139, 250, 0.34)",
    accent: "#c4b5fd",
  },
  dm: {
    bg: "rgba(56, 189, 248, 0.12)",
    header: "rgba(56, 189, 248, 0.20)",
    line: "rgba(125, 211, 252, 0.32)",
    accent: "#7dd3fc",
  },
  activity: {
    bg: "rgba(245, 158, 11, 0.12)",
    header: "rgba(245, 158, 11, 0.20)",
    line: "rgba(251, 191, 36, 0.32)",
    accent: "#fbbf24",
  },
};

const MEMBER_BY_ID = Object.fromEntries([
  [currentUser.id, currentUser],
  ...teamMembers.map((m) => [m.id, m]),
]);

const FILTERS = [
  { key: "all", label: "All" },
  { key: "activity", label: "Activity" },
  { key: "unread", label: "Unread" },
];

const ACTIVITY_KIND = {
  mention: { label: "Mention", color: "#8b5cf6" },
  reply: { label: "Reply", color: "#3b82f6" },
  reaction: { label: "Reaction", color: "#f59e0b" },
};

function firstName(name) {
  return (name || "").split(" ")[0] || name;
}

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function otherMember(conv) {
  if (conv.type !== "dm") return null;
  const id = conv.memberIds.find((id) => id !== currentUser.id);
  return MEMBER_BY_ID[id] || null;
}

function conversationTitle(conv) {
  if (conv.type === "dm") return otherMember(conv)?.name || "Direct message";
  return conv.name;
}

function isOnline(member) {
  if (!member) return false;
  if (member.id === currentUser.id) return true;
  return member.status === "online";
}

function nowClock() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function PresenceAvatar({
  name,
  avatar,
  online,
  size = "md",
  showPresence = true,
  className = "",
}) {
  const dim = { xs: "w-7 h-7 text-[9px]", sm: "w-8 h-8 text-[10px]", md: "w-10 h-10 text-[11px]" };
  const dot = { xs: "w-2 h-2", sm: "w-2 h-2", md: "w-2.5 h-2.5" };
  return (
    <div className={`relative shrink-0 ${className}`}>
      {avatar ? (
        <img src={avatar} alt={name} className={`${dim[size]} rounded-full object-cover`} />
      ) : (
        <div
          className={`${dim[size]} rounded-full flex items-center justify-center font-semibold uppercase text-[#161618]`}
          style={{ background: GOLD }}
        >
          {initials(name)}
        </div>
      )}
      {showPresence && (
        <span
          className={`absolute -bottom-px -right-px rounded-full border-2 ${dot[size]} ${
            online ? "bg-emerald-400" : "bg-white/25"
          }`}
          style={{ borderColor: INK }}
        />
      )}
    </div>
  );
}

function ChannelGlyph({ name, size = "md", type = "channel" }) {
  const dim = { xs: "w-7 h-7", sm: "w-8 h-8", md: "w-10 h-10" };
  const Icon = type === "group" ? Users : Hash;
  return (
    <div
      className={`${dim[size]} rounded-full flex items-center justify-center shrink-0`}
      style={{ background: "rgba(232,196,160,0.18)", color: GOLD }}
      title={name}
    >
      <Icon size={size === "xs" ? 12 : size === "sm" ? 13 : 15} />
    </div>
  );
}

function AvatarStack({ memberIds, size = "sm", max = 2 }) {
  const box = { xs: "w-7 h-7", sm: "w-8 h-8", md: "w-10 h-10" }[size];
  const face = { xs: "w-[18px] h-[18px]", sm: "w-5 h-5", md: "w-6 h-6" }[size];
  const members = (memberIds || [])
    .filter((id) => id !== currentUser.id)
    .map((id) => MEMBER_BY_ID[id])
    .filter(Boolean);
  const shown = members.slice(0, max);
  if (!shown.length) return null;
  if (shown.length === 1) {
    return (
      <PresenceAvatar
        name={shown[0].name}
        avatar={shown[0].avatar}
        online={isOnline(shown[0])}
        showPresence={false}
        size={size}
      />
    );
  }
  return (
    <div className={`relative ${box} shrink-0`}>
      {shown.map((m, i) => (
        <img
          key={m.id}
          src={m.avatar}
          alt={m.name}
          className={`absolute rounded-full object-cover ${face}`}
          style={{
            top: i === 0 ? 0 : undefined,
            left: i === 0 ? 0 : undefined,
            right: i === 1 ? 0 : undefined,
            bottom: i === 1 ? 0 : undefined,
            border: `2px solid ${INK}`,
          }}
        />
      ))}
    </div>
  );
}

function ConvAvatar({ conv, size = "md", showTypeMark = false }) {
  if (conv.type === "dm") {
    const other = otherMember(conv);
    return (
      <PresenceAvatar
        name={other?.name}
        avatar={other?.avatar}
        online={isOnline(other)}
        showPresence
        size={size}
      />
    );
  }
  const stack = <AvatarStack memberIds={conv.memberIds} size={size} />;
  if (!stack) return <ChannelGlyph name={conv.name} size={size} type={conv.type} />;
  if (!showTypeMark) return stack;
  const Icon = conv.type === "group" ? Users : Hash;
  return (
    <div className="relative shrink-0">
      {stack}
      <span
        className="absolute -bottom-0.5 -left-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
        style={{ background: INK, color: GOLD }}
      >
        <Icon size={8} />
      </span>
    </div>
  );
}

function ConversationRow({ conv, active, onClick, compact = false }) {
  const title = conversationTitle(conv);
  const unread = conv.unread > 0;
  const author = MEMBER_BY_ID[conv.lastAuthorId];
  const previewPrefix =
    conv.type !== "dm" && author ? `${firstName(author.name)}: ` : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-start gap-2 px-2 py-2 transition-colors ${
        active ? "bg-[#E8C4A0]/15" : "hover:bg-white/[0.06]"
      }`}
    >
      <div className={compact ? "" : "mt-0.5"}>
        <ConvAvatar conv={conv} size={compact ? "xs" : "sm"} showTypeMark={conv.type !== "dm"} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1.5">
          <span
            className={`truncate ${compact ? "text-[11px]" : "text-[12px]"} ${
              unread ? "font-semibold text-white" : "font-medium text-white/80"
            }`}
          >
            {conv.type === "channel" && (
              <Hash size={10} className="inline -mt-0.5 mr-0.5 text-white/30" />
            )}
            {title}
          </span>
          {!compact && (
            <span
              className={`shrink-0 text-[10px] font-mono ${
                unread ? "text-[#E8C4A0]" : "text-white/30"
              }`}
            >
              {conv.lastAt}
            </span>
          )}
          {compact && unread && (
            <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#E8C4A0] px-1 text-[9px] font-bold text-[#161618]">
              {conv.unread}
            </span>
          )}
        </div>
        {!compact && (
          <div className="flex items-start justify-between gap-2 mt-0.5">
            <p
              className={`min-w-0 flex-1 line-clamp-2 text-[11px] leading-snug ${
                unread ? "text-white/70" : "text-white/40"
              }`}
            >
              {conv.draft ? (
                <>
                  <span className="text-accent-orange font-semibold">Draft: </span>
                  {conv.draft}
                </>
              ) : (
                <>
                  {previewPrefix}
                  {conv.lastPreview}
                </>
              )}
            </p>
            {unread && (
              <span className="mt-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E8C4A0] px-1 text-[9px] font-bold text-[#161618]">
                {conv.unread}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function SectionHeader({ icon: Icon, label, count, open, onToggle, collapsible = true, tone }) {
  const accent = tone?.accent || "rgba(255,255,255,0.45)";
  const inner = (
    <>
      {collapsible ? (
        open ? (
          <ChevronDown size={12} className="shrink-0 opacity-70" style={{ color: accent }} />
        ) : (
          <ChevronRight size={12} className="shrink-0 opacity-70" style={{ color: accent }} />
        )
      ) : null}
      <Icon size={11} className="shrink-0" style={{ color: accent }} />
      <span
        className="text-[10px] font-bold uppercase tracking-[0.14em] truncate"
        style={{ color: accent }}
      >
        {label}
      </span>
      <span className="text-[10px] tabular-nums opacity-70" style={{ color: accent }}>
        {count}
      </span>
    </>
  );
  const barClass = "flex w-full items-center gap-1.5 px-2.5 py-2";
  const barStyle = { background: tone?.header };
  if (!collapsible) {
    return (
      <div className={barClass} style={barStyle}>
        {inner}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${barClass} text-left hover:brightness-110`}
      style={barStyle}
    >
      {inner}
    </button>
  );
}

function SectionBlock({ header, children, showBody = true, tone }) {
  const items = Children.toArray(children);
  return (
    <section
      className="rounded-xl overflow-hidden border"
      style={{
        background: tone?.bg || "rgba(255,255,255,0.06)",
        borderColor: tone?.line || GOLD_LINE,
      }}
    >
      {header}
      {showBody && items.length > 0 ? (
        <ul>
          {items.map((child, i) => (
            <li key={child.key ?? i}>
              <div
                className={i > 0 ? "h-px mx-2.5" : "h-px"}
                style={{ background: tone?.line || "rgba(255,255,255,0.2)" }}
                aria-hidden="true"
              />
              {child}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function PeopleStrip({ onPickPerson }) {
  const people = teamMembers.filter((m) => m.id !== currentUser.id);
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto px-3 py-2 border-y"
      style={{ scrollbarWidth: "none", borderColor: GOLD_LINE, background: "rgba(232,196,160,0.06)" }}
    >
      {people.map((m) => (
        <button
          key={m.id}
          type="button"
          title={m.name}
          onClick={() => onPickPerson?.(m)}
          className="shrink-0 rounded-full hover:opacity-90"
        >
          <PresenceAvatar
            name={m.name}
            avatar={m.avatar}
            online={isOnline(m)}
            size="sm"
          />
        </button>
      ))}
    </div>
  );
}

function ConversationList({
  conversations,
  filter,
  search,
  activeId,
  activity,
  onFilter,
  onSelect,
  onNew,
  onPickPerson,
  activityUnread,
  compact = false,
}) {
  const [openSections, setOpenSections] = useState({
    channel: true,
    group: true,
    dm: true,
  });

  const q = search.trim().toLowerCase();
  const filtered = conversations.filter((c) => {
    const title = conversationTitle(c).toLowerCase();
    if (q && !title.includes(q) && !(c.lastPreview || "").toLowerCase().includes(q)) {
      return false;
    }
    if (filter === "unread") return c.unread > 0;
    return true;
  });

  const channels = filtered.filter((c) => c.type === "channel");
  const groups = filtered.filter((c) => c.type === "group");
  const dms = filtered.filter((c) => c.type === "dm");
  const unreads = filtered.filter((c) => c.unread > 0);
  const totalUnread = conversations.filter((c) => c.unread > 0).length;
  const searching = q.length > 0;
  const sectionOpen = (key) => searching || openSections[key];

  const toggle = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const renderConv = (c) => (
    <ConversationRow
      key={c.id}
      conv={c}
      active={c.id === activeId}
      compact={compact}
      onClick={() => onSelect(c.id)}
    />
  );

  return (
    <div className="flex h-full w-full flex-col min-h-0">
      <div className={`flex flex-col gap-1.5 shrink-0 ${compact ? "px-2 pt-2 pb-1.5" : "px-3 pt-3 pb-2"}`}>
        {!compact && (
          <div className="flex items-center gap-1.5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8C4A0]">
              Chat
            </h2>
            {totalUnread > 0 && (
              <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#E8C4A0] px-1 text-[9px] font-bold text-[#161618]">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
            <button
              type="button"
              onClick={onNew}
              className="ml-auto inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#E8C4A0]/15 border border-[#E8C4A0]/30 text-[10px] font-bold uppercase tracking-[0.12em] text-[#E8C4A0] hover:bg-[#E8C4A0]/25"
            >
              <PenSquare size={11} />
              New
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onFilter(f.key)}
                className={`inline-flex items-center gap-1 rounded-full ${compact ? "px-2 py-1" : "px-2.5 py-1"} text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? "bg-[#E8C4A0] text-[#161618]"
                    : "bg-[#E8C4A0]/[0.08] text-[#E8C4A0]/70 border border-[#E8C4A0]/20 hover:text-[#E8C4A0] hover:bg-[#E8C4A0]/15"
                }`}
              >
                {f.key === "activity" && <AtSign size={10} />}
                {compact && f.key === "activity" ? null : f.label}
                {f.key === "unread" && totalUnread > 0 && !active && (
                  <span className="tabular-nums opacity-80">{totalUnread}</span>
                )}
                {f.key === "activity" && activityUnread > 0 && !active && (
                  <span className="tabular-nums opacity-80">
                    {activityUnread > 9 ? "9+" : activityUnread}
                  </span>
                )}
              </button>
            );
          })}
          {compact && (
            <button
              type="button"
              onClick={onNew}
              className="ml-auto inline-flex items-center justify-center h-7 w-7 rounded-lg bg-[#E8C4A0]/15 border border-[#E8C4A0]/30 text-[#E8C4A0] hover:bg-[#E8C4A0]/25"
              title="New message"
            >
              <PenSquare size={12} />
            </button>
          )}
        </div>
      </div>

      {!compact && filter !== "activity" && onPickPerson && (
        <PeopleStrip onPickPerson={onPickPerson} />
      )}

      {filter === "activity" ? (
        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3">
          <SectionBlock
            tone={SECTION_TONE.activity}
            header={
              <SectionHeader
                icon={AtSign}
                label="Activity"
                count={activity.length}
                collapsible={false}
                tone={SECTION_TONE.activity}
              />
            }
          >
            {activity.map((item) => {
              const member = MEMBER_BY_ID[item.memberId];
              const kind = ACTIVITY_KIND[item.kind] || ACTIVITY_KIND.mention;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.conversationId)}
                  className={`w-full text-left flex items-start gap-2.5 px-2 py-2 hover:bg-white/[0.06] ${
                    item.unread ? "bg-[#E8C4A0]/10" : ""
                  }`}
                >
                  <img
                    src={member?.avatar}
                    alt={member?.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-white/60 leading-snug">
                      <span className="font-semibold text-white/85">
                        {firstName(member?.name)}
                      </span>{" "}
                      {item.text}
                    </p>
                    <p className="text-[10px] text-white/35 truncate mt-0.5">{item.preview}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="inline-flex items-center h-[14px] px-1 rounded-[3px] text-[8px] font-semibold"
                        style={{ backgroundColor: `${kind.color}26`, color: kind.color }}
                      >
                        {kind.label}
                      </span>
                      <span className="text-[9px] font-mono text-white/25">{item.time}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </SectionBlock>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3 space-y-2">
          {filtered.length === 0 && (
            <p className="px-3 py-10 text-center text-[12px] text-white/35">
              {filter === "unread"
                ? "No unread conversations"
                : "No conversations match"}
            </p>
          )}
          {unreads.length > 0 && !compact && (
            <SectionBlock
              tone={SECTION_TONE.unread}
              header={
                <SectionHeader
                  icon={Inbox}
                  label="Unreads"
                  count={unreads.length}
                  collapsible={false}
                  tone={SECTION_TONE.unread}
                />
              }
            >
              {unreads.map(renderConv)}
            </SectionBlock>
          )}
          {filter !== "unread" && channels.length > 0 && (
            <SectionBlock
              tone={SECTION_TONE.channel}
              showBody={sectionOpen("channel")}
              header={
                <SectionHeader
                  icon={Hash}
                  label="Channels"
                  count={channels.length}
                  open={sectionOpen("channel")}
                  onToggle={() => toggle("channel")}
                  tone={SECTION_TONE.channel}
                />
              }
            >
              {channels.map(renderConv)}
            </SectionBlock>
          )}
          {filter !== "unread" && groups.length > 0 && (
            <SectionBlock
              tone={SECTION_TONE.group}
              showBody={sectionOpen("group")}
              header={
                <SectionHeader
                  icon={Users}
                  label="Groups"
                  count={groups.length}
                  open={sectionOpen("group")}
                  onToggle={() => toggle("group")}
                  tone={SECTION_TONE.group}
                />
              }
            >
              {groups.map(renderConv)}
            </SectionBlock>
          )}
          {filter !== "unread" && dms.length > 0 && (
            <SectionBlock
              tone={SECTION_TONE.dm}
              showBody={sectionOpen("dm")}
              header={
                <SectionHeader
                  icon={User}
                  label="Direct messages"
                  count={dms.length}
                  open={sectionOpen("dm")}
                  onToggle={() => toggle("dm")}
                  tone={SECTION_TONE.dm}
                />
              }
            >
              {dms.map(renderConv)}
            </SectionBlock>
          )}
        </div>
      )}
    </div>
  );
}

function ChatPane({ conv, messages, draft, onDraft, onSend, onBack }) {
  const scrollerRef = useRef(null);
  const title = conversationTitle(conv);
  const other = otherMember(conv);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, conv.id]);

  const grouped = messages.map((m, i) => {
    const prev = messages[i - 1];
    const showMeta = !prev || prev.memberId !== m.memberId;
    return { ...m, showMeta };
  });

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col">
      <div
        className="shrink-0 flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: GOLD_LINE, background: "rgba(232,196,160,0.06)" }}
      >
        <button
          type="button"
          onClick={onBack}
          title="Back to conversations"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 lg:hidden"
        >
          <ArrowLeft size={14} />
        </button>
        <ConvAvatar conv={conv} size="xs" showTypeMark={conv.type !== "dm"} />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-white truncate leading-tight">
            {conv.type !== "dm" && <span className="text-white/35 mr-0.5">#</span>}
            {title}
          </p>
          <p className="text-[10px] text-white/35 truncate">
            {conv.type === "dm"
              ? other?.role || "Direct message"
              : `${conv.memberIds.length} members`}
          </p>
        </div>
      </div>

      <div ref={scrollerRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-1">
        {grouped.map((m) => {
          const member = MEMBER_BY_ID[m.memberId];
          const own = m.memberId === currentUser.id;
          return (
            <div
              key={m.id}
              className={`flex gap-2 ${own ? "justify-end" : "justify-start"} ${
                m.showMeta ? "mt-2.5" : "mt-0.5"
              }`}
            >
              {!own &&
                (m.showMeta ? (
                  <img
                    src={member?.avatar}
                    alt={member?.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-4"
                  />
                ) : (
                  <div className="w-6 shrink-0" />
                ))}
              <div className={`max-w-[85%] flex flex-col ${own ? "items-end" : "items-start"}`}>
                {m.showMeta && !own && (
                  <span className="px-1 mb-0.5 text-[10px] font-medium text-white/40">
                    {firstName(member?.name)}
                  </span>
                )}
                <div
                  className={`px-3 py-1.5 text-[12px] leading-snug ${
                    own
                      ? "rounded-2xl rounded-br-md bg-[#E8C4A0]/20 text-[#F7F5F2] border border-[#E8C4A0]/25"
                      : "rounded-2xl rounded-bl-md bg-white/[0.08] text-white/90"
                  }`}
                >
                  {m.text}
                </div>
                {m.showMeta && (
                  <span className="px-1 mt-0.5 text-[9px] font-mono text-white/25">{m.time}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="shrink-0 flex items-end gap-1.5 px-2.5 py-2 border-t"
        style={{ borderColor: GOLD_LINE }}
      >
        <button
          type="button"
          title="Attach"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10"
        >
          <Paperclip size={14} />
        </button>
        <div className="flex-1 min-w-0 relative">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={`Message ${conv.type === "dm" ? firstName(title) : `#${title}`}`}
            className="w-full max-h-24 resize-none rounded-xl bg-[#E8C4A0]/[0.08] border border-[#E8C4A0]/20 px-3 py-2 pr-8 text-[12px] text-[#F7F5F2] placeholder:text-white/30 outline-none focus:border-[#E8C4A0]/50"
          />
          <button
            type="button"
            title="Emoji"
            className="absolute right-2 top-2 text-white/25 hover:text-white/60"
          >
            <Smile size={14} />
          </button>
        </div>
        <button
          type="submit"
          disabled={!draft.trim()}
          title="Send"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E8C4A0]/20 text-[#E8C4A0] hover:bg-[#E8C4A0]/30 disabled:opacity-30 disabled:hover:bg-[#E8C4A0]/20"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}

function NewConversation({ conversations, onClose, onPick }) {
  const existingDm = new Set(
    conversations.filter((c) => c.type === "dm").flatMap((c) => c.memberIds),
  );
  const people = teamMembers.filter((m) => m.id !== currentUser.id);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-[#161618]/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: GOLD_LINE }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8C4A0]">
          New message
        </p>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-[#E8C4A0]/70 hover:text-[#E8C4A0] hover:bg-[#E8C4A0]/15"
        >
          <X size={14} />
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {people.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onPick(m)}
              className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.06]"
            >
              <PresenceAvatar
                name={m.name}
                avatar={m.avatar}
                online={isOnline(m)}
                size="sm"
              />
              <div className="min-w-0 text-left">
                <p className="text-[12px] font-medium text-white truncate">{m.name}</p>
                <p className="text-[10px] text-white/35">
                  {existingDm.has(m.id) ? "Open conversation" : m.role}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotificationsOverlay({ onClose, onOpenTask }) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-[#161618]/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: GOLD_LINE }}>
        <Bell size={13} className="text-[#E8C4A0]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8C4A0]">
          Notifications
        </p>
        <span className="text-[10px] text-rose-300 font-semibold px-2 py-0.5 bg-rose-500/15 rounded-full">
          {unreadCount} new
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-[#E8C4A0]/70 hover:text-[#E8C4A0] hover:bg-[#E8C4A0]/15"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.map((n) => (
          <button
            type="button"
            key={n.id}
            onClick={() => {
              if (n.taskRef) onOpenTask?.(n.taskRef);
              onClose();
            }}
            className={`w-full text-left px-4 py-3 border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${
              !n.read ? "bg-white/[0.03]" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {!n.read && (
                <div className="w-1.5 h-1.5 bg-accent-red rounded-full mt-1.5 flex-shrink-0" />
              )}
              <div className={!n.read ? "" : "pl-[18px]"}>
                <p className="text-[13px] text-white/80 leading-snug">{n.message}</p>
                <p className="text-[11px] text-white/35 mt-1">{n.time}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function UnreadBadge({ count, className = "" }) {
  if (!count) return null;
  return (
    <span
      className={`flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E8C4A0] px-1 text-[8px] font-bold text-[#161618] ${className}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function CollapsedRail({
  conversations,
  activity,
  unreadAlerts,
  onExpand,
  onOpenConversation,
  onOpenActivity,
  onOpenNotifications,
}) {
  const unreads = conversations.filter((c) => c.unread > 0);
  const activityUnread = activity.filter((a) => a.unread).length;
  const totalUnread =
    unreads.reduce((n, c) => n + (c.unread || 0), 0) + activityUnread;

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center">
      <div
        className="relative flex w-full shrink-0 flex-col items-center gap-1 py-2 border-b"
        style={{ background: "transparent", borderColor: GOLD_LINE }}
      >
        <StaffProfile variant="rail" />
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[#E8C4A0] hover:bg-white/10"
        >
          <Bell size={16} />
          {unreadAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-red pulse-dot" />
          )}
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center gap-2.5 overflow-y-auto px-1 py-3">
        <button
          type="button"
          onClick={onExpand}
          aria-expanded={false}
          aria-label="Open team chat"
          title="Open team chat"
          className="relative flex h-11 w-11 items-center justify-center rounded-xl text-[#E8C4A0] hover:bg-white/[0.08]"
        >
          <MessageSquare size={16} />
          <UnreadBadge
            count={totalUnread}
            className="absolute -right-0.5 -top-0.5"
          />
        </button>
        {unreads.map((conv) => {
          const title = conversationTitle(conv);
          return (
            <button
              key={conv.id}
              type="button"
              aria-label={`${title}, ${conv.unread} new`}
              title={`${title} · ${conv.unread} new`}
              onClick={() => onOpenConversation(conv.id)}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/[0.08]"
            >
              <ConvAvatar conv={conv} size="sm" showTypeMark={conv.type !== "dm"} />
              <UnreadBadge
                count={conv.unread}
                className="absolute -right-0.5 -top-0.5"
              />
            </button>
          );
        })}
        {activityUnread > 0 && (
          <button
            type="button"
            aria-label={`${activityUnread} mention${activityUnread === 1 ? "" : "s"}`}
            title={`${activityUnread} mention${activityUnread === 1 ? "" : "s"}`}
            onClick={onOpenActivity}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/[0.08]"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: "rgba(139,92,246,0.22)", color: "#c4b5fd" }}
            >
              <AtSign size={14} />
            </div>
            <UnreadBadge
              count={activityUnread}
              className="absolute -right-0.5 -top-0.5"
            />
          </button>
        )}
        {conversations.some((c) => (c.type === "channel" || c.type === "group") && !c.unread) && (
          <span className="mt-1 mb-0.5 h-px w-6" style={{ background: GOLD_LINE }} />
        )}
        {conversations
          .filter((c) => (c.type === "channel" || c.type === "group") && !c.unread)
          .map((conv) => (
            <button
              key={conv.id}
              type="button"
              aria-label={conversationTitle(conv)}
              title={conversationTitle(conv)}
              onClick={() => onOpenConversation(conv.id)}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/[0.08]"
            >
              <ConvAvatar conv={conv} size="sm" showTypeMark />
            </button>
          ))}
      </div>
    </div>
  );
}

/**
 * Team Chat pane — fills the persistent staff column in studio and Command Center.
 */
export default function TeamChat({ collapsed, onCollapsedChange }) {
  const { openTask } = useCommandCenter();
  const [conversations, setConversations] = useState(teamChatSeed.conversations);
  const [messagesById, setMessagesById] = useState(teamChatSeed.messages);
  const [activity, setActivity] = useState(teamChatSeed.activity);
  const [showChat, setShowChat] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [drafts, setDrafts] = useState(() => {
    const seed = {};
    for (const c of teamChatSeed.conversations) {
      if (c.draft) seed[c.id] = c.draft;
    }
    return seed;
  });
  const [newOpen, setNewOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) || null;
  const messages = (activeId && messagesById[activeId]) || [];
  const activityUnread = activity.filter((a) => a.unread).length;
  const unreadAlerts = notifications.filter((n) => !n.read).length;

  const expand = () => onCollapsedChange?.(false);

  const openNotifications = () => {
    expand();
    setShowNotifications(true);
  };

  const openChat = (id) => {
    expand();
    setActiveId(id);
    setShowChat(true);
    setFilter("all");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
    setActivity((prev) =>
      prev.map((a) => (a.conversationId === id ? { ...a, unread: false } : a)),
    );
  };

  const send = () => {
    if (!activeId) return;
    const text = (drafts[activeId] || "").trim();
    if (!text) return;
    const msg = {
      id: `local-${Date.now()}`,
      memberId: currentUser.id,
      text,
      time: nowClock(),
    };
    setMessagesById((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), msg],
    }));
    setDrafts((prev) => ({ ...prev, [activeId]: "" }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              lastPreview: text,
              lastAuthorId: currentUser.id,
              lastAt: "now",
              draft: "",
              unread: 0,
            }
          : c,
      ),
    );
  };

  const setDraft = (value) => {
    if (!activeId) return;
    setDrafts((prev) => ({ ...prev, [activeId]: value }));
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, draft: value } : c)),
    );
  };

  const pickPerson = (member) => {
    const existing = conversations.find(
      (c) => c.type === "dm" && c.memberIds.includes(member.id),
    );
    setNewOpen(false);
    if (existing) {
      openChat(existing.id);
      return;
    }
    const id = `dm-${member.id}`;
    const conv = {
      id,
      type: "dm",
      memberIds: [currentUser.id, member.id],
      unread: 0,
      lastAt: "now",
      lastPreview: "No messages yet",
      lastAuthorId: currentUser.id,
    };
    setConversations((prev) => [conv, ...prev]);
    setMessagesById((prev) => ({ ...prev, [id]: [] }));
    openChat(id);
  };

  const iconBtn =
    "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#E8C4A0]/70 hover:text-[#E8C4A0] hover:bg-[#E8C4A0]/15";

  if (collapsed) {
    return (
      <CollapsedRail
        conversations={conversations}
        activity={activity}
        unreadAlerts={unreadAlerts}
        onExpand={expand}
        onOpenConversation={openChat}
        onOpenActivity={() => {
          expand();
          setShowChat(false);
          setActiveId(null);
          setFilter("activity");
        }}
        onOpenNotifications={openNotifications}
      />
    );
  }

  return (
    <div
      data-page-demo="command-team-chat"
      className="relative flex-1 min-h-0 flex flex-col overflow-hidden"
    >
      <div
        className="relative shrink-0 flex items-center gap-2 h-[52px] px-3 border-b"
        style={{ background: "transparent", borderColor: GOLD_LINE }}
      >
        {showChat && (
          <button
            type="button"
            onClick={() => {
              setShowChat(false);
              setActiveId(null);
            }}
            title="Back to conversations"
            className={iconBtn}
          >
            <ArrowLeft size={15} />
          </button>
        )}
        <div className="relative flex items-center gap-1.5 min-w-0">
          <MessageSquare size={13} className="text-[#E8C4A0] shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E8C4A0] truncate">
            Team Chat
          </span>
        </div>
        <div className="relative flex-1 min-w-0">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#E8C4A0]/70 pointer-events-none"
          />
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="w-full h-7 pl-7 pr-3 rounded-full bg-[#E8C4A0]/[0.08] border border-[#E8C4A0]/20 text-[11px] text-[#F7F5F2] placeholder:text-white/35 outline-none focus:border-[#E8C4A0]/50"
          />
        </div>
        <StaffProfile variant="header" />
        <button
          type="button"
          onClick={() => setShowNotifications((v) => !v)}
          aria-label="Notifications"
          title="Notifications"
          className={`${iconBtn} relative`}
        >
          <Bell size={15} />
          {unreadAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-red pulse-dot" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onCollapsedChange?.(true)}
          title="Collapse chat"
          aria-expanded="true"
          className={iconBtn}
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      <div className="relative flex-1 min-h-0 flex">
        <div
          className={`min-h-0 min-w-0 ${
            showChat && active
              ? "w-[188px] xl:w-[210px] shrink-0 border-r border-[#E8C4A0]/20"
              : "flex-1"
          }`}
        >
          <ConversationList
            conversations={conversations}
            filter={filter}
            search={search}
            activeId={activeId}
            activity={activity}
            activityUnread={activityUnread}
            compact={Boolean(showChat && active)}
            onFilter={setFilter}
            onSelect={openChat}
            onNew={() => setNewOpen(true)}
            onPickPerson={pickPerson}
          />
        </div>
        {showChat && active && (
          <ChatPane
            conv={active}
            messages={messages}
            draft={drafts[activeId] || ""}
            onDraft={setDraft}
            onSend={send}
            onBack={() => {
              setShowChat(false);
              setActiveId(null);
            }}
          />
        )}
      </div>

      {showNotifications && (
        <NotificationsOverlay
          onClose={() => setShowNotifications(false)}
          onOpenTask={openTask}
        />
      )}
      {newOpen && (
        <NewConversation
          conversations={conversations}
          onClose={() => setNewOpen(false)}
          onPick={pickPerson}
        />
      )}
    </div>
  );
}
