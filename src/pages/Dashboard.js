import React, { useEffect, useState, useRef } from "react";
import { fetchUserStats, fetchPosts, fetchReels, deleteReel, uploadReel, createReel } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userReels, setUserReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingReel, setDeletingReel] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const username = localStorage.getItem("username");
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Load user stats from your backend API
        const statsRes = await fetchUserStats();
        if (statsRes.ok) {
          setStats(statsRes.data);
        }

        // Load user's posts
        const postsRes = await fetchPosts(1, 50);
        if (postsRes.ok) {
          // Filter posts to show only current user's posts
          const currentUserPosts = postsRes.data.items.filter(
            post => post.author.username === username
          );
          setUserPosts(currentUserPosts.slice(0, 5)); // Show latest 5 posts
        }

        // Load user's reels
        const reelsRes = await fetchReels(1, 50);
        if (reelsRes.ok) {
          // Filter reels to show only current user's reels
          const currentUserReels = reelsRes.data.items.filter(
            reel => reel.author.username === username
          );
          setUserReels(currentUserReels.slice(0, 5)); // Show latest 5 reels
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [username]);

  // Function to handle reel deletion
  const handleDeleteReel = async (reelId, reelCaption) => {
    if (!window.confirm(`Are you sure you want to delete this reel?\n"${reelCaption || 'Untitled reel'}"`)) {
      return;
    }

    setDeletingReel(reelId);
    try {
      const res = await deleteReel(reelId);
      if (res.ok) {
        // Remove the deleted reel from state
        setUserReels(prev => prev.filter(reel => reel.id !== reelId));
        
        // Update stats
        if (stats) {
          setStats(prev => ({
            ...prev,
            reels: Math.max(0, (prev.reels || 0) - 1)
          }));
        }
        
        alert("✅ Reel deleted successfully!");
      } else {
        alert("❌ Failed to delete reel");
      }
    } catch (error) {
      console.error("Error deleting reel:", error);
      alert("❌ Error deleting reel");
    } finally {
      setDeletingReel(null);
    }
  };

  // Reload dashboard data
  const reloadDashboard = async () => {
    setLoading(true);
    try {
      const statsRes = await fetchUserStats();
      if (statsRes.ok) {
        setStats(statsRes.data);
      }

      const reelsRes = await fetchReels(1, 50);
      if (reelsRes.ok) {
        const currentUserReels = reelsRes.data.items.filter(
          reel => reel.author.username === username
        );
        setUserReels(currentUserReels.slice(0, 5));
      }
    } catch (error) {
      console.error("Error reloading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Upload reel functions
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowUpload(true);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const uploadRes = await uploadReel(selectedFile);
      if (uploadRes.ok) {
        const createRes = await createReel({
          video_url: uploadRes.data.url,
          caption: caption
        });
        
        if (createRes.ok) {
          alert("✅ Reel uploaded successfully!");
          setShowUpload(false);
          setSelectedFile(null);
          setCaption("");
          // Reload dashboard to show new reel
          await reloadDashboard();
        }
      }
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, @{username}</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full px-6 py-3 shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Upload Reel
          </button>
        </div>
      </div>

      {/* Stats Grid - Added Reels Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats?.posts || 0}</div>
          <div className="text-sm text-gray-600">Your Posts</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats?.reels || 0}</div>
          <div className="text-sm text-gray-600">Your Reels</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats?.likes_received || 0}</div>
          <div className="text-sm text-gray-600">Likes Received</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats?.comments || 0}</div>
          <div className="text-sm text-gray-600">Comments Made</div>
        </GlassCard>
      </div>

      {/* Recent Posts - UNCHANGED */}
      <GlassCard className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Recent Posts</h2>
        {userPosts.length > 0 ? (
          <div className="space-y-4">
            {userPosts.map(post => (
              <div key={post.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-800 line-clamp-2">{post.content}</p>
                    {post.image_url && (
                      <div className="mt-2 text-sm text-blue-600">📷 Contains Image</div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>❤️ {post.likes_count || 0}</span>
                      <span>💬 {post.comments_count || 0}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(post.created_at_pk || post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-600">No posts yet</p>
            <p className="text-sm text-gray-500 mt-1">Start sharing your thoughts!</p>
          </div>
        )}
      </GlassCard>

      {/* Recent Reels Section with Delete Option */}
      <GlassCard className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Recent Reels</h2>
          <button
            onClick={reloadDashboard}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            🔄 Refresh
          </button>
        </div>
        {userReels.length > 0 ? (
          <div className="space-y-4">
            {userReels.map(reel => (
              <div key={reel.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎬</span>
                      <p className="text-gray-800 font-medium">Reel Video</p>
                    </div>
                    {reel.caption && (
                      <p className="text-gray-600 text-sm mb-2">{reel.caption}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        ❤️ {reel.likes_count || 0} likes
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(reel.created_at_pk || reel.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={reel.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      Watch
                    </a>
                    <button
                      onClick={() => handleDeleteReel(reel.id, reel.caption)}
                      disabled={deletingReel === reel.id}
                      className="text-red-500 hover:text-red-600 text-sm bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deletingReel === reel.id ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </div>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-gray-600">No reels yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first reel to share videos!</p>
          </div>
        )}
      </GlassCard>

      {/* Quick Stats - Updated with Reels */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Posts</span>
            <span className="font-semibold">{stats?.posts || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Reels</span>
            <span className="font-semibold">{stats?.reels || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Likes Received</span>
            <span className="font-semibold">{stats?.likes_received || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Comments Made</span>
            <span className="font-semibold">{stats?.comments || 0}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-gray-600 font-medium">Total Content</span>
            <span className="font-semibold text-blue-600">
              {(stats?.posts || 0) + (stats?.reels || 0)}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Create New Reel</h2>
              <p className="text-gray-400 text-sm mt-1">Upload a short video</p>
            </div>
            
            <div className="p-6">
              {selectedFile && (
                <div className="mb-6 p-4 bg-gray-800 rounded-xl text-center">
                  <div className="text-4xl mb-3">🎥</div>
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
              
              <form onSubmit={handleUpload}>
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-3">
                    Add a caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="What's your reel about?"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpload(false);
                      setSelectedFile(null);
                      setCaption("");
                    }}
                    className="flex-1 py-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </div>
                    ) : (
                      "Upload Reel"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
