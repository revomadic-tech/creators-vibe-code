export function TabBar({ tabs, active, onChange, variant = "pills" }) {
  if (variant === "underline") {
    return (
      <div className="flex items-center gap-0.5 border-b border-white/[0.06]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${
              active === t.id
                ? "border-accent-red text-white"
                : "border-transparent text-white/30 hover:text-white/50 hover:border-white/[0.08]"
            }`}
          >
            {t.icon && <t.icon size={13} strokeWidth={active === t.id ? 2 : 1.5} />}
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.04] rounded-xl p-1">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-medium transition-all ${
              isActive
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
            }`}
          >
            {t.icon && <t.icon size={13} strokeWidth={isActive ? 2 : 1.5} />}
            {t.label}
            {t.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] leading-none font-semibold ${
                isActive
                  ? "bg-accent-red/20 text-accent-red"
                  : "bg-white/[0.05] text-white/20"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
