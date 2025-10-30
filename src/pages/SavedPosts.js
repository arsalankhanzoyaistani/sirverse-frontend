import React, { useEffect, useState } from "react";
import { fetchPosts } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";

export default function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    try {
      // Get saved posts from localStorage
      const savedFromStorage = localStorage.getItem('savedPosts');
      let savedPostIds = [];
      
      if (savedFromStorage) {
        savedPostIds = JSON.parse(savedFromStorage);
      }

      if (savedPostIds.length > 0) {
        // Fetch all posts and filter saved ones
        const postsRes = await fetchPosts(1, 100);
        if (postsRes.ok) {
          const savedPostsData = postsRes.data.items.filter(
            post => savedPostIds.includes(post.id)
          );
          setSavedPosts(savedPostsData);
        }
      }
    } catch (error) {
      console.error("Error loading saved posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const unsavePost = (postId) => {
    const updatedSavedPosts = savedPosts.filter(post => post.id !== postId);
    setSavedPosts(updatedSavedPosts);
    
    // Update localStorage
    const savedPostIds = updatedSavedPosts.map(post => post.id);
    localStorage.setItem('savedPosts', JSON.stringify(savedPostIds));
    
    // Show confirmation
    alert('Post removed from saved items');
  };

  const savePost = (postId) => {
    // Add to saved posts
    const savedFromStorage = localStorage.getItem('savedPosts');
    let savedPostIds = [];
    
    if (savedFromStorage) {
      savedPostIds = JSON.parse(savedFromStorage);
    }
    
    if (!savedPostIds.includes(postId)) {
      savedPostIds.push(postId);
      localStorage.setItem('savedPosts', JSON.stringify(savedPostIds));
      alert('Post saved!');
      loadSavedPosts(); // Reload to show the newly saved post
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading saved posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Posts</h1>
        <p className="text-gray-600 mt-1">Posts you've saved for later</p>
      </div>

      {savedPosts.length > 0 ? (
        <div className="space-y-4">
          {savedPosts.map(post => (
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
                  onClick={() => unsavePost(post.id)}
                  className="text-red-500 hover:text-red-600 text-sm bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                  title="Remove from saved"
                >
                  ❌ Remove
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
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  ❤️ {post.likes_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  💬 {post.comments_count || 0}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-6 text-center">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-gray-700 font-medium">No saved posts</p>
          <p className="text-sm text-gray-500 mt-1">
            Save posts by clicking the bookmark icon on any post to view them here later
          </p>
          <button 
            onClick={() => window.location.href = '/posts'}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Browse Posts
          </button>
        </GlassCard>
      )}
    </div>
  );
}
