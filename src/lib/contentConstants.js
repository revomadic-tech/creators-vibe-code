export const PAGE_SIZE = 48;

export const PRODUCT_COLORS = [
  "#e8442e",
  "#f26b3a",
  "#3b82f6",
  "#14b8a6",
  "#8b5cf6",
  "#f59e0b",
];

export const EMPTY_FEED = {
  featured: [],
  trending: [],
  products: [],
  tags: [],
  typeCounts: { image: 0, video: 0, document: 0, audio: 0 },
  totalCount: 0,
  newToday: 0,
};

export const UI_TO_API_TYPE = {
  Photo: "image",
  Video: "video",
  Motion: "video",
  Graphic: "document",
  Illustration: "document",
  "3D Render": "document",
};

export const API_TO_UI_TYPE = {
  image: "Photo",
  video: "Video",
  document: "Graphic",
  audio: "Motion",
};

export const SORT_TO_API = {
  newest: "date",
  oldest: "date",
  views: "downloads",
  downloads: "downloads",
  az: "name",
};

export function apiTypesFromUi(typeFilters) {
  const mapped = [
    ...new Set(typeFilters.map((t) => UI_TO_API_TYPE[t]).filter(Boolean)),
  ];
  return mapped.length === 1 ? mapped[0] : undefined;
}

export function uiTypesFromCounts(typeCounts) {
  const options = [];
  if ((typeCounts?.image ?? 0) > 0) options.push("Photo");
  if ((typeCounts?.video ?? 0) > 0) options.push("Video");
  if ((typeCounts?.document ?? 0) > 0) options.push("Graphic");
  if ((typeCounts?.audio ?? 0) > 0) options.push("Motion");
  return options.length ? options : ["Photo", "Video"];
}
