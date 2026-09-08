import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Image, Loader2 } from "lucide-react";
import GalleryCard from "../components/shared/GalleryCard";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import { useGetGalleries } from "../api/content-gallery/hooks";
import { unwrapGalleries } from "../lib/mapContentAsset";
import { APP_CONTENT_INSET } from "../components/layout/chrome";
import { useWidgets } from "../contexts/WidgetContext";

export default function Galleries() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const { gallery, openGallery, openCreateGallery } = useWidgets();
  const { data: galleriesResp, isLoading } = useGetGalleries();
  const galleries = unwrapGalleries(galleriesResp);
  const galleryIdParam = searchParams.get("galleryId");

  const filtered = useMemo(() => {
    if (!search.trim()) return galleries;
    const q = search.toLowerCase();
    return galleries.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [search, galleries]);

  useEffect(() => {
    if (!galleryIdParam || galleries.length === 0) return;
    if (String(gallery?.id) === String(galleryIdParam)) return;
    const g = galleries.find((x) => String(x.id) === String(galleryIdParam));
    if (g) openGallery(g, { preserveAsset: true });
  }, [galleryIdParam, galleries, gallery?.id, openGallery]);

  return (
    <div className="flex-1 overflow-y-auto" data-shell-page-scroll>
      <div className="px-6 pb-6 fade-in" style={{ paddingTop: APP_CONTENT_INSET }}>
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
            <button
              type="button"
              onClick={() => openCreateGallery()}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-red hover:bg-accent-red/90 text-white text-[13px] font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
            >
              <Plus size={15} /> New Gallery
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 mb-4">
          <h3 className="text-xs font-bold text-white/35 uppercase tracking-wider">
            Saved Galleries
          </h3>
          <span className="text-[10px] text-white/12 font-mono bg-white/[0.03] px-1.5 py-0.5 rounded-md">
            {filtered.length}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-white/30 text-xs py-12">
            <Loader2 size={14} className="animate-spin" /> Loading galleries…
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((g) => (
              <GalleryCard
                key={g.id}
                gallery={g}
                onClick={() => openGallery(g)}
                active={String(gallery?.id) === String(g.id)}
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
  );
}
