import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Discovery from "./pages/Discovery";
import Briefs from "./pages/Briefs";
import Galleries from "./pages/Galleries";
import BrandGuidelines from "./pages/BrandGuidelines";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="briefs" element={<Briefs />} />
          <Route path="galleries" element={<Galleries />} />
          <Route path="brand" element={<BrandGuidelines />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
