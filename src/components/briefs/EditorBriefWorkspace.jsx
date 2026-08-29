import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  SendHorizontal,
  Upload,
} from "lucide-react";
import AdminBriefPanel from "./AdminBriefPanel";
import {
  useAcceptEdit,
  useGetBriefUnits,
  useGetUnitEvents,
  usePostUnitEvent,
  useSetUnitBrolls,
  useSetUnitContent,
  useSubmitUnit,
} from "../../api/brief-units/hooks";
import { detectMediaKind, uploadFilesToLibrary } from "../../lib/taskContent";
import {
  deliverableLabel,
  mapBriefUnits,
  mapUnitEvents,
} from "../../lib/mapEditorBrief";
import { formatError } from "../../lib/apiError";
import { formatCommentTime, formatCommentTimeFull } from "../../lib/formatCommentTime";

function statusLabel(value) {
  return String(value || "draft")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isVideoUrl(url) {
  return /\.(mp4|mov|webm|m4v)(\?|$)/i.test(url || "");
}

function UnitThread({ unitId }) {
  const [draft, setDraft] = useState("");
  const eventsQuery = useGetUnitEvents(unitId);
  const postEvent = usePostUnitEvent(unitId);
  const events = mapUnitEvents(eventsQuery.data);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    try {
      await postEvent.mutateAsync(text);
      setDraft("");
    } catch {
      /* shown via disabled state */
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
      <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-3 py-2">
        <MessageSquare size={12} className="text-stone-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
          Feedback
        </span>
      </div>
      <div className="max-h-[220px] space-y-2 overflow-y-auto p-3">
        {eventsQuery.isLoading && (
          <p className="text-[12px] text-stone-400">Loading thread…</p>
        )}
        {events.length === 0 && !eventsQuery.isLoading && (
          <p className="text-[12px] italic text-stone-400">
            Reviewer notes from admin land here.
          </p>
        )}
        {events.map((event) => (
          <div key={event.id || `${event.type}-${event.createdAt}`} className="min-w-0">
            <p className="text-[11px] font-semibold text-stone-800">
              {event.actor || event.type || "Update"}
              {event.createdAt ? (
                <span
                  className="ml-1.5 font-medium text-stone-400"
                  title={formatCommentTimeFull(event.createdAt) || undefined}
                >
                  {formatCommentTime(event.createdAt)}
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-stone-700">
              {event.message || event.text || String(event.type || "").replace(/_/g, " ")}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-2 border-t border-stone-100 p-2.5">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Reply to the reviewer…"
          className="min-h-[44px] flex-1 resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-[12.5px] text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-400"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim() || postEvent.isPending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white disabled:opacity-35"
        >
          {postEvent.isPending ? <Loader2 size={14} className="animate-spin" /> : <SendHorizontal size={15} />}
        </button>
      </div>
    </div>
  );
}

function UnitCard({ briefId, unit, typeLabel, platform }) {
  const inputRef = useRef(null);
  const brollRef = useRef(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const setContent = useSetUnitContent(briefId);
  const setBrolls = useSetUnitBrolls(briefId);
  const submit = useSubmitUnit(briefId);
  const accept = useAcceptEdit(briefId);
  const unitId = unit.partnerUnitId || unit.deliverableUnitId || unit.id;
  const urls = unit.contentAssetUrls || unit.editorAssetUrls || [];
  const brolls = unit.brollAssetUrls || [];
  const preview = urls[0] || brolls[0];
  const canSubmit = Boolean(unitId) && urls.length > 0;
  const awaitingEdit = String(unit.editorStatus || "").toLowerCase() === "submitted";

  const uploadKind = async (files, kind) => {
    const list = [...files].filter(Boolean);
    if (!list.length || !unitId) return;
    setError("");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of list) {
        const media = detectMediaKind(file);
        const model = media === "video" ? "content_video" : "content_image";
        const next = await uploadFilesToLibrary([file], model);
        uploaded.push(...next);
      }
      if (kind === "broll") await setBrolls.mutateAsync({ unitId, urls: uploaded });
      else await setContent.mutateAsync({ unitId, urls: uploaded });
    } catch (err) {
      setError(formatError(err) || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const submitCut = async () => {
    setError("");
    try {
      await submit.mutateAsync(unitId);
    } catch (err) {
      setError(formatError(err) || "Couldn't submit this cut.");
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03]">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
            Unit {unit.unitNumber ?? ""} {platform ? `· ${platform}` : ""}
          </p>
          <p className="text-[13px] font-semibold text-stone-800">
            {typeLabel || deliverableLabel(unit.type)}
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-stone-600">
          {statusLabel(unit.status)}
        </span>
      </div>
      <div className="space-y-3 p-3.5">
        {preview ? (
          <div className="overflow-hidden rounded-xl bg-stone-950">
            {isVideoUrl(preview) ? (
              <video src={preview} controls className="mx-auto max-h-[280px] w-full object-contain" />
            ) : (
              <img src={preview} alt="" className="mx-auto max-h-[280px] w-full object-contain" />
            )}
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            uploadKind(e.target.files, "content");
            e.target.value = "";
          }}
        />
        <input
          ref={brollRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            uploadKind(e.target.files, "broll");
            e.target.value = "";
          }}
        />

        <button
          type="button"
          disabled={uploading || !unitId}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-center hover:border-stone-400 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin text-stone-500" />
          ) : (
            <Upload size={16} className="text-stone-500" />
          )}
          <p className="mt-2 text-[12px] font-semibold text-stone-700">
            {urls.length ? "Replace cut" : "Drop the cut or browse"}
          </p>
          <p className="mt-0.5 text-[11px] text-stone-400">
            Submitting sends this unit into admin Review Pipeline (Ads).
          </p>
        </button>

        {unit.requiresBroll ? (
          <button
            type="button"
            disabled={uploading || !unitId}
            onClick={() => brollRef.current?.click()}
            className="w-full rounded-full border border-stone-200 px-3 py-1.5 text-[12px] font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
          >
            {brolls.length ? `B-roll (${brolls.length}) — add more` : "Upload B-roll"}
          </button>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canSubmit || submit.isPending}
            onClick={submitCut}
            className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-stone-800 disabled:opacity-40"
          >
            {submit.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            Submit for review
          </button>
          {awaitingEdit ? (
            <button
              type="button"
              disabled={accept.isPending}
              onClick={() => accept.mutate(unitId)}
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-[12px] font-semibold text-violet-800"
            >
              Accept edit
            </button>
          ) : null}
        </div>
        {error ? <p className="text-[12px] text-rose-600">{error}</p> : null}
        {unit.lastDecisionNote ? (
          <p className="text-[12px] text-stone-600">
            Last note: {unit.lastDecisionNote}
          </p>
        ) : null}
        {unitId ? <UnitThread unitId={unitId} /> : null}
      </div>
    </section>
  );
}

export default function EditorBriefWorkspace({ brief, onBack }) {
  const [tab, setTab] = useState("units");
  const briefId = String(brief.uuid || brief.id);
  const unitsQuery = useGetBriefUnits(briefId);
  const packed = useMemo(() => mapBriefUnits(unitsQuery.data), [unitsQuery.data]);
  const missingUnits =
    unitsQuery.isError ||
    (!unitsQuery.isLoading && packed.deliverables.length === 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-[#F9F8F6] text-stone-800 shadow-2xl">
      <header className="shrink-0 space-y-3 border-b border-stone-200/80 bg-white/90 px-5 pt-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-stone-500 hover:bg-stone-100"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
              {brief.campaign} · Editor brief
            </p>
            <h2 className="text-[18px] font-semibold tracking-tight text-stone-900">
              {brief.title}
            </h2>
            <p className="mt-1 text-[12px] text-stone-500">
              Produce the units below. Reviewers decide on admin Review Pipeline — Ads lane.
              {brief.dueDate ? ` Due ${brief.dueDate}.` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-0.5" role="tablist" aria-label="Brief sections">
          {[
            { id: "units", label: "Units" },
            { id: "brief", label: "Brief" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`-mb-px border-b-2 px-3 pb-2.5 text-[12px] font-semibold ${
                tab === item.id
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {tab === "brief" ? (
          <AdminBriefPanel brief={brief} idPrefix="editor-brief" />
        ) : unitsQuery.isLoading ? (
          <p className="flex items-center gap-2 text-[12px] text-stone-400">
            <Loader2 size={12} className="animate-spin" /> Loading units…
          </p>
        ) : missingUnits ? (
          <p className="text-[13px] leading-relaxed text-stone-500">
            This brief is assigned to you. Units will show here once admin has published
            deliverables on the brief. You can still read the brief on the Brief tab.
          </p>
        ) : (
          <div className="space-y-4">
            {packed.deliverables.map((deliverable) =>
              (deliverable.units || []).map((unit) => (
                <UnitCard
                  key={unit.partnerUnitId || unit.deliverableUnitId || unit.unitNumber}
                  briefId={briefId}
                  unit={unit}
                  typeLabel={deliverable.typeLabel || deliverable.label}
                  platform={deliverable.platform}
                />
              )),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
