// frontend/src/components/QuickActions.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function QuickActions({ onPostClick }) {
  const navigate = useNavigate();

  const actions = [
    { icon: "📝", label: "Post", onClick: onPostClick, color: "bg-blue-100 text-blue-600" },
    { icon: "📸", label: "Photo", onClick: () => navigate("/reels"), color: "bg-green-100 text-green-600" },
    { icon: "📹", label: "Reel", onClick: () => navigate("/reels"), color: "bg-purple-100 text-purple-600" },
    { icon: "📍", label: "Check In", onClick: () => {}, color: "bg-red-100 text-red-600" },
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
          {localStorage.getItem("username")?.charAt(0) || "U"}
        </div>
        <button
          onClick={onPostClick}
          className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
        >
          What's on your mind?
        </button>
      </div>

      <div className="h-px bg-gray-200 mb-4"></div>

      <div className="grid grid-cols-4 gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-2 hover:bg-gray-50 rounded-lg"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${action.color}`}>
              {action.icon}
            </div>
            <span className="text-xs font-medium mt-1 text-gray-700">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
