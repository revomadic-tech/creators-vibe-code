import adProductionSeed from "./adProduction.seed.json";

export const AD_PHASES = [
  { id: "topics", title: "Video Editing Phase", color: "#14b8a6" },
  { id: "group_mm015fvq", title: "Image Design Editing Phase", color: "#8b5cf6" },
  { id: "new_group13518__1", title: "To Be Launched", color: "#3b82f6" },
  { id: "new_group__1", title: "Tested Ads", color: "#22c55e" },
  { id: "group_title", title: "Acting/Strategy Phase", color: "#f26b3a" },
  { id: "new_group37431__1", title: "On Hold", color: "#ec4899" },
  { id: "group_mkvy4v4p", title: "Ready To Whitelist", color: "#6366f1" },
  { id: "group_mkpsxatg", title: "Review Stage", color: "#f59e0b" },
  { id: "group_mm0fzy6j", title: "Applovin To Be Launched", color: "#0ea5e9" },
  { id: "group_mm54mrkz", title: "Applovin Launched", color: "#06b6d4" },
];

// Full column set — every field the local monday.com snapshot carries is a
// real column, visible by default. Hide/reorder via the Columns picker.
export const AD_BOARD_COLUMNS = [
  { id: "item", label: "Item", width: 220, minWidth: 160, pinned: true, hideable: false },
  { id: "status", label: "Status", width: 128, minWidth: 96 },
  { id: "product", label: "Product", width: 72, minWidth: 56 },
  { id: "priority", label: "Priority", width: 96, minWidth: 80 },
  { id: "editor", label: "Editor", width: 64, minWidth: 52 },
  { id: "angle", label: "Angle", width: 108, minWidth: 84 },
  { id: "due", label: "Due", width: 72, minWidth: 64 },
  { id: "style", label: "Style", width: 108, minWidth: 84 },
  { id: "platform", label: "Platform", width: 76, minWidth: 60 },
  { id: "painPoint", label: "Pain Point", width: 112, minWidth: 88 },
  { id: "strategist", label: "Strategist", width: 64, minWidth: 52 },
  { id: "sendDate", label: "Send Date", width: 80, minWidth: 68 },
  { id: "performance", label: "Performance", width: 104, minWidth: 84 },
  { id: "summary", label: "Summary", width: 80, minWidth: 64 },
  { id: "adCopy", label: "Ad Copy", width: 180, minWidth: 112 },
];

// Label→color maps mirrored from the live monday.com board's dropdowns.
export const AD_STATUS_COLORS = {
  Draft: "#c4c4c4",
  "Strategy In Progress": "#9d50dd",
  "On Hold": "#ff5ac4",
  Stuck: "#bb3354",
  "Needs Re-writing": "#579bfc",
  "Acting In Progress": "#ff007f",
  "Ready For Editing": "#007eb5",
  "In Editing": "#ff7575",
  "Ready For Review": "#9cd326",
  "Narek Reviewing": "#fdab3d",
  "Revisions Needed": "#ff6d3b",
  "Ready For Second Review": "#563e3e",
  "Final Revisions Needed": "#cd9282",
  "Finals Complete": "#4eccc6",
  Approved: "#00c875",
  "Final Review": "#ffadad",
  "Ready For Launch": "#037f4c",
  Launched: "#175a63",
  "Ready For Re-Launch": "#216edf",
  "Danilo Review": "#784bd1",
  "Design in progress": "#757575",
  done: "#faa1f1",
  "Ready To Whitelist": "#a9bee8",
  "Needs Creator": "#7e3b8a",
  "Ready for outreach": "#df2f4a",
  Outreached: "#225091",
  "Needs Alternate Creator": "#74afcc",
  "create variants": "#401694",
  "Reviewing - Vlad": "#bda8f9",
  "John Review": "#a1e3f6",
  cancelled: "#7f5347",
  "Applovin Ready": "#333333",
  REQUESTED: "#9aadbd",
  "REQUEST ASAP": "#e484bd",
  "SHOOT REQUESTED": "#9d99b9",
  "Applovin Launched": "#66ccff",
  "Design review": "#5559df",
};

export const AD_PRIORITY_COLORS = {
  "Critical ⚠️️": "#333333",
  High: "#401694",
  Medium: "#5559df",
  Low: "#579bfc",
};

export const AD_PRODUCT_COLORS = {
  "Cellulite Kit": "#fdab3d",
  "Walking Pad": "#00c875",
  "Relief Bundle": "#df2f4a",
  "Cupper Mixed": "#ff6d3b",
  "Face Genie & Collagen Jelly": "#ff5ac4",
  Mixed: "#9d50dd",
  "Standalone PDP": "#037f4c",
  WAVE: "#cab641",
  Sculptor: "#ffcb00",
  "Collagen Jelly": "#333333",
  "Face Genie Only": "#bb3354",
};

