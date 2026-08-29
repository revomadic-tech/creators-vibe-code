import { useMemo } from "react";
import HoveringWidget from "../layout/HoveringWidget";
import DetailPanel from "../layout/DetailPanel";
import ArcShare, { assetArcTarget } from "./ArcShare";
import { useGetContentList } from "../../api/content/hooks";
import { unwrapList } from "../../lib/mapContentAsset";
import { useWidgets } from "../../contexts/WidgetContext";

export default function AssetWidget() {
  const { asset, closeAsset, openAsset } = useWidgets();
  const relatedPayload = useMemo(
    () => ({
      page: "1",
      size: "5",
      sort: "date",
      ...(asset?.productId ? { productId: String(asset.productId) } : {}),
    }),
    [asset],
  );
  const { data: relatedResp } = useGetContentList(relatedPayload, {
    enabled: Boolean(asset?.productId),
  });
  const relatedAssets = unwrapList(relatedResp)
    .items.filter((a) => a.id !== asset?.id)
    .slice(0, 4);

  if (!asset) return null;

  return (
    <HoveringWidget
      open
      onClose={closeAsset}
      ariaLabel={asset.title || `Asset #${asset.id}`}
      defaultWidth={560}
      stack={1}
      zIndex={56}
    >
      <ArcShare tone="dark" target={assetArcTarget(asset)} />
      <DetailPanel
        item={asset}
        type="asset"
        onClose={closeAsset}
        relatedAssets={relatedAssets}
        onSelectRelated={openAsset}
        embedded
      />
    </HoveringWidget>
  );
}
