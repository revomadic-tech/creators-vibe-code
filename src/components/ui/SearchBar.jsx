import { Search, X, Command } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  size = "default",
  showShortcut = false,
  className = "",
}) {
  const sizes = {
    sm: "py-2 pl-8 pr-4 text-xs",
    default: "py-2.5 pl-10 pr-8 text-sm",
  };
  const iconSizes = { sm: 13, default: 15 };

  return (
    <div className={`relative group/search ${className}`}>
      <Search
        size={iconSizes[size]}
        className={`absolute ${size === "sm" ? "left-2.5" : "left-3.5"} top-1/2 -translate-y-1/2 text-white/20 group-focus-within/search:text-white/40 transition-colors pointer-events-none`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white/[0.04] border border-white/[0.06] rounded-xl text-white placeholder:text-white/20 outline-none focus:border-white/15 focus:bg-white/[0.06] transition-all duration-200 ${sizes[size]}`}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-white/20 hover:text-white/50 transition-colors"
        >
          <X size={13} />
        </button>
      )}
      {showShortcut && !value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-white/[0.04] rounded text-white/15">
          <Command size={10} />
          <span className="text-[10px] font-mono">K</span>
        </div>
      )}
    </div>
  );
}
