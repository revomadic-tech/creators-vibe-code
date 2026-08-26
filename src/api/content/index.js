import ApiClient from "../client";

const BASE_URL = "/contents";

const cleanParams = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );

export const getContentList = async (payload) => {
  const params = new URLSearchParams(cleanParams(payload));
  return await ApiClient.get(`${BASE_URL}?${params.toString()}`);
};

export const getContentDiscoveryFeed = async () =>
  await ApiClient.get(`${BASE_URL}/discovery`);

export const getContentById = async (id) =>
  await ApiClient.get(`${BASE_URL}/${id}`);