export const AD_EDITING_STYLE_COLORS = {
  "AI Voiceover": "#9cd326",
  UGC: "#7e3b8a",
  "No Voiceover": "#66ccff",
  Animation: "#fdab3d",
  "Image Illustration": "#00c875",
  Branded: "#df2f4a",
  "AI Ugc": "#9d50dd",
  EXPERT: "#037f4c",
  Mashup: "#579bfc",
  "Slide Show": "#cab641",
  Organic: "#ffcb00",
  "Street Interview": "#333333",
  "AI REALISTIC": "#bb3354",
  MASHUP: "#ff007f",
  CAROUSEL: "#ff5ac4",
  CAI: "#784bd1",
  "AI Image": "#ffadad",
  "AI CARTOON": "#9d99b9",
};

export const AD_ANGLE_COLORS = {
  Educational: "#9aadbd",
  "Use Case": "#fdab3d",
  Humor: "#00c875",
  Reaction: "#df2f4a",
  Curiosity: "#007eb5",
  Story: "#9d50dd",
  ASMR: "#037f4c",
  "Big Promise": "#401694",
  Comparison: "#cd9282",
  Demonstration: "#ffcb00",
  OFFER: "#333333",
  "before and after": "#bb3354",
  Testimonial: "#ff5ac4",
  Podcast: "#784bd1",
  "Street Interview": "#9cd326",
  gifting: "#66ccff",
  Unboxing: "#757575",
  "X REASONS WHY": "#7f5347",
  Timeline: "#ff6d3b",
  Contrarian: "#ff7575",
  "score card": "#faa1f1",
  Native: "#ffadad",
  Trend: "#7e3b8a",
  tagline: "#74afcc",
  "Alternative Cardio": "#225091",
};

export const AD_PAIN_POINT_COLORS = {
  Neck: "#00c875",
  "Foot Pain": "#fdab3d",
  "Back Pain": "#bda8f9",
  "Glass Skin": "#007eb5",
  "Dark Spots": "#9d50dd",
  Tension: "#037f4c",
  "Muscle Pain": "#579bfc",
  Wrinkles: "#cab641",
  Jawline: "#ffcb00",
  Shoulder: "#333333",
  Knots: "#bb3354",
  "Other Skicares are inneffective": "#ff007f",
  Sciatica: "#cd9282",
  "Weight Loss": "#ff5ac4",
  "Smoother and Brighter Skin": "#784bd1",
  "Natural Lift": "#9cd326",
  Puffiness: "#66ccff",
  "New and Innovative": "#757575",
  recovery: "#7f5347",
  Acne: "#ff6d3b",
  "different pain points": "#ff7575",
  Legs: "#faa1f1",
  "age related pain": "#ffadad",
  Offer: "#7e3b8a",
  "Ineffective Routine": "#9aadbd",
  Posture: "#74afcc",
  "crows feet": "#225091",
  "Sensitive Skin": "#4eccc6",
  Sleep: "#5559df",
  Recovery: "#401694",
  cellulite: "#563e3e",
  Validation: "#175a63",
  Identity: "#216edf",
  Prevention: "#a9bee8",
  Time: "#e484bd",
  "dark spots": "#9d99b9",
  Cost: "#bca58a",
  Absorption: "#a1e3f6",
  Knee: "#df2f4a",
};

export const AD_PLATFORM_COLORS = {
  Meta: "#9aadbd",
  YouTube: "#007eb5",
  AppLovin: "#9d99b9",
  Google: "#fdab3d",
  "Meta/AppLovin": "#00c875",
  "Meta/Google": "#df2f4a",
  "AppLovin/Meta": "#9d50dd",
  Vibe: "#037f4c",
};

export const AD_PERFORMANCE_COLORS = {
  "N/A": "#c4c4c4",
  Winner: "#037f4c",
};

export const AD_STATUS_OPTIONS = Object.keys(AD_STATUS_COLORS);
export const AD_PRIORITY_OPTIONS = Object.keys(AD_PRIORITY_COLORS);
export const AD_PRODUCT_OPTIONS = Object.keys(AD_PRODUCT_COLORS);
export const AD_EDITING_STYLE_OPTIONS = Object.keys(AD_EDITING_STYLE_COLORS);
export const AD_ANGLE_OPTIONS = Object.keys(AD_ANGLE_COLORS);
export const AD_PAIN_POINT_OPTIONS = Object.keys(AD_PAIN_POINT_COLORS);
export const AD_PLATFORM_OPTIONS = Object.keys(AD_PLATFORM_COLORS);
export const AD_PERFORMANCE_OPTIONS = Object.keys(AD_PERFORMANCE_COLORS);

export { adProductionSeed };

export const BOARD_LAYOUT_KEY = "revo.commandCenter.boardLayout.v1";

const PHASE_IDS = new Set(AD_PHASES.map((p) => p.id));

