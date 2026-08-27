import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import FloatingNav from "./FloatingNav";
import CommandCenterNav from "./CommandCenterNav";
import TaskWidget from "./TaskWidget";
import { CommandCenterProvider } from "../../contexts/CommandCenterContext";
import { useCommandCenterGesture } from "../../hooks/useCommandCenterGesture";
import StaffPanel from "../shared/StaffPanel";
import CommandCenter from "../../pages/CommandCenter";
import {
  findAdTask,
  loadBoardItems,
  moveBoardTask,
  persistBoardItems,
  updateBoardTask,
} from "../../data/adProduction";

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [boardItems, setBoardItems] = useState(loadBoardItems);
  const shellRef = useRef(null);
  const canvasRef = useRef(null);
  const gesture = useCommandCenterGesture(open, setOpen, shellRef, canvasRef);

  const findTask = useCallback(
    (ref) => findAdTask(ref, boardItems),
    [boardItems],
  );

  const openTask = useCallback(
    (ref) => {
      const item = findAdTask(ref, boardItems);
      if (!item) return null;
      setSelectedTaskId(item.id);
      return item;
    },
    [boardItems],
  );

  const closeTask = useCallback(() => setSelectedTaskId(null), []);

  const moveTask = useCallback((taskId, toPhase, beforeId) => {
    setBoardItems((prev) => {
      const next = moveBoardTask(prev, taskId, toPhase, beforeId);
      persistBoardItems(next);
      return next;
    });
  }, []);

  const updateTask = useCallback((taskId, patch) => {
    setBoardItems((prev) => {
      const next = updateBoardTask(prev, taskId, patch);
      if (next !== prev) persistBoardItems(next);
      return next;
    });
  }, []);

  const selectedTask = selectedTaskId
    ? boardItems.find((item) => item.id === selectedTaskId) || null
    : null;

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
        boardItems,
        findTask,
        moveTask,
        updateTask,
      }}
    >
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

        <div
          className="absolute inset-0 z-[8] flex min-h-0 min-w-0"
        >
          {gesture.canvasMounted && (
            <CommandCenterNav progress={gesture.progress} settling={gesture.settling} />
          )}
          <div className="hidden lg:flex flex-col shrink-0 self-stretch min-h-0 pl-3 pt-[72px] pb-[72px] pr-3 z-20">
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
    </CommandCenterProvider>
  );
}
