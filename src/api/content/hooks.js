import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";
import {
  getContentById,
  getContentDiscoveryFeed,
  getContentList,
} from "./index";
import { unwrapList } from "../../lib/mapContentAsset";

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
    };
  }

  const list = unwrapList(single.data);
  return {
    ...list,
    isLoading: single.isLoading,
    isFetching: single.isFetching,
  };
};
