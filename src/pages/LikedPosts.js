import React, { useEffect, useState } from "react";
import { fetchPosts, toggleLike } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";

export default function LikedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const postsRes = await fetchPosts(1, 100);
      if (postsRes.ok) {
        // Show posts that have likes (since we don't have direct "liked by current user" flag)
        const postsWithLikes = postsRes.data.items.filter(
          post => post.likes_count > 0
        );
        setPosts(postsWithLikes);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
  };

  const handleUnlike = async (postId) => {
    try {
      const res = await toggleLike(postId);
      if (res.ok) {
        // Refresh the list to reflect the change
        await loadPosts();
      }
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading liked posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Popular Posts</h1>
            <p className="text-gray-600 mt-1">Posts with engagement from the community</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <GlassCard key={post.id} className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {post.author.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">@{post.author.username}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(post.created_at_pk || post.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  onClick={() => handleUnlike(post.id)}
                  className="text-red-500 hover:text-red-600 text-sm bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                  title="Unlike post"
                >
                  ❤️ Unlike
                </button>
              </div>
              
              <p className="text-gray-800 mb-3">{post.content}</p>
              
              {post.image_url && (
                <div className="mb-3">
                  <img 
                    src={post.image_url} 
                    alt="Post content" 
                    className="w-full rounded-lg max-h-60 object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded">
                    ❤️ {post.likes_count || 0} likes
                  </span>
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded">
                    💬 {post.comments_count || 0} comments
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-6 text-center">
          <div className="text-4xl mb-3">❤️</div>
          <p className="text-gray-700 font-medium">No liked posts yet</p>
          <p className="text-sm text-gray-500 mt-1">Like some posts to see them here</p>
        </GlassCard>
      )}
    </div>
  );
}
