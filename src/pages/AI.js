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
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const endRef = useRef();
  const inputRef = useRef();

  // Load saved chat history
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
              text: "Hello! I'm Sir G, your AI study assistant. I can help you with explanations, summaries, quiz questions, and translations. How can I assist you today?",
            },
          ]);
      } catch {
        setMessages([
          {
            id: 0,
            role: "sirG",
            text: "Hello! I'm Sir G, your AI study assistant. I can help you with explanations, summaries, quiz questions, and translations. How can I assist you today?",
          },
        ]);
      }
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Copy text function
  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Send message
  async function send() {
    if (!input.trim()) return;
    
    const userMsg = { 
      id: Date.now(), 
      role: "user", 
      text: input.trim() 
    };
    setMessages((m) => [...m, userMsg]);
    await saveAIMessage("user", input);
    const prompt = input;
    setInput("");
    setLoading(true);

    try {
      const res = await askSirG({ prompt, mode: "explain" });
      
      if (res.ok && res.data && res.data.reply) {
        const reply = {
          id: Date.now() + 1,
          role: "sirG",
          text: res.data.reply,
        };
        setMessages((m) => [...m, reply]);
        await saveAIMessage("sirG", res.data.reply);
      } else {
        const errText = res.data?.detail || res.data?.error || "Sorry, I couldn't process your request.";
        const reply = { 
          id: Date.now() + 1, 
          role: "sirG", 
          text: errText 
        };
        setMessages((m) => [...m, reply]);
        await saveAIMessage("sirG", errText);
      }
    } catch (error) {
      const reply = { 
        id: Date.now() + 1, 
        role: "sirG", 
        text: "I'm having trouble connecting right now. Please try again." 
      };
      setMessages((m) => [...m, reply]);
      await saveAIMessage("sirG", reply.text);
    } finally {
      setLoading(false);
    }
  }

  // Clear chat
  const clearChat = async () => {
    if (window.confirm("Clear all chat history?")) {
      await deleteAIHistory();
      setMessages([
        {
          id: 0,
          role: "sirG",
          text: "Hello! I'm Sir G, your AI study assistant. How can I help you today?",
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">🧠</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sir G</h1>
                <p className="text-sm text-gray-500">AI Study Assistant</p>
              </div>
            </div>

            {/* Clear Chat Button */}
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "sirG" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                  </div>
                )}

                <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`rounded-2xl px-5 py-4 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : "bg-white text-gray-800 border border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className={`prose prose-sm max-w-none ${
                      message.role === "user" ? "prose-invert" : ""
                    } prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-headings:font-semibold`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                    
                    {/* Copy Button - Only for AI messages */}
                    {message.role === "sirG" && (
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => copyToClipboard(message.text, message.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                          {copiedMessageId === message.id ? (
                            <>
                              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-500 flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">You</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              </div>
              <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    Sir G is thinking...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-gray-50 pb-6 pt-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="p-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Message Sir G... (Press Enter to send)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    disabled={loading}
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base placeholder-gray-400 resize-none"
                    style={{ minHeight: '24px' }}
                  />
                </div>
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                    loading || !input.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transform hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Footer Note */}
          <div className="text-center mt-4 text-xs text-gray-500">
            Sir G can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  );
}
