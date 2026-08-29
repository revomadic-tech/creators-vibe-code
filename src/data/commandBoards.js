import {
  AD_ANGLE_COLORS,
  AD_BOARD_COLUMNS,
  AD_EDITING_STYLE_COLORS,
  AD_PAIN_POINT_COLORS,
  AD_PERFORMANCE_COLORS,
  AD_PHASES,
  AD_PLATFORM_COLORS,
  AD_PRIORITY_COLORS,
  AD_PRODUCT_COLORS,
  AD_STATUS_COLORS,
  BOARD_AD_PRODUCTION,
  adProductionSeed,
  createBoardTask as createAdTask,
  loadBoardItems as loadAdItems,
  moveBoardTask as moveAdTask,
  persistBoardItems as persistAdItems,
  updateBoardTask as updateAdTask,
} from "./adProduction";
import {
  BOARD_PRODUCTIONS_WEB_DEV,
  WD_BOARD_COLUMNS,
  WD_CLOSED_STATUSES,
  WD_PHASES,
  WD_PLATFORM_COLORS,
  WD_STATUS_COLORS,
  WD_TYPE_COLORS,
  createWebDevBoardTask,
  isWebDevItem,
  isWebDevPhase,
  loadWebDevBoardItems,
  moveWebDevBoardTask,
  persistWebDevBoardItems,
  productionsWebDevSeed,
  updateWebDevBoardTask,
} from "./productionsWebDev";
import { findBoardItem } from "./boardEngine";

export { BOARD_AD_PRODUCTION, BOARD_PRODUCTIONS_WEB_DEV };

export const ACTIVE_BOARD_STORAGE_KEY = "revo.commandCenter.activeBoard.v1";

export const COMMAND_BOARDS = [
  {
    id: BOARD_AD_PRODUCTION,
    label: "Ad Production",
    noun: "ad",
    nounPlural: "Ads",
    phases: AD_PHASES,
    columns: AD_BOARD_COLUMNS,
    seed: adProductionSeed,
    columnStorageKey: "revo.commandCenter.boardColumns.v5",
    openGroupStorageKey: "revo.commandCenter.lastOpenGroup.v1",
    closedStatuses: new Set([
      "Approved",
      "Launched",
      "Applovin Launched",
      "done",
      "cancelled",
    ]),
    statusColors: AD_STATUS_COLORS,
    productColors: AD_PRODUCT_COLORS,
    priorityColors: AD_PRIORITY_COLORS,
    platformColors: AD_PLATFORM_COLORS,
    extraColors: {
      angle: AD_ANGLE_COLORS,
      style: AD_EDITING_STYLE_COLORS,
      painPoint: AD_PAIN_POINT_COLORS,
      performance: AD_PERFORMANCE_COLORS,
    },
  },
  {
    id: BOARD_PRODUCTIONS_WEB_DEV,
    label: "Productions & Web Dev",
    noun: "task",
    nounPlural: "Tasks",
    phases: WD_PHASES,
    columns: WD_BOARD_COLUMNS,
    seed: productionsWebDevSeed,
    columnStorageKey: "revo.commandCenter.webDevColumns.v1",
    openGroupStorageKey: "revo.commandCenter.webDev.lastOpenGroup.v1",
    closedStatuses: WD_CLOSED_STATUSES,
    statusColors: { ...AD_STATUS_COLORS, ...WD_STATUS_COLORS },
    productColors: AD_PRODUCT_COLORS,
    priorityColors: AD_PRIORITY_COLORS,
    platformColors: { ...AD_PLATFORM_COLORS, ...WD_PLATFORM_COLORS },
    extraColors: {
      type: WD_TYPE_COLORS,
    },
  },
];

export const COMMAND_BOARD_BY_ID = Object.fromEntries(
  COMMAND_BOARDS.map((board) => [board.id, board]),
);

export const ALL_PHASES = [...AD_PHASES, ...WD_PHASES];

export function getCommandBoard(id) {
  return COMMAND_BOARD_BY_ID[id] || COMMAND_BOARDS[0];
}

export function loadActiveBoardId() {
  try {
    const saved = localStorage.getItem(ACTIVE_BOARD_STORAGE_KEY);
    if (COMMAND_BOARD_BY_ID[saved]) return saved;
  } catch {
    /* ignore */
  }
  return BOARD_AD_PRODUCTION;
}

export function persistActiveBoardId(id) {
  try {
    if (COMMAND_BOARD_BY_ID[id]) localStorage.setItem(ACTIVE_BOARD_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function boardIdForPhase(phaseId) {
  if (isWebDevPhase(phaseId)) return BOARD_PRODUCTIONS_WEB_DEV;
  return BOARD_AD_PRODUCTION;
}

export function boardIdForItem(item) {
  if (!item) return BOARD_AD_PRODUCTION;
  if (item.boardId && COMMAND_BOARD_BY_ID[item.boardId]) return item.boardId;
  return boardIdForPhase(item.phase);
}

export function loadAllBoardItems() {
  return {
    [BOARD_AD_PRODUCTION]: loadAdItems(),
    [BOARD_PRODUCTIONS_WEB_DEV]: loadWebDevBoardItems(),
  };
}

export function persistBoardById(boardId, items) {
  if (boardId === BOARD_PRODUCTIONS_WEB_DEV) persistWebDevBoardItems(items);
  else persistAdItems(items);
}

export function createTaskOnBoard(boardId, items, phase, fields = {}) {
  if (boardId === BOARD_PRODUCTIONS_WEB_DEV) {
    return createWebDevBoardTask(items, phase, fields);
  }
  return createAdTask(items, phase, fields);
}

export function updateTaskOnBoard(boardId, items, taskId, patch) {
  if (boardId === BOARD_PRODUCTIONS_WEB_DEV) {
    return updateWebDevBoardTask(items, taskId, patch);
  }
  return updateAdTask(items, taskId, patch);
}

export function moveTaskOnBoard(boardId, items, taskId, toPhase, beforeId) {
  if (boardId === BOARD_PRODUCTIONS_WEB_DEV) {
    return moveWebDevBoardTask(items, taskId, toPhase, beforeId);
  }
  return moveAdTask(items, taskId, toPhase, beforeId);
}

export function findAcrossBoards(ref, itemsByBoard) {
  const lists = itemsByBoard
    ? Object.values(itemsByBoard).flat()
    : [];
  return findBoardItem(ref, lists);
}

export { isWebDevItem, isWebDevPhase };
