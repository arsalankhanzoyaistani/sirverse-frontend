// frontend/src/components/TopNav.js - UPDATED FOR NEW AUTH SYSTEM
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Avatar from "./ui/Avatar";

export default function TopNav() {
  const username = localStorage.getItem("username");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    // Clear localStorage for new authentication system
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    
    // Redirect to login page
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-40">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left Side: Logo with your image */}
        <Link to="/posts" className="flex items-center gap-2">
          <div className="relative">
            {/* Your Logo Image */}
            <img
              src="/logo.png"
              alt="SirVerse Logo"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-lg"
            />
            {/* Optional Glow Effect */}
            <div className="absolute inset-0 bg-blue-400/30 rounded-2xl blur-md -z-10 animate-pulse"></div>
          </div>
          
          {/* Logo Text */}
          <div className="hidden sm:block">
            <div className="font-bold text-gray-900 text-lg leading-tight">SirVerse</div>
            <div className="text-xs text-gray-500 leading-tight">Connect & Share</div>
          </div>
        </Link>

        {/* Right Side: Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          {username ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Avatar 
                  src={null} 
                  emoji="👤" 
                  size={40} 
                  glow={false}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold text-gray-900">@{username}</div>
                    <div className="text-sm text-gray-500">View your profile</div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="text-xl">📊</span>
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/history"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="text-xl">🕒</span>
                      <span>History</span>
                    </Link>

                    <Link
                      to="/liked-posts"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="text-xl">❤️</span>
                      <span>Liked Posts</span>
                    </Link>

                    <Link
                      to="/saved-posts"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="text-xl">📁</span>
                      <span>Saved Posts</span>
                    </Link>

                    <div className="border-t border-gray-100 my-2"></div>

                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="text-xl">⚙️</span>
                      <span>Settings</span>
                    </Link>

                    <Link
                      to="/privacy-policy"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="text-xl">📄</span>
                      <span>Privacy & Terms</span>
                    </Link>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <span className="text-xl">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
