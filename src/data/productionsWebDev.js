import productionsWebDevSeed from "./productionsWebDev.seed.json";
import { createBoardEngine } from "./boardEngine";
import { BOARD_AD_PRODUCTION } from "./adProduction";

export const BOARD_PRODUCTIONS_WEB_DEV = "productions-web-dev";

export const WD_PHASES = [
  { id: "wd_incoming", title: "Incoming", color: "#c4c4c4" },
  { id: "wd_preprod", title: "Pre-Production", color: "#8b5cf6" },
  { id: "wd_onset", title: "On Set / In Production", color: "#df2f4a" },
  { id: "wd_post", title: "Post-Production", color: "#fdab3d" },
  { id: "wd_webdev", title: "Web Development", color: "#007eb5" },
  { id: "wd_review", title: "Review", color: "#9cd326" },
  { id: "wd_live", title: "Live / Shipped", color: "#00c875" },
  { id: "wd_hold", title: "On Hold", color: "#ff5ac4" },
];

export const WD_BOARD_COLUMNS = [
  { id: "item", label: "Item", width: 240, minWidth: 160, pinned: true, hideable: false },
  { id: "status", label: "Status", width: 128, minWidth: 96 },
  { id: "type", label: "Type", width: 108, minWidth: 84 },
  { id: "product", label: "Product", width: 72, minWidth: 56 },
  { id: "priority", label: "Priority", width: 96, minWidth: 80 },
  { id: "owner", label: "Owner", width: 64, minWidth: 52 },
  { id: "due", label: "Due", width: 72, minWidth: 64 },
  { id: "platform", label: "Channel", width: 76, minWidth: 60 },
  { id: "link", label: "Link", width: 72, minWidth: 56 },
  { id: "summary", label: "Notes", width: 200, minWidth: 120 },
];

export const WD_STATUS_COLORS = {
  Draft: "#c4c4c4",
  Requested: "#9aadbd",
  Briefing: "#9d50dd",
  "Pre-Production": "#8b5cf6",
  "On Set": "#df2f4a",
  "In Production": "#ff7575",
  "In Post": "#fdab3d",
  "In Development": "#007eb5",
  "In Progress": "#579bfc",
  Blocked: "#bb3354",
  "In Review": "#9cd326",
  QA: "#cab641",
  Staging: "#037f4c",
  Shipped: "#00c875",
  Live: "#175a63",
  "On Hold": "#ff5ac4",
  cancelled: "#7f5347",
};

export const WD_TYPE_COLORS = {
  Production: "#df2f4a",
  Video: "#9d50dd",
  Photo: "#fdab3d",
  "Landing Page": "#007eb5",
  PDP: "#00c875",
  Store: "#037f4c",
  Email: "#ff5ac4",
  App: "#401694",
  Web: "#579bfc",
};

export const WD_PLATFORM_COLORS = {
  Meta: "#9aadbd",
  YouTube: "#007eb5",
  AppLovin: "#9d99b9",
  Store: "#00c875",
  Email: "#ff5ac4",
  Create: "#401694",
  Partners: "#fdab3d",
};

export const WD_STATUS_OPTIONS = Object.keys(WD_STATUS_COLORS);
export const WD_TYPE_OPTIONS = Object.keys(WD_TYPE_COLORS);
export const WD_PLATFORM_OPTIONS = Object.keys(WD_PLATFORM_COLORS);

export const WD_CLOSED_STATUSES = new Set(["Shipped", "Live", "cancelled", "done"]);

export { productionsWebDevSeed };

export const WD_BOARD_LAYOUT_KEY = "revo.commandCenter.webDevLayout.v1";

const engine = createBoardEngine({
  phases: WD_PHASES,
  seed: productionsWebDevSeed,
  storageKey: WD_BOARD_LAYOUT_KEY,
  boardId: BOARD_PRODUCTIONS_WEB_DEV,
});

export const loadWebDevBoardItems = engine.loadBoardItems;
export const persistWebDevBoardItems = engine.persistBoardItems;
export const createWebDevBoardTask = engine.createBoardTask;
export const updateWebDevBoardTask = engine.updateBoardTask;
export const moveWebDevBoardTask = engine.moveBoardTask;
export const blankWebDevBoardTask = engine.blankBoardTask;

export function isWebDevPhase(phaseId) {
  return WD_PHASES.some((p) => p.id === phaseId);
}

export function isWebDevItem(item) {
  if (!item) return false;
  if (item.boardId === BOARD_PRODUCTIONS_WEB_DEV) return true;
  if (item.boardId === BOARD_AD_PRODUCTION) return false;
  return isWebDevPhase(item.phase);
}
