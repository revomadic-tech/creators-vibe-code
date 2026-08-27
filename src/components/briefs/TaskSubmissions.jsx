import { useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  Upload,
} from "lucide-react";
import {
  useCreateContent,
  useGetContentList,
} from "../../api/content/hooks";
import { unwrapList } from "../../lib/mapContentAsset";
import {
  detectMediaKind,
  mergeContentIds,
  taskContentTag,
  uploadFilesToLibrary,
} from "../../lib/taskContent";
import { useCommandCenter } from "../../contexts/CommandCenterContext";

function submissionStatus(asset) {
  const raw = asset.assetStatus || asset.reviewStatus || "";
  if (!raw) return asset.status || "";
  return String(raw)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function SubmissionCard({ asset, onOpen }) {
  const video = Boolean(asset.videoUrl) || asset.type === "Video" || asset.type === "Motion";
  return (
    <button
      type="button"
      onClick={() => onOpen(asset)}
      className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white text-left shadow-sm shadow-stone-900/[0.03] transition-colors hover:border-stone-300"
    >
      <div className="relative aspect-[4/5] bg-stone-100">
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-stone-400">
            {asset.title}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2.5">
          <p className="truncate text-[12px] font-semibold text-white">{asset.title}</p>
          <p className="mt-0.5 text-[10px] text-white/70">
            {asset.type}
            {submissionStatus(asset) ? ` · ${submissionStatus(asset)}` : ""}
          </p>
        </div>
        {video ? (
          <span className="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-white">
            Video
          </span>
        ) : null}
      </div>
    </button>
  );
}

export default function TaskSubmissions({ item, page = false, onOpenAsset }) {
  const inputRef = useRef(null);
  const { updateTask } = useCommandCenter();
  const createContent = useCreateContent();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [localAssets, setLocalAssets] = useState([]);

  const tag = taskContentTag(item);
  const storedIds = Array.isArray(item.contentIds) ? item.contentIds : [];

  const taggedQuery = useGetContentList(
    { page: "1", size: "48", tag, sort: "date" },
    { enabled: Boolean(tag) },
  );
  const idsQuery = useGetContentList(
    {
      page: "1",
      size: String(Math.max(storedIds.length, 1)),
      ids: storedIds.join(","),
    },
    { enabled: storedIds.length > 0 },
  );

  const assets = useMemo(() => {
    const tagged = unwrapList(taggedQuery.data).items;
    const byId = unwrapList(idsQuery.data).items;
    const merged = [];
    const seen = new Set();
    for (const row of [...localAssets, ...tagged, ...byId]) {
      const key = String(row.id);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(row);
    }
    return merged;
  }, [localAssets, taggedQuery.data, idsQuery.data]);

  const approvedCount = assets.filter((a) =>
    /approved|complete|posted/i.test(String(a.assetStatus || "")),
  ).length;
  const revisionCount = assets.filter((a) =>
    /revision|denied|needs/i.test(String(a.assetStatus || a.reviewStatus || "")),
  ).length;
  const loading =
    taggedQuery.isLoading || (storedIds.length > 0 && idsQuery.isLoading);

  const rememberId = (id) => {
    if (id == null) return;
    updateTask(item.id, { contentIds: mergeContentIds(item.contentIds, [id]) });
  };

  const uploadFiles = async (fileList) => {
    const files = [...fileList].filter(Boolean);
    if (!files.length) return;
    setError("");
    setUploading(true);
    setProgress(0);
    try {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const kind = detectMediaKind(file);
        const model = kind === "video" ? "content_video" : "content_image";
        const urls = await uploadFilesToLibrary([file], model, (_f, pct) => {
          setProgress(Math.round(((i + pct / 100) / files.length) * 100));
        });
        const url = urls[0];
        const payload = {
          title: `${item.name} · ${file.name.replace(/\.[^.]+$/, "")}`,
          description: `Submitted from Ad Production ${item.name}`,
          stage: "approved",
          assetStatus: "pending_approval",
          reviewStatus: "needs_review",
          sourcedFrom: "internal",
          contentType: kind === "video" ? "video" : "image",
          tags: [tag, item.product, "ad-production"].filter(Boolean),
          creativeBrief: item.product || item.name,
        };
        if (kind === "video") {
          payload.videos = [{ name: file.name, url }];
          payload.thumbnailImage = url;
        } else {
          payload.images = [{ name: file.name, url }];
          payload.thumbnailImage = url;
        }
        const created = await createContent.mutateAsync(payload);
        if (created?.id != null) {
          rememberId(created.id);
          setLocalAssets((prev) => [created, ...prev.filter((row) => row.id !== created.id)]);
        }
      }
      taggedQuery.refetch();
      idsQuery.refetch();
    } catch {
      setError("Upload didn't land in the Content database. Check that you're signed in and try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
        <div className="flex flex-wrap items-center gap-3 px-3.5 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
              Submissions
            </p>
            <p className="mt-0.5 text-[12px] text-stone-500">
              Uploads become Content cards. Open one to review, approve, or leave revisions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5">
              {assets.length} cards
            </span>
            {approvedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                <CheckCircle2 size={10} /> {approvedCount}
              </span>
            )}
            {revisionCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-orange-800">
                <RotateCcw size={10} /> {revisionCount}
              </span>
            )}
          </div>
        </div>
        <div className="border-t border-stone-100 px-3.5 py-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={(e) => {
              e.preventDefault();
              uploadFiles(e.dataTransfer.files);
            }}
            className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center hover:border-stone-400 hover:bg-stone-100 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin text-stone-500" />
                <p className="mt-2 text-[12px] font-semibold text-stone-700">
                  Saving to Content library… {progress}%
                </p>
              </>
            ) : (
              <>
                <Upload size={16} className="text-stone-500" />
                <p className="mt-2 text-[12px] font-semibold text-stone-700">
                  Drop creative here or browse
                </p>
                <p className="mt-0.5 text-[11px] text-stone-400">
                  Images and video land in the Content database as cards
                </p>
              </>
            )}
          </button>
          {error ? <p className="mt-2 text-[12px] text-rose-600">{error}</p> : null}
        </div>
      </section>

      {loading && assets.length === 0 ? (
        <p className="flex items-center gap-2 px-1 text-[12px] text-stone-400">
          <Loader2 size={12} className="animate-spin" /> Loading submissions…
        </p>
      ) : assets.length === 0 ? (
        <p className="px-1 text-[12px] italic text-stone-400">
          No content cards for this task yet. Upload a cut to start review.
        </p>
      ) : (
        <div className={`grid gap-3 ${page ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2"}`}>
          {assets.map((asset) => (
            <SubmissionCard key={asset.id} asset={asset} onOpen={onOpenAsset} />
          ))}
        </div>
      )}
    </div>
  );
}
