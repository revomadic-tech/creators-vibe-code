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
        // Keep the session. Sign-out is only from the Sign out button.
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default ApiClient;
