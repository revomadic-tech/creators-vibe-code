import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  FileText,
  Columns3,
  LayoutGrid,
  Rows3,
  ArrowLeft,
  Package,
  Tag,
  Calendar,
  Users,
  StickyNote,
  Link2,
  Image,
  X,
  SendHorizontal,
  ShieldCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import BriefCard from "../components/shared/BriefCard";
import AssetCard from "../components/shared/AssetCard";
import { StatusBadge, PriorityBadge } from "../components/ui/Tag";
import { TabBar } from "../components/ui/Tabs";
import ViewToggle from "../components/ui/ViewToggle";
import ProgressBar from "../components/ui/ProgressBar";
import { briefs, assets, teamMembers, socialPerformance } from "../data/mockData";

const statusTabs = [
  { id: "all", label: "All Briefs" },
  { id: "open", label: "Open", match: ["In Progress", "Draft"] },
  { id: "assigned", label: "Assigned", match: ["In Progress"] },
  { id: "review", label: "In Review", match: ["In Review"] },
  { id: "completed", label: "Completed", match: ["Approved"] },
];

const kanbanColumns = [
  { status: "Draft", label: "Draft", color: "bg-white/20" },
  { status: "In Progress", label: "In Progress", color: "bg-accent-blue" },
  { status: "In Review", label: "In Review", color: "bg-accent-purple" },
  { status: "Approved", label: "Completed", color: "bg-accent-teal" },
];

const viewOptions = [
  { value: "card", icon: LayoutGrid, label: "Cards" },
  { value: "kanban", icon: Columns3, label: "Kanban" },
  { value: "table", icon: Rows3, label: "Table" },
];

const briefTabs = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "deliverables", label: "Deliverables", icon: CheckCircle2 },
  { id: "references", label: "References", icon: Image },
  { id: "linked", label: "Linked Assets", icon: Link2 },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "status", label: "Status", icon: Tag },
];

const deliverableBoardColumns = [
  { id: "edits_requested", label: "Edits Requested", dot: "bg-accent-orange" },
  { id: "submitted", label: "Submited", dot: "bg-accent-blue" },
  { id: "needs_revisions", label: "Needs Revisisons", dot: "bg-accent-purple" },
  { id: "approved", label: "Approved", dot: "bg-accent-teal" },
  { id: "denied", label: "Denied", dot: "bg-accent-red" },
];

