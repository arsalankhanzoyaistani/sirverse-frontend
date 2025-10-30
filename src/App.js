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

import Posts from "./pages/Posts";
import Reels from "./pages/Reels";
import Dashboard from "./pages/Dashboard";
import SendOTP from "./pages/SendOTP";
import VerifyOTP from "./pages/VerifyOTP";
import Profile from "./pages/Profile";
import AI from "./pages/AI";
import Chats from "./pages/Chats"; 
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import LikedPosts from "./pages/LikedPosts";
import SavedPosts from "./pages/SavedPosts";
import Settings from "./pages/Settings";
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import BlockedUsers from './pages/BlockedUsers'; 

/* 🌈 Premium Animated Page Wrapper */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/posts" replace />} />

        {[
          ["/posts", <Posts />],
          ["/dashboard", <Dashboard />],
          ["/history", <History />],
          ["/liked-posts", <LikedPosts />],
          ["/saved-posts", <SavedPosts />],
          ["/settings", <Settings />],
          ["/privacy", <PrivacyPolicy />],
          ["/terms", <TermsOfService />],
          ["/ai", <AI />],
          ["/chats", <Chats />],
          ["/profile/:username", <Profile />],
          ["/send-otp", <SendOTP />],
          ["/verify-otp", <VerifyOTP />],
          ["/tools", <Posts />], // Temporary - replace later with real Tools component
          ["/reels", <Reels />], // ✅ Now points to actual Reels component
          ["/trends", <Posts />],  // Temporary-removed  will be added Slater
          ["/legal/terms", <TermsOfService />], 
          ["/legal/privacy", <PrivacyPolicy />],    
          ["/blocks", <BlockedUsers />],      
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

        {/* 🧭 Top Navigation */}
        {!isChatPage && <TopNav />}

        {/* 🧩 Premium Dynamic Page Area */}
        <main
          className={`flex-1 relative ${
            isChatPage
              ? "w-full max-w-none p-0 bg-white" // full-screen chat
              : "max-w-3xl mx-auto px-4 pb-20 pt-4" // optimized for mobile
          }`}
        >
          <AnimatedRoutes />
        </main>

        {/* 🧭 Bottom Navigation */}
        {!isChatPage && <BottomNav />}
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
