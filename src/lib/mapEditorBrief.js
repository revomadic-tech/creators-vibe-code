import { unwrapEnvelope, unwrapEnvelopeList } from "./unwrapEnvelope";

const DELIVERABLE_LABELS = {
  "ugc-video": "UGC Video",
  "ugc-image": "UGC Image",
  "ig-reel": "Instagram Reel",
  "ig-post": "Instagram Post",
  "ig-story": "Instagram Story Set",
  "ig-carousel": "Instagram Carousel",
  tiktok: "TikTok Video",
  "yt-short": "YouTube Short",
  "yt-long": "YouTube Long-Form",
};

export function deliverableLabel(type) {
  return DELIVERABLE_LABELS[type] || type || "Cut";
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  return [value];
}

function dateLabel(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Normalize GET /briefs row or GET /briefs/:id into the AdminBriefPanel + list-card shape. */
export function mapEditorBrief(raw) {
  if (!raw || typeof raw !== "object") return null;
  const creative = raw.creativeBrief || {};
  const uuid = raw.uuid || raw.id;
  if (uuid == null) return null;

  const products = asArray(raw.products).map((p) =>
    typeof p === "string"
      ? { id: p, title: p, thumbnail: "" }
      : {
          id: p.id,
          title: p.title || p.name,
          thumbnail: p.thumbnail || "",
        },
  );

  const deliverables = asArray(raw.deliverables).map((d) =>
    typeof d === "string"
      ? { platform: "", type: d, quantity: 1 }
      : {
          platform: d.platform,
          type: d.type,
          quantity: d.quantity ?? 1,
        },
  );

  const platforms = [
    ...new Set(
      [
        ...asArray(raw.platforms),
        ...deliverables.map((d) => d.platform).filter(Boolean),
      ].map(String),
    ),
  ];

  return {
    id: uuid,
    numericId: raw.id,
    uuid: String(uuid),
    title: raw.title || raw.brief_name || "Untitled brief",
    status: raw.status || "active",
    briefType: raw.briefType === "partner" ? "partner" : "editor",
    campaign: raw.campaign?.title || raw.campaign || raw.brand || "Ad Production",
    stakeholder: raw.stakeholder?.name || raw.stakeholder || "",
    reviewer: raw.reviewer?.name || raw.reviewer || "",
    artDirector: raw.artDirector || "",
    startDate: dateLabel(raw.startDate),
    dueDate: dateLabel(raw.dueDate || raw.deadline),
    thumbnail: raw.thumbnail || raw.image || "",
    products,
    platforms,
    aspectRatios: asArray(creative.aspectRatios || raw.aspectRatios),
    deliverables,
    attachments: asArray(raw.attachments || raw.pdf).filter(Boolean),
    videoEditorIds: asArray(raw.videoEditorIds).map(Number).filter(Boolean),
    creativeBrief: {
      category: creative.category || "ugc",
      gender: creative.gender || "",
      ageRange: creative.ageRange || "",
      dos: asArray(creative.dos || raw.do),
      donts: asArray(creative.donts || raw.dont),
      cameraAngles: asArray(creative.cameraAngles),
      settings: asArray(creative.settings),
      toneOfVoice: asArray(creative.toneOfVoice || raw.tone_of_voice),
      demoMoments: creative.demoMoments || "",
      requestedBRoll: asArray(creative.requestedBRoll),
      hooks: asArray(creative.hooks),
      inspirationUrls: asArray(creative.inspirationUrls || raw.inspiration_urls),
      driveFiles: creative.driveFiles || "",
      canvaPresentation: creative.canvaPresentation || "",
      tags: asArray(creative.tags),
      body: creative.body || raw.body || raw.description || "",
      visualDirection: creative.visualDirection || raw.visual_direction || "",
      creativeDirection: creative.creativeDirection || raw.creative_direction || "",
    },
  };
}

export function mapEditorBriefList(resp) {
  return unwrapEnvelopeList(resp).map(mapEditorBrief).filter(Boolean);
}

export function mapEditorBriefDetail(resp) {
  return mapEditorBrief(unwrapEnvelope(resp));
}

export function isAssignedEditor(brief, user) {
  if (!brief) return false;
  const ids = (brief.videoEditorIds || []).map(Number).filter(Boolean);
  // Empty ids: the list endpoint already scoped to this editor.
  if (ids.length === 0) return true;
  if (!user) return true;
  const uid = Number(user.id || user.userId);
  if (!Number.isFinite(uid)) return true;
  return ids.includes(uid);
}

export function mapBriefUnits(resp) {
  const data = unwrapEnvelope(resp) || {};
  return {
    briefPartnerStatus: data.briefPartnerStatus || data.status || "",
    deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
  };
}

export function mapUnitEvents(resp) {
  const data = unwrapEnvelope(resp);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.events)) return data.events;
  return [];
}
