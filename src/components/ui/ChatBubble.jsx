import React from "react";
import { motion } from "framer-motion";

/**
 * 💬 Modern ChatBubble
 * Clean design for light theme
 */
export default function ChatBubble({ text, sentByMe, time, status, isFirst, isLast }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full mb-2 ${sentByMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[80%] rounded-2xl px-4 py-3 ${
          sentByMe
            ? "bg-blue-500 text-white rounded-br-md"
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        } shadow-sm`}
      >
        {/* Message Text */}
        <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
        
        {/* Timestamp and Status */}
        <div className={`text-xs mt-2 opacity-70 flex items-center gap-1 ${
          sentByMe ? "justify-end" : "justify-start"
        }`}>
          <span>{formatTime(time)}</span>
          {sentByMe && (
            <span className={`${
              status === "read" ? "text-blue-200" : 
              status === "delivered" ? "text-gray-200" : 
              "text-gray-300"
            }`}>
              {status === "read" ? "✓✓" : status === "delivered" ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
