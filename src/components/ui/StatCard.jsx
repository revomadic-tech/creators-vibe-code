import { ArrowUpRight } from "lucide-react";

const accentMap = {
  red: "text-accent-red bg-accent-red/10",
  blue: "text-accent-blue bg-accent-blue/10",
  teal: "text-accent-teal bg-accent-teal/10",
  purple: "text-accent-purple bg-accent-purple/10",
  orange: "text-accent-orange bg-accent-orange/10",
};

export default function StatCard({ icon: Icon, label, value, sub, accent = "red" }) {
  return (
    <div className="glass-card rounded-2xl p-5 card-hover group">
      <div className="flex items-center justify-between mb-3.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
          <Icon size={17} strokeWidth={1.8} />
        </div>
        <ArrowUpRight size={14} className="text-white/10 group-hover:text-white/25 transition-colors" />
      </div>
      <p className="text-2xl font-black text-white stat-number leading-none">{value}</p>
      <p className="text-[11px] text-white/40 mt-1.5 font-medium">{label}</p>
      {sub && <p className="text-[10px] text-white/20 mt-0.5">{sub}</p>}
    </div>
  );
}
