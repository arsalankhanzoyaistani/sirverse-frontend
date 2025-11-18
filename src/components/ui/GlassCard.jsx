import React from "react";
import { motion } from "framer-motion";

/**
 * 💎 Modern GlassCard Component
 * Clean design for light theme
 */
export default function GlassCard({ children, className = "", hover = true, intensity = "medium" }) {
  const intensityStyles = {
    low: "shadow-sm",
    medium: "shadow-md",
    high: "shadow-lg"
  };

  return (
    <motion.div
      whileHover={
        hover
          ? {
              scale: 1.02,
              y: -2,
            }
          : {}
      }
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className={`
        relative p-6 rounded-2xl border border-gray-100 backdrop-blur-sm
        bg-white/80
        ${intensityStyles[intensity]}
        overflow-hidden group
        transition-all duration-300 ${className}
      `}
    >
      {/* Inner content */}
      <div className="relative z-10 text-gray-900">{children}</div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-tl-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-50 to-transparent rounded-br-2xl pointer-events-none" />
    </motion.div>
  );
}
