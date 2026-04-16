import { Search } from "lucide-react";

export default function EmptyState({
  icon: Icon = Search,
  title = "Nothing found",
  description,
  action,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center mb-4">
        <Icon size={24} strokeWidth={1.2} className="text-white/12" />
      </div>
      <p className="text-sm text-white/30 font-medium">{title}</p>
      {description && (
        <p className="text-xs text-white/15 mt-1 max-w-xs text-center leading-relaxed">
          {description}
        </p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-3 px-4 py-2 text-xs font-medium text-accent-red bg-accent-red/8 border border-accent-red/15 rounded-xl hover:bg-accent-red/12 transition-all"
        >
          {action}
        </button>
      )}
    </div>
  );
}
