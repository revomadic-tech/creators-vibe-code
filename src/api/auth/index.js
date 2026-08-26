import ApiClient from "../client";

export const login = async (data) =>
  await ApiClient.post(`/auth/login`, data, { withCredentials: true });

export const refreshToken = async () =>
  await ApiClient.post(`/auth/refresh-token`, {}, { withCredentials: true });

export const logout = async () =>
  await ApiClient.post(`/auth/logout`, {}, { withCredentials: true });
