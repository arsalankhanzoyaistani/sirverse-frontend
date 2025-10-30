import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const loc = useLocation();

  // helper to detect active route
  const active = (path) =>
    loc.pathname.startsWith(path)
      ? "text-blue-500 scale-110"
      : "text-gray-400 hover:text-gray-600";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-lg">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-around py-3">
          {/* Posts - Home Icon */}
          <Link
            to="/posts"
            className={`flex flex-col items-center transition-all duration-300 ${active("/posts")}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </Link>

          {/* Chats - Message Icon */}
          <Link
            to="/chats"
            className={`flex flex-col items-center transition-all duration-300 ${active("/chats")}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </Link>

          {/* Reels - Video Icon */}
          <Link
            to="/reels"
            className={`flex flex-col items-center transition-all duration-300 ${active("/reels")}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </Link>

          {/* AI - Brain/Sparkle Icon */}
          <Link
            to="/ai"
            className={`flex flex-col items-center transition-all duration-300 ${active("/ai")}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="m19.46 8l.79-1.75L22 5.46c.39-.18.39-.73 0-.91l-1.75-.79L19.46 2c-.18-.39-.73-.39-.91 0l-.79 1.75-1.76.79c-.39.18-.39.73 0 .91l1.75.79.79 1.76c.18.39.74.39.92 0zM11.5 9.5L9.91 6c-.35-.78-1.47-.78-1.82 0L6.5 9.5 3 11.09c-.78.36-.78 1.47 0 1.82l3.5 1.59L8.09 18c.36.78 1.47.78 1.82 0l1.59-3.5 3.5-1.59c.78-.36.78-1.47 0-1.82L11.5 9.5zm7.04 6.5l-.79 1.75-1.75.79c-.39.18-.39.73 0 .91l1.75.79.79 1.76c.18.39.73.39.91 0l.79-1.75 1.76-.79c.39-.18.39-.73 0-.91l-1.75-.79-.79-1.76c-.18-.39-.74-.39-.92 0z"/>
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
