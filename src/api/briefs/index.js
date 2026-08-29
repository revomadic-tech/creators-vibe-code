import ApiClient from "../client";

const BASE_URL = "/briefs";

export const listBriefs = async (payload = {}) => {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined && v !== null && v !== ""),
    ),
  );
  const qs = params.toString();
  return await ApiClient.get(qs ? `${BASE_URL}?${qs}` : BASE_URL);
};

export const getBrief = async (id) => await ApiClient.get(`${BASE_URL}/${id}`);
