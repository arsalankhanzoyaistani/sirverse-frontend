import React, { useState, useEffect } from "react";
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

import Login from "./pages/Login";
import Register from "./pages/Register";
import FriendRequests from "./pages/FriendRequests";
import FriendsList from "./pages/FriendsList";
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

import "./styles/global.css";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/friend-requests" element={<FriendRequests />} />
        <Route path="/friends" element={<FriendsList />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/liked-posts" element={<LikedPosts />} />
        <Route path="/saved-posts" element={<SavedPosts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/blocked-users" element={<BlockedUsers />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/login") || 
                     location.pathname.startsWith("/register");
  const isChatPage = location.pathname.startsWith("/chats");

  return (
    <>
      <SplashScreen />
      
      {/* Aurora Background */}
      <div className="aurora-bg"></div>

      <div className="app-container">
        {/* Top Navigation */}
        {!isAuthPage && !isChatPage && <TopNav />}

        {/* Main Content */}
        <main className={`main-container ${
          isChatPage
            ? "chat-layout"
            : isAuthPage
            ? "auth-layout"
            : "default-layout"
        }`}>
          <AnimatedRoutes />
        </main>

        {/* Bottom Navigation */}
        {!isAuthPage && !isChatPage && <BottomNav />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
