import React, { useEffect, useState } from "react";
import { fetchPosts } from "../utils/api";
import PostCard from "../components/PostCard";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadPosts(p = 1) {
    setLoading(true);
    const res = await fetchPosts(p, 10);
    setLoading(false);
    if (res.ok) {
      if (p === 1) setPosts(res.data.items || []);
      else setPosts((cur) => [...cur, ...(res.data.items || [])]);
      setPage(res.data.page || p);
      setPages(res.data.pages || 1);
    }
  }

  useEffect(() => {
    loadPosts(1);
  }, []);

  function refresh() {
    loadPosts(1);
  }

  return (
    <section className="max-w-2xl mx-auto space-y-6 fade-in">
      {/* REMOVED PostComposer - Users will create posts from a separate button */}
      
      {loading && posts.length === 0 && (
        <div className="text-center text-gray-400">Loading posts...</div>
      )}

      {posts.length === 0 && !loading && (
        <GlassCard className="text-center p-8">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share something!</p>
        </GlassCard>
      )}

      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} onRefresh={refresh} />
        ))}
      </div>

      {page < pages && (
        <div className="text-center mt-6">
          <Button onClick={() => loadPosts(page + 1)}>Load More</Button>
        </div>
      )}
    </section>
  );
}
