import { useQuery } from "@tanstack/react-query";
import { listGalleries } from "./index";

export const useGetGalleries = () => {
  return useQuery({
    queryKey: ["content-galleries"],
    queryFn: () => listGalleries(),
    staleTime: 1000 * 60 * 5,
  });
};
