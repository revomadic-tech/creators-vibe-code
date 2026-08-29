import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Link2,
  ListTodo,
  Search,
  Users,
} from "lucide-react";
import { teamMembers } from "../../data/mockData";
import { useCommandCenter } from "../../contexts/CommandCenterContext";
import { AD_PHASES } from "../../data/adProduction";

export function galleryArcTarget(gallery) {
  if (!gallery) return null;
  const count = gallery.assetCount ?? gallery.assetIds?.length ?? 0;
  return {
    kind: "gallery",
    refId: String(gallery.id),
    title: gallery.title,
    module: "Galleries",
    href: `/galleries?galleryId=${gallery.id}`,
    detail: `${count} assets`,
    imageUrl: gallery.thumbnail || gallery.coverImages?.[0],
  };
}

export function assetArcTarget(asset) {
  if (!asset) return null;
  return {
    kind: "content",
    refId: String(asset.id),
    title: asset.title || asset.name || `Asset #${asset.id}`,
    module: "Discovery",
    href: `/?assetId=${asset.id}`,
    detail: asset.product || asset.type,
    imageUrl: asset.thumbnail,
  };
}

/**
 * Arc — always pinned to the top-right corner of its nearest relative
 * widget root. Never place Arc mid-content or in toolbar flex rows.
 *
 * Click opens a compact popover: share to teammate, copy link, create task.
 */
export default function ArcShare({
  target,
  className = "",
  tone = "dark",
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("menu");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharedName, setSharedName] = useState("");
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);
  const { addTask, openTask } = useCommandCenter();

  const absoluteHref = useMemo(() => {
    if (!target?.href) return "";
    if (target.href.startsWith("http")) return target.href;
    if (typeof window === "undefined") return target.href;
    return `${window.location.origin}${target.href.startsWith("/") ? "" : "/"}${target.href}`;
  }, [target?.href]);

  const teammates = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = teamMembers.filter(Boolean);
    if (!q) return list;
    return list.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) {
      setMenuPos(null);
      return undefined;
    }
    const place = () => {
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      setMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    };
    place();
    const onPointer = (e) => {
      if (rootRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    setMode("menu");
    setQuery("");
    setCopied(false);
    setSharedName("");
  }, [open]);

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    try {
      await copyText(absoluteHref);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 900);
    } catch {
      /* clipboard blocked */
    }
  };

  const handleShareTo = async (member) => {
    try {
      await copyText(`Sharing: ${target.title}\n${absoluteHref}`);
      setSharedName(member.name);
      window.setTimeout(() => setOpen(false), 900);
    } catch {
      /* clipboard blocked */
    }
  };

  const handleCreateTask = (e) => {
    e.stopPropagation();
    const created = addTask(AD_PHASES[0].id, {
      name: target.title,
      summary: absoluteHref,
      angle: target.module || "Gallery",
    });
    if (created) openTask(created.id);
    setOpen(false);
  };

  if (!target) return null;

  return (
    <div
      ref={rootRef}
      className={`absolute top-0 right-0 z-30 ${className}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={`Share ${target.title}`}
        title="Quick share"
        onClick={() => setOpen((v) => !v)}
        className={`group/arc relative size-9 rounded-bl-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C4A0] focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${
          tone === "dark"
            ? "text-white/45 hover:text-[#E8C4A0]"
            : "text-stone-400 hover:text-stone-800"
        } ${open ? (tone === "dark" ? "text-[#E8C4A0]" : "text-stone-900") : ""}`}
      >
        <svg
          aria-hidden
          viewBox="0 0 36 36"
          className="absolute inset-0 size-full"
          fill="none"
        >
          <path
            d="M 10 2.5 A 23.5 23.5 0 0 1 33.5 26"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="transition-[stroke-width] group-hover/arc:stroke-[1.75]"
          />
        </svg>
      </button>

      {open &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed w-[240px] rounded-xl shadow-xl shadow-black/40 border border-white/[0.08] bg-[#1c1c1e] overflow-hidden z-[80]"
            style={{ top: menuPos.top, right: menuPos.right }}
            onClick={(e) => e.stopPropagation()}
          >
            {mode === "menu" ? (
              <div className="py-1.5">
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                    Quick share
                  </p>
                  <p className="text-[12px] font-semibold text-white truncate mt-0.5">
                    {target.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMode("share");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] font-medium text-white/80 hover:bg-white/[0.06] transition-colors"
                >
                  <span className="size-7 rounded-lg bg-stone-900 text-[#E8C4A0] flex items-center justify-center shrink-0">
                    <Users size={13} />
                  </span>
                  Share to teammate
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] font-medium text-white/80 hover:bg-white/[0.06] transition-colors"
                >
                  <span className="size-7 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-400/20 flex items-center justify-center shrink-0">
                    {copied ? <Check size={13} /> : <Link2 size={13} />}
                  </span>
                  {copied ? "Copied" : "Copy link"}
                </button>
                <button
                  type="button"
                  onClick={handleCreateTask}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] font-medium text-white/80 hover:bg-white/[0.06] transition-colors"
                >
                  <span className="size-7 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-400/20 flex items-center justify-center shrink-0">
                    <ListTodo size={13} />
                  </span>
                  Create task
                </button>
              </div>
            ) : (
              <div className="flex flex-col max-h-[320px]">
                <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMode("menu");
                      setQuery("");
                      setSharedName("");
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-white/35 hover:text-white/80"
                  >
                    Back
                  </button>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                    Share to teammate
                  </span>
                </div>
                <div className="relative px-2.5 py-2">
                  <Search
                    size={12}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                  />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search team…"
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06] text-[12px] text-white placeholder:text-white/25 outline-none focus:border-[#E8C4A0]/40"
                  />
                </div>
                <div className="flex-1 overflow-y-auto custom-scroll pb-1.5">
                  {sharedName ? (
                    <p className="px-3 py-3 text-[12px] text-[#E8C4A0]">
                      Link copied · share with {sharedName}
                    </p>
                  ) : teammates.length === 0 ? (
                    <p className="px-3 py-3 text-[11px] text-white/35">No matches</p>
                  ) : (
                    teammates.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleShareTo(member)}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-white/[0.06] transition-colors"
                      >
                        <img
                          src={member.avatar}
                          alt=""
                          className="size-7 rounded-full object-cover bg-white/[0.06]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-medium text-white/85 truncate">
                            {member.name}
                          </span>
                          <span className="block text-[10px] text-white/35 truncate">
                            {member.role}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