export const PATCHABLE_FIELDS = [
  "status",
  "product",
  "priority",
  "editingStyle",
  "angle",
  "painPoint",
  "platform",
  "editors",
  "creativeStrategists",
  "dueDate",
  "sendDate",
  "summary",
  "adCopy",
  "performance",
  "name",
  "contentIds",
];

function valuesEqual(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function applyPatch(item, patch) {
  if (!patch || typeof patch !== "object") return item;
  const next = { ...item };
  let changed = false;
  for (const key of PATCHABLE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
    if (valuesEqual(item[key], patch[key])) continue;
    next[key] = patch[key];
    changed = true;
  }
  return changed ? next : item;
}

/** Resolve a board item by monday id, `#1683`, or `1683`. */
export function findAdTask(ref, list = adProductionSeed) {
  if (ref == null || ref === "") return null;
  const raw = String(ref).trim();
  const byId = list.find((item) => item.id === raw);
  if (byId) return byId;
  const name = raw.startsWith("#") ? raw : `#${raw.replace(/^#/, "")}`;
  return list.find((item) => item.name === name) || null;
}

export function loadBoardItems() {
  const seed = adProductionSeed.map((item) => ({ ...item }));
  try {
    const saved = JSON.parse(localStorage.getItem(BOARD_LAYOUT_KEY) || "null");
    if (!saved || typeof saved !== "object") return seed;
    const phases = saved.phases && typeof saved.phases === "object" ? saved.phases : {};
    const patches = saved.patches && typeof saved.patches === "object" ? saved.patches : {};
    const byId = Object.fromEntries(
      seed.map((item) => {
        const patched = applyPatch(item, patches[item.id]);
        const phase = phases[item.id];
        return [item.id, phase && PHASE_IDS.has(phase) ? { ...patched, phase } : patched];
      }),
    );
    const next = [];
    const seen = new Set();
    for (const id of Array.isArray(saved.order) ? saved.order : []) {
      if (byId[id] && !seen.has(id)) {
        next.push(byId[id]);
        seen.add(id);
      }
    }
    for (const item of seed) {
      if (!seen.has(item.id)) next.push(byId[item.id]);
    }
    return next;
  } catch {
    return seed;
  }
}

export function persistBoardItems(items) {
  try {
    const seedById = Object.fromEntries(adProductionSeed.map((item) => [item.id, item]));
    const patches = {};
    for (const item of items) {
      const seed = seedById[item.id];
      if (!seed) continue;
      const patch = {};
      for (const key of PATCHABLE_FIELDS) {
        if (!valuesEqual(item[key], seed[key])) patch[key] = item[key] ?? null;
      }
      if (Object.keys(patch).length) patches[item.id] = patch;
    }
    localStorage.setItem(
      BOARD_LAYOUT_KEY,
      JSON.stringify({
        phases: Object.fromEntries(items.map((item) => [item.id, item.phase])),
        order: items.map((item) => item.id),
        patches,
      }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

/** Patch task fields. Phase changes go through `moveBoardTask` so order stays intact. */
export function updateBoardTask(items, taskId, patch) {
  const idx = items.findIndex((item) => item.id === taskId);
  if (idx < 0) return items;
  const nextItem = applyPatch(items[idx], patch);
  if (nextItem === items[idx]) return items;
  const next = items.slice();
  next[idx] = nextItem;
  return next;
}

export function parseTaskDrag(data) {
  const raw = String(data || "");
  return raw.startsWith("task:") ? raw.slice(5) : null;
}

/** Move a task into a phase, optionally inserting before another item.
 *  `beforeId` undefined = drop on section (no-op if already there, else append).
 *  `beforeId` null = append to the section.
 *  `beforeId` string = insert before that item.
 */
export function moveBoardTask(items, taskId, toPhase, beforeId) {
  if (!PHASE_IDS.has(toPhase)) return items;
  const from = items.find((item) => item.id === taskId);
  if (!from) return items;

  const samePhase = from.phase === toPhase;
  if (samePhase && beforeId === undefined) return items;
  if (samePhase && beforeId === taskId) return items;

  if (samePhase && (beforeId === null || beforeId === undefined)) {
    const group = items.filter((item) => item.phase === toPhase);
    if (group[group.length - 1]?.id === taskId) return items;
  }

  const without = items.filter((item) => item.id !== taskId);
  const moved = { ...from, phase: toPhase };
  if (typeof beforeId === "string" && beforeId && beforeId !== taskId) {
    const idx = without.findIndex((item) => item.id === beforeId);
    if (idx >= 0) {
      without.splice(idx, 0, moved);
      return without;
    }
  }
  let insertAt = without.length;
  for (let i = without.length - 1; i >= 0; i -= 1) {
    if (without[i].phase === toPhase) {
      insertAt = i + 1;
      break;
    }
  }
  without.splice(insertAt, 0, moved);
  return without;
}
