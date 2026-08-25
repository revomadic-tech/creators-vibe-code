import {
  Heart,
  Bookmark,
  Share2,
  Zap,
  FileText,
  TrendingUp,
} from "lucide-react";
import { PriorityBadge } from "../ui/Tag";

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

export default function BriefInsightCard({ content, index, total, onClick }) {
  const color = platformColors[content.platform] || "#e8442e";

  return (
    <div
      onClick={() => onClick?.(content)}
      className="group relative overflow-hidden rounded-2xl cursor-pointer card-hover flex-shrink-0 w-[280px] h-[400px]"
    >
      <img
        src={content.thumbnail}
        alt={content.title}
        className="absolute inset-0 w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

      {/* Top — brief badge + counter */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent-red/20 flex items-center justify-center">
            <FileText size={10} className="text-accent-red" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
              Brief
            </p>
            <p className="text-[11px] font-semibold text-white/70 leading-tight mt-0.5 max-w-[160px] truncate">
              {content.brief}
            </p>
          </div>
        </div>
        <span className="text-[10px] text-white/30 font-mono">
          {String(index + 1).padStart(2, "0")}/
          {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Bottom — metrics + insight */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-[11px] font-bold text-white/80 leading-tight mb-1">
          {content.title}
        </p>

        <p className="text-[42px] font-black text-white leading-none stat-number metric-glow tracking-tight">
          {formatK(content.impressions)}+
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-[10px] text-white/40 font-medium">
            {content.platform} &middot; {content.format}
          </span>
          <span className="text-[10px] font-bold text-accent-teal/70 flex items-center gap-0.5 ml-auto">
            <TrendingUp size={9} />
            {content.engagementRate}%
          </span>
        </div>

        <p className="text-[11px] text-white/40 mt-2 leading-relaxed line-clamp-2">
          {content.insight}
        </p>

        {/* Metric pills */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <MiniMetric icon={Heart} value={formatK(content.engagements)} />
          <MiniMetric icon={Bookmark} value={formatK(content.saves)} />
          <MiniMetric icon={Share2} value={formatK(content.shares)} />
        </div>
      </div>

      {/* Hover: editor + engagement rate */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="glass-pill rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
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
