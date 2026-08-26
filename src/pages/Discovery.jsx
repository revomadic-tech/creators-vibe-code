import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Grid3X3,
  Rows3,
  Video,
  Palette,
  Box,
  Sparkles,
  X,
  SlidersHorizontal,
  Clock,
  Eye,
  Film,
  Camera,
  Check,
  ArrowUpDown,
  ChevronDown,
  Upload,
  ArrowRight,
  ArrowLeft,
  Package,
  Grid2X2,
  FileText,
  Users,
  BarChart3,
  Image,
  PanelLeftOpen,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DetailPanel from "../components/layout/DetailPanel";
import AssetCard from "../components/shared/AssetCard";
import TeamShowcase from "../components/shared/TeamShowcase";
import FolderTree from "../components/shared/FolderTree";
import { teamMembers, briefs } from "../data/mockData";
import {
  useGetContentById,
  useGetContentDiscoveryFeed,
  useGetContentList,
  useMergedContentList,
} from "../api/content/hooks";
import { useGetGalleries } from "../api/content-gallery/hooks";
import {
  mapContentAsset,
  mapDiscoveryProduct,
  unwrapDetail,
  unwrapFeed,
  unwrapGalleries,
  unwrapList,
} from "../lib/mapContentAsset";
import {
  EMPTY_FEED,
  PAGE_SIZE,
  SORT_TO_API,
  apiTypesFromUi,
  uiTypesFromCounts,
} from "../lib/contentConstants";
import {
  familyIdsForProductFilter,
  groupProductFamilies,
} from "../lib/groupProductFamilies";

const typeIcons = {
  Photo: Camera,
  Video: Film,
  Graphic: Palette,
  "3D Render": Box,
  Motion: Video,
  Illustration: Palette,
};
const PRODUCT_STATUSES = ["In Progress", "In Review", "Approved", "Delivered", "Needs Revision"];

const sortOptions = [
  { value: "newest", label: "Newest First", icon: Clock },
  { value: "oldest", label: "Oldest First", icon: Clock },
  { value: "views", label: "Most Viewed", icon: Eye },
  { value: "downloads", label: "Most Downloaded", icon: ArrowUpDown },
  { value: "az", label: "A → Z", icon: ArrowUpDown },
];

