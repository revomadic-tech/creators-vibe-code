import { createContext, useCallback, useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";

const WidgetContext = createContext(null);

export function WidgetProvider({ children }) {
  const [gallery, setGallery] = useState(null);
  const [asset, setAsset] = useState(null);
  const [createGalleryOpen, setCreateGalleryOpen] = useState(false);
  const [seedAssetIds, setSeedAssetIds] = useState([]);
  const [, setSearchParams] = useSearchParams();

  const patchParams = useCallback(
    (mutate) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const openGallery = useCallback(
    (g, { preserveAsset = false } = {}) => {
      setGallery(g);
      if (!preserveAsset) setAsset(null);
      patchParams((n) => {
        if (g?.id != null) n.set("galleryId", String(g.id));
        else n.delete("galleryId");
        if (!preserveAsset) n.delete("assetId");
      });
    },
    [patchParams],
  );

  const closeGallery = useCallback(() => {
    setGallery(null);
    patchParams((n) => n.delete("galleryId"));
  }, [patchParams]);

  const openAsset = useCallback(
    (a) => {
      setAsset(a);
      patchParams((n) => {
        if (a?.id != null) n.set("assetId", String(a.id));
        else n.delete("assetId");
      });
    },
    [patchParams],
  );

  const closeAsset = useCallback(() => {
    setAsset(null);
    patchParams((n) => n.delete("assetId"));
  }, [patchParams]);

  const openCreateGallery = useCallback((assetIds = []) => {
    setSeedAssetIds(Array.isArray(assetIds) ? assetIds : []);
    setCreateGalleryOpen(true);
  }, []);

  const closeCreateGallery = useCallback(() => {
    setCreateGalleryOpen(false);
    setSeedAssetIds([]);
  }, []);

  return (
    <WidgetContext.Provider
      value={{
        gallery,
        asset,
        createGalleryOpen,
        seedAssetIds,
        openGallery,
        closeGallery,
        openAsset,
        closeAsset,
        openCreateGallery,
        closeCreateGallery,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgets() {
  const ctx = useContext(WidgetContext);
  if (!ctx) throw new Error("useWidgets must be used within WidgetProvider");
  return ctx;
}
