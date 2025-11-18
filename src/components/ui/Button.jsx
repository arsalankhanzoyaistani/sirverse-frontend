// frontend/src/components/ui/Button.jsx
// Reusable Button with variants and loading support
import React from "react";

export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary", // primary | secondary | danger
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-300",
  };
  const disabledCls = disabled || loading ? "opacity-60 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${disabledCls} ${className}`}
      {...rest}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"></circle>
          <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3"></path>
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}
