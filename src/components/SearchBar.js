import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/api";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (res.ok) {
          setResults(data);
        } else {
          setResults(null);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults(null);
      } finally {
        setLoading(false);
        setShowResults(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    setShowResults(false);
    setQuery("");
  };

  const handlePostClick = (postId) => {
    navigate(`/posts/${postId}`);
    setShowResults(false);
    setQuery("");
  };

  const handleReelClick = (reelId) => {
    navigate(`/reels/${reelId}`);
    setShowResults(false);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-lg mx-auto" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, posts, reels, #tags..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl max-h-96 overflow-y-auto z-50">
          {/* Users */}
          {results?.users?.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-500 mb-2">Users</div>
              {results.users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.username)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">@{user.username}</div>
                    <div className="text-xs text-gray-500">{user.full_name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Posts */}
          {results?.posts?.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-500 mb-2">Posts</div>
              {results.posts.map(post => (
                <button
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="text-sm text-gray-800 line-clamp-2">{post.content}</div>
                  <div className="text-xs text-gray-500 mt-1">by @{post.author.username}</div>
                </button>
              ))}
            </div>
          )}

          {/* Reels */}
          {results?.reels?.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-500 mb-2">Reels</div>
              {results.reels.map(reel => (
                <button
                  key={reel.id}
                  onClick={() => handleReelClick(reel.id)}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="text-sm text-gray-800">{reel.caption || "Reel video"}</div>
                  <div className="text-xs text-gray-500 mt-1">by @{reel.author.username}</div>
                </button>
              ))}
            </div>
          )}

          {/* Hashtags */}
          {results?.hashtags?.length > 0 && (
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 mb-2">Hashtags</div>
              {results.hashtags.map(tag => (
                <button
                  key={tag.tag}
                  onClick={() => {
                    navigate(`/search?tag=${tag.tag}`);
                    setShowResults(false);
                    setQuery("");
                  }}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="text-sm text-blue-600 font-medium">#{tag.tag}</div>
                  <div className="text-xs text-gray-500">{tag.posts + tag.reels} posts</div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && results && results.users?.length === 0 && results.posts?.length === 0 && results.reels?.length === 0 && results.hashtags?.length === 0 && (
            <div className="p-6 text-center">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-gray-600">No results found</div>
              <div className="text-xs text-gray-500 mt-1">Try searching for users, posts, reels, or #tags</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
