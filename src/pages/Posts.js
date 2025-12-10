import React, { useState } from "react";
import PostComposer from "../components/PostComposer";
import PostList from "../components/PostList";
//import { fetchPosts } from "../utils/api"; --- IGNORE ---
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";

export default function Posts() {
  const [refreshKey, setRefreshKey] = useState(0);

  function triggerRefresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      {/* 🟣 Post Composer Section */}
      <GlassCard>
        <h2 className="text-2xl font-bold neon-text mb-3">📝 Create a Post</h2>
        <PostComposer onPostCreated={triggerRefresh} />
      </GlassCard>

      {/* 🟣 Post Feed Section */}
      <div className="space-y-4">
        <PostList refreshKey={refreshKey} />
      </div>

      {/* Optional: Manual refresh button (optional) */}
      <div className="text-center mt-6">
        <Button variant="secondary" onClick={triggerRefresh}>
          🔄 Refresh Feed
        </Button>
      </div>
    </div>
  );
}
