import { useState } from "react";
import {
  ArrowUpRight,
  AlertTriangle,
  Image,
  Zap,
} from "lucide-react";
import { teamMembers, galleries, tasks, briefs, assets, recentActivity } from "../../data/mockData";

const IMG = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const TITLES = [
  "Reels — Street Style Tokyo", "Story — Athlete BTS", "Vertical — Lookbook SS26",
  "Reels — Studio Session", "Story — Product Unbox", "Vertical — Campaign Teaser",
  "Reels — Color Grade Test", "Story — Model Fitting", "Vertical — Night Shoot",
  "Reels — Transition Pack", "Story — Workshop BTS", "Vertical — Editorial Close-up",
  "Reels — Rooftop Sunset", "Story — Warehouse Shoot", "Vertical — Campaign Hero",
  "Reels — Neon Nights", "Story — Studio Setup", "Vertical — Flat Lay Detail",
  "Reels — Outdoor Run", "Story — Packaging Reveal", "Vertical — Texture Macro",
  "Reels — Dance Collab", "Story — Green Screen", "Vertical — Layflat Grid",
  "Reels — City Walk", "Story — Before & After", "Vertical — Moodboard Live",
  "Reels — Shadow Play", "Story — Quick Tip", "Vertical — Split Screen",
  "Reels — Water Splash", "Vertical — Minimal Cut",
];
const EDITORS = ["Aisha", "Marcus", "Luna", "James", "Sofia", "Tariq", "Mika", "Elena"];

const portraitItems = Array.from({ length: 32 }, (_, i) => ({
  id: `p${i}`,
  assetId: (i % 80) + 1,
  title: TITLES[i % TITLES.length],
  thumbnail: IMG(`feed-p${(i % 20) + 1}`, 400, 711),
  format: "9:16",
  type: ["Reel", "Story", "Vertical"][i % 3],
  submittedBy: EDITORS[i % EDITORS.length],
  timeAgo: `${(i * 3 + 1) % 24}h ago`,
}));

const priorityTasks = tasks.filter((t) => t.priority === "Critical" || t.priority === "High").slice(0, 3);
const recentGalleries = galleries.slice(0, 6);

