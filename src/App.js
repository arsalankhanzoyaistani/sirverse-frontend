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
import ProfilePage from './pages/ProfilePage'; // For viewing other users' profiles
import Posts from "./pages/Posts";
import Reels from "./pages/Reels";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyProfile from "./pages/Profile"; // Renamed to avoid conflict
import AI from "./pages/AI";
import Chats from "./pages/Chats";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import LikedPosts from "./pages/LikedPosts";
import SavedPosts from "./pages/SavedPosts";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import BlockedUsers from "./pages/BlockedUsers";

/* 🌈 Animated Page Routes with Auth Control */
function AnimatedRoutes() {
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 🧭 Default route */}
        <Route
          path="/"
          element={
            token ? <Navigate to="/posts" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* 🔐 Auth routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* 🌍 Protected routes (only for logged in users) */}
        {token ? (
          <>
            {/* Main navigation */}
            <Route path="/posts" element={<Posts />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Profile routes - FIXED: No conflict */}
            <Route path="/profile/:username" element={<ProfilePage />} /> {/* View other users */}
            <Route path="/my-profile" element={<MyProfile />} /> {/* View own profile */}
            
            {/* Settings & additional pages */}
            <Route path="/history" element={<History />} />
            <Route path="/liked-posts" element={<LikedPosts />} />
            <Route path="/saved-posts" element={<SavedPosts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/trends" element={<Posts />} />
            <Route path="/blocked-users" element={<BlockedUsers />} />
            
            {/* Legal pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          /* 🔒 Redirect unauthenticated users to login */
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </AnimatePresence>
  );
}

/* 🎨 Main App with Layout */
function AppContent() {
  const location = useLocation();
  const token = localStorage.getItem("access_token");
  
  // Don't show nav on auth pages
  const showNavigation = token && !["/login", "/register"].includes(location.pathname);
  
  // Don't show bottom nav on these pages
  const showBottomNav = showNavigation && !["/chats", "/ai", "/settings"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      {showNavigation && <TopNav />}
      
      {/* Main Content */}
      <main className={showNavigation ? "pb-16 pt-14" : ""}>
        <AnimatedRoutes />
      </main>
      
      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}

/* 🚀 Root App Component */
export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // 2 second splash screen

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}