import React from "react";
import { motion } from "framer-motion";

/**
 * 🌤️ Elegant Light-Mode Button
 * Clean, modern, slightly glowing, and fits your new light SirVerse interface.
 */
export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  full = false,
  size = "medium",
  loading = false,
}) {
  // 🎨 Light theme color variants
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-300/40",
    secondary:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md",
    success:
      "bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 shadow-md hover:shadow-lg hover:shadow-green-300/40",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-lg hover:shadow-red-300/40",
  };

  // 📏 Size Variants
  const sizeStyles = {
    small: "px-3 py-1.5 text-sm rounded-lg",
    medium: "px-5 py-2 text-base rounded-lg",
    large: "px-6 py-3 text-lg rounded-xl",
  };

  return (
    <motion.button
      whileHover={{
        scale: disabled ? 1 : 1.04,
      }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      disabled={disabled || loading}
      onClick={!disabled && !loading ? onClick : undefined}
      className={`
        relative font-semibold transition-all duration-300 ease-in-out
        flex items-center justify-center gap-2 overflow-hidden
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${full ? "w-full" : ""}
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* ✨ Shine animation overlay */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-out"></span>

      {/* Content or loader */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}
