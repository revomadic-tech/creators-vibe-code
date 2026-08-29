import { useQuery } from "@tanstack/react-query";
import { getBrief, listBriefs } from "./index";

export const useGetAssignedEditorBriefs = () =>
  useQuery({
    queryKey: ["briefs", "editor"],
    queryFn: () => listBriefs({ briefType: "editor" }),
    staleTime: 1000 * 30,
  });

export const useGetBrief = (id) =>
  useQuery({
    queryKey: ["brief", id],
    queryFn: () => getBrief(id),
    enabled: Boolean(id),
  });
