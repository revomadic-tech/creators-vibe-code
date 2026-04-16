import { useState, useRef } from "react";
import { ArrowUpRight, Eye, Clock, User, Tag, FileText, Layers } from "lucide-react";

const IMG = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const portraitItems = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i}`,
  /** Links feed card to mock `assets` for detail panel */
  assetId: (i % 80) + 1,
  title: [
    "Reels — Street Style Tokyo",
    "Story — Athlete BTS",
    "Vertical — Lookbook SS26",
    "Reels — Studio Session",
    "Story — Product Unbox",
    "Vertical — Campaign Teaser",
    "Reels — Color Grade Test",
    "Story — Model Fitting",
    "Vertical — Night Shoot",
    "Reels — Transition Pack",
    "Story — Workshop BTS",
    "Vertical — Editorial Close-up",
  ][i],
  thumbnail: IMG(`feed-p${i + 1}`, 400, 711),
  format: "9:16",
  type: ["Reel", "Story", "Vertical"][i % 3],
  submittedBy: ["Aisha Patel", "Marcus Chen", "Luna Rivera", "James Okafor", "Sofia Andersson", "Tariq Hassan", "Mika Tanaka", "Elena Volkov"][i % 8],
  timeAgo: `${Math.floor(Math.random() * 23) + 1}h ago`,
  product: ["REVO Sport", "REVO Luxe", "REVO Core", "REVO Kids", "REVO Home", "REVO Travel"][i % 6],
  partner: ["Nike", "Adidas", "Puma", "Converse", "New Balance", "Under Armour"][i % 6],
  brief: ["SS26 Campaign", "Brand Film", "Co-Brand", "Kids Launch", "Lifestyle Shoot", "Travel Q3"][i % 6],
  resolution: "1080 × 1920",
  fileSize: `${(Math.random() * 30 + 5).toFixed(1)} MB`,
  status: ["In Review", "Delivered", "In Progress", "Approved"][i % 4],
  colorGrade: ["REVO Warm", "Cinematic Blue", "Natural Tone", "High Contrast"][i % 4],
}));

const landscapeItems = Array.from({ length: 12 }, (_, i) => ({
  id: `l${i}`,
  assetId: ((i + 24) % 80) + 1,
  title: [
    "Hero — Campaign Wide Shot",
    "Banner — Homepage Takeover",
    "Cover — YouTube Thumbnail",
    "Header — Email Newsletter",
    "Hero — Product Launch",
    "Banner — Social Cover",
    "Cover — Collection Preview",
    "Header — Landing Page",
    "Hero — Brand Film Still",
    "Banner — Event Promo",
    "Cover — Spotify Canvas",
    "Header — Press Kit",
  ][i],
  thumbnail: IMG(`feed-l${i + 1}`, 711, 400),
  format: "16:9",
  type: ["Hero Shot", "Banner", "Cover"][i % 3],
  submittedBy: ["Luna Rivera", "James Okafor", "Elena Volkov", "Tariq Hassan", "Aisha Patel", "Marcus Chen", "Sofia Andersson", "Mika Tanaka"][i % 8],
  timeAgo: `${Math.floor(Math.random() * 23) + 1}h ago`,
  product: ["REVO Luxe", "REVO Core", "REVO Sport", "REVO Home", "REVO Travel", "REVO Kids"][i % 6],
  partner: ["Converse", "Nike", "Puma", "Adidas", "Reebok", "New Balance"][i % 6],
  brief: ["Brand Film", "SS26 Campaign", "Co-Brand", "Lifestyle Shoot", "Travel Q3", "Kids Launch"][i % 6],
  resolution: "1920 × 1080",
  fileSize: `${(Math.random() * 50 + 10).toFixed(1)} MB`,
  status: ["Delivered", "In Review", "Approved", "In Progress"][i % 4],
  colorGrade: ["Cinematic Blue", "REVO Warm", "High Contrast", "Natural Tone"][i % 4],
}));

export default function NewContentFeed({ onViewAll, onAssetClick }) {
  const [seenPortrait, setSeenPortrait] = useState(new Set());
  const [seenLandscape, setSeenLandscape] = useState(new Set());
  const [paused, setPaused] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const topRowRef = useRef(null);
  const bottomRowRef = useRef(null);

  const visiblePortrait = portraitItems.filter((p) => !seenPortrait.has(p.id));
  const visibleLandscape = landscapeItems.filter((l) => !seenLandscape.has(l.id));

  const markSeenP = (id) => setSeenPortrait((s) => new Set([...s, id]));
  const markSeenL = (id) => setSeenLandscape((s) => new Set([...s, id]));

  return (
    <div
      className="space-y-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setHoveredItem(null); }}
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[28px] font-black text-white tracking-tight leading-none">
            New <span className="text-accent-red">Submissions</span>
          </h2>
          <p className="text-[12px] text-white/25 mt-2 max-w-lg leading-relaxed">
            Freshly submitted content from the creative team. Mark as seen to clear your feed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/15 font-mono">
            {visiblePortrait.length + visibleLandscape.length} unseen
          </span>
          <button
            onClick={onViewAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-red/10 border border-accent-red/15 text-[11px] font-semibold text-accent-red hover:bg-accent-red/20 transition-all duration-200"
          >
            View All
            <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {/* Portrait row — scrolls RIGHT */}
      {visiblePortrait.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/40 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/40 to-transparent z-10 pointer-events-none" />
          <div
            ref={topRowRef}
            className="flex gap-3 py-1"
            style={{
              animation: paused ? "none" : "scrollRight 60s linear infinite",
            }}
          >
            {[...visiblePortrait, ...visiblePortrait].map((item, i) => (
              <FeedCard
                key={`${item.id}-${i}`}
                item={item}
                variant="portrait"
                onSeen={() => markSeenP(item.id)}
                onClick={() => onAssetClick?.(item)}
                onHover={(el) => {
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    setHoverPos({ x: rect.right + 8, y: rect.top });
                  }
                  setHoveredItem(el ? item : null);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Landscape row — scrolls LEFT */}
      {visibleLandscape.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/40 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/40 to-transparent z-10 pointer-events-none" />
          <div
            ref={bottomRowRef}
            className="flex gap-3 py-1"
            style={{
              animation: paused ? "none" : "scrollLeft 55s linear infinite",
            }}
          >
            {[...visibleLandscape, ...visibleLandscape].map((item, i) => (
              <FeedCard
                key={`${item.id}-${i}`}
                item={item}
                variant="landscape"
                onSeen={() => markSeenL(item.id)}
                onClick={() => onAssetClick?.(item)}
                onHover={(el) => {
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    setHoverPos({ x: rect.right + 8, y: rect.top });
                  }
                  setHoveredItem(el ? item : null);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hover detail widget — fixed position */}
      {hoveredItem && (
        <ContentHoverWidget item={hoveredItem} position={hoverPos} />
      )}
    </div>
  );
}

function FeedCard({ item, variant, onSeen, onClick, onHover }) {
  const isPortrait = variant === "portrait";
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className={`group relative flex-shrink-0 overflow-hidden rounded-2xl cursor-pointer card-hover ${
        isPortrait ? "w-[160px] h-[284px]" : "w-[320px] h-[180px]"
      }`}
      onClick={onClick}
      onMouseEnter={() => onHover?.(cardRef.current)}
      onMouseLeave={() => onHover?.(null)}
    >
      <img
        src={item.thumbnail}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      {/* Format badge */}
      <div className="absolute top-2.5 left-2.5">
        <span className="px-2 py-0.5 bg-white/[0.08] backdrop-blur-xl border border-white/[0.08] rounded-md text-[9px] font-bold text-white/60 uppercase tracking-wider">
          {item.format}
        </span>
      </div>

      {/* Time ago */}
      <div className="absolute top-2.5 right-2.5">
        <span className="text-[9px] text-white/30 font-mono">
          {item.timeAgo}
        </span>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className={`font-bold text-white/80 leading-tight ${isPortrait ? "text-[11px]" : "text-[12px]"}`}>
          {item.title}
        </p>
        <p className="text-[9px] text-white/35 mt-0.5">
          by {item.submittedBy.split(" ")[0]} &middot; {item.type}
        </p>
      </div>

      {/* Hover actions */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSeen();
          }}
          className="w-8 h-8 rounded-full bg-white/[0.1] backdrop-blur-xl border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.2] transition-all duration-200"
          title="Mark as seen"
        >
          <Eye size={13} />
        </button>
      </div>

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-white/[0.1]" />
    </div>
  );
}

function ContentHoverWidget({ item, position }) {
  const statusColor = {
    "In Review": "text-accent-purple",
    "In Progress": "text-accent-blue",
    Delivered: "text-accent-teal",
    Approved: "text-accent-teal",
  }[item.status] || "text-white/40";

  const clampedY = Math.min(position.y, window.innerHeight - 360);
  const clampedX = Math.min(position.x, window.innerWidth - 280);

  return (
    <div
      className="fixed z-[60] w-[260px] glass-panel rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/50 pointer-events-none animate-expand-popup"
      style={{ top: clampedY, left: clampedX }}
    >
      {/* Preview image */}
      <div className="relative h-28 overflow-hidden">
        <img
          src={item.thumbnail}
          alt=""
          className="w-full h-full object-cover img-cinematic"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-[11px] font-bold text-white leading-tight">{item.title}</p>
        </div>
      </div>

      {/* Details */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-semibold ${statusColor}`}>{item.status}</span>
          <span className="text-[9px] text-white/20 font-mono">{item.format}</span>
        </div>

        <DetailRow icon={User} label="Submitted by" value={item.submittedBy} />
        <DetailRow icon={FileText} label="Brief" value={item.brief} />
        <DetailRow icon={Tag} label="Product" value={item.product} />
        <DetailRow icon={Layers} label="Partner" value={item.partner} />
        <DetailRow icon={Clock} label="Submitted" value={item.timeAgo} />

        <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
          <span className="text-[9px] text-white/15">{item.resolution}</span>
          <span className="text-[9px] text-white/10">&middot;</span>
          <span className="text-[9px] text-white/15">{item.fileSize}</span>
          <span className="text-[9px] text-white/10">&middot;</span>
          <span className="text-[9px] text-white/15">{item.colorGrade}</span>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={10} className="text-white/15 flex-shrink-0" />
      <span className="text-[9px] text-white/25 w-16 flex-shrink-0">{label}</span>
      <span className="text-[10px] text-white/50 font-medium truncate">{value}</span>
    </div>
  );
}
