export default function MetadataRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <div className="flex items-center gap-2 text-white/25">
        {Icon && <Icon size={12} strokeWidth={1.5} />}
        <span className="text-[11px]">{label}</span>
      </div>
      <div className="text-[11px] text-white/60">{value}</div>
    </div>
  );
}
