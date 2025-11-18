import React from "react";

/**
 * ✏️ Modern Input Component
 * Clean design for light theme
 */
export default function Input({
  label,
  type = "text",
  className = "",
  ...props
}) {
  return (
    <div className="w-full space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        className={`w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  );
}
