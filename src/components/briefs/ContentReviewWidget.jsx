import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  MessageSquare,
  SendHorizontal,
  RotateCcw,
  XCircle,
} from "lucide-react";
import {
  useContentComments,
  useCreateContentComment,
  useGetContentById,
  useUpdateContent,
} from "../../api/content/hooks";
import { currentUser } from "../../data/mockData";
import { useCommandCenter } from "../../contexts/CommandCenterContext";
import { adminDiscoveryUrl, adminReviewPipelineUrl } from "../../config";
import { unwrapDetail } from "../../lib/mapContentAsset";
import { useAccountType } from "../../hooks/useAccountType";
import {
  applySampleDecision,
  appendSampleMessage,
  isSamplePipelineAsset,
  loadSamplePipeline,
  sampleViewer,
  simulateEditorReply,
} from "../../lib/reviewPipelineSample";

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

function pipelineKey(asset) {
  const status = String(asset?.assetStatus || "").toLowerCase();
  if (status === "ready_for_editors") return "editor";
  if (status === "approved" || status === "complete" || status === "posted") return "approved";
  if (status.includes("revision") || status === "denied") return "revisions";
  return "review";
}

const PIPELINE_COPY = {
  review: "New submission — approve, send to editor, or request revisions.",
  editor: "Sent to editor. Chat and revision history stay on this sample card.",
  revisions: "Revisions requested. Notes stay in this thread for the next cut.",
  approved: "Approved. History and chat remain on this sample card.",
};

const EVENT_LABEL = {
  submitted: "Submitted",
  resubmitted: "Re-submitted",
  revision_requested: "Revisions requested",
  sent_to_editor: "Sent to editor",
  approved: "Approved",
  denied: "Denied",
};

