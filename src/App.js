// frontend/src/App.js - UPDATED ROUTING
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import SplashScreen from "./components/ui/SplashScreen";
import TopNav from "./components/TopNav";
import BottomNav from "./components/BottomNav";

// Import NEW authentication pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Import existing pages
import Posts from "./pages/Posts";
import Reels from "./pages/Reels";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AI from "./pages/AI";
import Chats from "./pages/Chats"; 
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import LikedPosts from "./pages/LikedPosts";
import SavedPosts from "./pages/SavedPosts";
import Settings from "./pages/Settings";
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import BlockedUsers from './pages/BlockedUsers';

// Remove old OTP pages:
// import SendOTP from "./pages/SendOTP";
// import VerifyOTP from "./pages/VerifyOTP";

/* 🌈 Premium Animated Page Wrapper */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/posts" replace />} />

        {/* NEW AUTHENTICATION ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* REMOVE OLD OTP ROUTES */}
        {/* <Route path="/send-otp" element={<SendOTP />} /> */}
        {/* <Route path="/verify-otp" element={<VerifyOTP />} /> */}

        {[
          ["/posts", <Posts />],
          ["/dashboard", <Dashboard />],
          ["/history", <History />],
          ["/liked-posts", <LikedPosts />],
          ["/saved-posts", <SavedPosts />],
          ["/settings", <Settings />],
          ["/ai", <AI />],
          ["/chats", <Chats />],
          ["/profile/:username", <Profile />],
          ["/tools", <Posts />], // Temporary - replace later with real Tools component
          ["/reels", <Reels />],
          ["/trends", <Posts />], // Temporary - will be removed later
          ["/privacy-policy", <PrivacyPolicy />],
          ["/terms-of-service", <TermsOfService />],
          ["/blocked-users", <BlockedUsers />],
        ].map(([path, element]) => (
          <Route
            key={path}
            path={path}
            element={
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1],
                  scale: { duration: 0.3 },
                }}
                className="fade-in"
              >
                {element}
              </motion.div>
            }
          />
        ))}

        <Route
          path="*"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <NotFound />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

/* 💎 Premium Layout Wrapper */
function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/login") || 
                     location.pathname.startsWith("/register");
  const isChatPage = location.pathname.startsWith("/chats");

  return (
    <>
      <SplashScreen />

      {/* 🌟 Light Theme Background */}
      <div className="relative min-h-screen overflow-hidden text-gray-900 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        
        {/* ✨ Subtle Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* 🧭 Top Navigation - Hide on auth pages */}
        {!isAuthPage && !isChatPage && <TopNav />}

        {/* 🧩 Premium Dynamic Page Area */}
        <main
          className={`flex-1 relative ${
            isChatPage
              ? "w-full max-w-none p-0 bg-white" // full-screen chat
              : isAuthPage
              ? "w-full max-w-none" // full-screen auth
              : "max-w-3xl mx-auto px-4 pb-20 pt-4" // optimized for mobile
          }`}
        >
          <AnimatedRoutes />
        </main>

        {/* 🧭 Bottom Navigation - Hide on auth and chat pages */}
        {!isAuthPage && !isChatPage && <BottomNav />}
      </div>
    </>
  );
}

/* 🚀 Premium Main App Component */
export default function App() {
  return (
    <Router>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <AppLayout />
      </motion.div>
    </Router>
  );
}