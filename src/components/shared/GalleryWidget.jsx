import { useMemo, useState } from "react";
import {
  Clock,
  Download,
  Image,
  Loader2,
  Lock,
  Share2,
  Grid3X3,
  LayoutGrid,
} from "lucide-react";
import HoveringWidget from "../layout/HoveringWidget";
import ArcShare, { galleryArcTarget } from "./ArcShare";
import { FilterDropdown } from "../ui/FilterBar";
import ViewToggle from "../ui/ViewToggle";
import EmptyState from "../ui/EmptyState";
import { Tag } from "../ui/Tag";
import { useGetContentList } from "../../api/content/hooks";
import { unwrapList } from "../../lib/mapContentAsset";
import { useWidgets } from "../../contexts/WidgetContext";

const layoutOptions = [
  { value: "grid", icon: LayoutGrid },
  { value: "compact", icon: Grid3X3 },
];

export default function GalleryWidget() {
  const { gallery, closeGallery, openAsset } = useWidgets();
  const [interiorType, setInteriorType] = useState("");
  const [interiorLayout, setInteriorLayout] = useState("grid");

  const galleryIds = gallery?.assetIds || [];
  const { data: assetsResp, isFetching: assetsLoading } = useGetContentList(
    {
      page: "1",
      size: String(Math.max(galleryIds.length, 1)),
      sort: "date",
      ids: galleryIds.join(","),
    },
    { enabled: Boolean(gallery) && galleryIds.length > 0 },
  );
  const loadedAssets = unwrapList(assetsResp).items;
  const interiorTypes = [
    ...new Set(loadedAssets.map((a) => a.type).filter(Boolean)),
  ];
  const galleryAssets = useMemo(() => {
    if (!gallery) return [];
    return loadedAssets.filter((a) => {
      if (interiorType && a.type !== interiorType) return false;
      return true;
    });
  }, [gallery, interiorType, loadedAssets]);

  if (!gallery) return null;

  const gridCols =
    interiorLayout === "grid" ? "grid-cols-3" : "grid-cols-4";

  return (
    <HoveringWidget
      open
      onClose={closeGallery}
      ariaLabel={gallery.title}
      defaultWidth={520}
      zIndex={55}
    >
      <ArcShare
        tone="dark"
        target={galleryArcTarget({
          ...gallery,
          assetCount: galleryAssets.length,
        })}
      />

      <div className="flex items-center gap-3 px-5 py-3 pr-12 border-b border-white/[0.06] flex-shrink-0">
        <img
          src={gallery.thumbnail || gallery.coverImages?.[0]}
          alt=""
          className="w-10 h-10 rounded-xl object-cover img-cinematic flex-shrink-0 ring-1 ring-white/[0.08] bg-white/[0.04]"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-bold text-white truncate">{gallery.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-white/30 font-mono">
              {galleryAssets.length} assets
            </span>
            <span className="text-[9px] text-white/12">·</span>
            <span className="flex items-center gap-1 text-[10px] text-white/25">
              <Clock size={9} />
              {gallery.lastUpdated}
            </span>
            <span className="text-[9px] text-white/12">·</span>
            {gallery.isShared ? (
              <span className="flex items-center gap-1 text-[10px] text-white/25">
                <Share2 size={9} /> Shared
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-white/25">
                <Lock size={9} /> Private
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-5 py-2 border-b border-white/[0.04] flex-shrink-0">
        <FilterDropdown
          label="All Types"
          value={interiorType}
          options={interiorTypes}
          onChange={setInteriorType}
        />
        {gallery.tags?.length > 0 && (
          <div className="flex items-center gap-1 ml-2">
            {gallery.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
        <div className="ml-auto">
          <ViewToggle
            options={layoutOptions}
            value={interiorLayout}
            onChange={setInteriorLayout}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scroll">
        {assetsLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-white/30 text-xs">
            <Loader2 size={14} className="animate-spin" /> Loading assets…
          </div>
        ) : galleryAssets.length > 0 ? (
          <div className={`grid gap-2 ${gridCols}`}>
            {galleryAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => openAsset(asset)}
                className="group relative overflow-hidden rounded-xl cursor-pointer aspect-square"
              >
                <img
                  src={asset.thumbnail}
                  alt={asset.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-[10px] font-bold text-white/90 truncate">{asset.title}</p>
                  <p className="text-[8px] text-white/40 mt-0.5">{asset.type}</p>
                </div>
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.04] group-hover:ring-white/[0.12] transition-all duration-300" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Image}
            title="No assets match your filter"
            description="Try adjusting your filter criteria"
          />
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
        <button className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/[0.08] rounded-xl text-white/50 hover:text-white/80 text-[12px] font-semibold transition-all duration-200 flex items-center justify-center gap-2">
          <Download size={13} /> Download
        </button>
      </div>
    </HoveringWidget>
  );
}