export default function Discovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [typeFilters, setTypeFilters] = useState([]);
  const [layout, setLayout] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState("all");
  const [folderMeta, setFolderMeta] = useState(null);
  const [folderHidden, setFolderHidden] = useState(true);
  const [page, setPage] = useState(0);

  const assetIdParam = searchParams.get("assetId");
  const productFilter = searchParams.get("product") || "";
  const categoryFilter = searchParams.get("tag") || searchParams.get("category") || "";

  const patchParams = useCallback(
    (mutate) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        mutate(next);
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setProductFilter = useCallback(
    (value) => {
      setPage(0);
      patchParams((next) => {
        if (value) next.set("product", String(value));
        else next.delete("product");
      });
    },
    [patchParams]
  );

  const setCategoryFilter = useCallback(
    (value) => {
      setPage(0);
      patchParams((next) => {
        if (value) next.set("tag", String(value));
        else {
          next.delete("tag");
          next.delete("category");
        }
      });
    },
    [patchParams]
  );

  const { data: feedResp, isLoading: feedLoading } =
    useGetContentDiscoveryFeed();
  const feed = unwrapFeed(feedResp) || EMPTY_FEED;
  const discoveryProducts = useMemo(
    () =>
      groupProductFamilies(
        (feed.products || []).map(mapDiscoveryProduct).filter(Boolean)
      ),
    [feed.products]
  );
  const { data: galleriesResp } = useGetGalleries();
  const liveGalleries = unwrapGalleries(galleriesResp);
  const featuredAssets = useMemo(
    () => (feed.featured || []).map(mapContentAsset).filter(Boolean),
    [feed.featured]
  );
  const newAssets = useMemo(
    () => (feed.trending || []).map(mapContentAsset).filter(Boolean),
    [feed.trending]
  );
  const typeOptions = uiTypesFromCounts(feed.typeCounts);

  const folderIds = useMemo(() => {
    if (folderMeta?.isNew) return newAssets.map((a) => a.id);
    if (folderMeta?.isFeatured) return featuredAssets.map((a) => a.id);
    return folderMeta?.ids || [];
  }, [folderMeta, newAssets, featuredAssets]);

  const queryProductIds = useMemo(
    () => familyIdsForProductFilter(discoveryProducts, productFilter),
    [discoveryProducts, productFilter]
  );

  const listPayload = useMemo(() => {
    const payload = {
      page: String(page + 1),
      size: String(PAGE_SIZE),
      sort: SORT_TO_API[sortBy] || "date",
    };
    const apiType = apiTypesFromUi(typeFilters);
    if (apiType) payload.type = apiType;
    if (categoryFilter) payload.tag = categoryFilter;
    if (folderIds.length) payload.ids = folderIds.join(",");
    return payload;
  }, [page, sortBy, typeFilters, categoryFilter, folderIds]);

  const {
    items: filteredAssets,
    count: totalCount,
    pages: totalPagesRaw,
    isLoading: listLoading,
    isFetching: listFetching,
  } = useMergedContentList(listPayload, queryProductIds);
  const totalPages = totalPagesRaw || 1;

  const deepLinkId = assetIdParam && !Number.isNaN(Number(assetIdParam))
    ? Number(assetIdParam)
    : null;
  const { data: detailResp } = useGetContentById(deepLinkId);
  const selectedAsset =
    (deepLinkId && filteredAssets.find((a) => a.id === deepLinkId)) ||
    (deepLinkId ? unwrapDetail(detailResp) : null);

  const relatedPayload = useMemo(
    () => ({
      page: "1",
      size: "5",
      sort: "date",
      ...(selectedAsset?.productId
        ? { productId: String(selectedAsset.productId) }
        : {}),
    }),
    [selectedAsset]
  );
  const { data: relatedResp } = useGetContentList(relatedPayload, {
    enabled: Boolean(selectedAsset?.productId),
  });

  const hasActiveFilters =
    typeFilters.length > 0 ||
    productFilter ||
    categoryFilter ||
    folderMeta;
  const activeFilterCount = [
    typeFilters.length > 0,
    productFilter,
    categoryFilter,
    folderMeta,
  ].filter(Boolean).length;

  const productLabel = discoveryProducts.find(
    (p) =>
      String(p.id) === String(productFilter) ||
      (p.variantIds || []).map(String).includes(String(productFilter))
  )?.name || productFilter;

  const handleSelectFolder = useCallback((node) => {
    if (node.kind === "group") return;
    setPage(0);
    setSelectedFolderId(node.id);
    setTypeFilters([]);
    setFolderMeta(null);
    if (node.kind === "all") {
      setProductFilter("");
      setCategoryFilter("");
      return;
    }
    if (node.kind === "product") {
      setCategoryFilter("");
      setProductFilter(String(node.value));
    } else if (node.kind === "category") {
      setProductFilter("");
      setCategoryFilter(node.value);
    } else if (node.kind === "type") {
      setProductFilter("");
      setCategoryFilter("");
      setTypeFilters([node.value]);
    } else if (node.kind === "new") {
      setProductFilter("");
      setCategoryFilter("");
      setFolderMeta({ isNew: true });
    } else if (node.kind === "featured") {
      setProductFilter("");
      setCategoryFilter("");
      setFolderMeta({ isFeatured: true });
    } else if (node.kind === "gallery") {
      setProductFilter("");
      setCategoryFilter("");
      setFolderMeta({
        galleryTitle: node.label,
        ids: node.assetIds || [],
      });
    }
  }, [setProductFilter, setCategoryFilter]);

  const clearAll = useCallback(() => {
    setPage(0);
    setTypeFilters([]);
    setProductFilter("");
    setCategoryFilter("");
    setFolderMeta(null);
    setSelectedFolderId("all");
  }, [setProductFilter, setCategoryFilter]);

  const openAsset = useCallback(
    (asset) => {
      patchParams((next) => {
        next.set("assetId", String(asset.id));
      });
    },
    [patchParams]
  );

  const closeAsset = useCallback(() => {
    patchParams((next) => {
      next.delete("assetId");
    });
  }, [patchParams]);

  const relatedAssets = unwrapList(relatedResp).items.filter(
    (a) => a.id !== selectedAsset?.id
  ).slice(0, 4);

  const currentSort = sortOptions.find((s) => s.value === sortBy);

  if (activeProduct) {
    return (
      <>
        <ProductFullPage
          product={activeProduct}
          onBack={() => setActiveProduct(null)}
          onAssetClick={openAsset}
        />
        {selectedAsset && (
          <DetailPanel
            item={selectedAsset}
            type="asset"
            onClose={closeAsset}
            relatedAssets={relatedAssets}
            onSelectRelated={openAsset}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-hidden flex flex-col" id="discovery-scroll">
        <div className="fade-in pt-14 flex-1 flex overflow-hidden min-h-0">
          {!folderHidden && (
            <FolderTree
              totalCount={feed.totalCount}
              newCount={feed.newToday || newAssets.length}
              featuredCount={featuredAssets.length}
              products={discoveryProducts}
              tags={feed.tags || []}
              typeCounts={feed.typeCounts}
              galleries={liveGalleries}
              typeIcons={typeIcons}
              selectedId={selectedFolderId}
              onSelect={handleSelectFolder}
              onHide={() => setFolderHidden(true)}
            />
          )}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {!hasActiveFilters && (
            <div className="px-6">
              {/* Just Landed — above library filters */}
              {newAssets.length > 0 && (
                <div className="mb-6 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-5 h-5 rounded-md bg-accent-red/12">
                        <Upload size={10} className="text-accent-red" />
                      </div>
                      <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
                        Just Landed
                      </h3>
                      <span className="text-[10px] text-accent-red/60 font-mono">
                        {newAssets.length} new
                      </span>
                    </div>
                    <span className="text-[10px] text-white/12 font-mono">
                      Last 72 hours
                    </span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                    {newAssets.slice(0, 8).map((asset) => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        onClick={openAsset}
                        variant="featured"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Product collections — above command bar */}
              <div className="mb-6">
                <ProductCollectionSlider
                  products={discoveryProducts}
                  onSelectProduct={setActiveProduct}
                />
              </div>
            </div>
            )}

            {/* Command Bar */}
            <div className="sticky top-0 z-20 command-bar px-6 py-3">
            <div>
              <div className="flex items-center gap-2.5 flex-nowrap">
                {folderHidden && (
                  <button
                    type="button"
                    onClick={() => setFolderHidden(false)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.05] text-white/35 hover:text-white/55 hover:border-white/[0.08] text-[13px] font-medium transition-all duration-200"
                    title="Show library"
                  >
                    <PanelLeftOpen size={13} />
                    <span className="hidden xl:inline">Library</span>
                  </button>
                )}
                <TypeMultiSelect
                  values={typeFilters}
                  options={typeOptions}
                  onChange={(next) => {
                    setPage(0);
                    setTypeFilters(next);
                    if (selectedFolderId.startsWith("type:"))
                      setSelectedFolderId("all");
                  }}
                />

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    showFilters
                      ? "bg-white/[0.08] text-white border border-white/[0.1]"
                      : "bg-white/[0.04] border border-white/[0.05] text-white/35 hover:text-white/55 hover:border-white/[0.08]"
                  }`}
                >
                  <SlidersHorizontal size={13} /> Filters
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 bg-accent-red rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] border border-white/[0.05] rounded-xl text-[13px] text-white/35 hover:text-white/55 hover:border-white/[0.08] transition-all duration-200"
                  >
                    <ArrowUpDown size={12} /> {currentSort?.label}{" "}
                    <ChevronDown size={10} />
                  </button>
                  {showSortMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute right-0 top-10 w-48 glass-panel rounded-xl shadow-2xl z-50 py-1 fade-in">
                        {sortOptions.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => {
                              setPage(0);
                              setSortBy(s.value);
                              setShowSortMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-all duration-150 ${
                              sortBy === s.value
                                ? "text-white bg-white/[0.04]"
                                : "text-white/45 hover:text-white hover:bg-white/[0.03]"
                            }`}
                          >
                            <s.icon size={12} /> {s.label}
                            {sortBy === s.value && (
                              <Check
                                size={12}
                                className="ml-auto text-accent-red"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Layout */}
                <div className="flex-shrink-0 flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.04] rounded-xl p-0.5">
                  {[
                    { v: "grid", i: Grid3X3 },
                    { v: "list", i: Rows3 },
                  ].map((l) => (
                    <button
                      key={l.v}
                      onClick={() => setLayout(l.v)}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        layout === l.v
                          ? "bg-white/[0.1] text-white shadow-sm"
                          : "text-white/25 hover:text-white/45"
                      }`}
                    >
                      <l.i size={14} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced filters row */}
              { (showFilters || productFilter || categoryFilter) && (
                <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-white/[0.04] fade-in">
                  <span className="text-[10px] text-white/18 uppercase tracking-wider font-semibold mr-1">
                    Refine
                  </span>
                  <FilterChip
                    label="Product"
                    value={productFilter}
                    options={discoveryProducts.map((p) => ({
                      value: String(p.id),
                      label: p.name,
                    }))}
                    onChange={setProductFilter}
                  />
                  <FilterChip
                    label="Category"
                    value={categoryFilter}
                    options={feed.tags || []}
                    onChange={setCategoryFilter}
                  />
                  {hasActiveFilters && (
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-accent-red hover:text-white font-medium transition-colors rounded-lg hover:bg-accent-red/10"
                    >
                      <X size={11} /> Clear all
                    </button>
                  )}
                  <div className="ml-auto text-[11px] text-white/18 font-mono">
                    {(totalCount || filteredAssets.length).toLocaleString()} results
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6">
            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 pt-4 pb-4 flex-wrap">
                {typeFilters.map((t) => (
                  <ActiveChip
                    key={t}
                    label={t}
                    onRemove={() => {
                      setTypeFilters(typeFilters.filter((v) => v !== t));
                      if (selectedFolderId.startsWith("type:"))
                        setSelectedFolderId("all");
                    }}
                  />
                ))}
                {productFilter && (
                  <ActiveChip
                    label={productLabel}
                    onRemove={() => {
                      setProductFilter("");
                      if (selectedFolderId.startsWith("product:"))
                        setSelectedFolderId("all");
                    }}
                  />
                )}
                {categoryFilter && (
                  <ActiveChip
                    label={categoryFilter}
                    onRemove={() => {
                      setCategoryFilter("");
                      if (selectedFolderId.startsWith("category:"))
                        setSelectedFolderId("all");
                    }}
                  />
                )}
                {folderMeta?.galleryTitle && (
                  <ActiveChip
                    label={folderMeta.galleryTitle}
                    onRemove={() => {
                      setFolderMeta(null);
                      setSelectedFolderId("all");
                    }}
                  />
                )}
                {folderMeta?.isNew && (
                  <ActiveChip
                    label="Just Landed"
                    onRemove={() => {
                      setFolderMeta(null);
                      setSelectedFolderId("all");
                    }}
                  />
                )}
                {folderMeta?.isFeatured && (
                  <ActiveChip
                    label="Featured"
                    onRemove={() => {
                      setFolderMeta(null);
                      setSelectedFolderId("all");
                    }}
                  />
                )}
              </div>
            )}

            {/* Main Grid */}
            <div className={`pb-8 ${hasActiveFilters ? "" : "pt-4"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white/35 uppercase tracking-wider">
                    {hasActiveFilters ? "Results" : "All Assets"}
                  </h3>
                  <span className="text-[10px] text-white/12 font-mono bg-white/[0.03] px-1.5 py-0.5 rounded-md">
                    {(totalCount || filteredAssets.length).toLocaleString()}
                  </span>
                  {(listLoading || listFetching || feedLoading) && (
                    <Loader2 size={12} className="text-white/25 animate-spin" />
                  )}
                </div>
              </div>

              {layout === "grid" ? (
                <div className="grid grid-cols-10 gap-2 [&>*]:min-w-0">
                  {filteredAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onClick={openAsset}
                      variant="compact"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-2 py-2 text-[9px] text-white/12 font-semibold uppercase tracking-wider">
                    <span className="w-3" />
                    <span className="w-14" />
                    <span className="flex-1">Asset</span>
                    <span className="w-20">Product</span>
                    <span className="w-20">Partner</span>
                    <span className="w-24">Editor</span>
                    <span className="w-16 text-right">Date</span>
                    <span className="w-20 text-right">Status</span>
                    <span className="w-8" />
                  </div>
                  {filteredAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onClick={openAsset}
                      variant="list"
                    />
                  ))}
                </div>
              )}

              {filteredAssets.length === 0 && !listLoading && (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center mb-4">
                    <Search
                      size={24}
                      strokeWidth={1.2}
                      className="text-white/10"
                    />
                  </div>
                  <p className="text-sm text-white/25 font-medium">
                    No assets match your criteria
                  </p>
                  <p className="text-xs text-white/12 mt-1 mb-3">
                    Try adjusting your filters
                  </p>
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 text-xs font-medium text-accent-red bg-accent-red/8 border border-accent-red/15 rounded-xl hover:bg-accent-red/12 transition-all duration-200"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    type="button"
                    disabled={page <= 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/50 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft size={12} /> Prev
                  </button>
                  <span className="text-[11px] text-white/30 font-mono">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/50 hover:text-white disabled:opacity-30"
                  >
                    Next <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Editors Behind the Work */}
            <div className="mt-8 mb-4">
              <TeamShowcase
                title="Editors Behind"
                titleAccent="the Work"
                subtitle="The creative talent producing and refining REVO's 30,000+ asset library."
                members={teamMembers}
              />
            </div>
          </div>
          </div>
        </div>
      </div>

      {selectedAsset && (
        <DetailPanel
          item={selectedAsset}
          type="asset"
          onClose={closeAsset}
          relatedAssets={relatedAssets}
          onSelectRelated={openAsset}
        />
      )}
    </>
  );
}

function TypeMultiSelect({ values, options, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = values.length > 0;

  const toggle = (option) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div className="relative flex-shrink-0 z-50">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
          selected
            ? "bg-white/[0.08] text-white border border-white/[0.1]"
            : "bg-white/[0.04] border border-white/[0.05] text-white/35 hover:text-white/55 hover:border-white/[0.08]"
        }`}
      >
        Type
        {selected && (
          <span className="w-4 h-4 bg-accent-red rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
            {values.length}
          </span>
        )}
        <ChevronDown size={10} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-10 w-48 glass-panel rounded-xl shadow-2xl z-50 py-1 fade-in"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onChange([])}
              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-all duration-150 ${
                !selected
                  ? "text-white bg-white/[0.04]"
                  : "text-white/45 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Sparkles size={12} /> All types
              {!selected && (
                <Check size={12} className="ml-auto text-accent-red" />
              )}
            </button>
            {options.map((option) => {
              const Icon = typeIcons[option] || Sparkles;
              const isOn = values.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggle(option)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-all duration-150 ${
                    isOn
                      ? "text-white bg-white/[0.04]"
                      : "text-white/45 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon size={12} /> {option}
                  {isOn && (
                    <Check size={12} className="ml-auto text-accent-red" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function FilterChip({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const items = (options || []).map((o) =>
    typeof o === "object" ? o : { value: o, label: o }
  );
  const current = items.find((o) => String(o.value) === String(value));
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
          value
            ? "bg-accent-red/8 border border-accent-red/18 text-accent-red"
            : "bg-white/[0.04] border border-white/[0.05] text-white/35 hover:text-white/50 hover:border-white/[0.08]"
        }`}
      >
        {current?.label || label} <ChevronDown size={10} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 w-44 glass-panel rounded-xl shadow-2xl z-50 py-1 fade-in max-h-60 overflow-y-auto">
            <button
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-[11px] transition-all duration-150 ${
                !value
                  ? "text-white bg-white/[0.04]"
                  : "text-white/40 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              All {label}s
            </button>
            {items.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between transition-all duration-150 ${
                  String(value) === String(o.value)
                    ? "text-white bg-white/[0.04]"
                    : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {o.label}
                {String(value) === String(o.value) && (
                  <Check size={11} className="text-accent-red" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ActiveChip({ label, onRemove }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1 px-2.5 py-1 bg-accent-red/8 border border-accent-red/15 text-accent-red rounded-full text-[10px] font-medium hover:bg-accent-red/12 transition-all duration-200"
    >
      {label} <X size={10} />
    </button>
  );
}

function ProductCollectionSlider({ products = [], onSelectProduct, compact = false }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * (compact ? 160 : 120), behavior: "smooth" });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          className={`absolute left-0 z-10 w-7 h-7 rounded-full bg-black/60 border border-white/10 text-white/80 hover:text-white hover:bg-black/80 flex items-center justify-center ${
            compact ? "top-1/2 -translate-y-1/2" : "top-8 -translate-y-1/2"
          }`}
          aria-label="Previous products"
        >
          <ArrowLeft size={12} />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll(1)}
          className={`absolute right-0 z-10 w-7 h-7 rounded-full bg-black/60 border border-white/10 text-white/80 hover:text-white hover:bg-black/80 flex items-center justify-center ${
            compact ? "top-1/2 -translate-y-1/2" : "top-8 -translate-y-1/2"
          }`}
          aria-label="Next products"
        >
          <ArrowRight size={12} />
        </button>
      )}

      <div
        ref={scrollRef}
        className={`flex overflow-x-auto scroll-smooth ${
          compact
            ? "gap-1 items-center"
            : "gap-5 pb-1 -mx-1 px-1"
        }`}
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) =>
          compact ? (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product)}
              title={product.tagline}
              className="flex-shrink-0 flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-white/[0.05] transition-all duration-200 group"
            >
              <ProductThumbStack product={product} size={28} compact />
              <span className="text-[11px] font-bold text-white/70 group-hover:text-white tracking-wide leading-none whitespace-nowrap">
                {product.name}
              </span>
            </button>
          ) : (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product)}
              title={product.tagline}
              className="flex-shrink-0 min-w-[88px] group flex flex-col items-center gap-2 cursor-pointer"
            >
              <ProductThumbStack product={product} size={72} />
              <span className="w-full text-center">
                <span className="block text-[11px] font-bold text-white tracking-wide leading-none truncate">
                  {product.name}
                </span>
                <span className="block text-[9px] text-white/35 mt-1 truncate">
                  {product.tagline}
                </span>
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

function ProductThumbStack({ product, size = 72, compact = false }) {
  const variants = (product.variants || []).filter((v) => v.thumbnail);
  const peek = variants.slice(0, 3);
  const offset = Math.max(6, Math.round(size * 0.12));
  const peekScale = 0.78;
  const frame = size + (peek.length ? offset * Math.min(peek.length, 2) : 0);

  return (
    <span
      className="relative flex-shrink-0"
      style={{ width: frame, height: size }}
    >
      {peek.map((variant, i) => {
        const depth = peek.length - i;
        const peekSize = Math.round(size * peekScale);
        return (
          <span
            key={variant.id}
            className="absolute rounded-full bg-white overflow-hidden ring-1 ring-white/20 opacity-80"
            style={{
              width: peekSize,
              height: peekSize,
              left: depth * offset,
              top: Math.round((size - peekSize) / 2 + depth * 2),
              zIndex: i,
            }}
          >
            <img
              src={variant.thumbnail}
              alt=""
              className="absolute inset-[8%] w-[84%] h-[84%] object-contain"
              loading="lazy"
            />
          </span>
        );
      })}
      <span
        className="absolute rounded-full bg-white overflow-hidden ring-1 ring-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105 group-hover:ring-white/35"
        style={{
          width: size,
          height: size,
          left: 0,
          top: 0,
          zIndex: 10,
        }}
      >
        <img
          src={product.thumbnail}
          alt={product.name}
          className="absolute inset-[8%] w-[84%] h-[84%] object-contain"
          loading="lazy"
        />
        {!compact && (
          <span
            className="absolute bottom-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[8px] font-bold text-white flex items-center justify-center leading-none"
            style={{ backgroundColor: product.color }}
          >
            {product.assetCount}
          </span>
        )}
      </span>
    </span>
  );
}

function ProductFullPage({ product, onBack, onAssetClick }) {
  const [activeTab, setActiveTab] = useState("all");
  const [viewLayout, setViewLayout] = useState("grid");

  const variantIds = product.variantIds?.length
    ? product.variantIds
    : [product.id];
  const { items: productAssets, isLoading } = useMergedContentList(
    {
      page: "1",
      size: "60",
      sort: "date",
    },
    variantIds
  );
  const productBriefs = useMemo(
    () =>
      briefs.filter((b) => {
        const name = product.name?.toLowerCase() || "";
        const bp = b.product?.toLowerCase() || "";
        return name && bp && (bp.includes(name) || name.includes(bp));
      }).slice(0, 6),
    [product]
  );

  const tabs = [
    { id: "all", label: "All Assets", count: productAssets.length },
    { id: "photo", label: "Photography", count: productAssets.filter((a) => a.type === "Photo").length },
    { id: "video", label: "Video & Motion", count: productAssets.filter((a) => a.type === "Video" || a.type === "Motion").length },
    { id: "graphic", label: "Graphics", count: productAssets.filter((a) => a.type === "Graphic" || a.type === "Illustration").length },
    { id: "3d", label: "3D Renders", count: productAssets.filter((a) => a.type === "3D Render").length },
    { id: "briefs", label: "Briefs", count: productBriefs.length },
  ];

  const visibleAssets = useMemo(() => {
    if (activeTab === "all" || activeTab === "briefs") return productAssets;
    if (activeTab === "photo") return productAssets.filter((a) => a.type === "Photo");
    if (activeTab === "video") return productAssets.filter((a) => a.type === "Video" || a.type === "Motion");
    if (activeTab === "graphic") return productAssets.filter((a) => a.type === "Graphic" || a.type === "Illustration");
    if (activeTab === "3d") return productAssets.filter((a) => a.type === "3D Render");
    return productAssets;
  }, [activeTab, productAssets]);

  return (
    <div className="flex-1 overflow-y-auto" id="discovery-scroll">
      <div className="fade-in">
        {/* Hero banner */}
        <div
          className="relative h-[340px] overflow-hidden"
          style={{ background: `radial-gradient(ellipse at 50% 40%, ${product.color}44 0%, #0a0a0c 70%)` }}
        >
          <img
            src={product.thumbnail}
            alt={product.name}
            className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 h-[220px] w-[220px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%), radial-gradient(ellipse at 30% 50%, ${product.color}18 0%, transparent 60%)`,
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <button
              onClick={onBack}
              className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[12px] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft size={14} /> Back to Discovery
            </button>
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: `${product.color}cc` }}
                  >
                    REVO Product
                  </span>
                </div>
                <h1 className="text-[48px] font-black text-white tracking-tight leading-none">
                  {product.name}
                </h1>
                {product.variants?.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mr-1">
                      Variants
                    </span>
                    {[product, ...product.variants].map((v) => (
                      <span
                        key={v.id}
                        className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/70"
                      >
                        {v.name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[14px] text-white/50 mt-2 max-w-lg leading-relaxed">
                  {product.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatPill icon={Image} label="Assets" value={product.assetCount} color={product.color} />
                <StatPill icon={FileText} label="Briefs" value={product.briefCount} color={product.color} />
                <StatPill icon={Users} label="UGC Creators" value={product.ugcCount} color={product.color} />
                <StatPill icon={BarChart3} label="Reach" value={product.topMetric} color={product.color} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pt-5 pb-10">
          {/* Tab bar */}
          <div className="flex items-center justify-between mb-5 border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white/[0.08] text-white border border-white/[0.08]"
                      : "text-white/30 hover:text-white/55 hover:bg-white/[0.03]"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                      activeTab === tab.id
                        ? "bg-white/[0.08] text-white/60"
                        : "bg-white/[0.03] text-white/15"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.04] rounded-xl p-0.5">
              {[
                { v: "grid", i: Grid2X2 },
                { v: "list", i: Rows3 },
              ].map((l) => (
                <button
                  key={l.v}
                  onClick={() => setViewLayout(l.v)}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    viewLayout === l.v
                      ? "bg-white/[0.1] text-white shadow-sm"
                      : "text-white/25 hover:text-white/45"
                  }`}
                >
                  <l.i size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Briefs tab content */}
          {activeTab === "briefs" ? (
            <div className="grid grid-cols-3 gap-4">
              {productBriefs.map((brief) => (
                <div
                  key={brief.id}
                  className="glass-card rounded-2xl overflow-hidden card-hover cursor-pointer group"
                >
                  <div className="relative h-[140px] overflow-hidden">
                    <img
                      src={brief.thumbnail}
                      alt={brief.title}
                      className="w-full h-full object-cover img-cinematic transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider mb-1.5 ${
                        brief.priority === "Critical"
                          ? "bg-red-500/20 text-red-400"
                          : brief.priority === "High"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {brief.priority}
                      </span>
                      <p className="text-[13px] font-bold text-white leading-tight truncate">
                        {brief.title}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">
                        {brief.deliverableCount} deliverables
                      </span>
                      <span className="text-[10px] text-white/30">
                        Due {brief.dueDate}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${brief.progress}%`,
                          backgroundColor: product.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={
                viewLayout === "grid"
                  ? "grid grid-cols-5 gap-3"
                  : "space-y-1"
              }
            >
              {visibleAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onClick={onAssetClick}
                  variant={viewLayout === "grid" ? "compact" : "list"}
                />
              ))}
            </div>
          )}

          {visibleAssets.length === 0 && activeTab !== "briefs" && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center mb-4">
                {isLoading ? (
                  <Loader2 size={24} className="text-white/20 animate-spin" />
                ) : (
                  <Package size={24} strokeWidth={1.2} className="text-white/10" />
                )}
              </div>
              <p className="text-sm text-white/25 font-medium">
                {isLoading ? "Loading product assets…" : "No assets in this category"}
              </p>
              <p className="text-xs text-white/12 mt-1">Try viewing all assets instead</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.06] backdrop-blur-sm">
      <Icon size={13} style={{ color }} />
      <div>
        <p className="text-[13px] font-bold text-white leading-none">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-[9px] text-white/30 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
