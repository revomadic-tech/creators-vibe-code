import {
  Eye,
  Download,
  User,
  Heart,
  Layers,
  FileText,
  ExternalLink,
  Clock,
} from "lucide-react";
import { StatusBadge } from "../ui/Tag";

const typeColors = {
  Photo: "bg-accent-blue",
  Video: "bg-accent-purple",
  Graphic: "bg-accent-orange",
  Motion: "bg-accent-purple",
  "3D Render": "bg-accent-teal",
  Illustration: "bg-accent-orange",
};

export default function AssetCard({
  asset,
  onClick,
  onQuickAction,
  variant = "default",
  showOverlay = true,
}) {
  if (variant === "list") return <AssetListRow asset={asset} onClick={onClick} />;
  if (variant === "featured") return <AssetFeatured asset={asset} onClick={onClick} />;
  if (variant === "mini") return <AssetMini asset={asset} onClick={onClick} />;
  if (variant === "hero") return <AssetHero asset={asset} onClick={onClick} />;
  if (variant === "cinematic") return <AssetCinematic asset={asset} onClick={onClick} />;

  const isCompact = variant === "compact";

  return (
    <div
      onClick={() => onClick?.(asset)}
      className="group rounded-2xl overflow-hidden glass-card card-focus-ring cursor-pointer"
    >
      <div className={`relative overflow-hidden ${isCompact ? "aspect-square" : "aspect-[4/3]"}`}>
        <img
          src={asset.thumbnail}
          alt={asset.title}
          className="w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          loading="lazy"
        />

        {showOverlay && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute top-0 left-0 w-full h-[2px]">
              <div className={`h-full ${typeColors[asset.type] || "bg-white/20"} opacity-50`} />
            </div>

            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
              <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded text-[8px] font-semibold text-white/70 uppercase tracking-wider">
                {asset.type}
              </span>
              <div className="flex items-center gap-1">
                {asset.editorNeeded && (
                  <span className="px-1.5 py-0.5 bg-accent-orange/90 backdrop-blur-md rounded text-[8px] font-bold text-white flex items-center gap-0.5">
                    <User size={7} /> Needed
                  </span>
                )}
                {asset.isNew && (
                  <span className="px-1.5 py-0.5 bg-accent-red/90 rounded text-[8px] font-bold text-white uppercase">
                    New
                  </span>
                )}
              </div>
            </div>

            <div className="card-quick-actions absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white/60">
                <span className="flex items-center gap-0.5 text-[9px]">
                  <Eye size={10} /> {asset.views?.toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5 text-[9px]">
                  <Download size={10} /> {asset.downloads}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                {[
                  { icon: Heart, action: "save", title: "Save" },
                  { icon: Layers, action: "gallery", title: "Add to Gallery" },
                  { icon: Download, action: "download", title: "Download" },
                ].map((btn) => (
                  <button
                    key={btn.action}
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAction?.(btn.action, asset);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white/70 hover:bg-white/25 hover:text-white transition-all duration-200"
                    title={btn.title}
                  >
                    <btn.icon size={11} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <h3 className="text-[11px] font-semibold text-white leading-tight line-clamp-1">
            {asset.title}
          </h3>
          <StatusBadge status={asset.status} small />
        </div>

        <div className="flex items-center gap-1 text-[10px] text-white/30 leading-none mb-1.5">
          <span className="font-medium text-white/50">{asset.product}</span>
          <span className="text-white/12">·</span>
          <span>{asset.partner}</span>
          <span className="text-white/12">·</span>
          <span className="text-white/20">{asset.category}</span>
        </div>

        {asset.briefTitle && (
          <div className="flex items-center gap-1 mb-2">
            <FileText size={8} className="text-accent-red/50 flex-shrink-0" />
            <span className="text-[9px] text-accent-red/60 truncate font-medium">
              {asset.briefTitle}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <img
              src={asset.editorAvatar}
              alt=""
              className="w-4 h-4 rounded-full object-cover ring-1 ring-white/[0.06]"
            />
            <span className="text-[10px] text-white/35">{asset.editor}</span>
          </div>
          <span className="text-[9px] text-white/18 font-mono">
            {asset.dateSubmitted}
          </span>
        </div>
      </div>
    </div>
  );
}

function AssetHero({ asset, onClick }) {
  return (
    <div
      onClick={() => onClick?.(asset)}
      className="group relative rounded-2xl overflow-hidden glass-card card-focus-ring cursor-pointer col-span-2 row-span-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={asset.thumbnail}
          alt={asset.title}
          className="w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[9px] font-semibold text-white/70 uppercase tracking-wider">
              {asset.type}
            </span>
            {asset.isNew && (
              <span className="px-2 py-0.5 bg-accent-red/90 rounded-md text-[9px] font-bold text-white uppercase">
                New
              </span>
            )}
          </div>
          <div className="card-quick-actions flex items-center gap-1">
            {[Heart, Download, ExternalLink].map((Icon, i) => (
              <button
                key={i}
                className="p-2 rounded-lg bg-white/10 backdrop-blur-md text-white/70 hover:bg-white/25 hover:text-white transition-all duration-200"
              >
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={asset.status} />
            {asset.editorNeeded && (
              <span className="px-2 py-0.5 bg-accent-orange/80 rounded text-[9px] font-bold text-white flex items-center gap-1">
                <User size={9} /> Editor Needed
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white leading-tight mb-1.5">
            {asset.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <span className="font-medium text-white/70">{asset.product}</span>
            <span className="text-white/15">·</span>
            <span>{asset.partner}</span>
            <span className="text-white/15">·</span>
            <span>{asset.category}</span>
            {asset.briefTitle && (
              <>
                <span className="text-white/15">·</span>
                <span className="flex items-center gap-1 text-accent-red/70">
                  <FileText size={10} /> {asset.briefTitle}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.08]">
            <div className="flex items-center gap-2">
              <img
                src={asset.editorAvatar}
                alt=""
                className="w-5 h-5 rounded-full ring-1 ring-white/10"
              />
              <span className="text-[11px] text-white/50">{asset.editor}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/30">
              <span className="flex items-center gap-1">
                <Eye size={11} /> {asset.views?.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Download size={11} /> {asset.downloads}
              </span>
              <span className="font-mono">{asset.dateSubmitted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetCinematic({ asset, onClick }) {
  return (
    <div
      onClick={() => onClick?.(asset)}
      className="group relative rounded-2xl overflow-hidden glass-card card-focus-ring cursor-pointer"
    >
      <div className="relative aspect-[2/1] overflow-hidden">
        <img
          src={asset.thumbnail}
          alt={asset.title}
          className="w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

        <div className="absolute top-2.5 right-2.5 card-quick-actions flex items-center gap-0.5">
          <button className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white/60 hover:bg-white/25 hover:text-white transition-all duration-200">
            <Heart size={11} />
          </button>
          <button className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white/60 hover:bg-white/25 hover:text-white transition-all duration-200">
            <Download size={11} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur rounded text-[8px] font-semibold text-white/60 uppercase">
              {asset.type}
            </span>
            <StatusBadge status={asset.status} small />
          </div>
          <h3 className="text-sm font-bold text-white leading-tight mb-1">
            {asset.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <span className="text-white/60">{asset.product}</span>
            <span className="text-white/12">·</span>
            <span>{asset.partner}</span>
            {asset.briefTitle && (
              <>
                <span className="text-white/12">·</span>
                <span className="flex items-center gap-0.5 text-accent-red/60">
                  <FileText size={8} />
                  {asset.briefTitle}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetMini({ asset, onClick }) {
  return (
    <div
      onClick={() => onClick?.(asset)}
      className="group rounded-2xl overflow-hidden glass-card card-focus-ring cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={asset.thumbnail}
          alt={asset.title}
          className="w-full h-full object-cover img-cinematic transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded text-[8px] font-semibold text-white/70 uppercase">
            {asset.type}
          </span>
          {asset.isNew && (
            <span className="px-1 py-0.5 bg-accent-red/90 rounded text-[7px] font-bold text-white">
              NEW
            </span>
          )}
        </div>
        <div className="card-quick-actions absolute bottom-2 right-2 flex items-center gap-0.5">
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded bg-white/10 backdrop-blur-md text-white/60 hover:bg-white/25 hover:text-white transition-all duration-200"
          >
            <Heart size={10} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded bg-white/10 backdrop-blur-md text-white/60 hover:bg-white/25 hover:text-white transition-all duration-200"
          >
            <Download size={10} />
          </button>
        </div>
      </div>
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="text-[11px] font-semibold text-white leading-tight line-clamp-1">
            {asset.title}
          </h3>
          <StatusBadge status={asset.status} small />
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/30">
          <span className="text-white/45">{asset.product}</span>
          <span className="text-white/12">·</span>
          <span>{asset.partner}</span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <img
              src={asset.editorAvatar}
              alt=""
              className="w-4 h-4 rounded-full ring-1 ring-white/[0.06]"
            />
            <span className="text-[10px] text-white/30">{asset.editor}</span>
          </div>
          <span className="text-[9px] text-white/15 font-mono">
            {asset.dateSubmitted}
          </span>
        </div>
      </div>
    </div>
  );
}

function AssetFeatured({ asset, onClick }) {
  return (
    <div
      onClick={() => onClick?.(asset)}
      className="flex-shrink-0 w-72 group rounded-2xl overflow-hidden glass-card card-focus-ring cursor-pointer"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={asset.thumbnail}
          alt={asset.title}
          className="w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {asset.isNew && (
              <span className="px-1.5 py-0.5 bg-accent-red/90 rounded text-[8px] font-bold text-white uppercase tracking-widest">
                New
              </span>
            )}
            <span className="px-1.5 py-0.5 bg-black/40 backdrop-blur rounded text-[8px] text-white/60 uppercase">
              {asset.type}
            </span>
          </div>
          <div className="card-quick-actions flex items-center gap-0.5">
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white/60 hover:bg-white/25 hover:text-white transition-all duration-200"
            >
              <Heart size={11} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-2.5 left-3 right-3">
          <div className="flex items-center gap-1.5 mb-1">
            <StatusBadge status={asset.status} small />
          </div>
          <p className="text-[13px] font-bold text-white truncate leading-tight">
            {asset.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-white/50">
            <span className="text-white/70">{asset.product}</span>
            <span className="text-white/15">·</span>
            <span>{asset.partner}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <img
              src={asset.editorAvatar}
              alt=""
              className="w-3.5 h-3.5 rounded-full ring-1 ring-white/10"
            />
            <span className="text-[9px] text-white/35">{asset.editor}</span>
            <span className="text-[9px] text-white/15 ml-auto font-mono">
              {asset.dateSubmitted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetListRow({ asset, onClick }) {
  return (
    <div
      onClick={() => onClick?.(asset)}
      className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.04] hover:border-white/[0.06] cursor-pointer transition-all duration-200 group"
    >
      <div className={`type-indicator h-9 ${typeColors[asset.type] || "bg-white/20"}`} />
      <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={asset.thumbnail}
          alt=""
          className="w-full h-full object-cover img-cinematic"
        />
        {asset.isNew && (
          <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-accent-red rounded-bl" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">
          {asset.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] text-white/20 uppercase font-medium">
            {asset.type}
          </span>
          {asset.briefTitle && (
            <span className="text-[9px] text-accent-red/50 truncate max-w-[120px]">
              ← {asset.briefTitle}
            </span>
          )}
        </div>
      </div>
      <span className="w-20 text-[10px] text-white/45 truncate font-medium">
        {asset.product}
      </span>
      <span className="w-20 text-[10px] text-white/30 truncate">
        {asset.partner}
      </span>
      <div className="w-24 flex items-center gap-1.5">
        <img
          src={asset.editorAvatar}
          alt=""
          className="w-4 h-4 rounded-full ring-1 ring-white/[0.06]"
        />
        <span className="text-[10px] text-white/30 truncate">
          {asset.editor}
        </span>
        {asset.editorNeeded && (
          <div className="w-1.5 h-1.5 rounded-full bg-accent-orange flex-shrink-0" />
        )}
      </div>
      <span className="w-16 text-right text-[10px] text-white/20 font-mono">
        {asset.dateSubmitted}
      </span>
      <div className="w-20 flex justify-end">
        <StatusBadge status={asset.status} small />
      </div>
      <div className="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded text-white/20 hover:text-white/60 transition-colors"
        >
          <Heart size={12} />
        </button>
      </div>
    </div>
  );
}
