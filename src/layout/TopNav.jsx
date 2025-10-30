import React from "react";
import { Link } from "react-router-dom";

export default function TopNav() {
  const username = localStorage.getItem("username");

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    window.location.href = "/send-otp";
  }

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/10 backdrop-blur-lg">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 🔹 Logo + Title */}
        <Link to="/posts" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-glow">
            SV
          </div>
          <div>
            <div className="font-semibold text-white neon-text text-lg">
              SirVerse GPT
            </div>
            <div className="text-xs text-gray-400">Learn • Teach • Share</div>
          </div>
        </Link>

        {/* 🔹 Links */}
        <div className="flex items-center gap-4 text-sm">
          <Link className="text-gray-300 hover:text-purple-400 transition" to="/ai">
            AI
          </Link>
          <Link className="text-gray-300 hover:text-purple-400 transition" to="/chats">
            Chats
          </Link>
          {username ? (
            <>
              <Link className="text-gray-300 hover:text-purple-400 transition" to="/dashboard">
                Dashboard
              </Link>
              <Link className="text-gray-300 hover:text-purple-400 transition" to={`/profile/${username}`}>
                Profile
              </Link>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition">
                Logout
              </button>
            </>
          ) : (
            <Link className="text-gray-300 hover:text-purple-400 transition" to="/send-otp">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
