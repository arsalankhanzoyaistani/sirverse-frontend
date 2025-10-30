import React from "react";
import { motion } from "framer-motion";

/**
 * ✨ Modern Avatar Component
 * Now properly handles uploaded images from Cloudinary
 */
export default function Avatar({ src, emoji = "👤", size = 40, interactive = true }) {
  const dimension = `${size}px`;

  // Check if src is a valid image URL (Cloudinary or other)
  const isValidImage = src && (src.startsWith("http") || src.startsWith("https"));

  return (
    <motion.div
      className={`relative flex items-center justify-center rounded-full overflow-hidden bg-white border border-gray-200`}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
      }}
      whileHover={interactive ? { 
        scale: 1.05,
      } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 20 
      }}
    >
      {/* Content Container */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
        {isValidImage ? (
          <motion.img
            src={src}
            alt="User Avatar"
            className="object-cover w-full h-full rounded-full"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              // If image fails to load, show emoji fallback
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <motion.div 
            className="w-full h-full flex items-center justify-center text-xl select-none bg-gradient-to-br from-blue-100 to-purple-100"
            whileHover={{ scale: 1.1 }}
          >
            {emoji}
          </motion.div>
        )}
      </div>

      {/* Show emoji if image failed to load */}
      {isValidImage && (
        <div className="absolute inset-0 flex items-center justify-center text-xl opacity-0">
          {emoji}
        </div>
      )}

      {/* Subtle Inner Shadow */}
      <div className="absolute inset-0 rounded-full pointer-events-none shadow-inset" />
    </motion.div>
  );
}
