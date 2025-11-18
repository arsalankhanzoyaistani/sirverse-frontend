// frontend/src/components/ui/Avatar.jsx
import React from "react";
import { motion } from "framer-motion";

/**
 * ✨ Modern Avatar Component (Refined)
 * - Supports Cloudinary & emoji fallback
 * - Responsive sizes (24–160px)
 * - Smooth motion hover with optional interactivity
 * - Less bulky borders + inner shadow fix
 */
export default function Avatar({ 
  src, 
  emoji = "👤", 
  size = 40, 
  interactive = true 
}) {
  // 🧠 Limit size (avoid giant avatar)
  const safeSize = Math.max(24, Math.min(size, 160));
  const dimension = `${safeSize}px`;

  // ✅ Detect if src is valid image URL
  const isValidImage = src && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|avif|svg)?/.test(src);

  return (
    <motion.div
      className={`relative flex items-center justify-center rounded-full overflow-hidden bg-white border border-gray-200 shadow-sm`}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
      }}
      whileHover={
        interactive
          ? { scale: safeSize > 80 ? 1.02 : 1.05 } // gentler for large avatars
          : {}
      }
      whileTap={interactive ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      {/* Avatar Content */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
        {isValidImage ? (
          <motion.img
            src={src}
            alt="User Avatar"
            className="object-cover w-full h-full rounded-full"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.25 }}
            onError={(e) => {
              e.target.style.display = "none";
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

      {/* Hidden emoji fallback overlay (if image fails later) */}
      {isValidImage && (
        <div className="absolute inset-0 flex items-center justify-center text-xl opacity-0">
          {emoji}
        </div>
      )}

      {/* Soft inner shadow for depth */}
      <div className="absolute inset-0 rounded-full pointer-events-none shadow-inner" />
    </motion.div>
  );
}
