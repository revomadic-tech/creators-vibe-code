import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import FloatingNav from "./FloatingNav";
import CommandCenterNav from "./CommandCenterNav";
import TaskWidget from "./TaskWidget";
import { CommandCenterProvider } from "../../contexts/CommandCenterContext";
import { WidgetProvider } from "../../contexts/WidgetContext";
import { useCommandCenterGesture } from "../../hooks/useCommandCenterGesture";
import StaffPanel from "../shared/StaffPanel";
import CommandCenter from "../../pages/CommandCenter";
import WidgetHost from "./WidgetHost";
import {
  boardActorId,
  claimUnownedDrafts,
  findAdTask,
  visibleBoardItems,
} from "../../data/adProduction";
import {
  BOARD_AD_PRODUCTION,
  boardIdForItem,
  boardIdForPhase,
  createTaskOnBoard,
  getCommandBoard,
  loadActiveBoardId,
  loadAllBoardItems,
  moveTaskOnBoard,
  persistActiveBoardId,
  persistBoardById,
  updateTaskOnBoard,
} from "../../data/commandBoards";
import { APP_CONTENT_INSET } from "./chrome";
import useAuth from "../../hooks/useAuth";
import { useAccountType } from "../../hooks/useAccountType";

export default function AppShell() {
  const { user } = useAuth();
  const { identity } = useAccountType();
  const actorId = boardActorId(identity || user);
  const [open, setOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeBoardId, setActiveBoardIdState] = useState(loadActiveBoardId);
  const [itemsByBoard, setItemsByBoard] = useState(loadAllBoardItems);
  const itemsByBoardRef = useRef(itemsByBoard);
  itemsByBoardRef.current = itemsByBoard;
  const shellRef = useRef(null);
  const canvasRef = useRef(null);
  const gesture = useCommandCenterGesture(open, setOpen, shellRef, canvasRef);

  const setActiveBoardId = useCallback((id) => {
    const next = getCommandBoard(id).id;
    setActiveBoardIdState(next);
    persistActiveBoardId(next);
  }, []);

  const allItems = useMemo(
    () => Object.values(itemsByBoard).flat(),
    [itemsByBoard],
  );

  const visibleItems = useMemo(
    () => visibleBoardItems(allItems, actorId),
    [allItems, actorId],
  );

  const activeBoardItems = useMemo(
    () =>
      visibleBoardItems(itemsByBoard[activeBoardId] || [], actorId),
    [itemsByBoard, activeBoardId, actorId],
  );

  const commitBoard = useCallback((boardId, nextItems) => {
    persistBoardById(boardId, nextItems);
    setItemsByBoard((prev) => {
      const next = { ...prev, [boardId]: nextItems };
      itemsByBoardRef.current = next;
      return next;
    });
  }, []);

  const findTask = useCallback(
    (ref) => findAdTask(ref, visibleItems),
    [visibleItems],
  );

  const openTask = useCallback(
    (ref) => {
      const item = findAdTask(ref, visibleItems);
      if (!item) return null;
      const boardId = boardIdForItem(item);
      if (boardId !== activeBoardId) setActiveBoardId(boardId);
      setSelectedTaskId(item.id);
      return item;
    },
    [visibleItems, activeBoardId, setActiveBoardId],
  );

  const closeTask = useCallback(() => setSelectedTaskId(null), []);

  const moveTask = useCallback((taskId, toPhase, beforeId) => {
    const current = itemsByBoardRef.current;
    const fromBoard =
      boardIdForItem(
        Object.values(current)
          .flat()
          .find((item) => item.id === taskId),
      ) || BOARD_AD_PRODUCTION;
    const toBoard = boardIdForPhase(toPhase);
    if (fromBoard !== toBoard) return;
    const next = moveTaskOnBoard(toBoard, current[toBoard] || [], taskId, toPhase, beforeId);
    commitBoard(toBoard, next);
  }, [commitBoard]);

  const updateTask = useCallback((taskId, patch) => {
    const current = itemsByBoardRef.current;
    const item = Object.values(current)
      .flat()
      .find((row) => row.id === taskId);
    if (!item) return;
    const boardId = boardIdForItem(item);
    const nextPatch = { ...patch };
    if (
      nextPatch.status === "Draft" &&
      actorId &&
      (item.createdBy == null || item.createdBy === "")
    ) {
      nextPatch.createdBy = actorId;
    }
    const next = updateTaskOnBoard(boardId, current[boardId] || [], taskId, nextPatch);
    if (next === current[boardId]) return;
    commitBoard(boardId, next);
  }, [actorId, commitBoard]);

  const addTask = useCallback((phase, fields = {}) => {
    const boardId = boardIdForPhase(phase) || activeBoardId || BOARD_AD_PRODUCTION;
    const payload = {
      name: "",
      ...fields,
      createdBy: fields.createdBy || actorId || null,
    };
    const { items, item } = createTaskOnBoard(
      boardId,
      itemsByBoardRef.current[boardId] || [],
      phase,
      payload,
    );
    if (!item) return null;
    commitBoard(boardId, items);
    if (boardId !== activeBoardId) setActiveBoardId(boardId);
    setSelectedTaskId(item.id);
    return item;
  }, [actorId, activeBoardId, commitBoard, setActiveBoardId]);

  const selectedTask = selectedTaskId
    ? visibleItems.find((item) => item.id === selectedTaskId) || null
    : null;

  useEffect(() => {
    if (!actorId) return;
    for (const boardId of Object.keys(itemsByBoardRef.current)) {
      const prev = itemsByBoardRef.current[boardId] || [];
      const next = claimUnownedDrafts(prev, actorId);
      if (next !== prev) commitBoard(boardId, next);
    }
  }, [actorId, commitBoard]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#command-center") setOpen(true);
    const taskMatch = hash.match(/^#task\/(.+)$/);
    if (taskMatch) {
      const item = openTask(decodeURIComponent(taskMatch[1]));
      if (item) setOpen(true);
    }
  }, [openTask]);

  return (
    <CommandCenterProvider
      value={{
        open,
        setOpen: gesture.setOpen,
        toggle: gesture.toggle,
        isOpenVisual: gesture.isOpenVisual,
        selectedTaskId,
        openTask,
        closeTask,
        boardItems: visibleItems,
        activeBoardItems,
        activeBoardId,
        setActiveBoardId,
        findTask,
        moveTask,
        updateTask,
        addTask,
      }}
    >
      <WidgetProvider>
      <div className="h-screen w-full max-w-full overflow-hidden overscroll-none lustrous-bg">
        <div className="ambient-orbs" aria-hidden="true">
          <span className="orb orb-smoke-a" />
          <span className="orb orb-smoke-b" />
          <span className="orb orb-red" />
          <span className="orb orb-purple" />
          <span className="orb orb-orange" />
          <span className="orb orb-teal" />
          <span className="orb orb-blue" />
        </div>
        <div className="ui-glass-veil" aria-hidden="true" />
        <FloatingNav progress={gesture.progress} settling={gesture.settling} />
        <TaskWidget item={selectedTask} onClose={closeTask} />
        <WidgetHost />

        <div
          className="absolute inset-0 z-[8] flex min-h-0 min-w-0"
        >
          {gesture.canvasMounted && (
            <CommandCenterNav progress={gesture.progress} settling={gesture.settling} />
          )}
          <div
            className="hidden lg:flex flex-col shrink-0 self-stretch min-h-0 pl-3 pb-[72px] pr-3 z-20"
            style={{ paddingTop: APP_CONTENT_INSET }}
          >
            <StaffPanel className="flex h-full" />
          </div>

          <div className="relative flex-1 min-h-0 min-w-0">
            {gesture.canvasMounted && (
              <div
                ref={canvasRef}
                className="absolute inset-0 z-[8] flex flex-col overflow-hidden w-full max-w-full"
                style={gesture.canvasStyle}
                {...gesture.pointerBind}
              >
                <CommandCenter />
              </div>
            )}

            <main
              ref={shellRef}
              className={`absolute inset-0 z-10 flex flex-col overflow-hidden w-full max-w-full ${
                gesture.canvasMounted ? "bg-[#161618]/88 isolate" : "bg-transparent"
              }`}
              style={gesture.shellStyle}
              {...gesture.pointerBind}
            >
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      </WidgetProvider>
    </CommandCenterProvider>
  );
}
