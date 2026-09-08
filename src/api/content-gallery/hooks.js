import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAssetsToGallery, createGallery, listGalleries } from "./index";

export const useGetGalleries = () => {
  return useQuery({
    queryKey: ["content-galleries"],
    queryFn: () => listGalleries(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateGallery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGallery,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["content-galleries"] }),
  });
};

export const useAddAssetsToGallery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assetIds }) => addAssetsToGallery(id, assetIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["content-galleries"] }),
  });
};
