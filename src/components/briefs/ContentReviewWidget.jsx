import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageSquare,
  SendHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  useContentComments,
  useCreateContentComment,
  useUpdateContent,
} from "../../api/content/hooks";
import { currentUser } from "../../data/mockData";
import { useCommandCenter } from "../../contexts/CommandCenterContext";
import { adminDiscoveryUrl } from "../../config";

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isVideoAsset(asset) {
  return Boolean(asset?.videoUrl) || asset?.type === "Video" || asset?.type === "Motion";
}

export default function ContentReviewWidget({
  asset,
  taskItem,
  onBack,
  onUpdated,
}) {
  const navigate = useNavigate();
  const { updateTask } = useCommandCenter();
  const [draft, setDraft] = useState("");
  const [actionError, setActionError] = useState("");
  const commentsQuery = useContentComments(asset?.id);
  const commentMutation = useCreateContentComment(asset?.id);
  const updateMutation = useUpdateContent();

  if (!asset) return null;

  const comments = commentsQuery.data || [];
  const busy = commentMutation.isPending || updateMutation.isPending;
  const video = isVideoAsset(asset);

  const sendComment = async () => {
    const text = draft.trim();
    if (!text || !asset.id) return;
    setActionError("");
    try {
      await commentMutation.mutateAsync({ body: text });
      setDraft("");
    } catch {
      setActionError("Couldn't post feedback. Try again.");
    }
  };

  const setReview = async (kind) => {
    if (!asset.id) return;
    setActionError("");
    const payload =
      kind === "approve"
        ? { stage: "approved", assetStatus: "approved", reviewStatus: "approved" }
        : {
            stage: "denied",
            assetStatus: "needs_creator_revisions",
            reviewStatus: "needs_review",
          };
    try {
      await updateMutation.mutateAsync({ id: asset.id, payload });
      if (taskItem?.id) {
        updateTask(taskItem.id, {
          status: kind === "approve" ? "Approved" : "Revisions Needed",
        });
      }
      onUpdated?.();
    } catch {
      setActionError(
        kind === "approve"
          ? "Couldn't approve this submission."
          : "Couldn't request revisions.",
      );
    }
  };

  const openInLibrary = () => {
    navigate(`/?assetId=${asset.id}`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-stone-500 hover:bg-stone-200/70 hover:text-stone-800"
        >
          <ArrowLeft size={12} />
          Submissions
        </button>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
          Content
        </span>
        <span className="ml-auto truncate text-[11px] font-medium text-stone-500">
          {asset.title}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
          <div className="relative bg-stone-950">
            {video && asset.videoUrl ? (
              <video
                src={asset.videoUrl}
                poster={asset.thumbnail}
                controls
                className="mx-auto max-h-[360px] w-full object-contain"
              />
            ) : asset.thumbnail ? (
              <img
                src={asset.thumbnail}
                alt=""
                className="mx-auto max-h-[360px] w-full object-contain"
              />
            ) : (
              <div className="flex h-40 items-center justify-center text-[12px] text-stone-400">
                No preview
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 px-3.5 py-3">
            <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-stone-800">
              {asset.title}
            </p>
            {asset.assetStatus || asset.reviewStatus ? (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-stone-600">
                {String(asset.assetStatus || asset.reviewStatus).replace(/_/g, " ")}
              </span>
            ) : asset.status ? (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-stone-600">
                {asset.status}
              </span>
            ) : null}
            <span className="text-[10px] text-stone-400">{asset.type}</span>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setReview("approve")}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            Approve
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setReview("revise")}
            className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-3 py-1.5 text-[12px] font-semibold text-orange-800 hover:bg-orange-100 disabled:opacity-50"
          >
            <RotateCcw size={12} />
            Request revisions
          </button>
          <button
            type="button"
            onClick={openInLibrary}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-[12px] font-semibold text-stone-700 hover:bg-stone-100"
          >
            Open content card
          </button>
          <a
            href={adminDiscoveryUrl(asset.id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-[12px] font-semibold text-stone-700 hover:bg-stone-100"
          >
            <ExternalLink size={11} />
            Admin
          </a>
        </div>

        {actionError ? (
          <p className="text-[12px] text-rose-600">{actionError}</p>
        ) : (
          <p className="text-[11px] text-stone-400">
            Feedback lives on this content card. Approving or requesting revisions updates the Content database and this task.
          </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
          <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-4 py-2.5">
            <MessageSquare size={13} className="text-stone-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
              Revisions & feedback
            </span>
          </div>
          <div className="flex min-h-[200px] flex-col">
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {commentsQuery.isLoading ? (
                <p className="flex items-center gap-2 text-[12px] text-stone-400">
                  <Loader2 size={12} className="animate-spin" /> Loading notes…
                </p>
              ) : comments.length === 0 ? (
                <p className="px-1 py-6 text-center text-[12px] italic text-stone-400">
                  No revision notes yet. Leave feedback for the editor here.
                </p>
              ) : (
                comments.map((note) => {
                  const name = note.author?.name || currentUser.name;
                  const avatar = note.author?.avatar;
                  return (
                    <div key={note.id} className="flex gap-2.5">
                      {avatar ? (
                        <img src={avatar} alt="" className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[9px] font-bold text-stone-500">
                          {initials(name)}
                        </span>
                      )}
                      <div className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                        <p className="text-[11px] font-semibold text-stone-800">{name}</p>
                        <p className="mt-0.5 text-[12.5px] leading-relaxed text-stone-700">
                          {note.body}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t border-stone-100 p-2.5">
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendComment();
                    }
                  }}
                  rows={2}
                  placeholder="Leave revision notes on this content card…"
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-[12.5px] text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-400"
                />
                <button
                  type="button"
                  onClick={sendComment}
                  disabled={!draft.trim() || commentMutation.isPending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-opacity disabled:opacity-35"
                  title="Send feedback"
                >
                  {commentMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <SendHorizontal size={15} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
