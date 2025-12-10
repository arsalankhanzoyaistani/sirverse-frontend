// frontend/src/components/BottomNav.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/posts", icon: "🏠", activeIcon: "🏠" },
    { path: "/friends", icon: "👥",  activeIcon: "👥" },
    { path: "/reels", icon: "🎬",  activeIcon: "🎬" },
    { path: "/chats", icon: "💬",  activeIcon: "💬" },
    { path: "/ai", icon: "🤖", activeIcon: "🤖" },
  ];

  const isActive = (path) => {
    if (path === "/posts") return location.pathname === "/posts";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <span className="text-2xl mb-1">
                  {active ? item.activeIcon : item.icon}
                </span>
                <span className={`text-xs font-medium ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
