import { useState, useMemo } from "react";
import {
  Plus,
  Image,
  Share2,
  Lock,
  X,
  Grid3X3,
  LayoutGrid,
  Clock,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";
import DetailPanel from "../components/layout/DetailPanel";
import GalleryCard from "../components/shared/GalleryCard";
import SearchBar from "../components/ui/SearchBar";
import { FilterDropdown } from "../components/ui/FilterBar";
import ViewToggle from "../components/ui/ViewToggle";
import EmptyState from "../components/ui/EmptyState";
import { Tag } from "../components/ui/Tag";
import { useGetGalleries } from "../api/content-gallery/hooks";
import { useGetContentList } from "../api/content/hooks";
import { unwrapGalleries, unwrapList } from "../lib/mapContentAsset";

const layoutOptions = [
  { value: "grid", icon: LayoutGrid },
  { value: "compact", icon: Grid3X3 },
];

export default function Galleries() {
  const [search, setSearch] = useState("");
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [interiorType, setInteriorType] = useState("");
  const [interiorLayout, setInteriorLayout] = useState("grid");

  const { data: galleriesResp, isLoading } = useGetGalleries();
  const galleries = unwrapGalleries(galleriesResp);

  const filtered = useMemo(() => {
    if (!search.trim()) return galleries;
    const q = search.toLowerCase();
    return galleries.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [search, galleries]);

  const galleryIds = selectedGallery?.assetIds || [];
  const { data: assetsResp, isFetching: assetsLoading } = useGetContentList(
    {
      page: "1",
      size: String(Math.max(galleryIds.length, 1)),
      sort: "date",
      ids: galleryIds.join(","),
    },
    { enabled: galleryIds.length > 0 }
  );
  const loadedAssets = unwrapList(assetsResp).items;
  const interiorTypes = [
    ...new Set(loadedAssets.map((a) => a.type).filter(Boolean)),
  ];

  const galleryAssets = useMemo(() => {
    if (!selectedGallery) return [];
    return loadedAssets.filter((a) => {
      if (interiorType && a.type !== interiorType) return false;
      return true;
    });
  }, [selectedGallery, interiorType, loadedAssets]);

  const openGallery = (g) => {
    setSelectedGallery(g);
    setInteriorType("");
    setSelectedAsset(null);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-6 pt-16 fade-in">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                GALLERIES
              </h2>
              <p className="text-xs text-white/30 mt-2">
                Your saved collections and curated asset groups
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search galleries..."
                size="sm"
                className="w-64"
              />
              <button className="flex items-center gap-2 px-4 py-2.5 bg-accent-red hover:bg-accent-red/90 text-white text-[13px] font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]">
                <Plus size={15} /> New Gallery
              </button>
            </div>
          </div>

          {/* Gallery count */}
          <div className="flex items-center gap-2.5 mb-4">
            <h3 className="text-xs font-bold text-white/35 uppercase tracking-wider">
              Saved Galleries
            </h3>
            <span className="text-[10px] text-white/12 font-mono bg-white/[0.03] px-1.5 py-0.5 rounded-md">
              {filtered.length}
            </span>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="flex items-center gap-2 text-white/30 text-xs py-12">
              <Loader2 size={14} className="animate-spin" /> Loading galleries…
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((gallery) => (
                <GalleryCard
                  key={gallery.id}
                  gallery={gallery}
                  onClick={() => openGallery(gallery)}
                  active={selectedGallery?.id === gallery.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Image}
              title="No galleries found"
              description="Try a different search or create a new gallery"
            />
          )}
        </div>
      </div>

      {/* Gallery side panel — 50% width */}
      {selectedGallery && !selectedAsset && (
        <GallerySidePanel
          gallery={selectedGallery}
          galleryAssets={galleryAssets}
          assetsLoading={assetsLoading}
          interiorType={interiorType}
          setInteriorType={setInteriorType}
          interiorLayout={interiorLayout}
          setInteriorLayout={setInteriorLayout}
          interiorTypes={interiorTypes}
          onClose={() => setSelectedGallery(null)}
          onSelectAsset={(a) => setSelectedAsset(a)}
        />
      )}

      {selectedAsset && (
        <DetailPanel
          item={selectedAsset}
          type="asset"
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </>
  );
}

function GallerySidePanel({
  gallery,
  galleryAssets,
  assetsLoading,
  interiorType,
  setInteriorType,
  interiorLayout,
  setInteriorLayout,
  interiorTypes,
  onClose,
  onSelectAsset,
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 w-[520px] max-h-[80vh] flex flex-col glass-panel rounded-2xl border border-white/[0.08] animate-expand-popup shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <img src={gallery.thumbnail || gallery.coverImages?.[0]} alt="" className="w-10 h-10 rounded-xl object-cover img-cinematic flex-shrink-0 ring-1 ring-white/[0.08] bg-white/[0.04]" />
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-white truncate">{gallery.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-white/30 font-mono">{galleryAssets.length} assets</span>
              <span className="text-[9px] text-white/12">·</span>
              <span className="flex items-center gap-1 text-[10px] text-white/25"><Clock size={9} />{gallery.lastUpdated}</span>
              <span className="text-[9px] text-white/12">·</span>
              {gallery.isShared ? (
                <span className="flex items-center gap-1 text-[10px] text-white/25"><Share2 size={9} />Shared</span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-white/25"><Lock size={9} />Private</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200">
            <X size={14} />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-white/[0.04] flex-shrink-0">
          <FilterDropdown label="All Types" value={interiorType} options={interiorTypes} onChange={setInteriorType} />
          {gallery.tags?.length > 0 && (
            <div className="flex items-center gap-1 ml-2">
              {gallery.tags.map((t) => (<Tag key={t}>{t}</Tag>))}
            </div>
          )}
          <div className="ml-auto">
            <ViewToggle options={layoutOptions} value={interiorLayout} onChange={setInteriorLayout} />
          </div>
        </div>

        {/* Asset cards */}
        <div className="flex-1 overflow-y-auto p-3 custom-scroll">
          {assetsLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-white/30 text-xs">
              <Loader2 size={14} className="animate-spin" /> Loading assets…
            </div>
          ) : galleryAssets.length > 0 ? (
            <div className={`grid gap-2 ${interiorLayout === "grid" ? "grid-cols-3" : "grid-cols-4"}`}>
              {galleryAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="group relative overflow-hidden rounded-xl cursor-pointer aspect-square"
                >
                  <img src={asset.thumbnail} alt={asset.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
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
            <EmptyState icon={Image} title="No assets match your filter" description="Try adjusting your filter criteria" />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0 flex items-center gap-2">
          <button className="flex-1 py-2 bg-accent-red hover:bg-accent-red/90 text-white text-[12px] font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]">
            <ExternalLink size={13} /> Open Gallery
          </button>
          <button className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/[0.08] rounded-xl text-white/35 hover:text-white/70 transition-all duration-200">
            <Download size={14} />
          </button>
          <button className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/[0.08] rounded-xl text-white/35 hover:text-white/70 transition-all duration-200">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
