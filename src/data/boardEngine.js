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
  "createdBy",
  "type",
  "link",
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

function nextLocalTaskId() {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Stable id for draft ownership — prefers auth id, then email, then name. */
export function boardActorId(user) {
  if (!user || typeof user !== "object") return "";
  const raw = user.id ?? user._id ?? user.email ?? user.name;
  return raw == null || raw === "" ? "" : String(raw);
}

/** Drafts are private to `createdBy`. Non-drafts are visible to everyone. */
export function isDraftVisibleTo(item, actorId) {
  if (!item || item.status !== "Draft") return true;
  const owner =
    item.createdBy == null || item.createdBy === "" ? "" : String(item.createdBy);
  const me = actorId == null || actorId === "" ? "" : String(actorId);
  if (!owner) return Boolean(me);
  return Boolean(me) && owner === me;
}

export function visibleBoardItems(items, actorId) {
  return (items || []).filter((item) => isDraftVisibleTo(item, actorId));
}

/** Stamp legacy local drafts so they stay with the signed-in user. */
export function claimUnownedDrafts(items, actorId) {
  if (!actorId) return items;
  let changed = false;
  const next = (items || []).map((item) => {
    if (item.status !== "Draft") return item;
    if (item.createdBy != null && String(item.createdBy) !== "") return item;
    changed = true;
    return { ...item, createdBy: actorId };
  });
  return changed ? next : items;
}

export function parseTaskDrag(data) {
  const raw = String(data || "");
  return raw.startsWith("task:") ? raw.slice(5) : null;
}

/** Resolve a board item by monday id, `#1683`, or `1683`. */
export function findBoardItem(ref, list = []) {
  if (ref == null || ref === "") return null;
  const raw = String(ref).trim();
  const byId = list.find((item) => item.id === raw);
  if (byId) return byId;
  const name = raw.startsWith("#") ? raw : `#${raw.replace(/^#/, "")}`;
  return list.find((item) => item.name === name) || null;
}

export function createBoardEngine({
  phases,
  seed,
  storageKey,
  boardId,
  extraBlank = {},
}) {
  const phaseList = phases || [];
  const seedRows = Array.isArray(seed) ? seed : [];
  const PHASE_IDS = new Set(phaseList.map((p) => p.id));
  const defaultPhase = phaseList[0]?.id || null;

  function withPhase(item, phaseMap) {
    const phase = phaseMap?.[item.id];
    return phase && PHASE_IDS.has(phase) ? { ...item, phase } : item;
  }

  function blankBoardTask(phase, items = [], fields = {}) {
    const nextPhase = PHASE_IDS.has(phase) ? phase : defaultPhase;
    const hasName = Object.prototype.hasOwnProperty.call(fields, "name");
    return {
      id: fields.id || nextLocalTaskId(),
      name: hasName ? String(fields.name ?? "") : "",
      phase: nextPhase,
      boardId,
      status: fields.status ?? "Draft",
      product: fields.product ?? null,
      priority: fields.priority ?? null,
      editingStyle: fields.editingStyle ?? null,
      angle: fields.angle ?? null,
      painPoint: fields.painPoint ?? null,
      platform: fields.platform ?? null,
      editors: Array.isArray(fields.editors) ? fields.editors : [],
      creativeStrategists: Array.isArray(fields.creativeStrategists)
        ? fields.creativeStrategists
        : [],
      dueDate: fields.dueDate ?? null,
      sendDate: fields.sendDate ?? null,
      summary: fields.summary ?? null,
      adCopy: fields.adCopy ?? null,
      performance: fields.performance ?? null,
      type: fields.type ?? extraBlank.type ?? null,
      link: fields.link ?? extraBlank.link ?? null,
      contentIds: Array.isArray(fields.contentIds) ? fields.contentIds : [],
      createdBy:
        fields.createdBy == null || fields.createdBy === ""
          ? null
          : String(fields.createdBy),
    };
  }

  function normalizeCreatedItem(raw) {
    if (!raw || typeof raw !== "object" || raw.id == null || raw.id === "") return null;
    return blankBoardTask(raw.phase, [], { ...raw, id: String(raw.id) });
  }

  function serializeCreatedItem(item) {
    return blankBoardTask(item.phase, [], item);
  }

  function stampSeed(item) {
    return { ...item, boardId: item.boardId || boardId };
  }

  function loadBoardItems() {
    const seeded = seedRows.map((item) => stampSeed({ ...item }));
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!saved || typeof saved !== "object") return seeded;
      const phasesSaved =
        saved.phases && typeof saved.phases === "object" ? saved.phases : {};
      const patches =
        saved.patches && typeof saved.patches === "object" ? saved.patches : {};
      const created = (Array.isArray(saved.created) ? saved.created : [])
        .map(normalizeCreatedItem)
        .filter(Boolean);
      const byId = Object.fromEntries(
        seeded.map((item) => {
          let patched = applyPatch(item, patches[item.id]);
          if (item.sampleSimulation) {
            patched = { ...patched, sampleSimulation: true, contentIds: [] };
          }
          return [item.id, withPhase(patched, phasesSaved)];
        }),
      );
      for (const item of created) {
        if (byId[item.id]) continue;
        byId[item.id] = withPhase(item, phasesSaved);
      }
      const next = [];
      const seen = new Set();
      for (const id of Array.isArray(saved.order) ? saved.order : []) {
        if (byId[id] && !seen.has(id)) {
          next.push(byId[id]);
          seen.add(id);
        }
      }
      for (const item of seeded) {
        if (!seen.has(item.id)) next.push(byId[item.id]);
      }
      for (const item of created) {
        if (!seen.has(item.id) && byId[item.id]) next.push(byId[item.id]);
      }
      return next;
    } catch {
      return seeded;
    }
  }

  function persistBoardItems(items) {
    try {
      const seedById = Object.fromEntries(seedRows.map((item) => [item.id, item]));
      const patches = {};
      const created = [];
      for (const item of items) {
        const origin = seedById[item.id];
        if (!origin) {
          created.push(serializeCreatedItem(item));
          continue;
        }
        const patch = {};
        for (const key of PATCHABLE_FIELDS) {
          if (!valuesEqual(item[key], origin[key])) patch[key] = item[key] ?? null;
        }
        if (Object.keys(patch).length) patches[item.id] = patch;
      }
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          phases: Object.fromEntries(items.map((item) => [item.id, item.phase])),
          order: items.map((item) => item.id),
          patches,
          created,
        }),
      );
    } catch {
      /* ignore quota / private mode */
    }
  }

  function createBoardTask(items, phase, fields = {}) {
    if (!PHASE_IDS.has(phase)) return { items, item: null };
    const item = blankBoardTask(phase, items, fields);
    const next = items.slice();
    let insertAt = next.length;
    for (let i = next.length - 1; i >= 0; i -= 1) {
      if (next[i].phase === phase) {
        insertAt = i + 1;
        break;
      }
    }
    next.splice(insertAt, 0, item);
    return { items: next, item };
  }

  function updateBoardTask(items, taskId, patch) {
    const idx = items.findIndex((item) => item.id === taskId);
    if (idx < 0) return items;
    const nextItem = applyPatch(items[idx], patch);
    if (nextItem === items[idx]) return items;
    const next = items.slice();
    next[idx] = nextItem;
    return next;
  }

  function moveBoardTask(items, taskId, toPhase, beforeId) {
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

  function findAdTask(ref, list = seedRows) {
    return findBoardItem(ref, list);
  }

  return {
    PHASE_IDS,
    blankBoardTask,
    loadBoardItems,
    persistBoardItems,
    createBoardTask,
    updateBoardTask,
    moveBoardTask,
    findAdTask,
  };
}
