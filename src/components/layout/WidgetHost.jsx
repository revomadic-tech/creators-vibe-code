import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetContentById } from "../../api/content/hooks";
import { useGetGalleries } from "../../api/content-gallery/hooks";
import { unwrapDetail, unwrapGalleries } from "../../lib/mapContentAsset";
import { useWidgets } from "../../contexts/WidgetContext";
import GalleryWidget from "../shared/GalleryWidget";
import AssetWidget from "../shared/AssetWidget";
import NewGalleryModal from "../shared/NewGalleryModal";

export default function WidgetHost() {
  const { gallery, asset, openGallery, openAsset } = useWidgets();
  const [searchParams] = useSearchParams();
  const galleryIdParam = searchParams.get("galleryId");
  const assetIdParam = searchParams.get("assetId");
  const { data: galleriesResp } = useGetGalleries();
  const galleries = unwrapGalleries(galleriesResp);

  const deepLinkId =
    assetIdParam && !Number.isNaN(Number(assetIdParam))
      ? Number(assetIdParam)
      : assetIdParam || null;
  const { data: detailResp } = useGetContentById(deepLinkId);
  const detail = unwrapDetail(detailResp);

  useEffect(() => {
    if (!galleryIdParam || galleries.length === 0) return;
    if (String(gallery?.id) === String(galleryIdParam)) return;
    const g = galleries.find((x) => String(x.id) === String(galleryIdParam));
    if (g) openGallery(g, { preserveAsset: true });
  }, [galleryIdParam, galleries, gallery?.id, openGallery]);

  useEffect(() => {
    if (!detail) return;
    if (String(asset?.id) === String(detail.id)) return;
    openAsset(detail);
  }, [detail, asset?.id, openAsset]);

  return (
    <>
      <GalleryWidget />
      <AssetWidget />
      <NewGalleryModal />
    </>
  );
}
