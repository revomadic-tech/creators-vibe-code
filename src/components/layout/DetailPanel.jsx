import { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  ExternalLink,
  Share2,
  Download,
  Heart,
  Layers,
  Tag,
  Calendar,
  User,
  Package,
  Eye,
  Clock,
  MessageSquare,
  CheckCircle2,
  FileText,
  ChevronRight,
  ChevronDown,
  Copy,
  Maximize2,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "../ui/Tag";
import MetadataRow from "../ui/MetadataRow";
import ProgressBar from "../ui/ProgressBar";

export default function DetailPanel({
  item,
  type = "asset",
  onClose,
  onOpenFull,
  relatedAssets,
  onSelectRelated,
  embedded = false,
}) {
  const isAsset = type === "asset";
  const navigate = useNavigate();
  const [railOpen, setRailOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (embedded) return undefined;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [embedded, handleKeyDown]);

  if (!item) return null;

  const goToBrief = (briefId) => {
    if (!briefId) return;
    onClose?.();
    navigate(`/briefs?briefId=${briefId}`);
  };

  const goToDiscoveryFiltered = (key, value) => {
    if (!value) return;
    onClose?.();
    const params = new URLSearchParams({ [key]: value });
    navigate(`/?${params.toString()}`);
  };

  const panelWidth = isAsset && railOpen ? 880 : 560;

  const inner = (
    <div className="flex-1 min-w-0 flex h-full">
        <div className="flex-1 min-w-0 flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between px-4 h-12 border-b border-white/[0.06] flex-shrink-0 ${embedded ? "pr-11" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">
                {isAsset ? "Asset" : "Brief"}
              </span>
              <span className="text-[10px] text-white/8">&middot;</span>
              <span className="text-[10px] text-white/15 font-mono">
                #{item.id}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {isAsset && (
                <button
                  onClick={() => setRailOpen((v) => !v)}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    railOpen
                      ? "text-accent-red bg-accent-red/10"
                      : "text-white/20 hover:text-white/60 hover:bg-white/[0.06]"
                  }`}
                  title={railOpen ? "Close fields" : "Open fields"}
                >
                  {railOpen ? (
                    <PanelRightClose size={13} />
                  ) : (
                    <PanelRightOpen size={13} />
                  )}
                </button>
              )}
              {!embedded && (
                <button
                  onClick={
                    onOpenFull ||
                    (isAsset ? undefined : () => goToBrief(item.id))
                  }
                  className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200"
                  title="Open full view"
                >
                  <Maximize2 size={13} />
                </button>
              )}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?assetId=${item.id}`;
                  navigator.clipboard?.writeText(url);
                }}
                className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200"
                title="Copy link"
              >
                <Copy size={13} />
              </button>
              {!embedded && (
                <>
                  <button
                    className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200"
                    title="Share"
                  >
                    <Share2 size={13} />
                  </button>
                  <div className="w-px h-3.5 bg-white/[0.06] mx-0.5" />
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-200"
                    title="Close (Esc)"
                  >
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isAsset ? (
              <AssetDetail
                item={item}
                relatedAssets={relatedAssets}
                onSelectRelated={onSelectRelated}
                onGoBrief={goToBrief}
                onGoProduct={(value) =>
                  goToDiscoveryFiltered("product", item.productId || value)
                }
                onGoPartner={(value) =>
                  goToDiscoveryFiltered("partner", value)
                }
              />
            ) : (
              <BriefDetail
                item={item}
                onGoProduct={(value) =>
                  goToDiscoveryFiltered("product", value)
                }
                onGoPartner={(value) =>
                  goToDiscoveryFiltered("partner", value)
                }
              />
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0 flex items-center gap-2">
            {isAsset ? (
              item.downloadUrl ? (
                <a
                  href={item.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/[0.08] rounded-xl text-white/50 hover:text-white/80 text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  title="Download"
                >
                  <Download size={15} />
                  Download
                </a>
              ) : (
                <button
                  type="button"
                  className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/[0.08] rounded-xl text-white/50 hover:text-white/80 text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download size={15} />
                  Download
                </button>
              )
            ) : (
              <>
                <button
                  onClick={onOpenFull || (() => goToBrief(item.id))}
                  className="flex-1 py-2.5 bg-accent-red hover:bg-accent-red/90 text-white text-[13px] font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <ExternalLink size={14} />
                  Open Full Brief
                </button>
                <button className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/[0.08] rounded-xl text-white/35 hover:text-white/70 transition-all duration-200">
                  <Download size={15} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Field rail — only for assets */}
        {isAsset && (
          <FieldRail item={item} open={railOpen} />
        )}
    </div>
  );

  if (embedded) return inner;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 pointer-events-none" />
      <div
        className="fixed right-6 top-1/2 -translate-y-1/2 h-[88vh] rounded-2xl glass-panel z-50 flex slide-in-right shadow-2xl shadow-black/45 border border-white/[0.08] overflow-hidden"
        style={{
          width: panelWidth,
          transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {inner}
      </div>
    </>
  );
}

function FieldRail({ item, open }) {
  const contentMetricsFields = useMemo(
    () => buildContentMetricsFields(item),
    [item]
  );

  return (
    <div
      className="flex-shrink-0 border-l border-white/[0.06] bg-black/20 backdrop-blur-sm overflow-hidden flex flex-col"
      style={{
        width: open ? 320 : 0,
        opacity: open ? 1 : 0,
        transition:
          "width 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease",
      }}
    >
      <div className="px-3 py-2.5 border-b border-white/[0.06] flex-shrink-0">
        <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">
          Content Intelligence
        </p>
        <p className="text-[9px] text-white/30 mt-0.5">
          Technical + 40 field schema
        </p>
      </div>

      {/* Technical row */}
      <div className="px-3 pt-2.5 pb-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Dimensions", value: item.dimensions },
            { label: "File Size", value: item.fileSize },
            { label: "Format", value: item.type },
          ].map((d) => (
            <div
              key={d.label}
              className="bg-white/[0.025] border border-white/[0.03] rounded-lg px-2 py-1.5"
            >
              <p className="text-[8px] text-white/20 uppercase tracking-wider">
                {d.label}
              </p>
              <p className="text-[9px] text-white/60 font-mono mt-0.5 truncate">
                {d.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* All fields */}
      <div className="flex-1 overflow-y-auto">
        {contentMetricsFields.map((f) => (
          <div
            key={f.name}
            className="px-3 py-2.5 border-b border-white/[0.03]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/55 font-semibold">
                {f.name}
              </p>
              <span className="text-[8px] text-white/20 font-mono flex-shrink-0 ml-2">
                {f.type}
              </span>
            </div>
            <p className="text-[10px] text-white/60 mt-1 leading-snug">
              {f.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetDetail({
  item,
  relatedAssets,
  onSelectRelated,
  onGoBrief,
  onGoProduct,
  onGoPartner,
}) {
  return (
    <div className="fade-in">
      {/* Hero Image */}
      <div className="relative bg-surface-700 overflow-hidden group">
        <div className="aspect-[16/10]">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover img-cinematic"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-800/80 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[9px] font-semibold text-white/70 uppercase tracking-wider">
            {item.type}
          </span>
          {item.editorNeeded && (
            <span className="px-2 py-0.5 bg-accent-orange/80 rounded-md text-[9px] font-bold text-white flex items-center gap-1">
              <User size={9} /> Editor Needed
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 text-[10px] text-white/40">
            <span className="flex items-center gap-0.5">
              <Eye size={10} /> {item.views?.toLocaleString()}
            </span>
            <span className="flex items-center gap-0.5">
              <Download size={10} /> {item.downloads}
            </span>
            <span className="ml-auto font-mono text-[9px] text-white/20">
              {item.dimensions}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Title + Status */}
        <div>
          <h2 className="text-base font-bold text-white leading-tight">
            {item.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={item.status} />
            <span className="text-[10px] text-white/15 font-mono">
              {item.category}
            </span>
            {item.aspectLabel && (
              <span className="text-[10px] text-white/15">
                &middot; {item.aspectLabel}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          {[
            { icon: Download, label: "Download" },
            { icon: Heart, label: "Save" },
            { icon: Layers, label: "Add to Gallery" },
            { icon: Share2, label: "Share" },
          ].map((action, i) => (
            <button
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.04] rounded-lg text-[10px] text-white/45 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.08] transition-all duration-200"
            >
              <action.icon size={11} strokeWidth={1.5} /> {action.label}
            </button>
          ))}
        </div>

        {/* Brief linkage */}
        {item.briefTitle && (
          <button
            onClick={() => onGoBrief?.(item.briefId)}
            className="w-full flex items-center gap-2.5 p-3 bg-accent-red/[0.04] border border-accent-red/10 rounded-xl cursor-pointer hover:bg-accent-red/[0.06] hover:border-accent-red/15 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-lg bg-accent-red/10 flex items-center justify-center flex-shrink-0">
              <FileText size={13} className="text-accent-red/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/20 uppercase tracking-wider font-medium">
                Linked Brief
              </p>
              <p className="text-[11px] text-accent-red/80 font-semibold truncate">
                {item.briefTitle}
              </p>
            </div>
            <ChevronRight
              size={13}
              className="text-accent-red/25 flex-shrink-0"
            />
          </button>
        )}

        {/* Metadata */}
        <div className="space-y-2.5">
          <MetadataRow
            icon={Package}
            label="Product"
            value={
              <button
                onClick={() => onGoProduct?.(item.product)}
                className="font-medium text-white/70 hover:text-accent-red transition-colors"
              >
                {item.product}
              </button>
            }
          />
          <MetadataRow
            icon={Tag}
            label="Partner"
            value={
              <button
                onClick={() => onGoPartner?.(item.partner)}
                className="font-medium text-white/70 hover:text-accent-red transition-colors"
              >
                {item.partner}
              </button>
            }
          />
          <MetadataRow icon={Tag} label="Category" value={item.category} />
          <MetadataRow
            icon={Calendar}
            label="Submitted"
            value={item.dateSubmitted}
          />
          <MetadataRow
            icon={User}
            label="Editor"
            value={
              item.editor ? (
                <div className="flex items-center gap-1.5">
                  {item.editorAvatar ? (
                    <img
                      src={item.editorAvatar}
                      alt=""
                      className="w-4 h-4 rounded-full ring-1 ring-white/[0.06]"
                    />
                  ) : null}
                  <span className="font-medium">{item.editor}</span>
                </div>
              ) : (
                "—"
              )
            }
          />
        </div>

        {/* Tags */}
        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-[9px] text-white/15 font-semibold uppercase tracking-wider mb-2.5">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {item.tags?.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-white/[0.03] border border-white/[0.04] rounded-lg text-[10px] text-white/35 hover:text-white/55 hover:border-white/[0.08] hover:bg-white/[0.05] cursor-pointer transition-all duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Assets */}
        {relatedAssets && relatedAssets.length > 0 && (
          <div className="pt-3 border-t border-white/[0.06]">
            <p className="text-[9px] text-white/15 font-semibold uppercase tracking-wider mb-2.5">
              More from {item.product}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {relatedAssets.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelectRelated?.(a)}
                  className="group/rel rounded-lg overflow-hidden border border-white/[0.04] hover:border-white/[0.12] transition-all duration-200"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={a.thumbnail}
                      alt=""
                      className="w-full h-full object-cover img-cinematic transition-transform duration-300 group-hover/rel:scale-110"
                      loading="lazy"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BriefDetail({ item, onGoProduct, onGoPartner }) {
  return (
    <div className="fade-in">
      <div className="relative aspect-video bg-surface-700 overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover img-cinematic"
        />
        <div className="absolute inset-0 gradient-overlay-full" />
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-xl font-bold text-white leading-tight">
            {item.title}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
          <PriorityBadge priority={item.priority} />
        </div>

        <p className="text-xs text-white/40 leading-relaxed">
          {item.description}
        </p>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-white/25">
              {item.tasksCompleted}/{item.tasks} tasks
            </span>
            <span className="text-xs font-bold text-white">
              {item.progress}%
            </span>
          </div>
          <ProgressBar value={item.progress} size="sm" />
        </div>

        <div className="space-y-2.5">
          <MetadataRow
            icon={Package}
            label="Product"
            value={
              <button
                onClick={() => onGoProduct?.(item.product)}
                className="font-medium text-white/70 hover:text-accent-red transition-colors"
              >
                {item.product}
              </button>
            }
          />
          <MetadataRow
            icon={Tag}
            label="Partner"
            value={
              <button
                onClick={() => onGoPartner?.(item.partner)}
                className="font-medium text-white/70 hover:text-accent-red transition-colors"
              >
                {item.partner}
              </button>
            }
          />
          <MetadataRow icon={Tag} label="Campaign" value={item.campaign} />
          <MetadataRow icon={Calendar} label="Due Date" value={item.dueDate} />
          <MetadataRow icon={Clock} label="Created" value={item.dateCreated} />
          <MetadataRow
            icon={MessageSquare}
            label="Comments"
            value={item.comments}
          />
          <MetadataRow
            icon={CheckCircle2}
            label="Deliverables"
            value={item.deliverables?.length}
          />
        </div>

        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-[9px] text-white/15 font-semibold uppercase tracking-wider mb-3">
            Team ({item.assignees?.length})
          </p>
          <div className="space-y-2.5">
            {item.assignees?.map((a) => (
              <div key={a.id} className="flex items-center gap-2.5">
                <img
                  src={a.avatar}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-white/[0.06]"
                />
                <div>
                  <p className="text-[11px] text-white/70 font-medium">
                    {a.name}
                  </p>
                  <p className="text-[9px] text-white/25">{a.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-[9px] text-white/15 font-semibold uppercase tracking-wider mb-3">
            Deliverables
          </p>
          <div className="space-y-1.5">
            {item.deliverables?.map((d) => (
              <div
                key={d.id || d.name}
                className="flex items-center justify-between bg-white/[0.025] border border-white/[0.03] rounded-lg px-3 py-2.5"
              >
                <div>
                  <p className="text-[11px] text-white/60">{d.name}</p>
                  <p className="text-[9px] text-white/20 mt-0.5">
                    {d.completed}/{d.count}
                  </p>
                </div>
                <StatusBadge status={d.status} small />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildContentMetricsFields(item) {
  const monthUploaded = item.dateSubmitted
    ? new Date(item.dateSubmitted).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "N/A";
  const totalEngagement = Math.round(
    (item.views || 0) * 0.08 + (item.downloads || 0)
  );
  const creatorStage = item.status === "In Progress" ? "II" : "III";
  const editorStage = item.status === "In Review" ? "III" : "IV";
  const contentRating =
    item.status === "Approved" || item.status === "Delivered" ? "3/3" : "2/3";

  return [
    { name: "Ad Production Status", type: "Select", value: item.status === "In Progress" ? "In Editing" : item.status === "In Review" ? "On Hold" : item.status === "Approved" ? "Approved" : "Launched" },
    { name: "Asset Status", type: "Select", value: item.status || "Awaiting" },
    { name: "By City", type: "Linked", value: "Lisbon" },
    { name: "By Tags", type: "Linked", value: item.tags?.join(", ") || "N/A" },
    { name: "Campaign", type: "Linked", value: item.briefTitle || "General" },
    { name: "Content Rating", type: "Rating", value: contentRating },
    { name: "Content Type", type: "Multi", value: `${item.type}, Tag` },
    { name: "Contracts Rollup", type: "File", value: "Contract-v2.pdf" },
    { name: "Created", type: "Formula", value: item.dateSubmitted || "N/A" },
    { name: "Creative Brief", type: "Linked", value: item.briefTitle || "N/A" },
    { name: "Creator Rev Stage", type: "Multi", value: `Stage ${creatorStage}` },
    { name: "Date Posted", type: "Date", value: item.dateSubmitted || "Pending" },
    { name: "Editor", type: "Linked", value: item.editor || "Unassigned" },
    { name: "Editor Rev Stage", type: "Multi", value: `Stage ${editorStage}` },
    { name: "Facilities", type: "Linked", value: item.partner || "N/A" },
    { name: "Google Drive", type: "Text", value: `drive.google.com/${item.id}` },
    { name: "Images", type: "File", value: item.thumbnail ? "1 attached" : "None" },
    { name: "Month Uploaded", type: "Formula", value: monthUploaded },
    { name: "Name", type: "Text", value: item.title || `Asset #${item.id}` },
    { name: "Partner HQ", type: "Linked", value: item.partner || "N/A" },
    { name: "Partnership Type", type: "Multi", value: "Paid" },
    { name: "Platform", type: "Multi", value: "IG, TikTok, YT" },
    { name: "Posting Quality", type: "Multi", value: "Social set, Best Partner" },
    { name: "Posting Status", type: "Select", value: item.status === "Approved" || item.status === "Delivered" ? "Posted" : "Scheduled" },
    { name: "Product", type: "Linked", value: item.product || "N/A" },
    { name: "Production HQ", type: "Linked", value: "REVO Production" },
    { name: "Review Status", type: "Select", value: item.status === "In Review" ? "Pending" : item.status === "In Progress" ? "Needs Revisions" : "Approved" },
    { name: "Reviewed By", type: "Linked", value: "Creative Lead" },
    { name: "Social HQ", type: "Linked", value: "REVO Social Ops" },
    { name: "Sourced From", type: "Select", value: "Meta" },
    { name: "Spark Code", type: "Text", value: `SPARK-${String(item.id).padStart(4, "0")}` },
    { name: "Stakeholder", type: "Linked", value: item.editor || "Creative Team" },
    { name: "Submission Date", type: "Date", value: item.dateSubmitted || "N/A" },
    { name: "Thumbnail", type: "File", value: item.thumbnail ? "Attached" : "N/A" },
    { name: "TikTok Month", type: "Multi", value: monthUploaded },
    { name: "Total Engagement", type: "Formula", value: totalEngagement.toLocaleString() },
    { name: "Usage", type: "Multi", value: "1yr, Perpetuity" },
    { name: "Video", type: "File", value: item.type?.toLowerCase().includes("video") ? "Attached" : "None" },
    { name: "Video Format", type: "Select", value: item.aspectLabel || "Horizontal" },
  ];
}
