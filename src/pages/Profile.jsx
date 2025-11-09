// frontend/src/pages/Profile.jsx
// ===========================================
// ✅ SirVerse Final Profile Page (Full Version)
// Shows user profile, posts, reels, actions,
// with safe Cloudinary avatar display and controls
// ===========================================

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchUserProfile,
  createChatRoom,
  followUser,
  unfollowUser,
  getFollowStatus,
  blockUser,
} from "../utils/api";
import PostCard from "../components/PostCard";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import ReportModal from "../components/ReportModal";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();

  // 🔹 State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [followStatus, setFollowStatus] = useState({
    is_following: false,
    is_blocked: false,
    followers_count: 0,
    following_count: 0,
  });
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // ---------------------------------------------------
  // Load Profile
  // ---------------------------------------------------
  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchUserProfile(username);
      if (res.ok) setProfile(res.data);
      else setProfile(null);
    } catch (e) {
      console.error("Profile load error:", e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  // ---------------------------------------------------
  // Load Follow Status
  // ---------------------------------------------------
  const loadFollowStatus = async () => {
    if (!profile?.user) return;
    try {
      const res = await getFollowStatus(profile.user.id);
      if (res.ok) setFollowStatus(res.data);
    } catch (err) {
      console.error("Follow status load error:", err);
    }
  };

  useEffect(() => {
    if (profile?.user) loadFollowStatus();
  }, [profile]);

  // ---------------------------------------------------
  // Messaging
  // ---------------------------------------------------
  const handleSendMessage = async () => {
    if (!profile?.user) return;
    setSendingMessage(true);
    try {
      const res = await createChatRoom(profile.user.id);
      if (res.ok && res.data) {
        navigate("/chats", { state: { openRoom: res.data.room || res.data } });
      } else alert("Failed to start conversation.");
    } catch (err) {
      console.error("Start chat error:", err);
      alert("Error starting conversation.");
    } finally {
      setSendingMessage(false);
    }
  };

  // ---------------------------------------------------
  // Follow / Unfollow
  // ---------------------------------------------------
  const handleFollowToggle = async () => {
    if (!profile?.user) return;
    setLoadingFollow(true);
    try {
      const action = followStatus.is_following ? unfollowUser : followUser;
      const res = await action(profile.user.id);
      if (res.ok) {
        setFollowStatus((prev) => ({
          ...prev,
          is_following: !prev.is_following,
          followers_count: res.data.followers_count,
        }));
      } else alert(res.data?.error || "Action failed");
    } catch (err) {
      console.error("Follow toggle error:", err);
      alert("Error performing action");
    } finally {
      setLoadingFollow(false);
    }
  };

  // ---------------------------------------------------
  // Block
  // ---------------------------------------------------
  const handleBlock = async () => {
    if (!profile?.user) return;
    if (
      !window.confirm(
        `Block @${profile.user.username}? They won’t be able to message you.`
      )
    )
      return;
    setLoadingBlock(true);
    try {
      const res = await blockUser(profile.user.id);
      if (res.ok) {
        alert(`You blocked @${profile.user.username}`);
        navigate("/posts");
      } else alert(res.data?.error || "Failed to block user");
    } catch (err) {
      console.error("Block error:", err);
    } finally {
      setLoadingBlock(false);
    }
  };

  // ---------------------------------------------------
  // Helpers
  // ---------------------------------------------------
  const formatJoinDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return isNaN(date)
        ? "Unknown"
        : date.toLocaleDateString("en-PK", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
    } catch {
      return "Unknown";
    }
  };

  // ---------------------------------------------------
  // UI Loading & Empty
  // ---------------------------------------------------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600">User not found</p>
        <Button onClick={() => navigate("/posts")} className="mt-4">
          Back to Posts
        </Button>
      </div>
    );

  const user = profile.user;
  const loggedInUsername = localStorage.getItem("username") || "";
  const isOwnProfile = loggedInUsername === user.username;

  // ---------------------------------------------------
  // MAIN RETURN
  // ---------------------------------------------------
  return (
    <div className="min-h-screen pb-4 max-w-4xl mx-auto px-4">
      {/* Header */}
      <GlassCard className="p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar + Stats */}
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

            <div className="flex gap-4 mt-4 text-center">
              <div>
                <div className="font-bold text-gray-900 text-lg">
                  {followStatus.followers_count}
                </div>
                <div className="text-xs text-gray-600">Followers</div>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">
                  {followStatus.following_count}
                </div>
                <div className="text-xs text-gray-600">Following</div>
              </div>
            </div>

            {/* Mobile Buttons */}
            {!isOwnProfile && (
              <div className="flex flex-col gap-2 mt-4 md:hidden w-full">
                <Button
                  onClick={handleFollowToggle}
                  loading={loadingFollow}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {loadingFollow
                    ? "..."
                    : followStatus.is_following
                    ? "✓ Following"
                    : "👤 Follow"}
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
              </div>
            )}
            {isOwnProfile && (
              <Button
                onClick={() => navigate("/settings")}
                variant="secondary"
                className="border-gray-300 mt-4 md:hidden"
              >
                ⚙️ Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  @{user.username}
                </h1>
                {user.full_name && (
                  <p className="text-lg text-gray-700 mt-1">
                    {user.full_name}
                  </p>
                )}
                <p className="text-gray-600 mt-2">{user.bio || "No bio yet"}</p>

                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-xl">
                      {profile.posts?.length || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-xl">
                      {profile.reels?.length || 0}
                    </div>
                    <div className="text-gray-600 text-sm">Reels</div>
                  </div>
                </div>
              </div>

              {/* Desktop Buttons */}
              <div className="hidden md:flex flex-col gap-3 mt-4 md:mt-0">
                {!isOwnProfile ? (
                  <>
                    <Button
                      onClick={handleFollowToggle}
                      loading={loadingFollow}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {loadingFollow
                        ? "..."
                        : followStatus.is_following
                        ? "✓ Following"
                        : "👤 Follow"}
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
                ) : (
                  <Button
                    onClick={() => navigate("/settings")}
                    variant="secondary"
                    className="border-gray-300"
                  >
                    ⚙️ Edit Profile
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Joined {formatJoinDate(user.created_at)}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["posts", "reels"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "posts"
              ? `Posts (${profile.posts?.length || 0})`
              : `Reels (${profile.reels?.length || 0})`}
          </button>
        ))}
      </div>

      {/* Posts / Reels */}
      {activeTab === "posts" ? (
        profile.posts?.length ? (
          <div className="space-y-6">
            {profile.posts.map((post) => (
              <PostCard key={post.id} post={post} onRefresh={loadProfile} />
            ))}
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isOwnProfile ? "No posts yet" : "No posts to show"}
            </h3>
            {isOwnProfile && (
              <Button
                onClick={() => navigate("/posts")}
                className="bg-blue-500 hover:bg-blue-600 text-white mt-2"
              >
                Create Your First Post
              </Button>
            )}
          </GlassCard>
        )
      ) : profile.reels?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.reels.map((reel) => (
            <GlassCard key={reel.id} className="p-4">
              <video
                src={reel.video_url}
                className="w-full h-48 rounded-lg object-cover"
                controls
              />
              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                {reel.caption || "No caption"}
              </p>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isOwnProfile ? "No reels yet" : "No reels to show"}
          </h3>
          {isOwnProfile && (
            <Button
              onClick={() => navigate("/reels")}
              className="bg-blue-500 hover:bg-blue-600 text-white mt-2"
            >
              Create Your First Reel
            </Button>
          )}
        </GlassCard>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedItem={{ reported_user_id: profile?.user?.id }}
      />
    </div>
  );
}
