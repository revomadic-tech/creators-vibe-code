import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import FloatingNav from "./FloatingNav";
import CommandCenterNav from "./CommandCenterNav";
import AnnouncementTicker from "./AnnouncementTicker";
import { APP_TICKER_H } from "./chrome";
import { CommandCenterProvider } from "../../contexts/CommandCenterContext";
import { useCommandCenterGesture } from "../../hooks/useCommandCenterGesture";
import CommandCenter from "../../pages/CommandCenter";

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const shellRef = useRef(null);
  const canvasRef = useRef(null);
  const gesture = useCommandCenterGesture(open, setOpen, shellRef, canvasRef);

  useEffect(() => {
    if (window.location.hash === "#command-center") setOpen(true);
  }, []);

  return (
    <CommandCenterProvider
      value={{
        open,
        setOpen: gesture.setOpen,
        toggle: gesture.toggle,
        isOpenVisual: gesture.isOpenVisual,
      }}
    >
      <div className="h-screen overflow-hidden lustrous-bg">
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
        <AnnouncementTicker />
        <FloatingNav progress={gesture.progress} settling={gesture.settling} />

        {gesture.canvasMounted && (
          <div
            ref={canvasRef}
            className="absolute inset-x-0 bottom-0 z-[8] flex flex-col"
            style={{ top: APP_TICKER_H, ...gesture.canvasStyle }}
            {...gesture.pointerBind}
          >
            <CommandCenterNav progress={gesture.progress} settling={gesture.settling} />
            <CommandCenter />
          </div>
        )}

        <main
          ref={shellRef}
          className={`absolute inset-x-0 bottom-0 z-10 flex flex-col overflow-hidden ${
            gesture.canvasMounted ? "bg-[#050506] isolate" : "bg-transparent"
          }`}
          style={{ top: APP_TICKER_H, ...gesture.shellStyle }}
          {...gesture.pointerBind}
        >
          {gesture.progress < 0.98 && (
            <div className="absolute top-16 inset-x-0 z-30 flex justify-center pointer-events-none">
              <button
                type="button"
                data-command-gesture-handle
                onClick={() => gesture.setOpen(true)}
                className="pointer-events-auto touch-none flex flex-col items-center gap-1 px-8 py-2 text-white/40 hover:text-white/70 transition-colors cursor-grab active:cursor-grabbing"
                aria-label="Open Command Center"
              >
                <span className="w-12 h-1.5 rounded-full bg-white/35" />
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </CommandCenterProvider>
  );
}
