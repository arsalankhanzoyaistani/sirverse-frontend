// frontend/src/pages/Profile.jsx
// Ultra Clean Instagram Style Profile

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchUserProfile,
  createChatRoom,
  followUser,
  unfollowUser,
  getFollowStatus,
  blockUser
} from "../utils/api";

import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import PostCard from "../components/PostCard";
import GlassCard from "../components/ui/GlassCard";
import ReportModal from "../components/ReportModal";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posts");

  const [followState, setFollowState] = useState({
    is_following: false,
    followers_count: 0,
    following_count: 0
  });

  const [working, setWorking] = useState({
    follow: false,
    message: false,
    block: false
  });

  const [reportOpen, setReportOpen] = useState(false);
  const loggedIn = localStorage.getItem("username");

  // Load profile
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUserProfile(username);
      if (res && res.ok) {
        const data = res.data;
        const normalized = {
          user: data.user ?? data,
          posts: data.posts ?? data.user?.posts ?? [],
          reels: data.reels ?? data.user?.reels ?? []
        };

        const followersCount = normalized.user?.followers_count ?? normalized.user?.followers ?? data.followers_count ?? data.followers ?? 0;
        const followingCount = normalized.user?.following_count ?? normalized.user?.following ?? data.following_count ?? data.following ?? 0;

        setProfile(normalized);
        setFollowState(s => ({
          ...s,
          followers_count: Number(followersCount) || 0,
          following_count: Number(followingCount) || 0
        }));
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("loadProfile error:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Load follow state
  const loadFollowStatus = useCallback(async () => {
    const userId = profile?.user?.id ?? profile?.id;
    if (!userId) return;

    try {
      const res = await getFollowStatus(userId);
      if (res && res.ok) {
        const d = res.data;
        if (typeof d === "boolean") {
          setFollowState(s => ({ ...s, is_following: !!d }));
        } else {
          setFollowState(s => ({
            ...s,
            is_following: !!d?.is_following,
            followers_count: Number(d?.followers_count ?? d?.followers ?? s.followers_count) || s.followers_count,
            following_count: Number(d?.following_count ?? d?.following ?? s.following_count) || s.following_count
          }));
        }
      }
    } catch (err) {
      console.error("loadFollowStatus error:", err);
    }
  }, [profile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile) {
      loadFollowStatus();
    }
  }, [profile, loadFollowStatus]);

  // Follow / Unfollow
  async function toggleFollow() {
    if (!profile?.user?.id) return;
    if (working.follow) return;

    setWorking(w => ({ ...w, follow: true }));

    try {
      const userId = profile.user.id;
      const oldState = { ...followState };

      // UI optimistic update
      setFollowState(s => ({
        ...s,
        is_following: !s.is_following,
        followers_count: s.is_following
          ? s.followers_count - 1
          : s.followers_count + 1
      }));

      const res = followState.is_following
        ? await unfollowUser(userId)
        : await followUser(userId);

      if (res && res.ok) {
        // Refresh to ensure data consistency
        await loadProfile();
        await loadFollowStatus();
      } else {
        // revert on failure
        setFollowState(oldState);
        alert(res?.data?.error || "Failed to update follow status");
      }
    } catch (err) {
      console.error("toggleFollow error:", err);
      alert("Network error — try again");
    } finally {
      setWorking(w => ({ ...w, follow: false }));
    }
  }

  // Start messaging
  async function startMessage() {
    if (!profile?.user?.id) return;
    if (working.message) return;

    setWorking(w => ({ ...w, message: true }));

    try {
      const res = await createChatRoom(profile.user.id);
      if (res && res.ok) {
        const room = res.data?.room ?? res.data;
        navigate("/chats", { state: { openRoom: room } });
      } else {
        alert("Unable to start conversation.");
      }
    } catch (err) {
      console.error("startMessage error:", err);
      alert("Network error");
    } finally {
      setWorking(w => ({ ...w, message: false }));
    }
  }

  // Block user
  async function handleBlock() {
    if (!profile?.user?.id) return;
    if (!window.confirm(`Block @${profile.user.username}?`)) return;

    setWorking(w => ({ ...w, block: true }));

    try {
      const res = await blockUser(profile.user.id);
      if (res && res.ok) {
        alert("User blocked.");
        navigate("/posts");
      } else {
        alert(res?.data?.error || "Could not block user.");
      }
    } catch (err) {
      console.error("block error:", err);
      alert("Network error");
    } finally {
      setWorking(w => ({ ...w, block: false }));
    }
  }

  // Date format helper
  const formatDate = d => {
    if (!d) return "Unknown";
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return "Unknown";
      return dt.toLocaleDateString("en-PK", {
        year: "numeric",
        month: "long"
      });
    } catch {
      return "Unknown";
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  // Not found
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <p className="text-gray-600 mb-4">User not found.</p>
        <Button onClick={() => navigate("/posts")}>Go Back</Button>
      </div>
    );
  }

  const user = profile.user ?? profile;
  const isOwn = loggedIn && user.username && loggedIn === user.username;

  // ---------------------------
  // ULTRA CLEAN INSTAGRAM STYLE
  // ---------------------------

  return (
    <div className="min-h-screen px-4 pt-6 pb-24 max-w-xl mx-auto">
      
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <Avatar
          src={user.avatar}
          size={120}
          emoji={user.username?.charAt(0) ?? "U"}
        />

        {/* Username */}
        <h1 className="text-2xl font-bold mt-4">@{user.username}</h1>

        {/* Full Name */}
        {user.full_name && (
          <p className="text-gray-700 mt-1">{user.full_name}</p>
        )}

        {/* Bio */}
        <p className="text-gray-600 text-center mt-2 px-4 whitespace-pre-wrap">
          {user.bio || "No bio yet."}
        </p>

        {/* Joined Date */}
        <p className="text-xs text-gray-400 mt-1">
          Joined {formatDate(user.created_at)}
        </p>

        {/* Stats (Posts - Followers - Following) */}
        <div className="flex justify-center w-full mt-5">
          <div className="flex items-center justify-around w-full max-w-xs">
            <div className="text-center">
              <div className="font-bold text-lg">{(profile.posts ?? []).length}</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>

            <div className="text-center">
              <div className="font-bold text-lg">{followState.followers_count}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>

            <div className="text-center">
              <div className="font-bold text-lg">{followState.following_count}</div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        {!isOwn ? (
          <div className="w-full max-w-xs mt-4 space-y-2">
            <Button
              onClick={toggleFollow}
              loading={working.follow}
              className={`w-full ${followState.is_following ? "bg-blue-600 text-white" : "bg-blue-500 text-white"}`}
            >
              {followState.is_following ? "Following" : "Follow"}
            </Button>

            <Button
              onClick={startMessage}
              loading={working.message}
              className="w-full bg-gray-800 text-white"
            >
              Message
            </Button>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setReportOpen(true)}
                className="flex-1"
              >
                Report
              </Button>

              <Button
                variant="secondary"
                className="flex-1 text-red-600"
                loading={working.block}
                onClick={handleBlock}
              >
                Block
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => navigate("/settings")}
            className="w-full max-w-xs mt-4"
            variant="secondary"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex mt-10 border-b">
        <button
          className={`flex-1 py-2 text-center ${
            tab === "posts"
              ? "border-b-2 border-black font-semibold"
              : "text-gray-400"
          }`}
          onClick={() => setTab("posts")}
        >
          Posts
        </button>

        <button
          className={`flex-1 py-2 text-center ${
            tab === "reels"
              ? "border-b-2 border-black font-semibold"
              : "text-gray-400"
          }`}
          onClick={() => setTab("reels")}
        >
          Reels
        </button>
      </div>

      {/* Posts */}
      {tab === "posts" && (
        <div className="mt-6 space-y-4">
          {(profile.posts && profile.posts.length > 0) ? (
            profile.posts.map(p => (
              <PostCard key={p.id} post={p} onRefresh={loadProfile} />
            ))
          ) : (
            <GlassCard className="text-center p-8">
              <p>No posts yet.</p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Reels */}
      {tab === "reels" && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {(profile.reels && profile.reels.length > 0) ? (
            profile.reels.map(r => (
              <div key={r.id} className="rounded-lg overflow-hidden">
                <video src={r.video_url} controls className="w-full h-40 object-cover" />
              </div>
            ))
          ) : (
            <GlassCard className="text-center p-8 col-span-2">
              <p>No reels yet.</p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        reportedItem={{ reported_user_id: user.id }}
      />
    </div>
  );
}
