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
            className="absolute inset-x-0 bottom-0 z-[8] flex flex-col overflow-hidden"
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
          <Outlet />
        </main>
      </div>
    </CommandCenterProvider>
  );
}
