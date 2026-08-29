import ApiClient from "../client";

export const getBriefUnits = async (briefId) =>
  await ApiClient.get(`/brief-units/brief/${briefId}`);

export const setUnitContent = async (unitId, urls) =>
  await ApiClient.patch(`/brief-units/${unitId}/content`, { urls });

export const setUnitBrolls = async (unitId, urls) =>
  await ApiClient.patch(`/brief-units/${unitId}/brolls`, { urls });

export const submitUnit = async (unitId) =>
  await ApiClient.post(`/brief-units/${unitId}/submit`, {});

export const acceptEdit = async (unitId) =>
  await ApiClient.post(`/brief-units/${unitId}/accept-edit`, {});

export const getUnitEvents = async (unitId) =>
  await ApiClient.get(`/brief-units/${unitId}/events`);

export const postUnitEvent = async (unitId, message) =>
  await ApiClient.post(`/brief-units/${unitId}/events`, { message });
