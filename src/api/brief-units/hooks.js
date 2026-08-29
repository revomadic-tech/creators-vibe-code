import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptEdit,
  getBriefUnits,
  getUnitEvents,
  postUnitEvent,
  setUnitBrolls,
  setUnitContent,
  submitUnit,
} from "./index";

export const useGetBriefUnits = (briefId) =>
  useQuery({
    queryKey: ["brief-units", briefId],
    queryFn: () => getBriefUnits(briefId),
    enabled: Boolean(briefId),
  });

function useInvalidateUnits(briefId) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ["brief-units", briefId] });
}

export const useSetUnitContent = (briefId) => {
  const invalidate = useInvalidateUnits(briefId);
  return useMutation({
    mutationFn: ({ unitId, urls }) => setUnitContent(unitId, urls),
    onSuccess: invalidate,
  });
};

export const useSetUnitBrolls = (briefId) => {
  const invalidate = useInvalidateUnits(briefId);
  return useMutation({
    mutationFn: ({ unitId, urls }) => setUnitBrolls(unitId, urls),
    onSuccess: invalidate,
  });
};

export const useSubmitUnit = (briefId) => {
  const invalidate = useInvalidateUnits(briefId);
  return useMutation({
    mutationFn: (unitId) => submitUnit(unitId),
    onSuccess: invalidate,
  });
};

export const useAcceptEdit = (briefId) => {
  const invalidate = useInvalidateUnits(briefId);
  return useMutation({
    mutationFn: (unitId) => acceptEdit(unitId),
    onSuccess: invalidate,
  });
};

export const useGetUnitEvents = (unitId) =>
  useQuery({
    queryKey: ["brief-unit-events", unitId],
    queryFn: () => getUnitEvents(unitId),
    enabled: Boolean(unitId),
  });

export const usePostUnitEvent = (unitId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message) => postUnitEvent(unitId, message),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["brief-unit-events", unitId] }),
  });
};
