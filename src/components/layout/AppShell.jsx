import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FloatingNav from "./FloatingNav";
import CommandCenterNav from "./CommandCenterNav";
import AnnouncementTicker from "./AnnouncementTicker";
import { APP_TICKER_H } from "./chrome";
import { CommandCenterProvider } from "../../contexts/CommandCenterContext";
import { useCommandCenterGesture } from "../../hooks/useCommandCenterGesture";
import CommandCenter from "../../pages/CommandCenter";

function StudioOutlet() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="flex flex-1 min-h-0 flex-col overflow-hidden studio-page-fade">
      <Outlet />
    </div>
  );
}

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const shellRef = useRef(null);
  const canvasRef = useRef(null);
  const gesture = useCommandCenterGesture(open, setOpen, shellRef, canvasRef);

  useEffect(() => {
    if (window.location.hash === "#command-center") gesture.setOpen(true);
    // First-paint hash only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commandValue = useMemo(
    () => ({
      open,
      setOpen: gesture.setOpen,
      toggle: gesture.toggle,
      isOpenVisual: gesture.isOpenVisual,
    }),
    [open, gesture.setOpen, gesture.toggle, gesture.isOpenVisual],
  );

  return (
    <CommandCenterProvider value={commandValue}>
      <div className="h-screen overflow-hidden lustrous-bg">
        <div className="ambient-orbs" aria-hidden="true">
          <span className="orb orb-smoke-a" />
          <span className="orb orb-smoke-b" />
        </div>
        <div className="ui-glass-veil" aria-hidden="true" />
        <AnnouncementTicker />
        <FloatingNav />

        {gesture.canvasMounted && (
          <div
            ref={canvasRef}
            data-cc-canvas
            className="app-frame app-frame-bottom app-frame-outline absolute bottom-0 z-[8] flex flex-col overflow-hidden"
            style={{ top: APP_TICKER_H, ...gesture.canvasStyle }}
            {...gesture.pointerBind}
          >
            <CommandCenterNav />
            <CommandCenter />
          </div>
        )}

        <main
          ref={shellRef}
          className={`app-frame app-frame-bottom app-frame-outline absolute bottom-0 z-10 flex flex-col overflow-hidden ${
            gesture.canvasMounted ? "bg-[#050506] isolate" : "bg-transparent"
          }`}
          style={{ top: APP_TICKER_H, ...gesture.shellStyle }}
          {...gesture.pointerBind}
        >
          <div className="command-gesture-handle-wrap absolute top-16 inset-x-0 z-30 flex justify-center">
            <button
              type="button"
              data-command-gesture-handle
              onClick={() => gesture.setOpen(true)}
              className="touch-none flex flex-col items-center gap-1 px-8 py-2 text-white/40 hover:text-white/70 transition-colors cursor-grab active:cursor-grabbing"
              aria-label="Open Command Center"
            >
              <span className="w-12 h-1.5 rounded-full bg-white/35" />
            </button>
          </div>
          <StudioOutlet />
        </main>
      </div>
    </CommandCenterProvider>
  );
}
