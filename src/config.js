const PRODUCTION_API_URL = "https://createapi.wolfstudios.ai/api";

function isLocalHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

function useSameOriginProxy() {
  if (import.meta.env.DEV) return true;
  if (typeof window === "undefined") return false;
  return isLocalHost(window.location.hostname);
}

// createapi only allowlists https://create.revomadic.com for CORS.
// Local browsers must stay same-origin and go through the Vite /api proxy.
const envUrl = import.meta.env.VITE_BASE_URL;

export const BASE_URL = useSameOriginProxy()
  ? envUrl && envUrl.startsWith("/")
    ? envUrl
    : "/api"
  : envUrl || PRODUCTION_API_URL;

export const ADMIN_APP_URL = "https://admin.revomadic.com";

export const adminDiscoveryUrl = (id) =>
  `${ADMIN_APP_URL}/admin/content/discovery?id=${id}`;

export const adminBriefUrl = (id) =>
  `${ADMIN_APP_URL}/admin/campaigns/brief/${encodeURIComponent(id)}`;