export default function ContentReviewWidget({
  asset,
  taskItem,
  onBack,
  onUpdated,
}) {
  const navigate = useNavigate();
  const { updateTask } = useCommandCenter();
  const { accountType, isManager, viewer } = useAccountType();
  const actor = sampleViewer(viewer, accountType);
  const sample = isSamplePipelineAsset(asset) || Boolean(taskItem?.sampleSimulation);
  const [draft, setDraft] = useState("");
  const [actionError, setActionError] = useState("");
  const [overlay, setOverlay] = useState(null);
  const [threadTab, setThreadTab] = useState("chat");
  const [sampleState, setSampleState] = useState(() =>
    sample ? loadSamplePipeline(taskItem?.id, taskItem) : null,
  );
  const replyTimer = useRef(null);

  const detailQuery = useGetContentById(sample ? null : asset?.id);
  const commentsQuery = useContentComments(sample ? null : asset?.id);
  const commentMutation = useCreateContentComment(sample ? null : asset?.id);
  const updateMutation = useUpdateContent();

  useEffect(() => {
    setOverlay(null);
    setDraft("");
    setActionError("");
    setThreadTab("chat");
    if (sample) setSampleState(loadSamplePipeline(taskItem?.id, taskItem));
  }, [asset?.id, sample, taskItem?.id]);

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  if (!asset) return null;

  const live = overlay || unwrapDetail(detailQuery.data) || asset;
  const display = sample
    ? { ...live, assetStatus: sampleState?.assetStatus, reviewStatus: sampleState?.reviewStatus }
    : live;
  const comments = sample ? [] : commentsQuery.data || [];
  const messages = sampleState?.messages || [];
  const events = sampleState?.events || [];
  const busy = commentMutation.isPending || updateMutation.isPending;
  const video = isVideoAsset(display);
  const lane = pipelineKey(display);
  const editors = (taskItem?.editors || []).filter(Boolean);

  const queueEditorReply = () => {
    window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      setSampleState(simulateEditorReply(taskItem.id, taskItem));
    }, 900);
  };

  const sendComment = async (text = draft.trim()) => {
    if (!text) return false;
    setActionError("");
    if (sample) {
      const from = isManager ? "manager" : "editor";
      setSampleState(
        appendSampleMessage(taskItem.id, taskItem, {
          id: `msg-${Date.now()}`,
          from,
          name: actor.name,
          avatar: actor.avatar,
          body: text,
          time: "Just now",
        }),
      );
      setDraft("");
      if (isManager) queueEditorReply();
      return true;
    }
    if (!live.id) return false;
    try {
      await commentMutation.mutateAsync({ body: text });
      setDraft("");
      return true;
    } catch {
      setActionError("Couldn't post feedback. Try again.");
      return false;
    }
  };

  const setReview = async (kind) => {
    if (!isManager) return;
    setActionError("");
    const note = draft.trim();
    const taskStatus = {
      approve: "Approved",
      revise: "Revisions Needed",
      send_to_editor: "Ready For Editing",
      deny: "Needs Re-writing",
    };
    if (sample) {
      const next = applySampleDecision(taskItem.id, taskItem, kind, actor, note);
      setSampleState(next);
      setDraft("");
      if (taskItem?.id) updateTask(taskItem.id, { status: taskStatus[kind] });
      if (kind === "send_to_editor" || kind === "revise") queueEditorReply();
      onUpdated?.({ ...display, assetStatus: next.assetStatus, reviewStatus: next.reviewStatus });
      return;
    }
    if (!live.id) return;
    const payloads = {
      approve: {
        stage: "approved",
        assetStatus: "approved",
        reviewStatus: "approved",
        adProductionStatus: "completed",
      },
      revise: {
        stage: "denied",
        assetStatus: "needs_creator_revisions",
        reviewStatus: "needs_review",
        adProductionStatus: "in_progress",
      },
      send_to_editor: {
        assetStatus: "ready_for_editors",
        reviewStatus: "needs_review",
        adProductionStatus: "in_progress",
      },
      deny: {
        stage: "denied",
        assetStatus: "needs_creator_revisions",
        reviewStatus: "rejected",
        adProductionStatus: "not_started",
      },
    };
    try {
      if (note) await sendComment(note);
      const updated = await updateMutation.mutateAsync({
        id: live.id,
        payload: payloads[kind],
      });
      if (updated) setOverlay(updated);
      if (taskItem?.id) updateTask(taskItem.id, { status: taskStatus[kind] });
      onUpdated?.(updated || live);
    } catch {
      setActionError(
        kind === "send_to_editor"
          ? "Couldn't send this card to editors."
          : kind === "approve"
            ? "Couldn't approve this submission."
            : kind === "deny"
              ? "Couldn't deny this submission."
              : "Couldn't request revisions.",
      );
    }
  };

  const openInLibrary = () => {
    if (sample) return;
    navigate(`/?assetId=${live.id}`);
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
          Review Pipeline
        </span>
        {sample ? (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-violet-700">
            Sample
          </span>
        ) : null}
        <span className="ml-auto truncate text-[11px] font-medium text-stone-500">
          {display.title}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
          <div className="relative bg-stone-950">
            {video && display.videoUrl ? (
              <video
                src={display.videoUrl}
                poster={display.thumbnail}
                controls
                className="mx-auto max-h-[360px] w-full object-contain"
              />
            ) : display.thumbnail ? (
              <img
                src={display.thumbnail}
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
              {display.title}
            </p>
            {display.assetStatus || display.reviewStatus ? (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-stone-600">
                {String(display.assetStatus || display.reviewStatus).replace(/_/g, " ")}
              </span>
            ) : display.status ? (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-stone-600">
                {display.status}
              </span>
            ) : null}
            <span className="text-[10px] text-stone-400">{display.type}</span>
          </div>
        </section>

        {isManager ? (
          <div className="flex flex-wrap gap-2">
            {lane === "editor" ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setReview("approve")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                  Approve edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setReview("revise")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-3 py-1.5 text-[12px] font-semibold text-orange-800 hover:bg-orange-100 disabled:opacity-50"
                >
                  <RotateCcw size={12} />
                  Editor revisions
                </button>
              </>
            ) : lane === "approved" && !sample ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-800">
                <CheckCircle2 size={12} /> Approved
              </span>
            ) : (
              <>
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
                  Revisions
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setReview("send_to_editor")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-[12px] font-semibold text-violet-800 hover:bg-violet-100 disabled:opacity-50"
                >
                  <ArrowRight size={12} />
                  Send to Editor
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setReview("deny")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  <XCircle size={12} />
                  Deny
                </button>
              </>
            )}
            {!sample ? (
              <>
                <button
                  type="button"
                  onClick={openInLibrary}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-[12px] font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Open content card
                </button>
                <a
                  href={adminDiscoveryUrl(live.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-[12px] font-semibold text-stone-700 hover:bg-stone-100"
                >
                  <ExternalLink size={11} />
                  Admin card
                </a>
                <a
                  href={adminReviewPipelineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-[12px] font-semibold text-stone-700 hover:bg-stone-100"
                >
                  <ExternalLink size={11} />
                  Review Pipeline
                </a>
              </>
            ) : null}
          </div>
        ) : (
          <p className="text-[11px] text-stone-400">
            Review decisions are Manager-only. You can still read history and reply in the thread.
          </p>
        )}

        {actionError ? (
          <p className="text-[12px] text-rose-600">{actionError}</p>
        ) : isManager ? (
          <p className="text-[11px] text-stone-400">
            {sample ? PIPELINE_COPY[lane] : `${PIPELINE_COPY[lane]} Notes land on this Content card.`}
            {editors.length && lane !== "approved" ? ` Editor: ${editors.join(", ")}.` : ""}
          </p>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
          <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-4 py-2.5">
            <button
              type="button"
              onClick={() => setThreadTab("chat")}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                threadTab === "chat" ? "bg-white text-stone-800 shadow-sm" : "text-stone-400"
              }`}
            >
              <MessageSquare size={12} />
              Chat
            </button>
            <button
              type="button"
              onClick={() => setThreadTab("history")}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                threadTab === "history" ? "bg-white text-stone-800 shadow-sm" : "text-stone-400"
              }`}
            >
              <Clock3 size={12} />
              History
            </button>
          </div>
          <div className="flex min-h-[220px] flex-col">
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {threadTab === "history" ? (
                sample ? (
                  events.map((event) => (
                    <div key={event.id} className="flex gap-2.5">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[9px] font-bold text-stone-500">
                        {initials(event.actor)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-stone-800">
                          {EVENT_LABEL[event.kind] || event.kind}
                          <span className="ml-1.5 font-medium text-stone-400">{event.time}</span>
                        </p>
                        <p className="mt-0.5 text-[12.5px] leading-relaxed text-stone-700">
                          {event.actor}
                          {event.role ? ` · ${event.role}` : ""} — {event.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : commentsQuery.isLoading ? (
                  <p className="flex items-center gap-2 text-[12px] text-stone-400">
                    <Loader2 size={12} className="animate-spin" /> Loading notes…
                  </p>
                ) : comments.length === 0 ? (
                  <p className="px-1 py-6 text-center text-[12px] italic text-stone-400">
                    No revision history on this card yet.
                  </p>
                ) : (
                  comments.map((note) => (
                    <div key={note.id} className="flex gap-2.5">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[9px] font-bold text-stone-500">
                        {initials(note.author?.name || currentUser.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-stone-800">
                          {note.author?.name || currentUser.name}
                        </p>
                        <p className="mt-0.5 text-[12.5px] leading-relaxed text-stone-700">
                          {note.body}
                        </p>
                      </div>
                    </div>
                  ))
                )
              ) : sample ? (
                messages.map((note) => {
                  const mine = note.name === actor.name;
                  return (
                    <div
                      key={note.id}
                      className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}
                    >
                      {note.avatar ? (
                        <img src={note.avatar} alt="" className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[9px] font-bold text-stone-500">
                          {initials(note.name)}
                        </span>
                      )}
                      <div
                        className={`max-w-[80%] min-w-0 rounded-2xl px-3 py-2 ${
                          mine
                            ? "bg-stone-800 text-white"
                            : "border border-stone-200 bg-stone-50 text-stone-700"
                        }`}
                      >
                        <p className={`text-[11px] font-semibold ${mine ? "text-white/80" : "text-stone-800"}`}>
                          {note.name}
                          <span className={`ml-1.5 font-medium ${mine ? "text-white/45" : "text-stone-400"}`}>
                            {note.time}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[12.5px] leading-relaxed">{note.body}</p>
                      </div>
                    </div>
                  );
                })
              ) : commentsQuery.isLoading ? (
                <p className="flex items-center gap-2 text-[12px] text-stone-400">
                  <Loader2 size={12} className="animate-spin" /> Loading notes…
                </p>
              ) : comments.length === 0 ? (
                <p className="px-1 py-6 text-center text-[12px] italic text-stone-400">
                  No revision notes yet. Leave feedback here.
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
            {threadTab === "chat" ? (
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
                    placeholder={
                      sample
                        ? isManager
                          ? "Message the editor…"
                          : "Reply on this cut…"
                        : "Leave revision notes on this content card…"
                    }
                    className="min-h-[44px] flex-1 resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-[12.5px] text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => sendComment()}
                    disabled={!draft.trim() || commentMutation.isPending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-opacity disabled:opacity-35"
                    title="Send"
                  >
                    {commentMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <SendHorizontal size={15} />
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
