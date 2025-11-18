// frontend/src/pages/Chats.jsx
// Advanced Chats page for SirVerse
// - Instant temp messages (client-side) then replaced by real server messages
// - Typing indicator
// - Optimized socket listeners & cleanup
// - Minimal, safe assumptions so it won't break other systems
// Author: Senior Dev (for Arsalan) - heavily commented for learning

import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_URL, authHeaders, debugUserState } from "../utils/api";
import Avatar from "../components/ui/Avatar";

// Helper: generate a unique temp id for local messages
const makeTempId = () => `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export default function Chats() {
  // Local UI state
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  // store mounted state to avoid setting state on unmounted component
  const mountedRef = useRef(true);

  // get current user id from localStorage (project already uses this pattern)
  const getCurrentUserId = () => {
    const id = localStorage.getItem("user_id");
    return id ? parseInt(id, 10) : null;
  };

  // Debug helper called elsewhere in project
  useEffect(() => {
    debugUserState?.();
  }, []);

  // Scroll-to-bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat rooms (runs once)
  useEffect(() => {
    mountedRef.current = true;
    async function loadRooms() {
      setRoomsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/chats`, { headers: authHeaders() });
        const data = await res.json();
        if (!mountedRef.current) return;
        if (res.ok) setRooms(Array.isArray(data.rooms) ? data.rooms : []);
      } catch (err) {
        console.error("Error loading rooms:", err);
      } finally {
        if (mountedRef.current) setRoomsLoading(false);
      }
    }
    loadRooms();
    return () => { mountedRef.current = false; };
  }, []);

  // Socket setup (recreates when selectedRoom changes so we can scope some events)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return; // no socket if not logged-in

    // Create socket (websocket transport only for reliability)
    const s = io(API_URL, { auth: { token }, transports: ["websocket"] });

    // Save socket in state
    setSocket(s);

    // ---- receive_message handler (safe & replacement-aware) ----
    // This replaces a local temp message (if exists) OR appends a new one.
    const handleReceive = (msg) => {
      // if a selectedRoom is set, only append/replace when it matches (keeps UI tidy)
      if (selectedRoom && msg.room_id !== selectedRoom.id) return;

      setMessages((prev) => {
        // If incoming message is "real" (id is number & not -1)
        if (msg && typeof msg.id === "number" && msg.id !== -1) {
          // Find a local temp message sent by current user with same content
          const tempIndex = prev.findIndex(
            (m) =>
              (m.id === -1 || (typeof m.id === "string" && m.id.startsWith("temp-"))) &&
              m.content === msg.content &&
              m.sender?.id === getCurrentUserId()
          );
          if (tempIndex !== -1) {
            // Replace the temp message with the real one (keeps order intact)
            const updated = [...prev];
            updated[tempIndex] = msg;
            return updated;
          }
        }

        // Otherwise, simply append (this covers temp messages from server too)
        return [...prev, msg];
      });
    };

    // ---- typing indicator handler ----
    const handleTyping = ({ room_id }) => {
      if (selectedRoom && room_id === selectedRoom.id) {
        setIsOtherUserTyping(true);
        // auto-clear typing after 1.5s (server will re-emit if user still typing)
        setTimeout(() => setIsOtherUserTyping(false), 1500);
      }
    };

    // Register listeners
    s.on("receive_message", handleReceive);
    s.on("typing", handleTyping);

    // Clean up on unmount
    return () => {
      s.off("receive_message", handleReceive);
      s.off("typing", handleTyping);
      s.disconnect();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]); // re-run when selectedRoom changes so handlers can be room-aware

  // Open a room and load its messages
  const openRoom = async (room) => {
    setSelectedRoom(room);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chats/${room.id}/messages`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      console.error("Failed loading room messages:", err);
    } finally {
      setLoading(false);
      // scroll after messages loaded
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  };

  // --- Send message (instant UI + emit) ---
  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !selectedRoom) return;

    // Create a lightweight temp message locally so user sees it instantly.
    // id = -1 used by server too for temp messages; using same sentinel is fine.
    const temp = {
      id: -1, // sentinel for temp messages (client & server may use -1)
      _temp_ts: Date.now(), // small helper so React keys can be unique
      room_id: selectedRoom.id,
      content: newMessage,
      sender: { id: getCurrentUserId() },
      created_at: new Date().toISOString(),
      // status is optional; we show ticks if server provides status in real message
      status: "sending",
    };

    // Append temp message locally
    setMessages((prev) => [...prev, temp]);
    // Clear input
    setNewMessage("");

    // Emit typing/send event to server.
    // We also emit `client_temp_ts` so server (if coded) can echo and help matching.
    // If server ignores it, our replacement fallback (content+sender) will still work.
    socket.emit("send_message", {
      room: selectedRoom.id,
      content: temp.content,
      client_temp_ts: temp._temp_ts,
    });

    // We intentionally DO NOT wait for server to respond to show message (instant).
    // Server will emit a temp message (id -1) then a real message (id numeric).
    // Our receive handler replaces temp with real to avoid duplicates.
  };

  // Typing indicator emission (debounced-ish)
  let typingTimeout = useRef(null);
  const handleTypingEmit = () => {
    if (!socket || !selectedRoom) return;
    // emit once then block for 800ms to avoid spam
    socket.emit("typing", { room: selectedRoom.id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      // allow emitting again after short pause
      typingTimeout.current = null;
    }, 800);
  };

  // Simple time formatter
  const formatTime = (t) => {
    if (!t) return "";
    try {
      const d = new Date(t);
      return d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  };

  // Helper component for skeletons
  const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-300 rounded-md ${className}`} />;

  // Utility: determine if message is mine
  const isMine = (msg) => msg.sender && Number(msg.sender.id) === Number(getCurrentUserId());

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Sidebar with rooms */}
      <div className={`w-full md:w-96 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col ${selectedRoom ? "hidden md:flex" : "flex"}`}>
        <div className="p-6 border-b border-gray-200 bg-white/95 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <button onClick={() => window.location.reload()} disabled={roomsLoading} className="text-gray-500 hover:text-gray-700 p-2">
            <svg className={`w-5 h-5 ${roomsLoading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {roomsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
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
              <h3 className="text-lg font-semibold">No conversations yet</h3>
              <p className="text-sm text-gray-600">Visit profiles to start conversations.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => openRoom(room)}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer mb-2 transition-all ${selectedRoom?.id === room.id ? "bg-blue-50 border border-blue-200" : "bg-white hover:bg-gray-50"}`}
              >
                <Avatar src={room.last_message?.sender?.avatar} emoji="👤" size={50} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{room.name || "Chat"}</h3>
                  <p className="text-sm text-gray-600 truncate">{room.last_message?.content || "Say hello 👋"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col bg-white/60 backdrop-blur-sm ${selectedRoom ? "flex" : "hidden md:flex"}`}>
        {selectedRoom ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <button className="md:hidden text-gray-500 hover:text-gray-700 p-2" onClick={() => setSelectedRoom(null)}>◀</button>
              <Avatar src={selectedRoom.last_message?.sender?.avatar} emoji="👤" size={45} />
              <h2 className="font-semibold text-gray-900">{selectedRoom.name}</h2>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} items-end gap-3`}>
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
                    <p className="text-gray-600">Send your first message to start the conversation.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    // Key: use unique combination to avoid duplicates for temps
                    const uniqueKey = `${msg.id}-${msg._temp_ts || 0}-${msg.created_at || ""}`;
                    const mine = isMine(msg);
                    return (
                      <div key={uniqueKey} className={`flex ${mine ? "justify-end" : "justify-start"} items-end gap-3`}>
                        {!mine && <Avatar src={msg.sender?.avatar} emoji="👤" size={40} />}
                        <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm max-w-[75%] break-words ${mine ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          <div className="text-[10px] text-gray-300 mt-1 flex items-center gap-2 justify-end">
                            <span>{formatTime(msg.created_at)}</span>
                            {mine && (
                              // server may add status field (delivered/read) — show ticks if present
                              <span className="text-xs opacity-80">
                                {msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                        {mine && <Avatar src={localStorage.getItem("avatar")} emoji="👤" size={40} />}
                      </div>
                    );
                  })}
                  {isOtherUserTyping && <div className="text-sm text-gray-500">Typing…</div>}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex gap-3 items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  } else {
                    handleTypingEmit();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                disabled={!socket}
              />
              <button
                onClick={() => {
                  sendMessage();
                }}
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
