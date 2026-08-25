import { useState, useRef, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  FileText,
  Images,
  BookOpen,
  Bell,
  Search,
  Settings,
  Command,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Users,
} from "lucide-react";
import { currentUser, notifications, briefs, assets } from "../../data/mockData";
import { useCommandCenter } from "../../contexts/CommandCenterContext";
import { APP_TICKER_H, APP_NAV_H, APP_GUTTER } from "./chrome";

const navItems = [
  { to: "/", icon: Compass, label: "Discovery" },
  { to: "/briefs", icon: FileText, label: "Briefs" },
  { to: "/galleries", icon: Images, label: "Galleries" },
  { to: "/brand", icon: BookOpen, label: "Brand" },
];

const SETTLE_MS = 280;
const SETTLE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function FloatingNav({ progress = 0, settling = false }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { open: canvasOpen, toggle: toggleCanvas, setOpen: setCanvasOpen } =
    useCommandCenter();
  const docked = progress > 0.45;
  const unreadCount = notifications.filter((n) => !n.read).length;

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
        onClick: () => navigate(`/?assetId=${a.id}`),
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
    setShowNotifications(false);
    setSearchFocused(false);
  }, [location.pathname]);

  useEffect(() => {
    if (docked) {
      setShowNotifications(false);
      setSearchFocused(false);
    }
  }, [docked]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchFocused(true);
        setShowNotifications(false);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setShowNotifications(false);
        setSearchFocused(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setShowNotifications(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const iconBtn = (active) =>
    `w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
      active
        ? "bg-white/[0.12] text-white"
        : "text-white/40 hover:text-white hover:bg-white/[0.08]"
    }`;

  const popoverAnchor = docked ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div
      ref={navRef}
      data-command-interactive
      className="fixed z-50"
      style={{
        top: `calc(${APP_TICKER_H}px + ${progress} * (100dvh - ${APP_NAV_H}px - ${APP_TICKER_H}px))`,
        left: APP_GUTTER,
        right: APP_GUTTER,
        transition: settling ? `top ${SETTLE_MS}ms ${SETTLE_EASE}` : "none",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 w-full px-4 py-1.5 glass-nav shadow-lg shadow-black/30 rounded-xl"
        style={{ backgroundColor: "rgba(25, 30, 41, 0.42)" }}
      >
        <div className="flex items-center gap-0.5 min-w-0 overflow-x-auto">
        <button
          type="button"
          data-command-gesture-handle
          onClick={() => toggleCanvas()}
          aria-label={canvasOpen ? "Go down to studio" : "Go up to command center"}
          title={canvasOpen ? "Studio" : "Command Center"}
          className={`flex flex-col items-center justify-center w-9 h-9 rounded-xl border flex-shrink-0 touch-none cursor-grab active:cursor-grabbing transition-all duration-200 ${
            canvasOpen
              ? "bg-white/[0.1] border-white/[0.14] text-white"
              : "bg-white/[0.06] border-white/[0.1] text-white/70 hover:text-white hover:bg-white/[0.1]"
          }`}
        >
          <ChevronUp
            size={11}
            strokeWidth={2.6}
            className={`-mb-0.5 ${canvasOpen ? "text-white/30" : "text-white"}`}
          />
          <ChevronDown
            size={11}
            strokeWidth={2.6}
            className={canvasOpen ? "text-white" : "text-white/30"}
          />
        </button>

        {navItems.map((item) => {
          const isActive =
            !canvasOpen &&
            (item.to === "/"
              ? location.pathname === "/"
              : location.pathname === item.to || location.pathname.startsWith(item.to));

          const className = `flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 ${
            isActive
              ? "bg-white/[0.12] text-white"
              : "text-white/50 hover:text-white hover:bg-white/[0.06]"
          }`;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setCanvasOpen(false)}
              className={className}
            >
              <item.icon
                size={14}
                strokeWidth={isActive ? 2.2 : 1.5}
                className={isActive ? "text-accent-red" : ""}
              />
              {item.label}
            </NavLink>
          );
        })}
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
        {!docked && (
          <>
            <button
              type="button"
              onClick={() => {
                setSearchFocused((prev) => !prev);
                setShowNotifications(false);
                setTimeout(() => searchRef.current?.focus(), 80);
              }}
              className={iconBtn(searchFocused)}
              aria-label="Search"
            >
              <Search size={14} />
            </button>

            <NavLink to="/settings" className={({ isActive }) => iconBtn(isActive)}>
              <Settings size={14} />
            </NavLink>

            <NavLink to="/admin" className={({ isActive }) => iconBtn(isActive)}>
              <Users size={14} />
            </NavLink>

            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setSearchFocused(false);
              }}
              className={`${iconBtn(showNotifications)} relative`}
              aria-label="Notifications"
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent-red rounded-full pulse-dot" />
              )}
            </button>

            <button className="w-8 h-8 rounded-full overflow-hidden border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 flex-shrink-0">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            </button>
          </>
        )}
        </div>
      </div>

      {searchFocused && !docked && (
        <div className={`absolute right-4 ${popoverAnchor} w-[min(420px,calc(100vw-2rem))] glass-panel rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/40 animate-expand-popup`}>
          <div className="relative px-3 pt-3 pb-2">
            <Search size={14} className="absolute left-6 top-[22px] text-white/25 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets, briefs..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] py-2.5 pl-10 pr-10 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-6 top-[22px] text-white/20 hover:text-white/50 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {searchResults.length > 0 ? (
            <div className="max-h-[420px] overflow-y-auto p-2 space-y-1.5 border-t border-white/[0.06]">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    result.onClick();
                    setSearchFocused(false);
                  }}
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
          ) : (
            <div className="px-4 pb-3.5 text-[11px] text-white/25">
              {searchQuery.trim() ? "No matching assets or briefs." : (
                <span className="flex items-center gap-1.5">
                  <Command size={10} /> <span className="font-mono">K</span> to search
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {showNotifications && !docked && (
        <div className={`absolute right-4 ${popoverAnchor} w-80 glass-panel rounded-2xl shadow-2xl shadow-black/40 overflow-hidden fade-in`}>
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
      )}
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
