import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";
import { fetchPosts } from "../utils/api";

export default function PostList({ refreshKey }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  async function load(p = 1) {
    setLoading(true);
    const res = await fetchPosts(p);
    setLoading(false);
    if (res.ok) {
      setPosts(p === 1 ? res.data.items : [...posts, ...res.data.items]);
      setPage(res.data.page);
      setPages(res.data.pages);
    } else {
      console.error("Failed to load posts", res);
    }
  }

  useEffect(() => { load(1); }, [refreshKey]);

  return (
    <div>
      {loading && posts.length === 0 && (
        <div className="text-center text-gray-500 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-center items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Loading posts...
          </div>
        </div>
      )}
      
      {posts.length === 0 && !loading && (
        <div className="text-center text-gray-500 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-lg font-medium text-gray-700">No posts yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to share something!</p>
        </div>
      )}
      
      <div className="space-y-4">
        {posts.map(p => <PostCard key={p.id} post={p} onRefresh={() => load(1)} />)}
      </div>

      {page < pages && (
        <div className="text-center mt-6">
          <button 
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
            onClick={() => load(page + 1)}
          >
            Load More Posts
          </button>
        </div>
      )}
    </div>
  );
}
