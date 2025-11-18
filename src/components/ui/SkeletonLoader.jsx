import React from "react";

/**
 * ✨ Modern Skeleton Loader
 * Clean design for light theme
 */
export default function SkeletonLoader({ lines = 3, height = "20px" }) {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 rounded-lg"
          style={{ height }}
        />
      ))}
    </div>
  );
}
