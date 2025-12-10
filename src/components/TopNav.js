// frontend/src/components/TopNav.js
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Avatar from "./ui/Avatar";
import SearchBar from "./SearchBar";

export default function TopNav() {
  const username = localStorage.getItem("username");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    window.location.href = "/login";
  }

  return (
    <header className="top-nav">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/posts" className="app-logo">
          <div className="logo-wrapper">
            <img
              src="/logo.png"
              alt="SirVerse Logo"
              className="logo-image"
            />
            <div className="logo-glow"></div>
          </div>
          
        </Link>

        {/* SearchBar */}
        <div className="search-container">
          <SearchBar />
        </div>

        {/* Profile Dropdown */}
        <div className="profile-dropdown" ref={dropdownRef}>
          {username ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="profile-button"
              >
                <Avatar src={null} emoji="👤" size={40} glow={true} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="user-info">
                    <div className="user-name">@{username}</div>
                    <div className="user-status">View your profile</div>
                  </div>

                  <div className="menu-items">
                    <Link to="/dashboard" className="menu-item" onClick={() => setDropdownOpen(false)}>
                      <span className="menu-icon">📊</span>
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/history" className="menu-item" onClick={() => setDropdownOpen(false)}>
                      <span className="menu-icon">🕒</span>
                      <span>History</span>
                    </Link>
                    <Link to="/liked-posts" className="menu-item" onClick={() => setDropdownOpen(false)}>
                      <span className="menu-icon">❤️</span>
                      <span>Liked Posts</span>
                    </Link>
                    <Link to="/saved-posts" className="menu-item" onClick={() => setDropdownOpen(false)}>
                      <span className="menu-icon">📁</span>
                      <span>Saved Posts</span>
                    </Link>

                    <div className="menu-divider"></div>

                    <Link to="/settings" className="menu-item" onClick={() => setDropdownOpen(false)}>
                      <span className="menu-icon">⚙️</span>
                      <span>Settings</span>
                    </Link>
                    <Link to="/privacy-policy" className="menu-item" onClick={() => setDropdownOpen(false)}>
                      <span className="menu-icon">📄</span>
                      <span>Privacy & Terms</span>
                    </Link>

                    <button onClick={handleLogout} className="menu-item logout-item">
                      <span className="menu-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .top-nav {
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 100;
        }

        .nav-container {
          max-width: 414px;
          margin: 0 auto;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .app-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-wrapper {
          position: relative;
          width: 48px;
          height: 48px;
        }

        .logo-image {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .logo-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, #1B4B5A, #4ECDC4);
          border-radius: 16px;
          filter: blur(8px);
          opacity: 0.3;
          z-index: -1;
          animation: logoGlow 2s ease-in-out infinite alternate;
        }

        @keyframes logoGlow {
          from { opacity: 0.3; }
          to { opacity: 0.5; }
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .app-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #1B4B5A, #4ECDC4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .app-subtitle {
          font-size: 10px;
          color: #666;
          letter-spacing: 0.5px;
        }

        .search-container {
          flex: 1;
          min-width: 0;
        }

        .profile-dropdown {
          position: relative;
          flex-shrink: 0;
        }

        .profile-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .profile-button:hover {
          transform: scale(1.1);
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 260px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          z-index: 1000;
          animation: dropdownFade 0.3s ease;
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-info {
          padding: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #1B4B5A, #4ECDC4);
          color: white;
        }

        .user-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .user-status {
          font-size: 12px;
          opacity: 0.9;
        }

        .menu-items {
          padding: 8px 0;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 20px;
          background: none;
          border: none;
          text-decoration: none;
          color: #2C3E50;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .menu-item:hover {
          background: rgba(27, 75, 90, 0.05);
        }

        .menu-icon {
          font-size: 20px;
          width: 24px;
          text-align: center;
        }

        .menu-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 8px 20px;
        }

        .logout-item {
          color: #FF6B6B;
        }

        .login-button {
          background: linear-gradient(135deg, #1B4B5A, #4ECDC4);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .login-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(27, 75, 90, 0.2);
        }
      `}</style>
    </header>
  );
}
