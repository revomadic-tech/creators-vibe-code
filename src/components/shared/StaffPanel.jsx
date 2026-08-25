import TeamChat from "./TeamChat";

/**
 * Command Center staff column — Team Chat.
 * Identity, clock, and time snapshot live in CommandCenterNav.
 */
export default function StaffPanel({ className = "" }) {
  return (
    <aside
      className={`glass-panel rounded-2xl border border-white/[0.08] flex-col min-h-0 overflow-hidden ${className}`}
      style={{ background: "rgba(255, 255, 255, 0.03)" }}
    >
      <TeamChat />
    </aside>
  );
}
