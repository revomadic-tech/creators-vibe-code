export default function ViewToggle({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.04] rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
            value === opt.value
              ? "bg-white/[0.1] text-white shadow-sm"
              : "text-white/25 hover:text-white/45 hover:bg-white/[0.03]"
          }`}
        >
          {opt.icon && <opt.icon size={13} strokeWidth={value === opt.value ? 2 : 1.5} />}
          {opt.label && <span className="hidden lg:inline">{opt.label}</span>}
        </button>
      ))}
    </div>
  );
}
