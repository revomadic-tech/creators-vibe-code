import { useState } from "react";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Moon,
  Command,
} from "lucide-react";
import { currentUser, notifications } from "../../data/mockData";

export default function TopNav({ pageTitle }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.06] bg-surface-800/60 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-base font-bold text-white tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        <div
          className={`relative flex items-center transition-all duration-300 ${
            searchFocused ? "w-80" : "w-64"
          }`}
        >
          <Search
            size={14}
            className="absolute left-3.5 text-white/25 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search assets, briefs, people..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-2 pl-9 pr-12 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/15 focus:bg-white/[0.06] transition-all duration-200"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute right-3 flex items-center gap-0.5 px-1.5 py-0.5 bg-white/[0.04] rounded text-white/15">
            <Command size={10} />
            <span className="text-[10px] font-mono">K</span>
          </div>
        </div>

        <button className="relative p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
          <Plus size={17} strokeWidth={2} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full pulse-dot" />
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-11 w-80 bg-surface-700 border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden fade-in">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-white">
                    Notifications
                  </span>
                  <span className="text-[10px] text-accent-red font-semibold px-2 py-0.5 bg-accent-red/10 rounded-full">
                    {unreadCount} new
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer ${
                        !n.read ? "bg-white/[0.015]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!n.read && (
                          <div className="w-1.5 h-1.5 bg-accent-red rounded-full mt-1.5 flex-shrink-0" />
                        )}
                        <div className={!n.read ? "" : "pl-[18px]"}>
                          <p className="text-[13px] text-white/70 leading-snug">
                            {n.message}
                          </p>
                          <p className="text-[11px] text-white/25 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <button className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
          <Moon size={17} />
        </button>

        <div className="w-px h-5 bg-white/[0.06] mx-1" />

        <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-white/[0.06] transition-all duration-200">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-lg object-cover"
          />
          <div className="text-left hidden xl:block">
            <p className="text-[13px] font-medium text-white leading-none">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">
              {currentUser.workspace}
            </p>
          </div>
          <ChevronDown size={13} className="text-white/25 hidden xl:block" />
        </button>
      </div>
    </header>
  );
}
