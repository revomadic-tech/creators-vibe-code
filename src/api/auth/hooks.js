import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, logout } from "./index";
import { formatError } from "../../lib/apiError";
import useAuth from "../../hooks/useAuth";

function parseAuthPayload(data) {
  if (!data || typeof data !== "object") return null;
  const candidates = [data.data?.data, data.data, data];
  for (const payload of candidates) {
    if (!payload || typeof payload !== "object") continue;
    const accessToken =
      (typeof payload.accessToken === "string" && payload.accessToken) ||
      (typeof payload.token === "string" && payload.token) ||
      "";
    if (!accessToken) continue;
    const { accessToken: _a, token: _t, refreshToken: _r, ...user } = payload;
    return { accessToken, user };
  }
  return null;
}

export const useLogin = () => {
  const { onLogin } = useAuth();
  return useMutation({
    mutationFn: async (data) => {
      const res = await login(data);
      const parsed = parseAuthPayload(res);
      if (!parsed) {
        throw new Error("Signed in, but the session response was invalid");
      }
      return parsed;
    },
    onSuccess: (parsed) => {
      onLogin(parsed.accessToken, parsed.user);
    },
  });
};

export const useLogout = () => {
  const { onLogout } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await logout();
      } catch {
        // Still clear the local session if the API call fails.
      }
    },
    onSettled: () => {
      queryClient.clear();
      onLogout();
    },
  });
};

export { formatError };
