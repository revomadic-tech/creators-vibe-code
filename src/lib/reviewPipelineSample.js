import { currentUser, findWorkspaceUser } from "../data/mockData";

export const SAMPLE_PIPELINE_ID = "sample:review-pipeline";
const STORAGE_KEY = "revo.reviewPipeline.sample.v1";
const EVENT = "revo-sample-pipeline";

const FACE = (id) => `https://i.pravatar.cc/150?img=${id}`;

function editorOf(item) {
  const name = item?.editors?.[0] || "Aisha Patel";
  return findWorkspaceUser(name) || {
    name,
    role: "Video Editor",
    avatar: FACE(25),
  };
}

const SEED_EVENTS = [
  {
    id: "ev-1",
    kind: "submitted",
    actor: "Aisha Patel",
    role: "Editor",
    text: "First cut uploaded for review.",
    time: "Mon 9:14",
  },
  {
    id: "ev-2",
    kind: "revision_requested",
    actor: "Kai Montero",
    role: "Manager",
    text: "Hook is too slow — open on the device, not the VO.",
    time: "Mon 11:02",
  },
  {
    id: "ev-3",
    kind: "resubmitted",
    actor: "Aisha Patel",
    role: "Editor",
    text: "v2 — cold open on Sculptor, VO starts at 1.2s.",
    time: "Tue 8:40",
  },
];

const SEED_MESSAGES = [
  {
    id: "msg-1",
    from: "editor",
    name: "Aisha Patel",
    avatar: FACE(25),
    body: "v2 is in. Hook now opens on the device before VO.",
    time: "Tue 8:41",
  },
  {
    id: "msg-2",
    from: "manager",
    name: "Kai Montero",
    avatar: FACE(12),
    body: "Better. Punch the caption at 0:03 and hold the end card 1s longer.",
    time: "Tue 10:18",
  },
  {
    id: "msg-3",
    from: "editor",
    name: "Aisha Patel",
    avatar: FACE(25),
    body: "On it — I'll drop v3 here when captions are locked.",
    time: "Tue 10:22",
  },
];

const EDITOR_REPLIES = [
  "Posted v3 — captions punch at 0:03 and the end card holds 1s longer.",
  "Got it. I'll keep the VO under the first beat.",
  "Locked. Ready when you are.",
];

function emptyState(item) {
  return {
    assetStatus: "pending_approval",
    reviewStatus: "needs_review",
    events: SEED_EVENTS,
    messages: SEED_MESSAGES,
    replyIndex: 0,
    title: `${item?.name || "#1287"} · sample cut`,
  };
}

function readAll() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

export function loadSamplePipeline(taskId, item) {
  const all = readAll();
  const saved = all[String(taskId)];
  if (saved && typeof saved === "object") {
    return {
      ...emptyState(item),
      ...saved,
      events: Array.isArray(saved.events) ? saved.events : SEED_EVENTS,
      messages: Array.isArray(saved.messages) ? saved.messages : SEED_MESSAGES,
    };
  }
  return emptyState(item);
}

export function saveSamplePipeline(taskId, data) {
  try {
    const all = readAll();
    all[String(taskId)] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { taskId } }));
}

export function subscribeSamplePipeline(onChange) {
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getSamplePipelineAsset(item) {
  const state = loadSamplePipeline(item?.id, item);
  const editor = editorOf(item);
  return {
    id: SAMPLE_PIPELINE_ID,
    title: state.title,
    thumbnail: "https://picsum.photos/seed/revo-sculptor-sample/720/1280",
    type: "Video",
    videoUrl: null,
    status: "Pending Approval",
    assetStatus: state.assetStatus,
    reviewStatus: state.reviewStatus,
    editor: editor.name,
    editorAvatar: editor.avatar,
    editorNeeded: state.assetStatus === "ready_for_editors",
    sampleSimulation: true,
  };
}

export function isSamplePipelineAsset(asset) {
  return Boolean(
    asset?.sampleSimulation || String(asset?.id || "").startsWith("sample:"),
  );
}

function stamp() {
  return "Just now";
}

export function appendSampleMessage(taskId, item, message) {
  const state = loadSamplePipeline(taskId, item);
  const next = {
    ...state,
    messages: [...state.messages, message],
  };
  saveSamplePipeline(taskId, next);
  return next;
}

export function applySampleDecision(taskId, item, kind, actor, note) {
  const state = loadSamplePipeline(taskId, item);
  const labels = {
    approve: { status: "approved", review: "approved", event: "approved", text: "Content approved." },
    revise: {
      status: "needs_creator_revisions",
      review: "needs_review",
      event: "revision_requested",
      text: note || "Revisions requested.",
    },
    send_to_editor: {
      status: "ready_for_editors",
      review: "needs_review",
      event: "sent_to_editor",
      text: note || "Sent to editor.",
    },
    deny: {
      status: "needs_creator_revisions",
      review: "rejected",
      event: "denied",
      text: note || "Submission denied.",
    },
  };
  const meta = labels[kind];
  const event = {
    id: `ev-${Date.now()}`,
    kind: meta.event,
    actor: actor.name,
    role: actor.accountType || actor.role || "Manager",
    text: meta.text,
    time: stamp(),
  };
  const next = {
    ...state,
    assetStatus: meta.status,
    reviewStatus: meta.review,
    events: [...state.events, event],
  };
  if (note) {
    next.messages = [
      ...next.messages,
      {
        id: `msg-${Date.now()}`,
        from: "manager",
        name: actor.name,
        avatar: actor.avatar,
        body: note,
        time: stamp(),
      },
    ];
  }
  saveSamplePipeline(taskId, next);
  return next;
}

export function simulateEditorReply(taskId, item) {
  const state = loadSamplePipeline(taskId, item);
  const editor = editorOf(item);
  const body = EDITOR_REPLIES[state.replyIndex % EDITOR_REPLIES.length];
  const message = {
    id: `msg-${Date.now()}`,
    from: "editor",
    name: editor.name,
    avatar: editor.avatar,
    body,
    time: stamp(),
  };
  const next = {
    ...state,
    replyIndex: (state.replyIndex || 0) + 1,
    messages: [...state.messages, message],
  };
  saveSamplePipeline(taskId, next);
  return next;
}

export function sampleViewer(authUser, accountType) {
  const name = authUser?.name || currentUser.name;
  const member = findWorkspaceUser(name) || currentUser;
  return {
    ...member,
    name: member.name || name,
    accountType,
  };
}
