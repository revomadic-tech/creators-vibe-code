import ApiClient from "../client";

export const createPresignedUploads = async (payload) =>
  await ApiClient.post("/uploads", payload);
