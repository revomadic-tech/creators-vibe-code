import { useState, useRef, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  FileText,
  Images,
  BookOpen,
  Bell,
  Search,
  Settings,
  Command,
  X,
  Clock,
  ChevronDown,
  Zap,
  ArrowRight,
  Users,
} from "lucide-react";
import { currentUser, notifications, briefs, tasks, assets, teamMembers } from "../../data/mockData";
import { StatusBadge, PriorityBadge } from "../ui/Tag";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/discovery", icon: Compass, label: "Discovery" },
  { to: "/briefs", icon: FileText, label: "Briefs" },
  { to: "/galleries", icon: Images, label: "Galleries" },
  { to: "/brand", icon: BookOpen, label: "Brand" },
];

export default function FloatingNav() {
  const [expanded, setExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBriefs, setShowBriefs] = useState(false);
  const [briefsTab, setBriefsTab] = useState("briefs");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navRef = useRef(null);
  const briefsRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const assignedBriefs = briefs.filter(
    (b) => b.status !== "Approved" && b.status !== "Draft"
  );
  const activeTasks = tasks.filter(
    (t) => t.status === "In Review" || t.status === "In Progress"
  );
  const highPriority = assignedBriefs.filter((b) => b.priority === "High" || b.priority === "Critical");
  const nextDue = assignedBriefs.length > 0
    ? assignedBriefs.reduce((a, b) => (new Date(a.dueDate) < new Date(b.dueDate) ? a : b))
    : null;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const assetResults = assets
      .filter((a) =>
        [a.title, a.product, a.partner, a.briefTitle]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
      .slice(0, 8)
      .map((a) => ({
        id: `asset-${a.id}`,
        type: "asset",
        title: a.title,
        thumbnail: a.thumbnail,
        product: a.product,
        brief: a.briefTitle || "No brief linked",
        status: a.status,
        dateSubmitted: a.dateSubmitted,
        onClick: () => navigate(`/discovery?assetId=${a.id}`),
      }));

    const briefResults = briefs
      .filter((b) =>
        [b.title, b.product, b.partner]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
      .slice(0, 4)
      .map((b) => ({
        id: `brief-${b.id}`,
        type: "brief",
        title: b.title,
        thumbnail: b.thumbnail,
        product: b.product,
        brief: "Brief",
        status: b.status,
        dateSubmitted: b.dueDate,
        onClick: () => navigate(`/briefs?briefId=${b.id}`),
      }));

    return [...assetResults, ...briefResults].slice(0, 10);
  }, [searchQuery, navigate]);

  useEffect(() => {
    setExpanded(false);
    setShowNotifications(false);
    setShowBriefs(false);
    setSearchFocused(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchFocused(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setExpanded(false);
        setShowNotifications(false);
        setShowBriefs(false);
        setSearchFocused(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setExpanded(false);
      }
      if (briefsRef.current && !briefsRef.current.contains(e.target)) {
        setShowBriefs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Floating nav cluster — top left */}
      <div ref={navRef} className="fixed top-5 left-5 z-50 flex items-center gap-1.5">
        <button
          onClick={() => {
            setExpanded(!expanded);
            setShowNotifications(false);
            setShowBriefs(false);
            if (!expanded) setSearchFocused(false);
          }}
          className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out ${
            expanded
              ? "bg-accent-red shadow-lg shadow-accent-red/25 scale-105"
              : "glass-nav hover:bg-white/[0.06] hover:border-white/[0.12] shadow-lg shadow-black/30"
          }`}
        >
          {expanded ? (
            <X size={16} className="text-white" />
          ) : (
            <span className="text-white font-black text-sm tracking-tight">R</span>
          )}
        </button>

        {/* Search — visible when nav collapsed */}
        <div className={`relative transition-all duration-300 ease-out ${expanded ? "max-w-0 opacity-0 overflow-hidden" : "max-w-[360px] opacity-100"}`}>
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Search assets, briefs..."
            className="w-[320px] glass-nav rounded-2xl py-2.5 pl-10 pr-10 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/15 transition-all duration-200 shadow-lg shadow-black/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
              <X size={13} />
            </button>
          )}

          {(searchFocused || searchQuery.trim()) && searchResults.length > 0 && (
            <div className="absolute left-0 top-14 w-[420px] glass-panel rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/40 animate-expand-popup">
              <div className="px-3.5 py-2 border-b border-white/[0.06]">
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Search Results</p>
              </div>
              <div className="max-h-[420px] overflow-y-auto p-2 space-y-1.5">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => { result.onClick(); setSearchFocused(false); }}
                    className="w-full flex items-center gap-2.5 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] p-2 text-left transition-all duration-200"
                  >
                    <img src={result.thumbnail} alt={result.title} className="w-14 h-10 rounded-lg object-cover img-cinematic flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-white/75 font-semibold truncate">{result.title}</p>
                        {result.status && <SearchStatusBadge status={result.status} />}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.06] text-[9px] text-white/45 font-medium">{result.product}</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-accent-red/10 border border-accent-red/20 text-[9px] text-accent-red/80 font-medium truncate max-w-[120px]">{result.brief}</span>
                        {result.dateSubmitted && (
                          <span className="flex items-center gap-1 text-[9px] text-white/25 font-mono ml-auto flex-shrink-0">
                            <Clock size={8} className="text-white/15" />{result.dateSubmitted}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out ${
            expanded ? "max-w-[600px] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            const isExactHome = item.to === "/" && location.pathname === "/";
            const active = item.to === "/" ? isExactHome : isActive;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? "bg-white/[0.12] text-white border border-white/[0.1] shadow-sm"
                    : "glass-nav text-white/50 hover:text-white hover:bg-white/[0.06]"
                }`}
                style={{
                  transitionDelay: `${i * 40}ms`,
                  transform: expanded ? "translateX(0) scale(1)" : "translateX(-10px) scale(0.9)",
                  opacity: expanded ? 1 : 0,
                }}
              >
                <item.icon
                  size={15}
                  strokeWidth={active ? 2.2 : 1.5}
                  className={active ? "text-accent-red" : ""}
                />
                {item.label}
              </NavLink>
            );
          })}

          <div className="w-px h-6 bg-white/[0.06] mx-1 flex-shrink-0" />

          <NavLink
            to="/settings"
            className="p-2.5 rounded-xl glass-nav text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200"
            style={{
              transitionDelay: `${navItems.length * 40}ms`,
              transform: expanded ? "translateX(0) scale(1)" : "translateX(-10px) scale(0.9)",
              opacity: expanded ? 1 : 0,
            }}
          >
            <Settings size={14} />
          </NavLink>
        </div>
      </div>

      {/* Center — Assigned Briefs summary */}
      {assignedBriefs.length > 0 && (
        <div
          ref={briefsRef}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={() => {
              setShowBriefs((p) => !p);
              setShowNotifications(false);
              setExpanded(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg shadow-black/20 ${
              showBriefs
                ? "glass-nav border-white/[0.12] bg-white/[0.06]"
                : "glass-nav hover:bg-white/[0.06] hover:border-white/[0.1]"
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-accent-red/10 flex items-center justify-center flex-shrink-0">
              <FileText size={11} className="text-accent-red" />
            </div>
            <span className="text-[11px] font-bold text-white/60">
              {assignedBriefs.length} Brief{assignedBriefs.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[9px] text-white/15 font-mono">&middot;</span>
            <span className="text-[10px] text-white/40">
              {activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""}
            </span>
            {highPriority.length > 0 && (
              <>
                <span className="text-[9px] text-white/15 font-mono">&middot;</span>
                <span className="text-[10px] font-semibold text-accent-red/60">
                  {highPriority.length} urgent
                </span>
              </>
            )}
            <div
              className={`w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center transition-transform duration-300 ${
                showBriefs ? "rotate-180" : ""
              }`}
            >
              <ChevronDown size={11} className="text-white/25" />
            </div>
          </button>

          {/* Briefs + Tasks dropdown */}
          {showBriefs && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[660px] glass-panel rounded-2xl border border-white/[0.08] overflow-hidden animate-expand-popup shadow-2xl shadow-black/40">
              {/* Tabs + close */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBriefsTab("briefs")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                      briefsTab === "briefs"
                        ? "bg-white/[0.08] text-white border border-white/[0.06]"
                        : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                    }`}
                  >
                    Briefs
                    <span className="ml-1.5 text-[9px] text-white/25 font-mono">{assignedBriefs.length}</span>
                  </button>
                  <button
                    onClick={() => setBriefsTab("tasks")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                      briefsTab === "tasks"
                        ? "bg-white/[0.08] text-white border border-white/[0.06]"
                        : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                    }`}
                  >
                    Tasks
                    <span className="ml-1.5 text-[9px] text-white/25 font-mono">{activeTasks.length}</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowBriefs(false);
                      navigate("/briefs");
                    }}
                    className="flex items-center gap-1 text-[10px] text-accent-red/50 hover:text-accent-red transition-colors font-medium"
                  >
                    All Briefs <ArrowRight size={10} />
                  </button>
                  <button
                    onClick={() => setShowBriefs(false)}
                    className="w-5 h-5 rounded-full hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                  >
                    <X size={11} className="text-white/25" />
                  </button>
                </div>
              </div>

              {/* Tab content */}
              <div className="p-4">
                {briefsTab === "briefs" ? (
                  <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
                    {assignedBriefs.slice(0, 6).map((brief) => (
                      <NavBriefCard
                        key={brief.id}
                        brief={brief}
                        onClick={() => {
                          setShowBriefs(false);
                          navigate("/briefs");
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {activeTasks.map((task) => (
                      <NavTaskRow
                        key={task.id}
                        task={task}
                        onClick={() => {
                          setShowBriefs(false);
                          navigate("/briefs");
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right-side controls — Team Online + actions */}
      <div className="fixed top-5 right-5 z-50 flex items-center gap-1.5">
        {/* Team Online */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-nav shadow-lg shadow-black/20">
          <div className="flex -space-x-1.5">
            {teamMembers.filter((m) => m.status === "online").slice(0, 5).map((m) => (
              <img key={m.id} src={m.avatar} alt={m.name} title={m.name} className="w-6 h-6 rounded-full border-[1.5px] border-black/50 object-cover" />
            ))}
          </div>
          <span className="text-[10px] text-accent-teal font-bold">{teamMembers.filter((m) => m.status === "online").length}/{teamMembers.length}</span>
          <span className="text-[9px] text-white/20 font-medium">online</span>
        </div>

        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `w-11 h-11 rounded-2xl glass-nav flex items-center justify-center transition-all duration-200 shadow-lg shadow-black/20 ${
              isActive ? "bg-white/[0.12] text-white border border-white/[0.1]" : "text-white/40 hover:text-white hover:bg-white/[0.06]"
            }`
          }
        >
          <Users size={15} />
        </NavLink>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowBriefs(false);
            }}
            className="w-11 h-11 rounded-2xl glass-nav flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200 shadow-lg shadow-black/20 relative"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent-red rounded-full pulse-dot" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-14 w-80 glass-panel rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden fade-in">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-white">Notifications</span>
                  <span className="text-[10px] text-accent-red font-semibold px-2 py-0.5 bg-accent-red/10 rounded-full">
                    {unreadCount} new
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer ${
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
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <button className="w-11 h-11 rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200 shadow-lg shadow-black/20">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
        </button>
      </div>

      {!expanded && !showBriefs && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 glass-pill rounded-full text-[10px] text-white/15 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <Command size={10} /> <span className="font-mono">K</span> to search
          <span className="text-white/8 mx-1">&middot;</span>
          Click <span className="font-bold text-accent-red/40">R</span> to navigate
        </div>
      )}
    </>
  );
}

function NavBriefCard({ brief, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[200px] glass-card rounded-xl overflow-hidden cursor-pointer card-hover group"
    >
      <div className="relative h-20 overflow-hidden">
        <img
          src={brief.thumbnail}
          alt={brief.title}
          className="w-full h-full object-cover img-cinematic transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-1.5 right-1.5">
          <PriorityBadge priority={brief.priority} />
        </div>
        <div className="absolute bottom-1.5 left-2">
          <StatusBadge status={brief.status} small />
        </div>
      </div>

      <div className="p-2.5">
        <h4 className="text-[11px] font-bold text-white/70 truncate group-hover:text-white transition-colors">
          {brief.title}
        </h4>
        <div className="flex items-center gap-1 mt-0.5 text-[9px] text-white/20">
          <span>{brief.product}</span>
          <span className="text-white/10">&middot;</span>
          <Clock size={8} className="text-white/15" />
          <span>{brief.dueDate}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex-1 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-red/40 rounded-full"
              style={{ width: `${brief.progress}%` }}
            />
          </div>
          <span className="text-[8px] text-white/20 font-mono">
            {brief.progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

const statusColors = {
  Approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "In Review": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "In Progress": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Draft: "bg-white/[0.06] text-white/40 border-white/[0.08]",
  Delivered: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  "Needs Revision": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Needs Editor": "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

function SearchStatusBadge({ status }) {
  const cls = statusColors[status] || "bg-white/[0.06] text-white/40 border-white/[0.08]";
  return (
    <span className={`px-1.5 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider flex-shrink-0 ${cls}`}>
      {status}
    </span>
  );
}

function NavTaskRow({ task, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group/task"
    >
      <div
        className={`w-[3px] h-7 rounded-full flex-shrink-0 ${
          task.status === "In Review" ? "bg-accent-purple" : "bg-accent-blue"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-white/60 truncate group-hover/task:text-white/80 transition-colors">
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-white/20">
          <span className="text-white/30 truncate max-w-[160px]">{task.briefTitle}</span>
          <span className="text-white/10">&middot;</span>
          <Clock size={8} className="text-white/15" />
          <span>Due {task.dueDate}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <img
          src={task.assignee.avatar}
          alt=""
          className="w-5 h-5 rounded-full ring-1 ring-white/[0.06]"
        />
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} small />
      </div>
    </div>
  );
}
