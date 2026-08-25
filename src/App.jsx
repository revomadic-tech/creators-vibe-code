import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Discovery from "./pages/Discovery";
import Briefs from "./pages/Briefs";
import Galleries from "./pages/Galleries";
import BrandGuidelines from "./pages/BrandGuidelines";
import Admin from "./pages/Admin";

function RedirectDiscovery() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: "/", search }} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Discovery />} />
          <Route path="discovery" element={<RedirectDiscovery />} />
          <Route path="briefs" element={<Briefs />} />
          <Route path="galleries" element={<Galleries />} />
          <Route path="brand" element={<BrandGuidelines />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
