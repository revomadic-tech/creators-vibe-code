import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Discovery from "./pages/Discovery";
import Briefs from "./pages/Briefs";
import Galleries from "./pages/Galleries";
import BrandGuidelines from "./pages/BrandGuidelines";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { AuthGuard, GuestGuard, ManagerGuard } from "./components/auth/AuthGuard";

function RedirectDiscovery() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: "/", search }} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestGuard>
              <Login />
            </GuestGuard>
          }
        />
        <Route
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route index element={<Discovery />} />
          <Route path="discovery" element={<RedirectDiscovery />} />
          <Route path="briefs" element={<Briefs />} />
          <Route path="galleries" element={<Galleries />} />
          <Route path="brand" element={<BrandGuidelines />} />
          <Route path="settings" element={<Settings />} />
          <Route
            path="admin"
            element={
              <ManagerGuard>
                <Admin />
              </ManagerGuard>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
