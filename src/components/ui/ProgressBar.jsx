export default function ProgressBar({ value, size = "sm", colorByValue = false }) {
  const heights = { xs: "h-[3px]", sm: "h-1.5", md: "h-2" };
  let barColor = "bg-accent-red";
  if (colorByValue) {
    barColor =
      value === 100
        ? "bg-accent-teal"
        : value > 70
          ? "bg-accent-blue"
          : "bg-accent-red";
  }

  return (
    <div className={`${heights[size]} bg-white/[0.06] rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
        style={{ width: `${Math.max(value, 1)}%` }}
      />
    </div>
  );
}
