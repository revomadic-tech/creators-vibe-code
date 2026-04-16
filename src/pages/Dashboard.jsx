import { useState } from "react";
import {
  ArrowUpRight,
  Heart,
  Bookmark,
  Share2,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DetailPanel from "../components/layout/DetailPanel";
import HeroBanner from "../components/shared/HeroBanner";
import {
  assets,
  briefs,
  socialPerformance,
} from "../data/mockData";

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

export default function Dashboard() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedBrief, setSelectedBrief] = useState(null);
  const navigate = useNavigate();

  const topContent = socialPerformance.topPerformingContent;

  const briefCards = topContent.slice(0, 3);

  return (
    <>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 relative fade-in">
          <div className="absolute inset-0 pt-14 px-6 pb-6 flex flex-col">
            {/* Brief cards row — top */}
            <div className="flex-shrink-0 mb-4">
              <div className="grid grid-cols-3 gap-3">
                {briefCards.map((content, i) => {
                  const linkedBrief = briefs.find((b) =>
                    content.brief?.toLowerCase().includes(b.product?.toLowerCase().split(" ").pop())
                  );
                  return (
                    <BriefPerformanceCard
                      key={content.id}
                      content={content}
                      index={i}
                      total={briefCards.length}
                      onClick={() => {
                        if (linkedBrief) navigate(`/briefs?briefId=${linkedBrief.id}`);
                        else navigate("/briefs");
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Hero fills remaining space */}
            <div className="flex-1 min-h-0">
              <HeroBanner
                onAssetClick={(item) => {
                  const asset = assets.find((a) => a.id === item.assetId);
                  if (asset) setSelectedAsset(asset);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedAsset && (
        <DetailPanel
          item={selectedAsset}
          type="asset"
          onClose={() => setSelectedAsset(null)}
        />
      )}
      {selectedBrief && (
        <DetailPanel
          item={selectedBrief}
          type="brief"
          onClose={() => setSelectedBrief(null)}
        />
      )}
    </>
  );
}

function BriefPerformanceCard({ content, index, total, onClick }) {
  const color = platformColors[content.platform] || "#e8442e";

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl cursor-pointer card-hover h-[160px]"
    >
      <img
        src={content.thumbnail}
        alt={content.title}
        className="absolute inset-0 w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/20" />

      {/* Full card layout — horizontal */}
      <div className="absolute inset-0 p-4 flex items-center gap-5">
        {/* Left: brief info + metric */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-accent-red/20 flex items-center justify-center flex-shrink-0">
              <FileText size={10} className="text-accent-red" />
            </div>
            <p className="text-[12px] font-bold text-white/80 truncate">{content.brief}</p>
            <span className="text-[9px] text-white/20 font-mono ml-auto flex-shrink-0">{String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
          </div>
          <p className="text-[32px] font-black text-white leading-none tracking-tight stat-number">
            {formatK(content.impressions)}+
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-white/35 font-medium">{content.platform} · {content.format}</span>
            <span className="text-[10px] font-bold text-accent-teal/70 flex items-center gap-0.5">
              <TrendingUp size={9} />{content.engagementRate}%
            </span>
          </div>
          <p className="text-[10px] text-white/30 mt-1.5 leading-relaxed line-clamp-1">{content.insight}</p>
        </div>

        {/* Right: metrics + editor + CTA */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <MetricPill icon={Heart} value={formatK(content.engagements)} />
            <MetricPill icon={Bookmark} value={formatK(content.saves)} />
            <MetricPill icon={Share2} value={formatK(content.shares)} />
          </div>
          <div className="flex items-center gap-2">
            <img src={content.editor.avatar} alt="" className="w-5 h-5 rounded-full ring-1 ring-white/[0.06]" />
            <span className="text-[9px] text-white/35 font-medium">{content.editor.name.split(" ")[0]}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-semibold text-accent-red/60 group-hover:text-accent-red transition-colors">View Brief</span>
            <ArrowUpRight size={9} className="text-accent-red/40 group-hover:text-accent-red transition-all" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-white/[0.1]" />
    </div>
  );
}

function MetricPill({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06]">
      <Icon size={9} className="text-white/30" />
      <span className="text-[10px] font-bold text-white/55">{value}</span>
    </div>
  );
}
