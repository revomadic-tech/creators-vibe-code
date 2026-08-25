import { ChevronRight } from "lucide-react";

export default function SectionHeader({ title, count, action, href, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-5 h-5 rounded-md bg-accent-red/10 flex items-center justify-center">
              <Icon size={11} className="text-accent-red" />
            </div>
          )}
          <h2 className="text-[13px] font-bold text-white tracking-tight">{title}</h2>
          {count !== undefined && (
            <span className="text-[10px] text-white/20 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded-md leading-none">
              {count}
            </span>
          )}
        </div>
        {action && (
          <a href={href || "#"} className="text-[11px] text-white/25 hover:text-white/50 flex items-center gap-1 transition-colors font-medium group/link">
            {action} <ChevronRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>
      {children}
    </div>
  );
}
