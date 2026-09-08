import { useState, useRef, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  FileText,
  Images,
  BookOpen,
  Search,
  Command,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Plus,
  ListTodo,
} from "lucide-react";
import { useCommandCenter } from "../../contexts/CommandCenterContext";
import { useWidgets } from "../../contexts/WidgetContext";
import { briefPath, formatTaskDate } from "../../lib/adTaskBrief";
import { AD_PHASES } from "../../data/adProduction";
import { APP_GUTTER, COMMAND_BAR } from "./chrome";
import TickerMarquee from "./AnnouncementTicker";
import { useGetContentList } from "../../api/content/hooks";
import { unwrapList } from "../../lib/mapContentAsset";
import useDebounce from "../../hooks/useDebounce";

const navItems = [
  { to: "/", icon: Compass, label: "Discovery" },
  { to: "/briefs", icon: FileText, label: "Briefs" },
  { to: "/galleries", icon: Images, label: "Galleries" },
  { to: "/brand", icon: BookOpen, label: "Brand" },
];

const SETTLE_MS = 280;
const SETTLE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function FloatingNav({ progress = 0, settling = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { open: canvasOpen, toggle: toggleCanvas, setOpen: setCanvasOpen, boardItems, addTask, openTask } =
    useCommandCenter();
  const { openCreateGallery, openAsset } = useWidgets();
  const docked = progress > 0.45;
  const debouncedSearch = useDebounce(searchQuery, 350);
  const { data: searchResp, isFetching: searchLoading } = useGetContentList(
    {
      page: "1",
      size: "8",
      sort: "date",
      search: debouncedSearch.trim(),
    },
    { enabled: debouncedSearch.trim().length >= 2 }
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const assetResults = unwrapList(searchResp).items.map((a) => ({
      id: `asset-${a.id}`,
      type: "asset",
      title: a.title,
      thumbnail: a.thumbnail,
      product: a.product,
      brief: a.campaignNames?.[0] || "Library asset",
      status: a.status,
      dateSubmitted: a.dateSubmitted,
      onClick: () => openAsset(a),
    }));

    const briefResults = boardItems
      .filter((item) =>
        [item.name, item.product, item.status, item.angle, item.adCopy, ...(item.editors || [])]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
      .slice(0, 4)
      .map((item) => ({
        id: `brief-${item.id}`,
        type: "brief",
        title: item.product ? `${item.name} · ${item.product}` : item.name,
        thumbnail: null,
        product: item.product,
        brief: "Brief",
        status: item.status,
        dateSubmitted: formatTaskDate(item.dueDate),
        onClick: () => navigate(briefPath(item)),
      }));

    return [...assetResults, ...briefResults].slice(0, 10);
  }, [searchQuery, searchResp, openAsset, boardItems, navigate]);

  useEffect(() => {
    setSearchFocused(false);
    setCreateOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (docked) {
      setSearchFocused(false);
      setCreateOpen(false);
    }
  }, [docked]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchFocused(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setSearchFocused(false);
        setCreateOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setSearchFocused(false);
        setCreateOpen(false);
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
        top: `calc(${APP_GUTTER}px + ${progress} * (100dvh - ${APP_GUTTER * 2}px))`,
        left: APP_GUTTER,
        right: APP_GUTTER,
        transform: `translateY(${-progress * 100}%)`,
        transition: settling
          ? `top ${SETTLE_MS}ms ${SETTLE_EASE}, transform ${SETTLE_MS}ms ${SETTLE_EASE}`
          : "none",
      }}
    >
      <div className={COMMAND_BAR}>
        <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          data-command-gesture-handle
          onClick={() => toggleCanvas()}
          aria-label={canvasOpen ? "Go down to studio" : "Go up to command center"}
          title={canvasOpen ? "Studio" : "Command Center"}
          className="flex flex-col items-center justify-center w-9 h-9 rounded-xl border border-white/15 bg-white/[0.07] text-white/70 hover:text-white hover:bg-white/12 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing transition-all duration-200"
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

        {!docked && <TickerMarquee tone="dark" />}

        <div className="flex items-center gap-0.5 flex-shrink-0">
        {!docked && (
          <>
            <button
              type="button"
              onClick={() => {
                setCreateOpen(false);
                setSearchFocused((prev) => !prev);
                setTimeout(() => searchRef.current?.focus(), 80);
              }}
              className={iconBtn(searchFocused)}
              aria-label="Search"
            >
              <Search size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchFocused(false);
                setCreateOpen((prev) => !prev);
              }}
              className={iconBtn(createOpen)}
              aria-label="Create"
              title="Create"
            >
              <Plus size={16} strokeWidth={2.2} />
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
                  {result.thumbnail ? (
                    <img src={result.thumbnail} alt={result.title} className="w-14 h-10 rounded-lg object-cover img-cinematic flex-shrink-0" />
                  ) : (
                    <span className="w-14 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-white/30" />
                    </span>
                  )}
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
              {searchQuery.trim() ? (
                searchLoading ? "Searching library…" : "No matching assets or briefs."
              ) : (
                <span className="flex items-center gap-1.5">
                  <Command size={10} /> <span className="font-mono">K</span> to search
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {createOpen && !docked && (
        <div
          className={`absolute right-4 ${popoverAnchor} w-[240px] glass-panel rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/40 animate-expand-popup`}
        >
          <div className="px-3 py-2 border-b border-white/[0.06]">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
              Create
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreateOpen(false);
              openCreateGallery();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
          >
            <span className="size-7 rounded-lg bg-white/[0.06] text-[#E8C4A0] flex items-center justify-center shrink-0">
              <Images size={13} />
            </span>
            <span>
              <span className="block text-[12px] font-semibold text-white/90">New Gallery</span>
              <span className="block text-[10px] text-white/35">Collection of assets</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCreateOpen(false);
              const created = addTask(AD_PHASES[0].id);
              if (created) {
                setCanvasOpen(true);
                openTask(created.id);
              }
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
          >
            <span className="size-7 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-400/20 flex items-center justify-center shrink-0">
              <ListTodo size={13} />
            </span>
            <span>
              <span className="block text-[12px] font-semibold text-white/90">New Task</span>
              <span className="block text-[10px] text-white/35">Add to command center</span>
            </span>
          </button>
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
