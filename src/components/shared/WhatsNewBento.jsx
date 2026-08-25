import { useRef, useState, useEffect } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function WhatsNewBento({
  headline = "NEW",
  tagline,
  taglineAction,
  onTaglineAction,
  message,
  featuredImage,
  featuredLabel,
  quickLinks = [],
}) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`relative transition-all duration-1000 ease-out ${
        isVisible ? "bento-lit" : "opacity-60"
      }`}
    >
      {/* Ambient light glow on scroll-in */}
      <div
        className={`absolute -inset-8 rounded-[40px] pointer-events-none transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(232,68,46,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative space-y-3">
        {/* Top row — headline + tagline */}
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-4">
            <span className="text-[11px] text-white/25 font-mono">//</span>
            <p className="text-[15px] font-semibold text-white/60 italic">
              {tagline}
            </p>
          </div>
          <div className="flex items-end gap-8">
            {taglineAction && (
              <button
                onClick={onTaglineAction}
                className="flex items-center gap-2 text-[13px] text-white/40 hover:text-white/70 font-medium transition-colors group/ta"
              >
                {taglineAction}
                <ArrowRight
                  size={14}
                  className="group-hover/ta:translate-x-0.5 transition-transform duration-200"
                />
              </button>
            )}
            <h2 className="text-[72px] font-black text-white/[0.06] tracking-tighter leading-none select-none uppercase">
              {headline}
            </h2>
          </div>
        </div>

        {/* Bento row — message card + featured image */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 rounded-2xl border border-dashed border-white/[0.12] p-6 flex items-center justify-center min-h-[200px]">
            <p className="text-[13px] font-bold text-white/50 leading-relaxed text-center uppercase tracking-wide max-w-[260px]">
              {message}
            </p>
          </div>

          <div className="col-span-8 relative rounded-2xl overflow-hidden min-h-[200px] group cursor-pointer card-hover">
            <img
              src={featuredImage}
              alt={featuredLabel}
              className="absolute inset-0 w-full h-full object-cover img-cinematic transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
            {featuredLabel && (
              <div className="absolute top-5 left-6">
                <span className="text-[18px] font-black text-white/80 uppercase tracking-wide">
                  {featuredLabel}
                </span>
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-white/[0.1]" />
          </div>
        </div>

        {/* Quick link pills */}
        {quickLinks.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {quickLinks.map((link, i) => {
              const isAction = link.isAction;
              return (
                <button
                  key={i}
                  onClick={link.onClick}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-200 group/ql ${
                    isAction
                      ? "bg-accent-red hover:bg-accent-red/90 text-white"
                      : "glass-card hover:bg-white/[0.06] hover:border-white/[0.1] text-white/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold uppercase tracking-wider">
                      {link.label}
                    </span>
                    <ArrowRight
                      size={13}
                      className={`${
                        isAction ? "text-white/70" : "text-white/25"
                      } group-hover/ql:translate-x-0.5 transition-transform duration-200`}
                    />
                  </div>
                  {link.badge && (
                    <span
                      className={`text-[11px] font-semibold ${
                        isAction ? "text-white/70" : "text-white/25"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                  {isAction && (
                    <ChevronRight
                      size={16}
                      className="text-white/60 group-hover/ql:translate-x-0.5 transition-transform duration-200"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
