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
  const [dark, setDark] = useState(false);
  const endRef = useRef();

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
              text: "👋 Salaam! I'm Sir G — your study assistant.\nTry asking: *Explain Newton’s 2nd law*.",
            },
          ]);
      } catch {
        setMessages([
          {
            id: 0,
            role: "sirG",
            text: "👋 Salaam! I'm Sir G — your study assistant.\nTry asking: *Explain Newton’s 2nd law*.",
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
          "⚠️ Sorry, I couldn’t answer that right now.";
        const reply = { id: Date.now() + 1, role: "sirG", text: errText };
        setMessages((m) => [...m, reply]);
        await saveAIMessage("sirG", errText);
      }
    } catch {
      const reply = {
        id: Date.now() + 1,
        role: "sirG",
        text: "⚠️ Network error — please check your connection.",
      };
      setMessages((m) => [...m, reply]);
      await saveAIMessage("sirG", reply.text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center py-6 px-3 transition-colors duration-500 ${
        dark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100"
          : "bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900"
      }`}
    >
      {/* 🌙 Theme toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="fixed top-4 right-4 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg shadow-md hover:bg-purple-700"
      >
        {dark ? "🌞 Light" : "🌙 Dark"}
      </button>

      {/* 🧠 Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl text-center mb-5"
      >
        <h1 className="text-2xl font-bold mb-1">🧠 Sir G — Study Assistant</h1>
        <p className="text-sm opacity-70">
          Ask anything — explain, summarize, quiz, or translate!
        </p>
      </motion.div>

      {/* 💬 Chat Box */}
      <div
        className={`w-full max-w-2xl shadow-lg rounded-2xl flex flex-col h-[75vh] overflow-hidden ${
          dark
            ? "bg-gray-800/60 border border-gray-700"
            : "bg-white/80 border border-gray-200"
        } backdrop-blur-xl`}
      >
        {/* Toolbar */}
        <div
          className={`flex justify-between items-center p-3 border-b ${
            dark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-purple-100 text-purple-800 px-3 py-2 rounded-md text-sm font-medium"
          >
            <option value="explain">Explain ✏️</option>
            <option value="summarize">Summarize 🧾</option>
            <option value="quiz">Quiz 🎯</option>
            <option value="translate_urdu">Translate → Urdu 🇵🇰</option>
          </select>

          <button
            onClick={async () => {
              if (window.confirm("Clear all chat history?")) {
                await deleteAIHistory();
                setMessages([]);
              }
            }}
            className="text-sm text-red-500 hover:text-red-700"
          >
            🗑️ Clear History
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-md ${
                    m.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : dark
                      ? "bg-gray-700 text-gray-100 rounded-bl-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading dots */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 ml-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></span>
              <p className="text-sm">Sir G is thinking...</p>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Box */}
        <div
          className={`p-3 border-t ${
            dark ? "border-gray-700 bg-gray-800/80" : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask Sir G anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none border ${
                dark
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-400"
                  : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-400"
              }`}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md disabled:opacity-50 transition-all"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
