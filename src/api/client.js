import axios from "axios";
import { BASE_URL } from "../config";

const ApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "application/json",
  },
  withCredentials: true,
});

ApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

ApiClient.interceptors.response.use(
  (response) => response,
  async function (error) {
    const originalRequest = error?.config;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh-token");

    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      originalRequest._retry = true;
      try {
        const result = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = result?.data?.data?.accessToken;
        if (!newToken)
          throw new Error("Missing access token in refresh response");
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return ApiClient(originalRequest);
      } catch (refreshError) {
        const refreshStatus = refreshError?.response?.status;
        const sessionDead = refreshStatus === 401 || refreshStatus === 403;
        // Proxy/DNS/5xx failures must not wipe the session — Discovery
        // would empty out and dump the user on /login.
        if (sessionDead) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          if (!window.location.pathname.startsWith("/login")) {
            window.location.assign("/login");
          }
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default ApiClient;
