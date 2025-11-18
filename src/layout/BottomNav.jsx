import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function BottomNav() {
  const loc = useLocation();
  const active = (path) =>
    loc.pathname.startsWith(path)
      ? "text-purple-400 border-t-2 border-purple-400"
      : "text-gray-400 hover:text-purple-300";

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-4 left-0 right-0 z-50"
    >
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass-card flex justify-around py-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <Link to="/posts" className={`flex flex-col items-center gap-1 ${active("/posts")}`}>
            <span className="text-lg">🏠</span>
            <span className="text-xs font-medium">Posts</span>
          </Link>
          <Link to="/tools" className={`flex flex-col items-center gap-1 ${active("/tools")}`}>
            <span className="text-lg">🧰</span>
            <span className="text-xs font-medium">Tools</span>
          </Link>
          <Link to="/ai" className={`flex flex-col items-center gap-1 ${active("/ai")}`}>
            <span className="text-lg">🤖</span>
            <span className="text-xs font-medium">AI</span>
          </Link>
          <Link to="/chats" className={`flex flex-col items-center gap-1 ${active("/chats")}`}>
            <span className="text-lg">💬</span>
            <span className="text-xs font-medium">Chats</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
