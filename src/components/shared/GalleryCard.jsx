import { Image, Share2, Lock, Clock } from "lucide-react";
import { Tag } from "../ui/Tag";

export default function GalleryCard({ gallery, onClick, variant = "default", active }) {
  if (variant === "compact") return <CompactGallery gallery={gallery} onClick={onClick} />;

  return (
    <div
      onClick={onClick}
      className={`group rounded-2xl overflow-hidden glass-card card-hover cursor-pointer transition-all duration-200 ${
        active
          ? "ring-2 ring-accent-red/40 border-accent-red/20"
          : ""
      }`}
    >
      <div className="relative h-44 overflow-hidden">
        <div className="grid grid-cols-2 grid-rows-2 gap-[1px] h-full bg-surface-600">
          {(gallery.coverImages || []).slice(0, 4).map((img, i) => (
            <div key={i} className="overflow-hidden bg-white/[0.03]">
              {img ? (
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover img-cinematic transition-transform duration-500 ease-out group-hover:scale-110"
                  loading="lazy"
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-700 via-transparent to-transparent" />
        <div className="absolute top-2.5 right-2.5">
          {gallery.isShared ? (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[9px] text-white/60">
              <Share2 size={9} /> Shared
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[9px] text-white/60">
              <Lock size={9} /> Private
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-[13px] font-bold text-white mb-1.5">{gallery.title}</h3>
        <p className="text-[11px] text-white/30 line-clamp-1 mb-3">
          {gallery.description}
        </p>

        {gallery.tags && (
          <div className="flex items-center gap-1.5 mb-3">
            {gallery.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            {gallery.createdBy?.avatar ? (
              <img
                src={gallery.createdBy.avatar}
                alt=""
                className="w-5 h-5 rounded-full object-cover ring-1 ring-white/[0.06]"
              />
            ) : (
              <span className="w-5 h-5 rounded-full bg-white/[0.08]" />
            )}
            <span className="text-[10px] text-white/35">
              {gallery.createdBy?.name || "Library"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/20">
            <span className="flex items-center gap-1">
              <Image size={10} /> {gallery.assetCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> {gallery.lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactGallery({ gallery, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group rounded-2xl overflow-hidden glass-card card-hover cursor-pointer"
    >
      <div className="relative h-24 overflow-hidden">
        <div className="grid grid-cols-2 gap-[1px] h-full bg-surface-600">
          {(gallery.coverImages || []).slice(0, 2).map((img, i) =>
            img ? (
              <img
                key={i}
                src={img}
                alt=""
                className="w-full h-full object-cover img-cinematic transition-transform duration-500 ease-out group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div key={i} className="bg-white/[0.03]" />
            )
          )}
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs font-semibold text-white truncate">
          {gallery.title}
        </p>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-white/25">
          <Image size={10} />
          <span>{gallery.assetCount} assets</span>
        </div>
      </div>
    </div>
  );
}
