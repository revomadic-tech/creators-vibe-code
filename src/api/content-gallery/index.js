import ApiClient from "../client";

const BASE_URL = "/content-galleries";

export const listGalleries = async () => await ApiClient.get(BASE_URL);

export const createGallery = async (payload) =>
  await ApiClient.post(BASE_URL, payload);

export const addAssetsToGallery = async (id, assetIds) =>
  await ApiClient.post(`${BASE_URL}/${id}/assets`, { assetIds });
