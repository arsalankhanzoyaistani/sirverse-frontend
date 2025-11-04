// frontend/src/pages/Chats.jsx
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { API_URL, authHeaders, debugUserState } from "../utils/api";
import Avatar from "../components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";

export default function Chats() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const getCurrentUserId = () => {
    const userId = localStorage.getItem("user_id");
    return userId ? parseInt(userId) : null;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    debugUserState();
  }, []);

  // Load chat rooms
  useEffect(() => {
    let mounted = true;
    async function fetchChats() {
      setRoomsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/chats`, { headers: authHeaders() });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok) setRooms(Array.isArray(data.rooms) ? data.rooms : []);
      } catch (err) {
        console.error("Error loading chats:", err);
      } finally {
        setRoomsLoading(false);
      }
    }
    fetchChats();
    return () => { mounted = false; };
  }, []);

  // Socket
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    const newSocket = io(API_URL, { auth: { token }, transports: ["websocket"] });
    setSocket(newSocket);
    newSocket.on("receive_message", (msg) => {
      if (selectedRoom && msg.room_id === selectedRoom.id) {
        setMessages((p) => [...p, msg]);
      }
    });
    return () => newSocket.disconnect();
  }, [selectedRoom]);

  const openRoom = async (room) => {
    setSelectedRoom(room);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chats/${room.id}/messages`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !selectedRoom) return;
    socket.emit("send_message", { room: selectedRoom.id, content: newMessage });
    setNewMessage("");
  };

  const isCurrentUser = (id) => getCurrentUserId() === id;

  const formatTime = (t) => {
    if (!t) return "";
    const d = new Date(t);
    return d.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Karachi",
    });
  };

  // 🩶 Skeleton loader component
  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-300 rounded-md ${className}`} />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Sidebar */}
      <div
        className={`w-full md:w-96 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col ${
          selectedRoom ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-6 border-b border-gray-200 bg-white/95 flex justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <button
            onClick={() => window.location.reload()}
            disabled={roomsLoading}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <svg
              className={`w-5 h-5 ${roomsLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Chat list with skeletons */}
        <div className="flex-1 overflow-y-auto p-3">
          {roomsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-white/60 rounded-xl shadow-sm">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-sm text-gray-600">
                Visit user profiles to start new conversations
              </p>
            </div>
          ) : (
            rooms.map((room) => (
              <motion.div
                key={room.id}
                onClick={() => openRoom(room)}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer mb-2 transition-all ${
                  selectedRoom?.id === room.id
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white hover:bg-gray-50 border border-transparent"
                }`}
              >
                <Avatar
                  src={room.last_message?.sender?.avatar}
                  emoji="👤"
                  size={50}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {room.name || "Chat"}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {room.last_message?.content || "Say hello 👋"}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div
        className={`flex-1 flex flex-col bg-white/60 backdrop-blur-sm ${
          selectedRoom ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <button
                className="md:hidden text-gray-500 hover:text-gray-700 p-2"
                onClick={() => setSelectedRoom(null)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <Avatar
                src={selectedRoom.last_message?.sender?.avatar}
                emoji="👤"
                size={45}
              />
              <h2 className="font-semibold text-gray-900">{selectedRoom.name}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex ${
                        i % 2 === 0 ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-center">
                  <div>
                    <div className="text-6xl mb-3">👋</div>
                    <h3 className="text-lg font-semibold">No messages yet</h3>
                    <p className="text-gray-600">
                      Send your first message to start the conversation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg) => {
                    const mine = isCurrentUser(msg.sender?.id);
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          mine ? "justify-end" : "justify-start"
                        } items-end gap-3`}
                      >
                        {!mine && (
                          <Avatar
                            src={msg.sender?.avatar}
                            emoji="👤"
                            size={40}
                          />
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                            mine
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-900 rounded-bl-none"
                          }`}
                        >
                          {msg.content}
                          <div className="text-[10px] text-gray-400 mt-1">
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                        {mine && (
                          <Avatar
                            src={localStorage.getItem("avatar")}
                            emoji="👤"
                            size={40}
                          />
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                disabled={!socket}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !socket}
                className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 disabled:opacity-50"
              >
                ➤
              </button>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-7xl mb-4">💭</div>
              <h2 className="text-xl font-semibold">Your Messages</h2>
              <p>Choose a chat to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
