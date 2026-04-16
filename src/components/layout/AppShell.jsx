import { Outlet } from "react-router-dom";
import FloatingNav from "./FloatingNav";

export default function AppShell() {
  return (
    <div className="h-screen overflow-hidden lustrous-bg">
      <FloatingNav />
      <main className="relative z-10 h-full overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
