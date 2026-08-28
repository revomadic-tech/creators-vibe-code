import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useAccountType } from "../../hooks/useAccountType";

const RETURN_KEY = "revo:returnTo";

export function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();
  const { pathname, search } = useLocation();

  if (!isAuthenticated) {
    const next = `${pathname}${search}`;
    if (next && next !== "/login") sessionStorage.setItem(RETURN_KEY, next);
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function ManagerGuard({ children }) {
  const { isManager } = useAccountType();
  if (!isManager) return <Navigate to="/" replace />;
  return children;
}

export function GuestGuard({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    const to = sessionStorage.getItem(RETURN_KEY) || "/";
    sessionStorage.removeItem(RETURN_KEY);
    return <Navigate to={to} replace />;
  }
  return children;
}
