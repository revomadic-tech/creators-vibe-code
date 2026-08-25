export function FilterDropdown({ label, value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-white/[0.04] border rounded-lg py-2 px-2.5 text-[11px] outline-none cursor-pointer appearance-none transition-all duration-200 ${
        value
          ? "border-accent-red/25 text-white/70 bg-accent-red/[0.04]"
          : "border-white/[0.06] text-white/35 hover:border-white/[0.1] hover:text-white/50"
      }`}
    >
      <option value="" className="bg-surface-700">
        {label}
      </option>
      {options.map((o) => (
        <option key={o} value={o} className="bg-surface-700">
          {o}
        </option>
      ))}
    </select>
  );
}

export function FilterPills({ items, value, onChange }) {
  return (
    <div className="flex items-center bg-white/[0.03] border border-white/[0.04] rounded-xl overflow-hidden">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() =>
            onChange(item.value === value ? items[0].value : item.value)
          }
          className={`flex items-center gap-1 px-2.5 py-2 text-[11px] font-medium transition-all duration-200 ${
            value === item.value
              ? "bg-white/[0.08] text-white"
              : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
          }`}
        >
          {item.icon && (
            <item.icon
              size={12}
              strokeWidth={value === item.value ? 2 : 1.5}
            />
          )}
          <span className="hidden xl:inline">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export function SortDropdown({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white/[0.04] border border-white/[0.06] rounded-lg py-2 px-2.5 text-[11px] text-white/50 outline-none cursor-pointer appearance-none hover:border-white/[0.1] transition-all duration-200"
    >
      {options.map((s) => (
        <option key={s.value} value={s.value} className="bg-surface-700">
          {s.label}
        </option>
      ))}
    </select>
  );
}
