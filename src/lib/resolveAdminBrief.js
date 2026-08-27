import { adminBriefUrl } from "../config";
import {
  ADMIN_BRIEFS_BY_PRODUCT,
  DEFAULT_ADMIN_BRIEF,
  deliverableLabel,
} from "../data/adminBriefs";

function styleDeliverable(item) {
  const style = String(item?.editingStyle || "").toLowerCase();
  if (style.includes("carousel") || style.includes("slide")) {
    return { platform: item.platform || "Meta", type: "ig-carousel", quantity: 1 };
  }
  if (style.includes("image") || style.includes("illustration")) {
    return { platform: item.platform || "Meta", type: "ugc-image", quantity: 1 };
  }
  if (String(item?.platform || "").toLowerCase().includes("youtube")) {
    return { platform: "YouTube", type: "yt-short", quantity: 1 };
  }
  if (String(item?.platform || "").toLowerCase().includes("tiktok")) {
    return { platform: "TikTok", type: "tiktok", quantity: 1 };
  }
  return { platform: item.platform || "Meta", type: "ugc-video", quantity: 1 };
}

export function findAdminBriefForProduct(product) {
  const key = String(product || "").trim().toLowerCase();
  if (!key) return DEFAULT_ADMIN_BRIEF;
  return ADMIN_BRIEFS_BY_PRODUCT[key] || DEFAULT_ADMIN_BRIEF;
}

/** Merge the admin.revomadic creative brief with this Monday cut. */
export function resolveAdminBrief(item) {
  const base = findAdminBriefForProduct(item?.product);
  const creative = base.creativeBrief || {};
  const thisCut = styleDeliverable(item);
  const deliverables = [...(base.deliverables || [])];

  return {
    ...base,
    adminUrl: adminBriefUrl(base.uuid || base.id),
    products: base.products,
    platforms: base.platforms,
    deliverables,
    creativeBrief: {
      ...creative,
      category: creative.category || "ugc",
    },
    thisCut: {
      taskName: item?.name || "",
      product: item?.product || base.products?.[0]?.title || "",
      angle: item?.angle || "",
      painPoint: item?.painPoint || "",
      editingStyle: item?.editingStyle || "",
      platform: item?.platform || thisCut.platform,
      deliverable: `${thisCut.quantity}× ${deliverableLabel(thisCut.type)}`,
      hook: "",
    },
  };
}

export function formatDeliverable(d) {
  return `${d.quantity}× ${deliverableLabel(d.type)}`;
}
