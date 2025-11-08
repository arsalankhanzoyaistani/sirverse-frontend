import React, { useState } from "react";
import { motion } from "framer-motion";

/**
 * ✨ Modern Avatar Component
 * Handles uploaded images from Cloudinary and provides fallbacks
 */
export default function Avatar({ 
  src, 
  emoji = "👤", 
  size = 40, 
  interactive = true,
  onClick,
  className = "",
  alt = "User Avatar"
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const dimension = `${size}px`;
  const fontSize = `${size * 0.4}px`;

  // Check if src is a valid image URL
  const isValidImage = src && (src.startsWith("http") || src.startsWith("https")) && !imageError;

  const handleClick = (e) => {
    if (interactive && onClick) {
      onClick(e);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  return (
    <motion.div
      className={`
        relative flex items-center justify-center 
        rounded-full overflow-hidden 
        bg-white border border-gray-200
        ${interactive ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
      }}
      whileHover={interactive ? { 
        scale: 1.05,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
      } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 20 
      }}
      onClick={handleClick}
    >
      {/* Content Container */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        {isValidImage ? (
          <>
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
            )}
            
            <motion.img
              src={src}
              alt={alt}
              className="object-cover w-full h-full rounded-full"
              onError={handleImageError}
              onLoad={handleImageLoad}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: imageLoaded ? 1 : 0,
                scale: imageLoaded ? 1 : 0.8 
              }}
              transition={{ duration: 0.3 }}
            />
          </>
        ) : (
          <motion.div 
            className="w-full h-full flex items-center justify-center select-none bg-gradient-to-br from-blue-100 to-purple-100"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{ fontSize }}>{emoji}</span>
          </motion.div>
        )}
      </div>

      {/* Subtle Inner Shadow */}
      <div className="absolute inset-0 rounded-full pointer-events-none shadow-inset border border-black/5" />
      
      {/* Online indicator (optional) */}
      {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" /> */}
    </motion.div>
  );
}
