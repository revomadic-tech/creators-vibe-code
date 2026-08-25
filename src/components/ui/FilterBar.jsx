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
