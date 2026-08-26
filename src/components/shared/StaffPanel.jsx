import { useEffect, useState } from "react";
import TeamChat from "./TeamChat";

const COLLAPSED_KEY = "revo.commandCenter.staffChat.collapsed.v1";

function loadCollapsed() {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    /* ignore private mode */
  }
  return true;
}

/**
 * Command Center staff column — Team Chat.
 * Collapsed by default into a notification-icon rail.
 */
export default function StaffPanel({ className = "" }) {
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore quota / private mode */
    }
  }, [collapsed]);

  return (
    <aside
      data-command-interactive
      className={`glass-panel rounded-2xl border border-white/[0.08] flex-col min-h-0 overflow-hidden transition-[width] duration-200 ease-out ${
        collapsed ? "w-16" : "w-[320px] xl:w-[345px]"
      } ${className}`}
      style={{ background: "rgba(255, 255, 255, 0.03)" }}
    >
      <TeamChat collapsed={collapsed} onCollapsedChange={setCollapsed} />
    </aside>
  );
}
