import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContent,
  createContentComment,
  getContentById,
  getContentComments,
  getContentDiscoveryFeed,
  getContentList,
  updateContent,
} from "./index";
import { unwrapDetail, unwrapList } from "../../lib/mapContentAsset";

export const useGetContentDiscoveryFeed = () => {
  return useQuery({
    queryKey: ["content-discovery-feed"],
    queryFn: () => getContentDiscoveryFeed(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetContentList = (payload, options) => {
  return useQuery({
    queryKey: ["content-list", payload],
    queryFn: () => getContentList(payload),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    enabled: options?.enabled ?? true,
  });
};

export const useGetContentById = (id) => {
  return useQuery({
    queryKey: ["content", id],
    queryFn: () => getContentById(id),
    enabled: id !== null && id !== undefined && id !== "",
    staleTime: 1000 * 60 * 5,
  });
};

/** Fetch and merge content lists across one or more product IDs (variant families). */
export const useMergedContentList = (payload, productIds) => {
  const ids = [...new Set((productIds || []).map(String).filter(Boolean))];
  const base = { ...payload };
  delete base.productId;

  const single = useGetContentList(
    ids.length === 1 ? { ...base, productId: ids[0] } : base,
    { enabled: ids.length <= 1 }
  );

  const multi = useQueries({
    queries: (ids.length > 1 ? ids : []).map((id) => ({
      queryKey: ["content-list", { ...base, productId: id }],
      queryFn: () => getContentList({ ...base, productId: id }),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60 * 2,
    })),
  });

  if (ids.length > 1) {
    const seen = new Set();
    const items = [];
    let count = 0;
    let pages = 1;
    for (const q of multi) {
      const list = unwrapList(q.data);
      count += list.count;
      pages = Math.max(pages, list.pages || 1);
      for (const item of list.items) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        items.push(item);
      }
    }
    return {
      items,
      count,
      pages,
      isLoading: multi.some((q) => q.isLoading),
      isFetching: multi.some((q) => q.isFetching),
      isError: multi.some((q) => q.isError),
      refetch: () => Promise.all(multi.map((q) => q.refetch())),
    };
  }

  const list = unwrapList(single.data);
  return {
    ...list,
    isLoading: single.isLoading,
    isFetching: single.isFetching,
    isError: single.isError,
    refetch: single.refetch,
  };
};

const contentCommentsKey = (id) => ["content-comments", id];

export const useContentComments = (id) =>
  useQuery({
    queryKey: id != null && id !== "" ? contentCommentsKey(id) : ["content-comments", "none"],
    queryFn: async () => {
      const res = await getContentComments(id);
      const inner = res?.data?.data;
      return Array.isArray(inner) ? inner : inner?.data ?? [];
    },
    enabled: id != null && id !== "",
    staleTime: 1000 * 15,
  });

export const useCreateContentComment = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createContentComment(id, payload),
    onSuccess: () => {
      if (id != null && id !== "") {
        qc.invalidateQueries({ queryKey: contentCommentsKey(id) });
      }
    },
  });
};

export const useCreateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await createContent(payload);
      const mapped = unwrapDetail(res);
      if (mapped) return mapped;
      const raw = res?.data?.data ?? res?.data;
      if (raw?.id == null) return null;
      return {
        id: raw.id,
        title: raw.title || payload.title,
        thumbnail: raw.thumbnailImage || raw.images?.[0]?.url || "",
        videoUrl: raw.videos?.[0]?.url || null,
        type: payload.contentType === "video" ? "Video" : "Photo",
        status: "Pending Approval",
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-list"] });
      qc.invalidateQueries({ queryKey: ["content-discovery-feed"] });
    },
  });
};

export const useUpdateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) =>
      unwrapDetail(await updateContent(id, payload)),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["content-list"] });
      qc.invalidateQueries({ queryKey: ["content-discovery-feed"] });
      qc.invalidateQueries({ queryKey: ["content", variables.id] });
      qc.invalidateQueries({ queryKey: contentCommentsKey(variables.id) });
    },
  });
};
