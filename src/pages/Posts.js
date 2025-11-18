import React, { useState } from "react";
import PostComposer from "../components/PostComposer";
import PostList from "../components/PostList";

export default function Posts() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pb-4">
      {/* Removed the header with "Home" text */}
      
      {/* Post Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Posts List */}
      <PostList refreshKey={refreshKey} />
    </div>
  );
}
