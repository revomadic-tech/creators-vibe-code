import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  AtSign,
  ChevronDown,
  ChevronRight,
  FilePenLine,
  Hash,
  MessageSquare,
  Paperclip,
  PenSquare,
  Search,
  Send,
  Smile,
  User,
  Users,
  X,
} from "lucide-react";
import { currentUser, teamMembers } from "../../data/mockData";
import { teamChatSeed } from "../../data/teamChat";

const GOLD = "#E8C4A0";
const NAVY = "#191e29";

const MEMBER_BY_ID = Object.fromEntries([
  [currentUser.id, currentUser],
  ...teamMembers.map((m) => [m.id, m]),
]);

const FILTERS = [
  { key: "all", label: "All" },
  { key: "activity", label: "Activity" },
  { key: "unread", label: "Unread" },
  { key: "drafts", label: "Drafts" },
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
          className={`${dim[size]} rounded-full flex items-center justify-center font-semibold uppercase text-[#191e29]`}
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
          style={{ borderColor: NAVY }}
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

function ConvAvatar({ conv, size = "md" }) {
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
  return <ChannelGlyph name={conv.name} size={size} type={conv.type} />;
}

function ConversationRow({ conv, active, onClick }) {
  const title = conversationTitle(conv);
  const unread = conv.unread > 0;
  const author = MEMBER_BY_ID[conv.lastAuthorId];
  const previewPrefix =
    conv.type !== "dm" && author ? `${firstName(author.name)}: ` : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors ${
        active ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
      }`}
    >
      <div className="mt-0.5">
        <ConvAvatar conv={conv} size="sm" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`truncate text-[12px] ${
              unread ? "font-semibold text-white" : "font-medium text-white/80"
            }`}
          >
            {conv.type === "channel" && (
              <Hash size={10} className="inline -mt-0.5 mr-0.5 text-white/30" />
            )}
            {title}
          </span>
          <span
            className={`shrink-0 text-[10px] font-mono ${
              unread ? "text-[#E8C4A0]" : "text-white/30"
            }`}
          >
            {conv.lastAt}
          </span>
        </div>
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
            <span className="mt-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E8C4A0] px-1 text-[9px] font-bold text-[#191e29]">
              {conv.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function SectionHeader({ icon: Icon, label, count, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-1.5 px-2 pb-1.5 pt-2 rounded-lg text-left hover:bg-white/[0.04]"
    >
      {open ? (
        <ChevronDown size={12} className="text-white/30 shrink-0" />
      ) : (
        <ChevronRight size={12} className="text-white/30 shrink-0" />
      )}
      <Icon size={11} className="text-white/30 shrink-0" />
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 truncate">
        {label}
      </span>
      <span className="text-[10px] tabular-nums text-white/25">{count}</span>
    </button>
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
  activityUnread,
  draftCount,
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
    if (filter === "drafts") return !!c.draft;
    return true;
  });

  const channels = filtered.filter((c) => c.type === "channel");
  const groups = filtered.filter((c) => c.type === "group");
  const dms = filtered.filter((c) => c.type === "dm");
  const totalUnread = conversations.filter((c) => c.unread > 0).length;

  const toggle = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex h-full w-full flex-col min-h-0">
      <div className="flex flex-col gap-1.5 px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8C4A0]">
            Chat
          </h2>
          {totalUnread > 0 && (
            <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#E8C4A0] px-1 text-[9px] font-bold text-[#191e29]">
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
        <div className="flex flex-wrap items-center gap-1">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onFilter(f.key)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? f.key === "unread"
                      ? "bg-rose-500 text-white"
                      : f.key === "activity"
                        ? "bg-violet-600 text-white"
                        : f.key === "drafts"
                          ? "bg-amber-600 text-white"
                          : "bg-white/15 text-white"
                    : "bg-white/[0.04] text-white/40 hover:text-white/70 border border-white/[0.08]"
                }`}
              >
                {f.key === "activity" && <AtSign size={10} />}
                {f.key === "drafts" && <FilePenLine size={10} />}
                {f.label}
                {f.key === "unread" && totalUnread > 0 && !active && (
                  <span className="tabular-nums opacity-80">{totalUnread}</span>
                )}
                {f.key === "activity" && activityUnread > 0 && !active && (
                  <span className="tabular-nums opacity-80">
                    {activityUnread > 9 ? "9+" : activityUnread}
                  </span>
                )}
                {f.key === "drafts" && draftCount > 0 && !active && (
                  <span className="tabular-nums opacity-80">{draftCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {filter === "activity" ? (
        <ul className="flex-1 min-h-0 overflow-y-auto px-2 pb-3">
          {activity.map((item) => {
            const member = MEMBER_BY_ID[item.memberId];
            const kind = ACTIVITY_KIND[item.kind] || ACTIVITY_KIND.mention;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.conversationId)}
                  className={`w-full text-left flex items-start gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.05] ${
                    item.unread ? "bg-white/[0.03]" : ""
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
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3">
          {filtered.length === 0 && (
            <p className="px-3 py-10 text-center text-[12px] text-white/35">
              {filter === "unread"
                ? "No unread conversations"
                : filter === "drafts"
                  ? "No drafts — start typing in a chat to save one"
                  : "No conversations match"}
            </p>
          )}
          {channels.length > 0 && (
            <div>
              <SectionHeader
                icon={Hash}
                label="Channels"
                count={channels.length}
                open={openSections.channel}
                onToggle={() => toggle("channel")}
              />
              {openSections.channel &&
                channels.map((c) => (
                  <ConversationRow
                    key={c.id}
                    conv={c}
                    active={c.id === activeId}
                    onClick={() => onSelect(c.id)}
                  />
                ))}
            </div>
          )}
          {groups.length > 0 && (
            <div>
              <SectionHeader
                icon={Users}
                label="Groups"
                count={groups.length}
                open={openSections.group}
                onToggle={() => toggle("group")}
              />
              {openSections.group &&
                groups.map((c) => (
                  <ConversationRow
                    key={c.id}
                    conv={c}
                    active={c.id === activeId}
                    onClick={() => onSelect(c.id)}
                  />
                ))}
            </div>
          )}
          {dms.length > 0 && (
            <div>
              <SectionHeader
                icon={User}
                label="Direct messages"
                count={dms.length}
                open={openSections.dm}
                onToggle={() => toggle("dm")}
              />
              {openSections.dm &&
                dms.map((c) => (
                  <ConversationRow
                    key={c.id}
                    conv={c}
                    active={c.id === activeId}
                    onClick={() => onSelect(c.id)}
                  />
                ))}
            </div>
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
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
        <button
          type="button"
          onClick={onBack}
          title="Back to conversations"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 lg:hidden"
        >
          <ArrowLeft size={14} />
        </button>
        <ConvAvatar conv={conv} size="xs" />
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
                      ? "rounded-2xl rounded-br-md bg-[#191e29] text-[#F7F5F2] border border-white/10"
                      : "rounded-2xl rounded-bl-md bg-white/[0.07] text-white/90"
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
        className="shrink-0 flex items-end gap-1.5 px-2.5 py-2 border-t border-white/[0.06]"
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
            className="w-full max-h-24 resize-none rounded-xl bg-white/[0.06] border border-white/[0.08] px-3 py-2 pr-8 text-[12px] text-white placeholder:text-white/25 outline-none focus:border-[#E8C4A0]/40"
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
    <div className="absolute inset-0 z-10 flex flex-col bg-[#191e29]/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E8C4A0]">
          New message
        </p>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10"
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

/**
 * Team Chat pane — sits under the staff time snapshot inside StaffPanel.
 */
export default function TeamChat() {
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
  const searchRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) || null;
  const messages = (activeId && messagesById[activeId]) || [];
  const activityUnread = activity.filter((a) => a.unread).length;
  const draftCount = conversations.filter((c) => c.draft).length;

  const openChat = (id) => {
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
    "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-[#F7F5F2] hover:bg-white/10";

  return (
    <div
      data-page-demo="command-team-chat"
      className="relative flex-1 min-h-0 flex flex-col overflow-hidden"
    >
      <div
        className="relative shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/10"
        style={{ background: NAVY }}
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
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F7F5F2] truncate">
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
            className="w-full h-7 pl-7 pr-3 rounded-full bg-white/10 border border-white/10 text-[11px] text-[#F7F5F2] placeholder:text-stone-500 outline-none focus:border-[#E8C4A0]/40"
          />
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex">
        {showChat && active ? (
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
        ) : (
          <div className="flex-1 min-h-0">
            <ConversationList
              conversations={conversations}
              filter={filter}
              search={search}
              activeId={activeId}
              activity={activity}
              activityUnread={activityUnread}
              draftCount={draftCount}
              onFilter={setFilter}
              onSelect={openChat}
              onNew={() => setNewOpen(true)}
            />
          </div>
        )}
      </div>

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
