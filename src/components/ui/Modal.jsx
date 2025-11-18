import React from "react";
import GlassCard from "./GlassCard";
import Button from "./Button";

/**
 * 💬 Modal Component
 * Clean design for light theme
 */
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
      <GlassCard className="max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <Button variant="secondary" onClick={onClose}>
            ✖
          </Button>
        </div>
        <div className="text-gray-700">{children}</div>
      </GlassCard>
    </div>
  );
}
