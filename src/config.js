const PRODUCTION_API_URL = "https://createapi.wolfstudios.ai/api";

// Dev goes through the Vite proxy so the browser stays same-origin.
// createapi only allowlists https://create.revomadic.com for CORS.
export const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  (import.meta.env.DEV ? "/api" : PRODUCTION_API_URL);

export const ADMIN_APP_URL = "https://admin.revomadic.com";

export const adminDiscoveryUrl = (id) =>
  `${ADMIN_APP_URL}/admin/content/discovery?id=${id}`;
