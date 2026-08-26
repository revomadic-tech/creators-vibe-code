import { createContext, useState } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  token: null,
  user: null,
  onLogin: () => {},
  onLogout: () => {},
  onSetUser: () => {},
});

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const [user, setUser] = useState(readStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("accessToken"))
  );

  const onLogin = (accessToken, nextUser) => {
    setToken(accessToken);
    setUser(nextUser);
    setIsAuthenticated(true);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  const onLogout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  const onSetUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        onLogin,
        onLogout,
        onSetUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
