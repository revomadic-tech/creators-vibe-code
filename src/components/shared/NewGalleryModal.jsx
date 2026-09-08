import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useCreateGallery } from "../../api/content-gallery/hooks";
import { mapGallery } from "../../lib/mapContentAsset";
import { useWidgets } from "../../contexts/WidgetContext";

export default function NewGalleryModal() {
  const { createGalleryOpen, seedAssetIds, closeCreateGallery, openGallery } =
    useWidgets();
  const [name, setName] = useState("");
  const create = useCreateGallery();

  if (!createGalleryOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || create.isPending) return;
    try {
      const resp = await create.mutateAsync({
        name: trimmed,
        assetIds: seedAssetIds,
      });
      const raw = resp?.data?.data ?? resp?.data ?? { name: trimmed, assetIds: seedAssetIds };
      const mapped = mapGallery(raw);
      closeCreateGallery();
      setName("");
      if (mapped) openGallery(mapped);
    } catch {
      /* hook surfaces failure */
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40" onClick={closeCreateGallery} data-widget-chrome />
      <form
        onSubmit={submit}
        data-widget-chrome
        className="fixed z-[71] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(420px,calc(100vw-2rem))] glass-panel rounded-2xl border border-white/[0.08] shadow-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
              New gallery
            </p>
            <h3 className="text-[15px] font-bold text-white mt-0.5">Create a collection</h3>
          </div>
          <button
            type="button"
            onClick={closeCreateGallery}
            className="p-1.5 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/[0.06]"
          >
            <X size={14} />
          </button>
        </div>
        <label className="block text-[11px] font-semibold text-white/45 mb-1.5">
          Name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Spring stills"
          className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#E8C4A0]/40"
        />
        {seedAssetIds.length > 0 && (
          <p className="mt-2 text-[11px] text-white/35">
            {seedAssetIds.length} asset{seedAssetIds.length === 1 ? "" : "s"} will be added.
          </p>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={closeCreateGallery}
            className="px-3 py-2 rounded-xl text-[12px] font-semibold text-white/45 hover:text-white hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || create.isPending}
            className="px-4 py-2 rounded-xl bg-accent-red hover:bg-accent-red/90 text-white text-[12px] font-semibold disabled:opacity-40 flex items-center gap-2"
          >
            {create.isPending && <Loader2 size={12} className="animate-spin" />}
            Create
          </button>
        </div>
      </form>
    </>
  );
}
