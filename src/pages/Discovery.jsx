import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Grid3X3,
  LayoutGrid,
  Rows3,
  Video,
  Palette,
  Box,
  Sparkles,
  X,
  SlidersHorizontal,
  Clock,
  Eye,
  Zap,
  Film,
  Camera,
  Check,
  ArrowUpDown,
  ChevronDown,
  TrendingUp,
  Upload,
  Command,
  ArrowRight,
  ArrowLeft,
  Package,
  Grid2X2,
  FileText,
  Users,
  BarChart3,
  Image,
} from "lucide-react";
import DetailPanel from "../components/layout/DetailPanel";
import AssetCard from "../components/shared/AssetCard";
import TeamShowcase from "../components/shared/TeamShowcase";
import {
  assets,
  products,
  partners,
  statuses,
  assetTypes,
  categories,
  teamMembers,
  revoProducts,
  briefs,
} from "../data/mockData";

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
  const [searchParams] = useSearchParams();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [layout, setLayout] = useState("masonry");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const product = searchParams.get("product");
    const partner = searchParams.get("partner");
    const status = searchParams.get("status");
    const q = searchParams.get("q");
    const assetId = searchParams.get("assetId");

    if (product) setProductFilter(product);
    if (partner) setPartnerFilter(partner);
    if (status) setStatusFilter(status);
    if (q) setSearchQuery(q);
    if (product || partner || status) setShowFilters(true);

    if (assetId) {
      const matched = assets.find((a) => a.id === Number(assetId));
      if (matched) setSelectedAsset(matched);
    }
  }, [searchParams]);

  const filteredAssets = useMemo(() => {
    let result = [...assets].filter((a) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          ![
            a.title,
            a.product,
            a.partner,
            a.editor,
            a.category,
            a.type,
            a.briefTitle || "",
          ].some((f) => f.toLowerCase().includes(q))
        )
          return false;
      }
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (productFilter && a.product !== productFilter) return false;
      if (partnerFilter && a.partner !== partnerFilter) return false;
      if (categoryFilter && a.category !== categoryFilter) return false;
      return true;
    });
    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => a.dateSubmitted.localeCompare(b.dateSubmitted));
        break;
      case "views":
        result.sort((a, b) => b.views - a.views);
        break;
      case "downloads":
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case "az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        result.sort((a, b) => b.dateSubmitted.localeCompare(a.dateSubmitted));
    }
    return result;
  }, [
    searchQuery,
    typeFilter,
    statusFilter,
    productFilter,
    partnerFilter,
    categoryFilter,
    sortBy,
  ]);

  const newAssets = useMemo(() => assets.filter((a) => a.isNew), []);
  const featuredAssets = useMemo(
    () => assets.filter((a) => a.isFeatured).slice(0, 8),
    []
  );
  const hasActiveFilters =
    typeFilter !== "all" ||
    statusFilter ||
    productFilter ||
    partnerFilter ||
    categoryFilter ||
    searchQuery;
  const activeFilterCount = [
    typeFilter !== "all",
    statusFilter,
    productFilter,
    partnerFilter,
    categoryFilter,
  ].filter(Boolean).length;

  const clearAll = useCallback(() => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("");
    setProductFilter("");
    setPartnerFilter("");
    setCategoryFilter("");
  }, []);

  const currentSort = sortOptions.find((s) => s.value === sortBy);

  if (activeProduct) {
    return (
      <>
        <ProductFullPage
          product={activeProduct}
          onBack={() => setActiveProduct(null)}
          onAssetClick={setSelectedAsset}
        />
        {selectedAsset && (
          <DetailPanel
            item={selectedAsset}
            type="asset"
            onClose={() => setSelectedAsset(null)}
            relatedAssets={assets
              .filter(
                (a) =>
                  a.id !== selectedAsset.id &&
                  a.product === selectedAsset.product
              )
              .slice(0, 4)}
            onSelectRelated={setSelectedAsset}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto" id="discovery-scroll">
        <div className="fade-in pt-14">
          {/* Command Bar */}
          <div className="sticky top-0 z-20 command-bar px-6 py-3">
            <div>
              <div className="flex items-center gap-2.5">
                {/* Search */}
                <div className="relative flex-1 max-w-xl group/search">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/search:text-accent-red/60 transition-colors"
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 31,247 assets — names, products, partners, editors, briefs..."
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-20 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-accent-red/25 focus:bg-white/[0.06] transition-all duration-200"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-white/20 hover:text-white/50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-white/[0.04] rounded text-white/15">
                      <Command size={10} />
                      <span className="text-[10px] font-mono">K</span>
                    </div>
                  )}
                </div>

                {/* Type pills */}
                <div className="flex items-center bg-white/[0.03] border border-white/[0.04] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setTypeFilter("all")}
                    className={`flex items-center gap-1 px-2.5 py-2 text-[11px] font-medium transition-all duration-200 ${
                      typeFilter === "all"
                        ? "bg-white/[0.08] text-white"
                        : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Sparkles size={12} />
                    <span className="hidden xl:inline">All</span>
                  </button>
                  {assetTypes.map((t) => {
                    const Icon = typeIcons[t] || Sparkles;
                    return (
                      <button
                        key={t}
                        onClick={() =>
                          setTypeFilter(typeFilter === t ? "all" : t)
                        }
                        className={`flex items-center gap-1 px-2.5 py-2 text-[11px] font-medium transition-all duration-200 ${
                          typeFilter === t
                            ? "bg-white/[0.08] text-white"
                            : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
                        }`}
                      >
                        <Icon size={12} />
                        <span className="hidden xl:inline">{t}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all duration-200 ${
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
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] border border-white/[0.05] rounded-xl text-[11px] text-white/35 hover:text-white/55 hover:border-white/[0.08] transition-all duration-200"
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
                <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.04] rounded-xl p-0.5">
                  {[
                    { v: "masonry", i: LayoutGrid },
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
              {showFilters && (
                <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-white/[0.04] fade-in">
                  <span className="text-[10px] text-white/18 uppercase tracking-wider font-semibold mr-1">
                    Refine
                  </span>
                  <FilterChip
                    label="Status"
                    value={statusFilter}
                    options={statuses}
                    onChange={setStatusFilter}
                  />
                  <FilterChip
                    label="Product"
                    value={productFilter}
                    options={products}
                    onChange={setProductFilter}
                  />
                  <FilterChip
                    label="Partner"
                    value={partnerFilter}
                    options={partners}
                    onChange={setPartnerFilter}
                  />
                  <FilterChip
                    label="Category"
                    value={categoryFilter}
                    options={categories}
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
                    {filteredAssets.length.toLocaleString()} results
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6">
            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 pt-4 pb-4 flex-wrap">
                {searchQuery && (
                  <ActiveChip
                    label={`"${searchQuery}"`}
                    onRemove={() => setSearchQuery("")}
                  />
                )}
                {typeFilter !== "all" && (
                  <ActiveChip
                    label={typeFilter}
                    onRemove={() => setTypeFilter("all")}
                  />
                )}
                {statusFilter && (
                  <ActiveChip
                    label={statusFilter}
                    onRemove={() => setStatusFilter("")}
                  />
                )}
                {productFilter && (
                  <ActiveChip
                    label={productFilter}
                    onRemove={() => setProductFilter("")}
                  />
                )}
                {partnerFilter && (
                  <ActiveChip
                    label={partnerFilter}
                    onRemove={() => setPartnerFilter("")}
                  />
                )}
                {categoryFilter && (
                  <ActiveChip
                    label={categoryFilter}
                    onRemove={() => setCategoryFilter("")}
                  />
                )}
              </div>
            )}

            {/* Just Landed — always first when no filters */}
            {!hasActiveFilters && newAssets.length > 0 && (
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
                      onClick={setSelectedAsset}
                      variant="featured"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Product Collections — sliding viewer */}
            {!hasActiveFilters && (
              <div className="mb-8">
                <ProductCollectionSlider
                  onSelectProduct={setActiveProduct}
                />
              </div>
            )}

            {/* Trending */}
            {!hasActiveFilters && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-md bg-accent-purple/12">
                      <TrendingUp size={10} className="text-accent-purple" />
                    </div>
                    <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
                      Trending
                    </h3>
                    <span className="text-[10px] text-white/12 font-mono">
                      Most viewed this week
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                  {featuredAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onClick={setSelectedAsset}
                      variant="featured"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main Grid */}
            <div className="pb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white/35 uppercase tracking-wider">
                    {hasActiveFilters ? "Results" : "All Assets"}
                  </h3>
                  <span className="text-[10px] text-white/12 font-mono bg-white/[0.03] px-1.5 py-0.5 rounded-md">
                    {filteredAssets.length.toLocaleString()}
                  </span>
                </div>
              </div>

              {layout === "masonry" ? (
                <StaggeredMasonry
                  assets={filteredAssets}
                  onSelect={setSelectedAsset}
                />
              ) : layout === "grid" ? (
                <div className="grid grid-cols-4 gap-3">
                  {filteredAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onClick={setSelectedAsset}
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
                      onClick={setSelectedAsset}
                      variant="list"
                    />
                  ))}
                </div>
              )}

              {filteredAssets.length === 0 && (
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
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 text-xs font-medium text-accent-red bg-accent-red/8 border border-accent-red/15 rounded-xl hover:bg-accent-red/12 transition-all duration-200"
                  >
                    Clear all filters
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

      {selectedAsset && (
        <DetailPanel
          item={selectedAsset}
          type="asset"
          onClose={() => setSelectedAsset(null)}
          relatedAssets={assets
            .filter(
              (a) =>
                a.id !== selectedAsset.id &&
                a.product === selectedAsset.product
            )
            .slice(0, 4)}
          onSelectRelated={setSelectedAsset}
        />
      )}
    </>
  );
}

function StaggeredMasonry({ assets: items, onSelect }) {
  const cols = 4;
  const columns = Array.from({ length: cols }, () => []);

  items.forEach((asset, i) => {
    const colIdx = i % cols;
    const isHero = i === 0 || i === 7 || i === 18 || i === 33;
    const isCinematic = i === 3 || i === 11 || i === 22 || i === 38;
    columns[colIdx].push({ asset, isHero, isCinematic });
  });

  return (
    <div className="flex gap-3">
      {columns.map((col, ci) => (
        <div key={ci} className="flex-1 space-y-3">
          {col.map(({ asset, isHero, isCinematic }) => {
            if (isHero)
              return (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onClick={onSelect}
                  variant="hero"
                />
              );
            if (isCinematic)
              return (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onClick={onSelect}
                  variant="cinematic"
                />
              );
            return (
              <AssetCard
                key={asset.id}
                asset={asset}
                onClick={onSelect}
                variant="default"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function FilterChip({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
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
        {value || label} <ChevronDown size={10} />
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
            {options.map((o) => (
              <button
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between transition-all duration-150 ${
                  value === o
                    ? "text-white bg-white/[0.04]"
                    : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {o}
                {value === o && (
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

function ProductCollectionSlider({ onSelectProduct }) {
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
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 420, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-[22px] font-black text-white tracking-tight leading-none">
            REVO <span className="text-accent-red">Products</span>
          </h2>
          <p className="text-[11px] text-white/25 mt-1.5 max-w-md leading-relaxed">
            Explore the full creative universe of each REVO product — assets, UGC, briefs, and campaign work.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              canScrollLeft
                ? "bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.06]"
                : "bg-white/[0.02] text-white/10 border border-white/[0.03] cursor-not-allowed"
            }`}
          >
            <ArrowLeft size={14} />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              canScrollRight
                ? "bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.06]"
                : "bg-white/[0.02] text-white/10 border border-white/[0.03] cursor-not-allowed"
            }`}
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {revoProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="flex-shrink-0 w-[320px] group relative rounded-2xl overflow-hidden glass-card card-hover cursor-pointer text-left"
          >
            <div className="relative h-[200px] overflow-hidden">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(ellipse at 50% 80%, ${product.color}15 0%, transparent 70%)`,
                }}
              />
              <div className="absolute top-3 right-3">
                <span
                  className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: `${product.color}cc` }}
                >
                  {product.assetCount} Assets
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-[20px] font-black text-white tracking-wide leading-none">
                  {product.name}
                </h3>
                <p className="text-[11px] text-white/50 mt-1 font-medium">
                  {product.tagline}
                </p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-3 border-t border-white/[0.04]">
              <ProductMiniStat icon={FileText} label="Briefs" value={product.briefCount} />
              <ProductMiniStat icon={Users} label="UGC" value={product.ugcCount} />
              <ProductMiniStat icon={BarChart3} label="" value={product.topMetric} />
              <ArrowRight
                size={14}
                className="ml-auto text-white/15 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-300"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductMiniStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={11} className="text-white/20" />
      <span className="text-[10px] text-white/40 font-medium">
        {label && `${label} `}{typeof value === "number" ? value : value}
      </span>
    </div>
  );
}

function ProductFullPage({ product, onBack, onAssetClick }) {
  const [activeTab, setActiveTab] = useState("all");
  const [viewLayout, setViewLayout] = useState("grid");

  const productAssets = useMemo(
    () => assets.filter((a) => a.product?.toLowerCase().includes(product.name.toLowerCase().split(" ")[0]) || Math.random() < 0.15).slice(0, 120),
    [product]
  );
  const productBriefs = useMemo(
    () => briefs.filter(() => Math.random() < 0.5).slice(0, 6),
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
        <div className="relative h-[340px] overflow-hidden">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.4) saturate(1.2)" }}
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
                <Package size={24} strokeWidth={1.2} className="text-white/10" />
              </div>
              <p className="text-sm text-white/25 font-medium">No assets in this category</p>
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