export default function Briefs() {
  const [searchParams] = useSearchParams();
  const [fullBrief, setFullBrief] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [briefTab, setBriefTab] = useState("overview");

  const pendingOffers = useMemo(() =>
    briefs.filter((b) => b.status === "Draft" || b.status === "In Progress").slice(0, 3),
  []);

  const tabsWithCounts = statusTabs.map((t) => ({
    ...t,
    count:
      t.id === "all"
        ? briefs.length
        : briefs.filter((b) => t.match?.includes(b.status)).length,
  }));

  const filtered = briefs.filter((b) => {
    if (activeTab === "all") return true;
    const tab = statusTabs.find((t) => t.id === activeTab);
    return tab?.match?.includes(b.status);
  });

  const openFull = (brief) => {
    setFullBrief(brief);
    setBriefTab("overview");
  };

  useEffect(() => {
    const briefId = Number(searchParams.get("briefId"));
    if (!briefId) return;
    const matchedBrief = briefs.find((b) => b.id === briefId);
    if (matchedBrief) {
      setFullBrief(matchedBrief);
      setBriefTab("overview");
    }
  }, [searchParams]);

  if (fullBrief) {
    return (
      <BriefFullPage
        brief={fullBrief}
        activeTab={briefTab}
        setActiveTab={setBriefTab}
        onBack={() => setFullBrief(null)}
      />
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-6 pt-16 fade-in">
          {/* New Brief Offers */}
          {pendingOffers.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
                  <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">New Briefs Available</span>
                  <span className="text-[9px] text-white/12 font-mono bg-white/[0.03] px-1.5 py-0.5 rounded-md">{pendingOffers.length} open</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {pendingOffers.map((brief) => (
                  <BriefOfferCard key={brief.id} brief={brief} onAccept={() => openFull(brief)} onView={() => openFull(brief)} />
                ))}
              </div>
            </div>
          )}

          {/* Tabs + View Toggle */}
          <div className="flex items-center justify-between mb-5">
            <TabBar
              tabs={tabsWithCounts}
              active={activeTab}
              onChange={setActiveTab}
            />
            <ViewToggle
              options={viewOptions}
              value={viewMode}
              onChange={setViewMode}
            />
          </div>

          {/* Card Grid View */}
          {viewMode === "card" && (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((brief) => (
                <BriefCard
                  key={brief.id}
                  brief={brief}
                  onClick={() => openFull(brief)}
                />
              ))}
            </div>
          )}

          {/* Kanban View */}
          {viewMode === "kanban" && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {kanbanColumns.map((col) => {
                const items = briefs.filter((b) => b.status === col.status);
                return (
                  <div key={col.status} className="flex-shrink-0 w-72">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${col.color}`} />
                      <span className="text-xs font-semibold text-white/60">
                        {col.label}
                      </span>
                      <span className="text-[10px] text-white/18 font-mono">
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {items.map((brief) => (
                        <BriefCard
                          key={brief.id}
                          brief={brief}
                          onClick={() => openFull(brief)}
                          variant="kanban"
                        />
                      ))}
                      {items.length === 0 && (
                        <div className="text-center py-8 text-[11px] text-white/12 border border-dashed border-white/[0.06] rounded-xl">
                          No briefs
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-4 py-2 text-[10px] text-white/18 font-semibold uppercase tracking-wider">
                <span className="flex-1">Brief</span>
                <span className="w-24">Product</span>
                <span className="w-20">Partner</span>
                <span className="w-20">Priority</span>
                <span className="w-24">Due Date</span>
                <span className="w-16 text-center">Progress</span>
                <span className="w-20">Deliverables</span>
                <span className="w-20 text-right">Status</span>
              </div>
              {filtered.map((brief) => (
                <div
                  key={brief.id}
                  onClick={() => openFull(brief)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.04] hover:border-white/[0.06] cursor-pointer transition-all duration-200"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <img
                      src={brief.thumbnail}
                      alt=""
                      className="w-12 h-8 rounded-lg object-cover img-cinematic flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {brief.title}
                      </p>
                      <p className="text-[10px] text-white/25 mt-0.5">
                        {brief.campaign}
                      </p>
                    </div>
                  </div>
                  <span className="w-24 text-[11px] text-white/40 truncate">
                    {brief.product}
                  </span>
                  <span className="w-20 text-[11px] text-white/30 truncate">
                    {brief.partner}
                  </span>
                  <div className="w-20">
                    <PriorityBadge priority={brief.priority} />
                  </div>
                  <span className="w-24 text-[11px] text-white/35 font-mono">
                    {brief.dueDate}
                  </span>
                  <div className="w-16 flex items-center justify-center gap-1.5">
                    <div className="w-10">
                      <ProgressBar value={brief.progress} size="xs" />
                    </div>
                    <span className="text-[10px] text-white/35 font-mono">
                      {brief.progress}%
                    </span>
                  </div>
                  <span className="w-20 text-[11px] text-white/30 text-center">
                    {brief.deliverables.length}
                  </span>
                  <div className="w-20 flex justify-end">
                    <StatusBadge status={brief.status} small />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function BriefFullPage({ brief, activeTab, setActiveTab, onBack }) {
  const linkedAssets =
    brief.linkedAssets
      ?.map((id) => assets.find((a) => a.id === id))
      .filter(Boolean) || [];
  const [activeDeliverable, setActiveDeliverable] = useState(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [threadsByDeliverable, setThreadsByDeliverable] = useState({});
  const [sentToAdmin, setSentToAdmin] = useState({});
  const [assetPartnerFilter, setAssetPartnerFilter] = useState("all");
  const [assetGenderFilter, setAssetGenderFilter] = useState("all");

  const openDeliverableThread = (deliverable) => {
    setActiveDeliverable(deliverable);
    setDraftMessage("");
    setThreadsByDeliverable((prev) =>
      prev[deliverable.id]
        ? prev
        : {
            ...prev,
            [deliverable.id]: buildDeliverableThread(deliverable, brief),
          }
    );
  };

  const closeDeliverableThread = () => {
    setActiveDeliverable(null);
    setDraftMessage("");
  };

  const sendEditorMessage = () => {
    const message = draftMessage.trim();
    if (!message || !activeDeliverable) return;
    const next = {
      id: `editor-${Date.now()}`,
      author: "editor",
      authorLabel: "Editor",
      text: message,
      time: "Just now",
    };
    setThreadsByDeliverable((prev) => ({
      ...prev,
      [activeDeliverable.id]: [...(prev[activeDeliverable.id] || []), next],
    }));
    setDraftMessage("");
  };

  const sendToAdminForReview = () => {
    if (!activeDeliverable) return;
    setSentToAdmin((prev) => ({ ...prev, [activeDeliverable.id]: true }));
    setThreadsByDeliverable((prev) => ({
      ...prev,
      [activeDeliverable.id]: [
        ...(prev[activeDeliverable.id] || []),
        {
          id: `system-${Date.now()}`,
          author: "system",
          authorLabel: "System",
          text: "Deliverable package sent to Admin for review.",
          time: "Just now",
        },
      ],
    }));
  };

  const activeThread = activeDeliverable
    ? threadsByDeliverable[activeDeliverable.id] || []
    : [];
  const mediaPreview = activeDeliverable
    ? buildDeliverableMediaPreview(activeDeliverable, brief)
    : null;
  const revisionCount = activeDeliverable
    ? Math.max(0, activeDeliverable.count - activeDeliverable.completed)
    : 0;
  const partnersAssociated = Array.from(
    new Set([brief.partner, ...linkedAssets.map((a) => a.partner)].filter(Boolean))
  );
  const realBriefAssets = assets.filter(
    (a) => a.briefId === brief.id || linkedAssets.some((la) => la.id === a.id)
  );

  const expandedBriefAssets = useMemo(
    () => generateExpandedBriefAssets(brief, realBriefAssets),
    [brief, realBriefAssets]
  );
  const allBriefAssets = expandedBriefAssets;

  const approvedAssets = allBriefAssets.filter(
    (a) => a.status === "Approved" || a.status === "Delivered"
  );
  const contentStatusBreakdown = [
    { label: "In Progress", count: allBriefAssets.filter((a) => a.status === "In Progress").length, color: "#3b82f6" },
    { label: "In Review", count: allBriefAssets.filter((a) => a.status === "In Review").length, color: "#8b5cf6" },
    { label: "Approved", count: allBriefAssets.filter((a) => a.status === "Approved").length, color: "#14b8a6" },
    { label: "Delivered", count: allBriefAssets.filter((a) => a.status === "Delivered").length, color: "#22c55e" },
    { label: "Needs Editor", count: allBriefAssets.filter((a) => a.editorNeeded).length, color: "#f59e0b" },
  ];
  const attributedSocial = socialPerformance.topPerformingContent.filter(
    (c) => c.brief === brief.title
  );
  const socialImpressions =
    attributedSocial.reduce((sum, c) => sum + c.impressions, 0) ||
    approvedAssets.reduce((sum, a) => sum + (a.views || 0) * 120, 0);
  const socialEngagements =
    attributedSocial.reduce((sum, c) => sum + c.engagements, 0) ||
    approvedAssets.reduce((sum, a) => sum + Math.round((a.views || 0) * 0.06), 0);
  const socialShares =
    attributedSocial.reduce((sum, c) => sum + c.shares, 0) ||
    approvedAssets.reduce((sum, a) => sum + Math.round((a.downloads || 0) * 1.4), 0);
  const ugcCreators =
    Array.from(
      new Map(
        realBriefAssets
          .filter((a) => partnersAssociated.includes(a.partner))
          .map((a) => [a.editorId, teamMembers.find((t) => t.id === a.editorId)])
      ).values()
    )
      .filter(Boolean)
      .slice(0, 6);
  const ugcList = ugcCreators.length > 0 ? ugcCreators : brief.assignees.slice(0, 6);

  const uniquePartners = useMemo(
    () => [...new Set(allBriefAssets.map((a) => a.partner).filter(Boolean))].sort(),
    [allBriefAssets]
  );
  const uniqueGenders = useMemo(
    () => [...new Set(allBriefAssets.map((a) => a.creatorGender).filter(Boolean))].sort(),
    [allBriefAssets]
  );
  const filteredBriefAssets = useMemo(() => {
    let pool = allBriefAssets;
    if (assetPartnerFilter !== "all") pool = pool.filter((a) => a.partner === assetPartnerFilter);
    if (assetGenderFilter !== "all") pool = pool.filter((a) => a.creatorGender === assetGenderFilter);
    return pool;
  }, [allBriefAssets, assetPartnerFilter, assetGenderFilter]);

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-6 pt-16 fade-in">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/55 transition-colors mb-5"
          >
            <ArrowLeft size={14} /> Back to Briefs
          </button>

          {/* Hero */}
          <div className="relative rounded-2xl overflow-hidden mb-6 h-64">
            <img
              src={brief.thumbnail}
              alt=""
              className="w-full h-full object-cover img-cinematic"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/70 to-surface-900/20" />
            <div className="absolute bottom-5 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={brief.status} />
                <PriorityBadge priority={brief.priority} />
              </div>
              <h1 className="text-2xl font-black text-white">{brief.title}</h1>
              <p className="text-[13px] text-white/45 leading-relaxed mt-2 max-w-3xl">
                {brief.description}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Package size={12} /> {brief.product}
                </span>
                <span className="flex items-center gap-1">
                  <Tag size={12} /> {brief.partner}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> Due {brief.dueDate}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {brief.assignees.length} assigned
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <TabBar
              tabs={briefTabs}
              active={activeTab}
              onChange={setActiveTab}
              variant="underline"
            />
          </div>

          {/* Tab Content */}
          <div className="fade-in">
            {activeTab === "overview" && (
              <div className="space-y-5">
                {/* Metric cards */}
                <div className="grid grid-cols-6 gap-3">
                  <MetricCard label="Content Submitted" value={allBriefAssets.length} />
                  <MetricCard label="Approved Content" value={approvedAssets.length} />
                  <MetricCard label="Deliverables" value={brief.deliverables.length} />
                  <MetricCard label="Impressions" value={socialImpressions.toLocaleString()} />
                  <MetricCard label="Engagements" value={socialEngagements.toLocaleString()} />
                  <MetricCard label="Shares" value={socialShares.toLocaleString()} />
                </div>

                {/* Status donut + UGC creators row */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <div className="glass-card rounded-2xl p-5">
                      <p className="text-[10px] text-white/20 uppercase tracking-wider font-semibold mb-4">
                        Content Status Breakdown
                      </p>
                      <StatusDonutChart
                        segments={contentStatusBreakdown}
                        total={allBriefAssets.length}
                      />
                    </div>
                  </div>

                  <div className="col-span-7">
                    <div className="glass-card rounded-2xl p-4 h-full">
                      <p className="text-[10px] text-white/20 uppercase tracking-wider font-semibold mb-2">
                        UGC Creators (Partners Associated)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {ugcList.map((creator) => (
                          <div
                            key={creator.id}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                          >
                            <img
                              src={creator.avatar}
                              alt={creator.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-white/[0.08]"
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] text-white/70 font-medium truncate">
                                {creator.name}
                              </p>
                              <p className="text-[10px] text-white/25 truncate">
                                {creator.role}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brief Assets — full expanded grid */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] text-white/20 uppercase tracking-wider font-semibold">
                        Brief Assets
                      </p>
                      <p className="text-[11px] text-white/35 mt-0.5">
                        {filteredBriefAssets.length} of {allBriefAssets.length} assets
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Filter size={11} className="text-white/25" />
                        <span className="text-[9px] text-white/25 uppercase tracking-wider font-semibold">
                          Partner
                        </span>
                      </div>
                      <select
                        value={assetPartnerFilter}
                        onChange={(e) => setAssetPartnerFilter(e.target.value)}
                        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white/70 outline-none cursor-pointer hover:bg-white/[0.06] transition-colors appearance-none pr-6"
                        style={{ backgroundImage: "none" }}
                      >
                        <option value="all">All Partners</option>
                        {uniquePartners.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1 ml-2">
                        <Users size={11} className="text-white/25" />
                        <span className="text-[9px] text-white/25 uppercase tracking-wider font-semibold">
                          Gender
                        </span>
                      </div>
                      <select
                        value={assetGenderFilter}
                        onChange={(e) => setAssetGenderFilter(e.target.value)}
                        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white/70 outline-none cursor-pointer hover:bg-white/[0.06] transition-colors appearance-none pr-6"
                        style={{ backgroundImage: "none" }}
                      >
                        <option value="all">All</option>
                        {uniqueGenders.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active filter chips */}
                  {(assetPartnerFilter !== "all" || assetGenderFilter !== "all") && (
                    <div className="flex items-center gap-2 mb-3">
                      {assetPartnerFilter !== "all" && (
                        <button
                          onClick={() => setAssetPartnerFilter("all")}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-red/10 border border-accent-red/20 text-[10px] text-accent-red/80 font-medium hover:bg-accent-red/15 transition-colors"
                        >
                          {assetPartnerFilter} <X size={10} />
                        </button>
                      )}
                      {assetGenderFilter !== "all" && (
                        <button
                          onClick={() => setAssetGenderFilter("all")}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-blue/10 border border-accent-blue/20 text-[10px] text-accent-blue/80 font-medium hover:bg-accent-blue/15 transition-colors"
                        >
                          {assetGenderFilter} <X size={10} />
                        </button>
                      )}
                      <button
                        onClick={() => { setAssetPartnerFilter("all"); setAssetGenderFilter("all"); }}
                        className="text-[10px] text-white/25 hover:text-white/50 transition-colors ml-1"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  {/* Thumbnail grid */}
                  <div className="grid grid-cols-8 gap-1.5 max-h-[520px] overflow-y-auto rounded-xl pr-1">
                    {filteredBriefAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="group relative rounded-lg overflow-hidden border border-white/[0.04] hover:border-white/[0.15] transition-all duration-200 cursor-pointer"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={asset.thumbnail}
                            alt={asset.title}
                            className="w-full h-full object-cover img-cinematic transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <p className="text-[8px] text-white/80 font-semibold truncate leading-tight">
                            {asset.title}
                          </p>
                          <p className="text-[7px] text-white/40 truncate mt-0.5">
                            {asset.partner} · {asset.creatorGender}
                          </p>
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <StatusDot status={asset.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "deliverables" && (
              <div className="overflow-x-auto pb-2">
                <div className="grid grid-cols-5 gap-3 min-w-[1200px]">
                  {deliverableBoardColumns.map((col) => {
                    const items = brief.deliverables.filter(
                      (d) => mapDeliverableBoardStatus(d) === col.id
                    );
                    return (
                      <div
                        key={col.id}
                        className="glass-card rounded-2xl p-3 border border-white/[0.06]"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`w-2 h-2 rounded-full ${col.dot} flex-shrink-0`}
                          />
                          <span className="text-[11px] text-white/60 font-semibold">
                            {col.label}
                          </span>
                          <span className="text-[10px] text-white/20 font-mono ml-auto">
                            {items.length}
                          </span>
                        </div>

                        <div className="space-y-2 min-h-[120px]">
                          {items.length > 0 ? (
                            items.map((d) => (
                              <div
                                key={d.id}
                                onClick={() => openDeliverableThread(d)}
                                className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200 group/deliverable"
                              >
                                <h4 className="text-[11px] font-semibold text-white/80 leading-snug">
                                  {d.name}
                                </h4>
                                <p className="text-[10px] text-white/30 mt-1">
                                  {d.completed} of {d.count} items
                                </p>
                                <div className="mt-2">
                                  <ProgressBar
                                    value={d.count > 0 ? (d.completed / d.count) * 100 : 0}
                                    size="xs"
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <StatusBadge status={d.status} small />
                                  <ChevronRight
                                    size={12}
                                    className="text-white/20 group-hover/deliverable:text-white/45 transition-colors"
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed border-white/[0.08] py-6 text-center text-[10px] text-white/18">
                              No items
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "references" && (
              <div className="grid grid-cols-3 gap-3">
                {brief.references?.length > 0 ? (
                  brief.references.map((ref, i) => (
                    <div
                      key={i}
                      className="rounded-2xl overflow-hidden glass-card card-hover"
                    >
                      <img
                        src={ref}
                        alt=""
                        className="w-full aspect-[3/2] object-cover img-cinematic"
                      />
                      <div className="p-3">
                        <p className="text-xs text-white/40">
                          Reference {i + 1}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/18 col-span-3 text-center py-16">
                    No references added yet
                  </p>
                )}
              </div>
            )}

            {activeTab === "linked" && (
              <div className="grid grid-cols-6 gap-2">
                {linkedAssets.length > 0 ? (
                  linkedAssets.map((a) => (
                    <AssetCard key={a.id} asset={a} variant="mini" />
                  ))
                ) : (
                  <p className="text-sm text-white/18 col-span-6 text-center py-16">
                    No linked assets
                  </p>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                {brief.notes?.length > 0 ? (
                  brief.notes.map((n, i) => (
                    <div
                      key={i}
                      className="glass-card rounded-2xl p-4 flex items-start gap-3"
                    >
                      <img
                        src={n.author.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full flex-shrink-0 ring-1 ring-white/[0.06]"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white/80">
                            {n.author.name}
                          </span>
                          <span className="text-[10px] text-white/18">
                            {n.date}
                          </span>
                        </div>
                        <p className="text-[13px] text-white/45 leading-relaxed">
                          {n.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/18 text-center py-16">
                    No notes yet
                  </p>
                )}
              </div>
            )}

            {activeTab === "status" && (
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card rounded-2xl p-5 text-center">
                  <p className="text-3xl font-black text-white stat-number">
                    {brief.progress}%
                  </p>
                  <p className="text-xs text-white/30 mt-1.5">
                    Overall Progress
                  </p>
                </div>
                <div className="glass-card rounded-2xl p-5 text-center">
                  <p className="text-3xl font-black text-white stat-number">
                    {brief.tasksCompleted}/{brief.tasks}
                  </p>
                  <p className="text-xs text-white/30 mt-1.5">
                    Tasks Complete
                  </p>
                </div>
                <div className="glass-card rounded-2xl p-5 text-center">
                  <p className="text-3xl font-black text-white stat-number">
                    {
                      brief.deliverables.filter(
                        (d) => d.status === "Approved"
                      ).length
                    }
                    /{brief.deliverables.length}
                  </p>
                  <p className="text-xs text-white/30 mt-1.5">
                    Deliverables Approved
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeDeliverable && (
        <>
          <div className="fixed inset-0 z-40 pointer-events-none" />
          <div className="fixed right-6 top-1/2 -translate-y-1/2 h-[84vh] w-[540px] rounded-2xl glass-panel z-50 flex flex-col shadow-2xl shadow-black/45 border border-white/[0.08] overflow-hidden slide-in-right">
            <div className="h-14 px-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] text-white/20 uppercase tracking-wider font-semibold leading-none">
                  Deliverable Review Thread
                </p>
                <p className="text-[12px] text-white/70 font-semibold mt-1 truncate">
                  {activeDeliverable.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center gap-1.5">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">
                    Status
                  </span>
                  <StatusBadge status={activeDeliverable.status} small />
                </div>
                <div className="h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center gap-1.5">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">
                    Revisions
                  </span>
                  <span className="text-[11px] text-white/80 font-semibold">
                    {revisionCount}
                  </span>
                </div>
                <button
                  onClick={closeDeliverableThread}
                  className="w-8 h-8 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200 flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mediaPreview && (
                <div className="glass-card rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">
                      Deliverable Media
                    </p>
                    <span className="text-[9px] text-white/25 font-mono">
                      Example 9:16 · 2 revisions
                    </span>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-7 rounded-xl overflow-hidden border border-white/[0.06] bg-black/30">
                      <div className="relative aspect-[9/16]">
                        <img
                          src={mediaPreview.main}
                          alt=""
                          className="w-full h-full object-cover img-cinematic"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.08] border border-white/[0.1] text-[9px] text-white/65 font-semibold">
                            9:16
                          </span>
                          <span className="text-[9px] text-white/40 font-mono">
                            Rev {mediaPreview.activeRevision}/2
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-5 space-y-2">
                      {mediaPreview.revisions.map((rev, idx) => (
                        <div
                          key={rev.id}
                          className={`rounded-lg overflow-hidden border ${
                            idx === 0
                              ? "border-accent-red/30"
                              : "border-white/[0.06]"
                          }`}
                        >
                          <div className="relative aspect-[16/10]">
                            <img
                              src={rev.thumbnail}
                              alt=""
                              className="w-full h-full object-cover img-cinematic"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                              <span className="text-[9px] text-white/55 font-semibold">
                                Revision {idx + 1}
                              </span>
                              <span className="text-[8px] text-white/30 font-mono">
                                {rev.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-card rounded-xl p-3">
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mb-2">
                  Editor ↔ Admin Conversation
                </p>
                <div className="space-y-2.5">
                  {activeThread.map((m) => (
                    <div
                      key={m.id}
                      className={m.author === "editor" ? "text-right" : ""}
                    >
                      <div
                        className={`inline-block max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${
                          m.author === "editor"
                            ? "bg-accent-red/15 border border-accent-red/20 text-white/80"
                            : m.author === "system"
                              ? "bg-accent-teal/10 border border-accent-teal/20 text-accent-teal/80"
                              : "bg-white/[0.04] border border-white/[0.06] text-white/65"
                        }`}
                      >
                        <p className="font-medium mb-0.5">{m.authorLabel}</p>
                        <p>{m.text}</p>
                        <p className="text-[9px] opacity-60 mt-1">{m.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.06] p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  placeholder="Reply to admin about requested revisions..."
                  className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-accent-red/25"
                />
                <button
                  onClick={sendEditorMessage}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/55 hover:text-white/75 hover:bg-white/[0.08] transition-colors"
                >
                  <SendHorizontal size={14} />
                </button>
              </div>
              <button
                onClick={sendToAdminForReview}
                className="w-full py-2.5 rounded-xl bg-accent-red hover:bg-accent-red/90 text-white text-[12px] font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck size={14} />
                {sentToAdmin[activeDeliverable.id]
                  ? "Sent to Admin for Review"
                  : "Send to Admin for Review"}
              </button>
            </div>
          </div>
        </>
      )}

    </>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="glass-card rounded-2xl p-4 text-center">
      <p className="text-2xl font-black text-white stat-number leading-none">
        {value}
      </p>
      <p className="text-[10px] text-white/30 mt-2 uppercase tracking-wider font-medium">
        {label}
      </p>
    </div>
  );
}

function mapDeliverableBoardStatus(deliverable) {
  const status = deliverable.status?.toLowerCase() || "";
  if (status.includes("approved")) return "approved";
  if (status.includes("denied") || status.includes("rejected")) return "denied";
  if (status.includes("review")) return "submitted";
  if (status.includes("draft")) return "edits_requested";
  if (status.includes("progress")) return "needs_revisions";
  return "needs_revisions";
}

function buildDeliverableThread(deliverable, brief) {
  return [
    {
      id: `${deliverable.id}-m1`,
      author: "admin",
      authorLabel: "Admin",
      text: `Please update ${deliverable.name} based on stakeholder notes for ${brief.title}.`,
      time: "2h ago",
    },
    {
      id: `${deliverable.id}-m2`,
      author: "editor",
      authorLabel: "Editor",
      text: "Received. Updating cut and exporting a revised package.",
      time: "1h ago",
    },
  ];
}

function buildDeliverableMediaPreview(deliverable, brief) {
  const base = encodeURIComponent(`${brief.id}-${deliverable.id}-${deliverable.name}`);
  return {
    main: `https://picsum.photos/seed/${base}-main/540/960`,
    activeRevision: 2,
    revisions: [
      {
        id: `${deliverable.id}-rev-1`,
        thumbnail: `https://picsum.photos/seed/${base}-rev1/420/260`,
        date: "2026-04-11",
      },
      {
        id: `${deliverable.id}-rev-2`,
        thumbnail: `https://picsum.photos/seed/${base}-rev2/420/260`,
        date: "2026-04-13",
      },
    ],
  };
}

/* ── Animated Donut Chart ── */

const DONUT_RADIUS = 70;
const DONUT_STROKE = 14;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function StatusDonutChart({ segments, total }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const nonZero = segments.filter((s) => s.count > 0);
  let cumulativeOffset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="172" height="172" viewBox="0 0 172 172">
          <circle
            cx="86"
            cy="86"
            r={DONUT_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={DONUT_STROKE}
          />
          {nonZero.map((seg) => {
            const fraction = seg.count / total;
            const dashLen = fraction * DONUT_CIRCUMFERENCE;
            const gap = DONUT_CIRCUMFERENCE - dashLen;
            const offset = -cumulativeOffset;
            cumulativeOffset += dashLen;
            return (
              <circle
                key={seg.label}
                cx="86"
                cy="86"
                r={DONUT_RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={DONUT_STROKE}
                strokeDasharray={`${dashLen} ${gap}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 86 86)"
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: `stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease`,
                  transitionDelay: "0.1s",
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white stat-number leading-none">
            {total}
          </span>
          <span className="text-[9px] text-white/25 uppercase tracking-wider mt-1">
            Total
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="flex-1 text-[11px] text-white/50">{seg.label}</span>
            <span className="text-[12px] text-white/80 font-bold tabular-nums">
              {seg.count}
            </span>
            <span className="text-[10px] text-white/25 w-10 text-right font-mono">
              {total > 0 ? Math.round((seg.count / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Status Dot (tiny indicator) ── */

function StatusDot({ status }) {
  const colorMap = {
    "In Progress": "bg-blue-400",
    "In Review": "bg-purple-400",
    Approved: "bg-teal-400",
    Delivered: "bg-green-400",
    Draft: "bg-white/30",
    "Needs Revision": "bg-orange-400",
  };
  return (
    <div
      className={`w-2 h-2 rounded-full ${colorMap[status] || "bg-white/20"} ring-1 ring-black/30`}
    />
  );
}

/* ── Synthetic asset pool generator ── */

const SYNTH_PARTNER_POOL = [
  "Nike", "Adidas", "Puma", "New Balance", "Converse",
  "Under Armour", "Reebok", "ASICS",
];
const SYNTH_GENDERS = ["Male", "Female", "Non-binary"];
const SYNTH_STATUSES = ["In Progress", "In Review", "Approved", "Delivered", "Needs Revision"];
const SYNTH_TITLES = [
  "Hero Campaign Shot", "Product Detail Close-up", "Lifestyle Urban Series",
  "Studio Portrait", "Motion Reel Snippet", "Social Grid Asset",
  "Packaging Front View", "BTS Studio Day", "Editorial Spread",
  "3D Product Spin", "Event Coverage", "Campaign Video Thumb",
  "Flat Lay Composition", "Night Street Series", "Color Study Warm",
  "Texture Detail Macro", "Model Lookbook Page", "Product on White",
  "Overhead Arrangement", "Cinematic Still Frame", "Street Style Portrait",
  "Aerial Product Lay", "Dynamic Action Shot", "Behind the Scenes",
  "Brand Identity Frame", "Seasonal Collection Set", "Retouched Final",
  "UGC Repost Edit", "Campaign Teaser Clip", "Social Story Frame",
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateExpandedBriefAssets(brief, realAssets) {
  const TARGET = 128;
  const result = [...realAssets.map((a) => ({
    ...a,
    creatorGender: SYNTH_GENDERS[a.id % SYNTH_GENDERS.length],
  }))];

  const rand = seededRandom(brief.id * 997 + 42);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  for (let i = result.length; i < TARGET; i++) {
    const synId = `synth-${brief.id}-${i}`;
    const w = [400, 500, 600][Math.floor(rand() * 3)];
    const h = [400, 500, 600][Math.floor(rand() * 3)];
    result.push({
      id: synId,
      title: pick(SYNTH_TITLES),
      thumbnail: `https://picsum.photos/seed/ba${brief.id}-${i}/${w}/${h}`,
      type: pick(["Photo", "Video", "Graphic", "Motion"]),
      status: pick(SYNTH_STATUSES),
      partner: pick(SYNTH_PARTNER_POOL),
      product: brief.product,
      editor: pick(["Aisha Patel", "Marcus Chen", "Luna Rivera", "Tariq Hassan", "Sofia Andersson"]),
      editorNeeded: rand() > 0.7,
      dateSubmitted: `2026-0${Math.floor(rand() * 4) + 1}-${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}`,
      views: Math.floor(rand() * 1200 + 50),
      downloads: Math.floor(rand() * 200 + 5),
      creatorGender: pick(SYNTH_GENDERS),
    });
  }
  return result;
}

function BriefOfferCard({ brief, onAccept, onView }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl h-[160px]">
      <img src={brief.thumbnail} alt={brief.title} className="absolute inset-0 w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/30" />

      <div className="absolute top-3 right-3">
        <PriorityBadge priority={brief.priority} />
      </div>

      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-accent-teal/15 flex items-center justify-center flex-shrink-0">
              <FileText size={10} className="text-accent-teal" />
            </div>
            <p className="text-[13px] font-bold text-white/90 truncate">{brief.title}</p>
          </div>
          <p className="text-[10px] text-white/35 leading-relaxed line-clamp-2 mt-1">{brief.description || `${brief.product} · ${brief.deliverables?.length || 0} deliverables · Due ${brief.dueDate}`}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.06] text-[9px] text-white/40 font-medium">{brief.product}</span>
            <span className="flex items-center gap-1 text-[9px] text-white/25">
              <Clock size={9} />{brief.dueDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onView(); }} className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.06] text-[10px] font-semibold text-white/50 hover:text-white/80 hover:bg-white/[0.1] transition-all duration-200">
              View
            </button>
            <button onClick={(e) => { e.stopPropagation(); onAccept(); }} className="px-3 py-1.5 rounded-lg bg-accent-teal/80 hover:bg-accent-teal text-[10px] font-bold text-white transition-all duration-200 active:scale-[0.97]">
              Accept Brief
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-white/[0.1]" />
    </div>
  );
}
