import {
  Heart,
  Bookmark,
  Share2,
  Zap,
} from "lucide-react";

function formatK(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

const platformColors = {
  Instagram: "#E1306C",
  TikTok: "#00f2ea",
  YouTube: "#FF0000",
  LinkedIn: "#0A66C2",
};

export default function ContentInsightCard({ content, index, onClick }) {
  const color = platformColors[content.platform] || "#e8442e";

  return (
    <div
      onClick={() => onClick?.(content)}
      className="group relative overflow-hidden rounded-2xl cursor-pointer card-hover flex-shrink-0 w-[260px] h-[380px]"
    >
      {/* Background image — no red filter, just the image */}
      <img
        src={content.thumbnail}
        alt={content.title}
        className="absolute inset-0 w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />

      {/* Subtle darkening gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

      {/* Top bar — title + counter */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between">
        <div>
          <p className="text-[13px] font-bold text-white/90 leading-tight">
            REVO<sup className="text-[8px]">&reg;</sup> Insight
          </p>
          <div className="w-5 h-[2px] bg-white/30 mt-2 rounded-full" />
        </div>
        <span className="text-[11px] text-white/40 font-mono">
          {String(index + 1).padStart(2, "0")}/
          {String(6).padStart(2, "0")}
        </span>
      </div>

      {/* Main metric — huge number */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-[48px] font-black text-white leading-none stat-number metric-glow tracking-tight">
          {formatK(content.impressions)}+
        </p>
        <p className="text-[12px] text-white/50 mt-1.5 leading-relaxed line-clamp-2">
          {content.insight}
        </p>

        {/* Metric pills row */}
        <div className="flex items-center gap-1.5 mt-3">
          <MiniMetric icon={Heart} value={formatK(content.engagements)} />
          <MiniMetric icon={Bookmark} value={formatK(content.saves)} />
          <MiniMetric icon={Share2} value={formatK(content.shares)} />
          <div className="ml-auto flex items-center gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] text-white/40 font-medium">
              {content.platform}
            </span>
          </div>
        </div>
      </div>

      {/* Hover: show engagement rate badge */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="glass-pill rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
          <Zap size={10} className="text-accent-orange" />
          <span className="text-[11px] font-bold text-white">
            {content.engagementRate}%
          </span>
        </div>
      </div>

      {/* Editor avatar */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-1.5 glass-pill rounded-full px-2 py-1">
          <img
            src={content.editor.avatar}
            alt=""
            className="w-4 h-4 rounded-full"
          />
          <span className="text-[10px] text-white/60 font-medium">
            {content.editor.name.split(" ")[0]}
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.08]">
      <Icon size={10} className="text-white/40" />
      <span className="text-[10px] font-semibold text-white/60">{value}</span>
    </div>
  );
}
