import ApiClient from "../client";

const BASE_URL = "/content-galleries";

export const listGalleries = async () => await ApiClient.get(BASE_URL);