export default function HeroBanner({ onAssetClick }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const totalDelivered = teamMembers.reduce((s, m) => s + (m.stats?.assetsDelivered ?? 0), 0);
  const avgApproval = (teamMembers.reduce((s, m) => s + (m.stats?.approvalRate ?? 0), 0) / teamMembers.length).toFixed(0);
  const activeBriefCount = briefs.filter((b) => b.status === "In Progress" || b.status === "In Review").length;
  const inReviewCount = assets.filter((a) => a.status === "In Review").length;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl">
      {/* Gallery background mosaic */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-0">
          {galleries.slice(0, 8).map((g, i) => (
            <img key={g.id} src={g.thumbnail || g.coverImages?.[0]} alt="" className="w-full h-full object-cover" style={{ opacity: 0.25 - i * 0.02 }} loading="lazy" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-red/[0.04] via-transparent to-accent-purple/[0.03]" />
      </div>

      <div className="relative z-10 h-full">
        <div className="grid grid-cols-12 gap-4 p-6 h-full">

          {/* ── LEFT: Headline + Stats underneath + Priority + Activity ── */}
          <div className="col-span-3 flex flex-col h-full">
            {/* Title block */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
                <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">Command Center</span>
              </div>
              <h1 className="text-[24px] font-black text-white tracking-tight leading-[0.92] uppercase">
                Your Creative <span className="text-accent-red">Pipeline.</span>
              </h1>
              {/* Stats directly under title */}
              <div className="flex gap-1.5 mt-3">
                <MiniStat label="Delivered" value={totalDelivered.toLocaleString()} />
                <MiniStat label="Approval" value={`${avgApproval}%`} accent />
                <MiniStat label="Briefs" value={activeBriefCount} />
                <MiniStat label="Review" value={inReviewCount} />
              </div>
            </div>

            {/* Priority tasks */}
            <div className="mt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={11} className="text-accent-orange/50" />
                <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Priority</span>
              </div>
              <div className="space-y-1">
                {priorityTasks.map((t) => (
                  <a
                    key={t.id}
                    href={`/briefs?briefId=${t.briefId}`}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-200 group"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.priority === "Critical" ? "bg-red-500" : "bg-amber-500"}`} />
                    <p className="text-[11px] font-semibold text-white/50 truncate flex-1 group-hover:text-white/75 transition-colors">{t.title}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                      t.priority === "Critical" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                    }`}>{t.priority}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="mt-3 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={11} className="text-accent-blue/50" />
                <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Activity</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scroll space-y-0.5">
                {recentActivity.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <img src={a.user.avatar} alt="" className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 ring-1 ring-white/[0.06]" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-white/45 leading-relaxed">
                        <span className="font-semibold text-white/60">{a.user.name.split(" ")[0]}</span>{" "}
                        {a.action}{" "}
                        <span className="font-medium text-accent-red/60">{a.target}</span>
                      </p>
                      <p className="text-[9px] text-white/20">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CENTER: 9:16 grid — 2 visible rows, scrollable ── */}
          <div className="col-span-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
                <span className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Incoming Content</span>
                <span className="text-[8px] text-white/12 font-mono ml-1">{portraitItems.length} new</span>
              </div>
              <button
                onClick={() => window.location.href = "/discovery"}
                className="flex items-center gap-1 text-[9px] font-semibold text-white/25 hover:text-white/55 transition-colors"
              >
                View All <ArrowUpRight size={9} />
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden rounded-xl">
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
              <div className="overflow-y-auto h-full custom-scroll">
                <div className="grid grid-cols-4 gap-1.5">
                  {portraitItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-lg cursor-pointer aspect-[9/16]"
                      onClick={() => onAssetClick?.(item)}
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <img src={item.thumbnail} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                      <div className="absolute top-1.5 left-1.5">
                        <span className="px-1 py-0.5 bg-white/[0.08] backdrop-blur-xl border border-white/[0.06] rounded text-[7px] font-bold text-white/45 uppercase">{item.format}</span>
                      </div>
                      <div className="absolute top-1.5 right-1.5">
                        <span className="text-[7px] text-white/20 font-mono">{item.timeAgo}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-1.5">
                        <p className="text-[8px] font-bold text-white/70 leading-tight truncate">{item.title}</p>
                        <p className="text-[7px] text-white/25 mt-0.5">by {item.submittedBy}</p>
                      </div>
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ring-1 ring-inset ring-white/[0.1]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Stacked gallery cards ── */}
          <div className="col-span-3 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Image size={9} className="text-white/20" />
                <span className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Recent Galleries</span>
              </div>
              <a href="/galleries" className="text-[8px] text-white/18 hover:text-white/45 font-semibold transition-colors">All</a>
            </div>
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scroll">
              {recentGalleries.map((g, i) => (
                <a
                  key={g.id}
                  href="/galleries"
                  className="group relative overflow-hidden rounded-xl flex-shrink-0 block"
                  style={{ height: 100 }}
                >
                  <img src={g.thumbnail} alt={g.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ring-1 ring-inset ring-white/[0.1]" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-[10px] font-bold text-white/75 leading-tight truncate group-hover:text-white transition-colors">{g.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[8px] text-white/25">{g.assetCount} assets</span>
                      <span className="text-[8px] text-white/12">·</span>
                      <span className="text-[8px] text-white/18">{g.lastUpdated}</span>
                    </div>
                    {i === 0 && g.tags && (
                      <div className="flex gap-1 mt-1">
                        {g.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-1 py-0.5 bg-white/[0.06] rounded text-[6px] font-semibold text-white/25">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {i === 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 bg-accent-red/80 rounded text-[7px] font-bold text-white uppercase tracking-wider">Latest</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Watermark */}
        <div className="absolute -bottom-3 left-0 right-0 overflow-hidden pointer-events-none select-none z-[5]">
          <h2 className="text-[100px] font-black text-white/[0.02] tracking-tighter leading-none uppercase whitespace-nowrap">
            REVO CREATE
          </h2>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div className="flex-1 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
      <p className="text-[7px] text-white/18 font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-[15px] font-black tracking-tight leading-none mt-0.5 ${accent ? "text-accent-teal" : "text-white/65"}`}>{value}</p>
    </div>
  );
}
