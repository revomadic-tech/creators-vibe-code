import { ArrowRight } from "lucide-react";

export default function SpotlightGrid({
  title,
  titleAccent,
  subtitle,
  actionLabel,
  onAction,
  items,
  renderPill,
  renderLabel,
  onItemClick,
}) {
  if (!items || items.length < 6) return null;

  return (
    <div>
      {/* Editorial header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-[28px] font-black text-white tracking-tight leading-none">
            {title}{" "}
            <span className="text-accent-red">{titleAccent}</span>
          </h2>
          {subtitle && (
            <p className="text-[13px] text-white/25 mt-2.5 max-w-lg leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actionLabel && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 text-[13px] text-accent-blue/60 hover:text-accent-blue font-medium transition-colors group/action"
          >
            {actionLabel}{" "}
            <ArrowRight
              size={15}
              className="group-hover/action:translate-x-1 transition-transform duration-200"
            />
          </button>
        )}
      </div>

      {/* Asymmetric grid: left column tall bottom, right two shorter */}
      <div className="grid grid-cols-12 grid-rows-[200px_220px] gap-2.5">
        {/* Row 1 — 3 equal cards */}
        <SpotlightCard
          item={items[0]}
          className="col-span-4"
          renderPill={renderPill}
          renderLabel={renderLabel}
          onClick={onItemClick}
        />
        <SpotlightCard
          item={items[1]}
          className="col-span-4"
          renderPill={renderPill}
          renderLabel={renderLabel}
          onClick={onItemClick}
        />
        <SpotlightCard
          item={items[2]}
          className="col-span-4"
          renderPill={renderPill}
          renderLabel={renderLabel}
          onClick={onItemClick}
        />

        {/* Row 2 — first card wider, two others split */}
        <SpotlightCard
          item={items[3]}
          className="col-span-5"
          renderPill={renderPill}
          renderLabel={renderLabel}
          onClick={onItemClick}
          large
        />
        <SpotlightCard
          item={items[4]}
          className="col-span-4"
          renderPill={renderPill}
          renderLabel={renderLabel}
          onClick={onItemClick}
        />
        <SpotlightCard
          item={items[5]}
          className="col-span-3"
          renderPill={renderPill}
          renderLabel={renderLabel}
          onClick={onItemClick}
        />
      </div>
    </div>
  );
}

function SpotlightCard({
  item,
  className = "",
  renderPill,
  renderLabel,
  onClick,
  large,
}) {
  return (
    <div
      onClick={() => onClick?.(item)}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.04] cursor-pointer ${className}`}
    >
      <img
        src={item.thumbnail}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/15" />

      {/* Frosted metric pill */}
      <div className="absolute top-3 right-3">
        <span className="px-3 py-1.5 bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] rounded-full text-[11px] font-medium text-white/80 shadow-lg transition-all duration-200 group-hover:bg-white/[0.12] group-hover:border-white/[0.15]">
          {renderPill(item)}
        </span>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3
          className={`font-bold text-white leading-tight ${
            large ? "text-xl" : "text-[17px]"
          }`}
        >
          {item.title}
        </h3>
        <p className="text-xs text-white/45 mt-0.5">{renderLabel(item)}</p>
      </div>

      {/* Hover ring */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-white/[0.1]" />
    </div>
  );
}
