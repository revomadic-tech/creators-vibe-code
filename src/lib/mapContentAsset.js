import { API_TO_UI_TYPE, PRODUCT_COLORS } from "./contentConstants";

function firstUrl(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const first = items[0];
  if (typeof first === "string") return first;
  return first?.url || "";
}

function extFromUrl(url) {
  if (!url) return "";
  try {
    const path = new URL(url, window.location.origin).pathname;
    const match = path.match(/\.([a-zA-Z0-9]+)$/);
    return match ? `.${match[1].toLowerCase()}` : "";
  } catch {
    return "";
  }
}

function isRecent(dateStr) {
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return false;
  return Date.now() - t < 3 * 24 * 60 * 60 * 1000;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return String(dateStr);
  return new Date(t).toISOString().split("T")[0];
}

function humanStatus(value) {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mapContentAsset(raw) {
  if (!raw || typeof raw !== "object") return null;
  const display = raw.display && typeof raw.display === "object" ? raw.display : raw;
  const id = display.id ?? raw.id;
  if (id == null) return null;

  const apiType = display.type || raw.contentType || "image";
  const type = API_TO_UI_TYPE[apiType] || "Photo";
  const thumbnail =
    display.thumbnail ||
    raw.thumbnailImage ||
    firstUrl(raw.images) ||
    "";
  const videoUrl =
    display.videoUrl || firstUrl(raw.videos) || null;
  const downloadUrl =
    display.downloadUrl || videoUrl || firstUrl(raw.images) || thumbnail || "";
  const tags = Array.isArray(display.tags)
    ? display.tags
    : Array.isArray(raw.tags)
      ? raw.tags
      : [];
  const productName =
    display.productName ||
    raw.products?.[0]?.title ||
    raw.products?.[0]?.name ||
    "";
  const productIds = display.productIds || raw.products?.map((p) => String(p.id)) || [];
  const date = display.date || raw.createdAt || raw.submissionDate || "";
  const partner =
    raw.partner?.name ||
    display.partnerName ||
    "";
  const editorUser = raw.editorUser || raw.editor || null;
  const size = display.size || raw.fileSize || "";

  return {
    id,
    title: display.name || raw.title || `Asset #${id}`,
    thumbnail,
    type,
    fileExt: extFromUrl(downloadUrl) || (type === "Video" ? ".mp4" : ".jpg"),
    category: tags[0] || raw.contentType || type,
    product: productName,
    productId: productIds[0] || "",
    productIds,
    productNames: display.productNames || [],
    partner,
    status: humanStatus(display.stage || display.assetStatus || raw.stage || raw.assetStatus),
    editor: editorUser?.name || "",
    editorId: editorUser?.id || raw.editorId || null,
    editorAvatar: editorUser?.avatar || "",
    editorNeeded: false,
    dateSubmitted: formatDate(date),
    isNew: isRecent(date),
    isFeatured: Boolean(display.featured || raw.featured || raw.horizontalFeatured || raw.verticalFeatured),
    dimensions: display.dimensions || "",
    fileSize: size,
    tags,
    views: display.views ?? 0,
    downloads: display.downloads ?? 0,
    videoUrl,
    downloadUrl,
    description: display.description || raw.description || "",
    contentType: display.contentType || raw.contentType || null,
    videoFormat: display.videoFormat || raw.videoFormat || null,
    city: display.city || raw.city || null,
    stage: display.stage || raw.stage || null,
    assetStatus: display.assetStatus || raw.assetStatus || null,
    reviewStatus: display.reviewStatus || raw.reviewStatus || null,
    campaignNames: display.campaignNames || [],
    aspectLabel: display.videoFormat
      ? String(display.videoFormat).replace(/^\w/, (c) => c.toUpperCase())
      : "",
    briefId: null,
    briefTitle: null,
  };
}

export function mapDiscoveryProduct(product, index = 0) {
  if (!product) return null;
  return {
    id: String(product.id),
    name: product.title || product.name || "Product",
    tagline: product.description || "",
    description: product.description || "",
    thumbnail: product.thumbnail || "",
    color: PRODUCT_COLORS[index % PRODUCT_COLORS.length],
    assetCount: product.stats?.assets ?? 0,
    briefCount: 0,
    ugcCount: 0,
    topMetric: product.stats?.downloads
      ? `${Number(product.stats.downloads).toLocaleString()} downloads`
      : "",
  };
}

export function mapGallery(raw) {
  if (!raw) return null;
  const assetIds = Array.isArray(raw.assetIds) ? raw.assetIds : [];
  const preview = Array.isArray(raw.previewMedia) ? raw.previewMedia : [];
  const previewThumbs = Array.isArray(raw.previewThumbnails)
    ? raw.previewThumbnails
    : preview.map((m) => (typeof m === "string" ? m : m?.url)).filter(Boolean);
  const coverImages = [...previewThumbs];
  while (coverImages.length < 4) coverImages.push(coverImages[0] || "");
  const updated = raw.updatedAt || raw.createdAt || "";
  let lastUpdated = "";
  const t = Date.parse(updated);
  if (!Number.isNaN(t)) lastUpdated = new Date(t).toISOString().split("T")[0];

  return {
    id: raw.id,
    title: raw.name || `Gallery #${raw.id}`,
    description: raw.description || "",
    thumbnail: coverImages[0] || "",
    assetCount: assetIds.length,
    assetIds,
    createdBy: raw.createdBy
      ? typeof raw.createdBy === "object"
        ? raw.createdBy
        : { name: "Library", avatar: "" }
      : { name: "Library", avatar: "" },
    dateCreated: raw.createdAt || "",
    lastUpdated: lastUpdated || "",
    isShared: false,
    tags: [],
    coverImages,
    color: raw.color || null,
  };
}

export function unwrapFeed(resp) {
  return resp?.data?.data ?? null;
}

export function unwrapList(resp) {
  const inner = resp?.data?.data;
  const rows = Array.isArray(inner) ? inner : inner?.data ?? [];
  const count = Array.isArray(inner) ? rows.length : inner?.count ?? rows.length;
  const pages = Array.isArray(inner) ? 1 : inner?.pages ?? 1;
  return {
    items: rows.map(mapContentAsset).filter(Boolean),
    count,
    pages,
    totalAll: Array.isArray(inner) ? rows.length : inner?.totalAll ?? count,
  };
}

export function unwrapDetail(resp) {
  const raw = resp?.data?.data ?? resp?.data;
  return mapContentAsset(raw);
}

export function unwrapGalleries(resp) {
  const data = resp?.data?.data;
  const rows = Array.isArray(data) ? data : data?.data ?? [];
  return rows.map(mapGallery).filter(Boolean);
}
