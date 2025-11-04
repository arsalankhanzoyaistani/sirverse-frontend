import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserProfile, createChatRoom } from "../utils/api";
import PostCard from "../components/PostCard";
import Avatar from "../components/ui/Avatar";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import { followUser, unfollowUser, getFollowStatus, blockUser } from "../utils/api";
import ReportModal from "../components/ReportModal";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [followStatus, setFollowStatus] = useState({
    is_following: false,
    is_blocked: false,
    followers_count: 0,
    following_count: 0
  });
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  async function loadProfile() {
    setLoading(true);
    const res = await fetchUserProfile(username);
    setLoading(false);
    if (res.ok) {
      setProfile(res.data);
    } else {
      setProfile(null);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [username]);

  // Load follow status when profile loads
  useEffect(() => {
    if (profile && profile.user) {
      loadFollowStatus();
    }
  }, [profile]);

  const loadFollowStatus = async () => {
    if (!profile?.user) return;
    
    try {
      const res = await getFollowStatus(profile.user.id);
      if (res.ok) {
        setFollowStatus(res.data);
      }
    } catch (error) {
      console.error("Error loading follow status:", error);
    }
  };

  // Function to handle sending message - FIXED VERSION
  const handleSendMessage = async () => {
    if (!profile || !profile.user) return;
    
    setSendingMessage(true);
    try {
      // Create chat room with this user
      const res = await createChatRoom(profile.user.id);
      
      if (res.ok && res.data) {
        // Navigate to chats and open the specific room
        navigate('/chats', { 
          state: { 
            openRoom: res.data.room || res.data 
          } 
        });
      } else {
        alert("Failed to start conversation. Please try again.");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert("Error starting conversation. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFollow = async () => {
    if (!profile?.user) return;
    
    setLoadingFollow(true);
    try {
      const res = await followUser(profile.user.id);
      if (res.ok) {
        setFollowStatus(prev => ({
          ...prev,
          is_following: true,
          followers_count: res.data.followers_count
        }));
      } else {
        alert(res.data?.error || "Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
      alert("Error following user");
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleUnfollow = async () => {
    if (!profile?.user) return;
    
    setLoadingFollow(true);
    try {
      const res = await unfollowUser(profile.user.id);
      if (res.ok) {
        setFollowStatus(prev => ({
          ...prev,
          is_following: false,
          followers_count: res.data.followers_count
        }));
      } else {
        alert(res.data?.error || "Failed to unfollow user");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      alert("Error unfollowing user");
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleBlock = async () => {
    if (!profile?.user) return;
    
    if (!window.confirm(`Are you sure you want to block @${profile.user.username}? You won't see their content and they won't be able to message you.`)) {
      return;
    }
    
    setLoadingBlock(true);
    try {
      const res = await blockUser(profile.user.id);
      if (res.ok) {
        alert(`You have blocked @${profile.user.username}`);
        navigate('/posts'); // Redirect to posts after blocking
      } else {
        alert(res.data?.error || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Error blocking user");
    } finally {
      setLoadingBlock(false);
    }
  };

  // FIXED: Proper date formatting function
  const formatJoinDate = (dateString) => {
    if (!dateString) return "Unknown";
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Unknown";
      }
      
      return date.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <Button 
            onClick={() => navigate('/posts')} 
            className="mt-4"
          >
            Back to Posts
          </Button>
        </div>
      </div>
    );
  }

  const user = profile.user;
  const loggedInUsername = localStorage.getItem("username") || "";
  const isOwnProfile = loggedInUsername === user.username;

  return (
    <div className="min-h-screen pb-4 max-w-4xl mx-auto px-4">
      {/* Profile Header */}
      <GlassCard className="p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            {user.avatar && user.avatar.startsWith("http") ? (
              <img
                src={user.avatar}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Follow Stats */}
            <div className="flex gap-4 mt-4 text-center">
              <div>
                <div className="font-bold text-gray-900 text-lg">{followStatus.followers_count}</div>
                <div className="text-xs text-gray-600">Followers</div>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">{followStatus.following_count}</div>
                <div className="text-xs text-gray-600">Following</div>
              </div>
            </div>
            
            {/* Action Buttons for Mobile */}
            <div className="flex flex-col gap-2 mt-4 md:hidden w-full">
              {!isOwnProfile && (
                <>
                  <Button
                    onClick={followStatus.is_following ? handleUnfollow : handleFollow}
                    loading={loadingFollow}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {loadingFollow ? "..." : (followStatus.is_following ? "✓ Following" : "👤 Follow")}
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    loading={sendingMessage}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {sendingMessage ? "..." : "💬 Message"}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowReportModal(true)}
                      className="border-gray-300 flex-1"
                    >
                      ⚠️ Report
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={handleBlock}
                      loading={loadingBlock}
                      className="border-gray-300 text-red-600 hover:bg-red-50 flex-1"
                    >
                      🚫 Block
                    </Button>
                  </div>
                </>
              )}
              {isOwnProfile && (
                <Button 
                  onClick={() => navigate('/settings')}
                  variant="secondary"
                  className="border-gray-300"
                >
                  ⚙️ Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">@{user.username}</h1>
                {user.full_name && (
                  <p className="text-lg text-gray-700 mt-1">{user.full_name}</p>
                )}
                <p className="text-gray-600 mt-2">{user.bio || "No bio yet"}</p>
                
                {/* Stats */}
                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-xl">{profile.posts?.length || 0}</div>
                    <div className="text-gray-600 text-sm">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-xl">{profile.reels?.length || 0}</div>
                    <div className="text-gray-600 text-sm">Reels</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-xl">
                      {(profile.posts?.length || 0) + (profile.reels?.length || 0)}
                    </div>
                    <div className="text-gray-600 text-sm">Total</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Desktop */}
              <div className="hidden md:flex flex-col gap-3 mt-4 md:mt-0">
                {!isOwnProfile && (
                  <>
                    <Button
                      onClick={followStatus.is_following ? handleUnfollow : handleFollow}
                      loading={loadingFollow}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {loadingFollow ? "..." : (followStatus.is_following ? "✓ Following" : "👤 Follow")}
                    </Button>
                    
                    <Button
                      onClick={handleSendMessage}
                      loading={sendingMessage}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      {sendingMessage ? "Starting..." : "💬 Send Message"}
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => setShowReportModal(true)}
                        className="border-gray-300 flex-1"
                      >
                        ⚠️ Report
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={handleBlock}
                        loading={loadingBlock}
                        className="border-gray-300 text-red-600 hover:bg-red-50 flex-1"
                      >
                        🚫 Block
                      </Button>
                    </div>
                  </>
                )}
                {isOwnProfile && (
                  <Button 
                    onClick={() => navigate('/settings')}
                    variant="secondary"
                    className="border-gray-300"
                  >
                    ⚙️ Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Join Date - FIXED */}
            <div className="mt-4 text-sm text-gray-500">
              Joined {formatJoinDate(user.created_at)}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Content Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'posts' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Posts ({profile.posts?.length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('reels')}
          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'reels' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Reels ({profile.reels?.length || 0})
        </button>
      </div>

      {/* Posts Content */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {profile.posts && profile.posts.length > 0 ? (
            profile.posts.map((post) => (
              <PostCard key={post.id} post={post} onRefresh={loadProfile} />
            ))
          ) : (
            <GlassCard className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isOwnProfile ? "No posts yet" : "No posts to show"}
              </h3>
              <p className="text-gray-600 mb-4">
                {isOwnProfile 
                  ? "Share your first post with the community!" 
                  : `${user.username} hasn't shared any posts yet.`
                }
              </p>
              {isOwnProfile && (
                <Button 
                  onClick={() => navigate('/posts')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Create Your First Post
                </Button>
              )}
            </GlassCard>
          )}
        </div>
      )}

      {/* Reels Content */}
      {activeTab === 'reels' && (
        <div>
          {profile.reels && profile.reels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.reels.map((reel) => (
                <GlassCard key={reel.id} className="p-4">
                  <div className="relative">
                    <video
                      src={reel.video_url}
                      className="w-full h-48 rounded-lg object-cover"
                      controls
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      🎬 Reel
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                    {reel.caption || "No caption"}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      ❤️ {reel.likes_count || 0}
                    </span>
                    <span>{formatJoinDate(reel.created_at)}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isOwnProfile ? "No reels yet" : "No reels to show"}
              </h3>
              <p className="text-gray-600 mb-4">
                {isOwnProfile 
                  ? "Create your first reel to share videos!" 
                  : `${user.username} hasn't created any reels yet.`
                }
              </p>
              {isOwnProfile && (
                <Button 
                  onClick={() => navigate('/reels')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Create Your First Reel
                </Button>
              )}
            </GlassCard>
          )}
        </div>
      )}

      {/* Empty State when no content at all */}
      {(!profile.posts || profile.posts.length === 0) && (!profile.reels || profile.reels.length === 0) && (
        <GlassCard className="p-8 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isOwnProfile ? "Your profile is empty" : "No content to show"}
          </h3>
          <p className="text-gray-600">
            {isOwnProfile 
              ? "Start sharing posts and reels to build your profile!" 
              : `This user hasn't shared any content yet.`
            }
          </p>
          {isOwnProfile && (
            <div className="flex gap-3 justify-center mt-4">
              <Button 
                onClick={() => navigate('/posts')}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Create Post
              </Button>
              <Button 
                onClick={() => navigate('/reels')}
                variant="secondary"
                className="border-gray-300"
              >
                Create Reel
              </Button>
            </div>
          )}
        </GlassCard>
      )}

      {/* Report Modal */}
      <ReportModal
   isOpen={showReportModal}
   onClose={() => setShowReportModal(false)}
   reportedItem={{
      reported_user_id: profile?.user?.id  
  }}
/>

    </div>
  );
}
