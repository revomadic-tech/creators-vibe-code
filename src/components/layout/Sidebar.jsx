import { NavLink } from "react-router-dom";
import {
  Compass,
  FileText,
  Images,
  BookOpen,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", icon: Compass, label: "Discovery" },
  { to: "/briefs", icon: FileText, label: "Briefs" },
  { to: "/galleries", icon: Images, label: "Galleries" },
  { to: "/brand", icon: BookOpen, label: "Brand" },
];

const bottomItems = [
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/help", icon: HelpCircle, label: "Help" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col glass-panel border-r border-white/[0.08] transition-all duration-300 ease-out ${
        collapsed ? "w-[68px]" : "w-[220px]"
      }`}
    >
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-sm tracking-tight">R</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-[13px] font-bold tracking-tight text-white truncate">
              REVO CREATE
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex-shrink-0">
                  <item.icon
                    size={19}
                    strokeWidth={isActive ? 2 : 1.6}
                    className={isActive ? "text-accent-red" : ""}
                  />
                  {isActive && (
                    <div className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent-red rounded-r-full" />
                  )}
                </div>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="py-3 px-3 space-y-0.5 border-t border-white/[0.06] flex-shrink-0">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200"
          >
            <item.icon size={17} strokeWidth={1.5} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all duration-200 w-full"
        >
          {collapsed ? (
            <ChevronRight size={17} />
          ) : (
            <ChevronLeft size={17} />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
