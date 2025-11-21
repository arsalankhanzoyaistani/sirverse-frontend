import React, { useState, useRef, useEffect } from "react";
import {
  askSirG,
  fetchAIHistory,
  saveAIMessage,
  deleteAIHistory,
} from "../utils/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

export default function AI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("explain");
  const [dark, setDark] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const endRef = useRef();
  const inputRef = useRef();

  // 🧾 Load saved chat history
  useEffect(() => {
    (async () => {
      try {
        const hist = await fetchAIHistory();
        if (hist?.length) setMessages(hist);
        else
          setMessages([
            {
              id: 0,
              role: "sirG",
              text: "👋 **Salaam! I'm Sir G — your AI study assistant.**\n\nI can help you with:\n- 📚 **Explaining complex concepts**\n- 📝 **Summarizing content**\n- 🎯 **Creating quizzes**\n- 🌐 **Translating to Urdu**\n\nTry asking me something like: *Explain Newton's 2nd law* or *Summarize the French Revolution*.",
            },
          ]);
      } catch {
        setMessages([
          {
            id: 0,
            role: "sirG",
            text: "👋 **Salaam! I'm Sir G — your AI study assistant.**\n\nI can help you with:\n- 📚 **Explaining complex concepts**\n- 📝 **Summarizing content**\n- 🎯 **Creating quizzes**\n- 🌐 **Translating to Urdu**\n\nTry asking me something like: *Explain Newton's 2nd law* or *Summarize the French Revolution*.",
          },
        ]);
      }
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ✉️ Send message
  async function send() {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    await saveAIMessage("user", input);
    const prompt = input;
    setInput("");
    setLoading(true);

    try {
      const res = await askSirG({ prompt, mode });
      if (res.ok && res.data && res.data.reply) {
        const reply = {
          id: Date.now() + 1,
          role: "sirG",
          text: res.data.reply,
        };
        setMessages((m) => [...m, reply]);
        await saveAIMessage("sirG", res.data.reply);
      } else {
        const errText =
          res.data?.detail ||
          res.data?.error ||
          "⚠️ Sorry, I couldn't answer that right now. Please try rephrasing your question.";
        const reply = { id: Date.now() + 1, role: "sirG", text: errText };
        setMessages((m) => [...m, reply]);
        await saveAIMessage("sirG", errText);
      }
    } catch {
      const reply = {
        id: Date.now() + 1,
        role: "sirG",
        text: "⚠️ Network error — please check your connection and try again.",
      };
      setMessages((m) => [...m, reply]);
      await saveAIMessage("sirG", reply.text);
    } finally {
      setLoading(false);
    }
  }

  // Quick actions
  const quickActions = [
    { text: "Explain quantum physics", icon: "🧠" },
    { text: "Summarize French Revolution", icon: "📝" },
    { text: "Biology quiz questions", icon: "🎯" },
    { text: "Translate to Urdu", icon: "🌐" },
  ];

  const handleQuickAction = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-300 ${
        dark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900"
      }`}
    >
      {/* 🌟 Enhanced Mobile Header */}
      <div
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all ${
          dark
            ? "bg-gray-900/95 border-gray-700"
            : "bg-white/95 border-gray-200"
        }`}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                  dark
                    ? "bg-gradient-to-r from-purple-600 to-blue-600"
                    : "bg-gradient-to-r from-purple-500 to-blue-500"
                }`}
              >
                <span className="text-white font-bold text-lg">🧠</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold">Sir G AI</h1>
                <p className="text-sm opacity-70">Study Assistant</p>
              </div>
            </div>

            {/* Center: Mode Selector - Mobile Optimized */}
            <div className="flex-1 max-w-xs mx-4">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium border backdrop-blur-sm transition-all ${
                  dark
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="explain">🧠 Explain</option>
                <option value="summarize">📝 Summarize</option>
                <option value="quiz">🎯 Quiz</option>
                <option value="translate_urdu">🌐 Translate Urdu</option>
              </select>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={() => setDark(!dark)}
                className={`p-2 rounded-lg border backdrop-blur-sm transition-all active:scale-95 ${
                  dark
                    ? "bg-gray-800 border-gray-600 active:bg-gray-700"
                    : "bg-white border-gray-300 active:bg-gray-100"
                }`}
              >
                {dark ? "🌞" : "🌙"}
              </button>

              {/* Mobile Menu */}
              <div className="relative sm:hidden">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className={`p-2 rounded-lg border backdrop-blur-sm transition-all active:scale-95 ${
                    dark
                      ? "bg-gray-800 border-gray-600 active:bg-gray-700"
                      : "bg-white border-gray-300 active:bg-gray-100"
                  }`}
                >
                  ⋮
                </button>

                {/* Mobile Dropdown */}
                <AnimatePresence>
                  {showMobileMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className={`absolute right-0 top-12 w-48 rounded-xl border backdrop-blur-xl shadow-xl z-50 ${
                        dark
                          ? "bg-gray-800 border-gray-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <button
                        onClick={async () => {
                          if (window.confirm("Clear all chat history?")) {
                            await deleteAIHistory();
                            setMessages([]);
                          }
                          setShowMobileMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left border-b transition-all active:scale-95 ${
                          dark
                            ? "border-gray-700 text-red-400 active:bg-gray-700"
                            : "border-gray-200 text-red-500 active:bg-gray-100"
                        }`}
                      >
                        🗑️ Clear History
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            messages.map(m => `${m.role}: ${m.text}`).join('\n\n')
                          );
                          setShowMobileMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-all active:scale-95 ${
                          dark
                            ? "active:bg-gray-700"
                            : "active:bg-gray-100"
                        }`}
                      >
                        📋 Copy Chat
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop Clear Button */}
              <button
                onClick={async () => {
                  if (window.confirm("Clear all chat history?")) {
                    await deleteAIHistory();
                    setMessages([]);
                  }
                }}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm transition-all active:scale-95 text-sm"
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm transition-all active:scale-95 text-sm ${
                  dark
                    ? "bg-gray-800 border-gray-600 text-red-400 active:bg-gray-700"
                    : "bg-white border-gray-300 text-red-500 active:bg-gray-100"
                }`}
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 💬 Enhanced Chat Area - Mobile First */}
      <div className="flex-1 flex flex-col w-full px-3 sm:px-4 py-4">
        {/* Messages Container */}
        <div
          className={`flex-1 rounded-2xl mb-4 overflow-hidden border backdrop-blur-sm transition-all ${
            dark
              ? "bg-gray-800/40 border-gray-700"
              : "bg-white/70 border-gray-200"
          }`}
        >
          <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI Avatar */}
                  {m.role === "sirG" && (
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                          dark
                            ? "bg-gradient-to-r from-purple-600 to-blue-600"
                            : "bg-gradient-to-r from-purple-500 to-blue-500"
                        }`}
                      >
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm transition-all ${
                      m.role === "user"
                        ? dark
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-blue-500 text-white rounded-br-md"
                        : dark
                        ? "bg-gray-700/80 text-gray-100 rounded-bl-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <div
                      className={`prose prose-sm max-w-none break-words ${
                        dark ? "prose-invert" : ""
                      } prose-p:leading-relaxed prose-ul:leading-relaxed prose-ol:leading-relaxed prose-code:bg-opacity-20 prose-code:px-1 prose-code:rounded prose-pre:bg-opacity-10 prose-pre:rounded-lg ${
                        dark
                          ? "prose-code:bg-gray-600 prose-pre:bg-gray-600"
                          : "prose-code:bg-gray-200 prose-pre:bg-gray-200"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.text}
                      </ReactMarkdown>
                    </div>
                    
                    {/* Message Time */}
                    <div
                      className={`text-xs mt-2 ${
                        m.role === "user"
                          ? "text-blue-100"
                          : dark
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {m.role === "user" && (
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                          dark ? "bg-gray-600" : "bg-gray-400"
                        }`}
                      >
                        <span className="text-white text-xs font-bold">You</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Enhanced Loading Animation */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      dark
                        ? "bg-gradient-to-r from-purple-600 to-blue-600"
                        : "bg-gradient-to-r from-purple-500 to-blue-500"
                    }`}
                  >
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 ${
                    dark ? "bg-gray-700/80" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          dark ? "bg-blue-400" : "bg-blue-500"
                        }`}
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          dark ? "bg-blue-400" : "bg-blue-500"
                        }`}
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full animate-bounce ${
                          dark ? "bg-blue-400" : "bg-blue-500"
                        }`}
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span
                      className={`text-sm ${
                        dark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Thinking...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Quick Actions - Only show when no messages or empty */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <p className={`text-center text-sm mb-3 ${dark ? "text-gray-400" : "text-gray-600"}`}>
              Try asking:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleQuickAction(action.text)}
                  className={`p-3 rounded-xl text-sm text-left transition-all active:scale-95 backdrop-blur-sm border ${
                    dark
                      ? "bg-gray-800/50 border-gray-600 active:bg-gray-700/50"
                      : "bg-white/50 border-gray-300 active:bg-gray-100/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{action.icon}</span>
                    <span className="flex-1 truncate">{action.text.split(' ')[0]}...</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Enhanced Input Area - Mobile Optimized */}
        <div className="sticky bottom-0 bg-transparent pb-3">
          <div
            className={`flex gap-2 p-2 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${
              dark
                ? "bg-gray-800/90 border-gray-600"
                : "bg-white/95 border-gray-300"
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Message Sir G..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={loading}
              className={`flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-sm ${
                dark
                  ? "text-white placeholder:text-gray-400"
                  : "text-gray-900 placeholder:text-gray-500"
              }`}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 active:scale-95 ${
                loading || !input.trim()
                  ? dark
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : dark
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white active:from-purple-700 active:to-blue-700 shadow-lg"
                  : "bg-gradient-to-r from-purple-500 to-blue-500 text-white active:from-purple-600 active:to-blue-600 shadow-lg"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-lg">↑</span>
              )}
            </button>
          </div>

          {/* Footer Note */}
          <div className={`text-center mt-3 text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
            Sir G can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
