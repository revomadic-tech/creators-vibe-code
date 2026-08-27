import { ChevronDown, ChevronUp } from "lucide-react";
import { APP_GUTTER, COMMAND_BAR } from "./chrome";
import TickerMarquee from "./AnnouncementTicker";
import { useCommandCenter } from "../../contexts/CommandCenterContext";

const SETTLE_MS = 280;
const SETTLE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function CommandCenterNav({ progress = 0, settling = false }) {
  const { setOpen } = useCommandCenter();
  const live = progress > 0.08;
  const interactive = progress > 0.35;

  return (
    <div
      data-command-interactive
      className="command-center-nav absolute z-30"
      style={{
        top: APP_GUTTER,
        left: APP_GUTTER,
        right: APP_GUTTER,
        opacity: Math.min(1, progress * 1.35),
        pointerEvents: interactive ? "auto" : "none",
        visibility: live ? "visible" : "hidden",
        transition: settling ? `opacity ${SETTLE_MS}ms ${SETTLE_EASE}` : "none",
      }}
    >
      <div className={COMMAND_BAR}>
        <button
          type="button"
          data-command-gesture-handle
          onClick={() => setOpen(false)}
          aria-label="Go down to studio"
          title="Studio"
          className="flex flex-col items-center justify-center w-9 h-9 rounded-xl border border-white/15 bg-white/[0.07] text-white/70 hover:text-white hover:bg-white/12 transition-all duration-200 touch-none cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <ChevronUp size={11} strokeWidth={2.6} className="text-white/30 -mb-0.5" />
          <ChevronDown size={11} strokeWidth={2.6} />
        </button>
        <TickerMarquee tone="dark" />
      </div>
    </div>
  );
}
