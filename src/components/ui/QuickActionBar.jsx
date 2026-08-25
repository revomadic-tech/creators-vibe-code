export default function QuickActionBar({ actions }) {
  return (
    <div className="flex items-center gap-1.5">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.04] rounded-lg text-[10px] text-white/50 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.08] transition-all duration-200"
        >
          {action.icon && <action.icon size={11} strokeWidth={1.5} />}
          {action.label}
        </button>
      ))}
    </div>
  );
}
