import { useState } from "react";
import TeamChat from "./TeamChat";

/**
 * Command Center chat column. Collapses to a notification rail by default;
 * expands to a wider conversation pane.
 */
export default function StaffPanel({ className = "" }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`glass-panel rounded-2xl border border-white/[0.08] flex-col min-h-0 overflow-hidden transition-[width] duration-200 ease-out ${
        expanded ? "w-[400px] xl:w-[460px]" : "w-14"
      } ${className}`}
    >
      <TeamChat
        collapsed={!expanded}
        onExpand={() => setExpanded(true)}
        onCollapse={() => setExpanded(false)}
      />
    </aside>
  );
}
