// frontend/src/pages/Profile.jsx
// Fixed: Follow vs Friends vs Unfriend — never lies

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchUserProfile,
  createChatRoom,
  getFollowStatus,
  blockUser,
  followUser,
  unfollowUser
} from "../utils/api";
import FriendRequestButton from "../components/FriendRequestButton";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import PostCard from "../components/PostCard";
import GlassCard from "../components/ui/GlassCard";
import ReportModal from "../components/ReportModal";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const loggedIn = localStorage.getItem("username");
  const myId = parseInt(localStorage.getItem("user_id") || "0");

  // profile data
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posts");

  // follow + friend state
  const [followState, setFollowState] = useState({
    is_following: false,
    followers_count: 0,
    following_count: 0
  });
  const [isFriend, setIsFriend] = useState(false);

  // UI flags
  const [working, setWorking] = useState({
    follow: false,
    message: false,
    block: false
  });

  const [reportOpen, setReportOpen] = useState(false);

  // ----------  DATA LOADING  ----------
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUserProfile(username);
      if (res?.ok) {
        const data = res.data;
        const norm = {
          user: data.user ?? data,
          posts: data.posts ?? data.user?.posts ?? [],
          reels: data.reels ?? data.user?.reels ?? []
        };
        setProfile(norm);

        const fCount = norm.user?.followers_count ?? 0;
        const gCount = norm.user?.following_count ?? 0;
        setFollowState(s => ({
          ...s,
          followers_count: Number(fCount),
          following_count: Number(gCount)
        }));
      } else setProfile(null);
    } catch (e) {
      console.error("loadProfile", e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // ✅ MUTUAL-ONLY FRIEND DETECTION (ID-based)
  const loadFriendStatus = useCallback(async () => {
    if (!profile?.user?.id || !myId) return;
    try {
      const theirId = profile.user.id;

      // 1. Do YOU follow THEM?
      const resMe = await getFollowStatus(theirId);
      const iFollowThem = resMe?.ok ? !!resMe.data?.is_following : false;

      // 2. Do THEY follow YOU? (swap IDs)
      const resThem = await getFollowStatus(myId);
      const theyFollowMe = resThem?.ok ? !!resThem.data?.is_following : false;

      // 3. Only friends if MUTUAL
      setIsFriend(iFollowThem && theyFollowMe);

      // Update counts for display
      setFollowState(s => ({
        ...s,
        is_following: iFollowThem,
        followers_count: Number(resMe.data?.followers_count ?? s.followers_count),
        following_count: Number(resMe.data?.following_count ?? s.following_count)
      }));
    } catch (e) {
      console.error("loadFriendStatus", e);
    }
  }, [profile, myId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile) loadFriendStatus();
  }, [profile, loadFriendStatus]);

  // ----------  ACTIONS  ----------
  const toggleFollow = async () => {
    if (!profile?.user?.id || working.follow) return;
    setWorking(w => ({ ...w, follow: true }));
    try {
      const userId = profile.user.id;
      const res = followState.is_following
        ? await unfollowUser(userId)
        : await followUser(userId);
      if (res?.ok) {
        await loadFriendStatus(); // refresh mutual status
      } else {
        alert(res?.data?.error || "Failed to update follow");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setWorking(w => ({ ...w, follow: false }));
    }
  };

  const startMessage = async () => {
    if (!profile?.user?.id || working.message) return;
    setWorking(w => ({ ...w, message: true }));
    try {
      const res = await createChatRoom(profile.user.id);
      if (res?.ok) navigate("/chats", { state: { openRoom: res.data.room } });
      else alert("Unable to start conversation");
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setWorking(w => ({ ...w, message: false }));
    }
  };

  // ✅ UNFRIEND: removes BOTH follows → back to public-only
  const handleUnfriend = async () => {
    if (!profile?.user?.id || working.message) return;
    if (!window.confirm(`Remove @${profile.user.username} from friends? This undoes the mutual connection.`)) return;
    setWorking(w => ({ ...w, message: true })); // reuse loader
    try {
      // Remove BOTH directions = unfriend
      await unfollowUser(profile.user.id); // you → them
      await unfollowUser(myId);            // them → you (swap IDs)
      await loadFriendStatus();            // refresh mutual status
      alert("Friend removed");
    } catch (e) {
      console.error(e);
      alert("Could not unfriend");
    } finally {
      setWorking(w => ({ ...w, message: false }));
    }
  };

  const handleBlock = async () => {
    if (!profile?.user?.id || working.block) return;
    if (!window.confirm(`Block @${profile.user.username}?`)) return;
    setWorking(w => ({ ...w, block: true }));
    try {
      const res = await blockUser(profile.user.id);
      if (res?.ok) {
        alert("User blocked");
        navigate("/posts");
      } else alert(res?.data?.error || "Block failed");
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setWorking(w => ({ ...w, block: false }));
    }
  };

  // ----------  HELPERS  ----------
  const formatDate = d =>
    d
      ? new Date(d).toLocaleDateString("en-PK", { year: "numeric", month: "long" })
      : "Unknown";

  const isOwn = loggedIn === username;

  // ----------  LOADING / 404  ----------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <p className="text-gray-600 mb-4">User not found.</p>
        <Button onClick={() => navigate("/posts")}>Go Back</Button>
      </div>
    );

  const user = profile.user;
  const posts = profile.posts ?? [];
  const reels = profile.reels ?? [];

  // ----------  RENDER  ----------
  return (
    <div className="min-h-screen px-4 pt-6 pb-24 max-w-xl mx-auto">
      {/* ----  HEADER  ---- */}
      <div className="flex flex-col items-center">
        <Avatar src={user.avatar} size={120} emoji={user.username?.[0] ?? "U"} />

        <h1 className="text-2xl font-bold mt-4">@{user.username}</h1>
        {user.full_name && <p className="text-gray-700 mt-1">{user.full_name}</p>}
        <p className="text-gray-600 text-center mt-2 px-4 whitespace-pre-wrap">{user.bio || "No bio yet."}</p>
        <p className="text-xs text-gray-400 mt-1">Joined {formatDate(user.created_at)}</p>

        {/* Stats */}
        <div className="flex justify-center w-full mt-5 max-w-xs">
          <div className="text-center">
            <div className="font-bold text-lg">{posts.length}</div>
            <div className="text-xs text-gray-500">Posts</div>
          </div>
          <div className="text-center mx-8">
            <div className="font-bold text-lg">{followState.followers_count}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{followState.following_count}</div>
            <div className="text-xs text-gray-500">Following</div>
          </div>
        </div>

        {/* ----  ACTION BUTTONS  ---- */}
        {!isOwn && (
          <div className="w-full max-w-xs mt-4 space-y-2">
            {/* 1. FOLLOW (public updates) */}
            <Button
              onClick={toggleFollow}
              loading={working.follow}
              className={`w-full ${
                followState.is_following ? "bg-gray-800 text-white" : "bg-blue-500 text-white"
              }`}
            >
              {followState.is_following ? "Following" : "Follow"}
            </Button>

            {/* 2. FRIEND REQUEST (mutual chat) */}
            <FriendRequestButton userId={user.id} username={user.username} />

            {/* 3. MESSAGE (only if friends) */}
            {isFriend && (
              <>
                <Button loading={working.message} onClick={startMessage} className="w-full bg-green-600 text-white">
                  Message
                </Button>

                {/* 👇 UNFRIEND (removes mutual connection) */}
                <Button
                  variant="secondary"
                  className="w-full text-orange-600 border border-orange-300 hover:bg-orange-50"
                  onClick={handleUnfriend}
                >
                  Unfriend
                </Button>
              </>
            )}

            {/* 4. Report / Block */}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setReportOpen(true)} className="flex-1">
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
        )}

        {/* Own profile */}
        {isOwn && (
          <Button onClick={() => navigate("/settings")} variant="secondary" className="w-full max-w-xs mt-4">
            Edit Profile
          </Button>
        )}
      </div>

      {/* ----  TABS  ---- */}
      <div className="flex mt-10 border-b">
        <button
          className={`flex-1 py-2 text-center ${tab === "posts" ? "border-b-2 border-black font-semibold" : "text-gray-400"}`}
          onClick={() => setTab("posts")}
        >
          Posts
        </button>
        <button
          className={`flex-1 py-2 text-center ${tab === "reels" ? "border-b-2 border-black font-semibold" : "text-gray-400"}`}
          onClick={() => setTab("reels")}
        >
          Reels
        </button>
      </div>

      {/* ----  CONTENT  ---- */}
      {tab === "posts" && (
        <div className="mt-6 space-y-4">
          {posts.length ? (
            posts.map(p => <PostCard key={p.id} post={p} />)
          ) : (
            <GlassCard className="text-center p-8"><p>No posts yet.</p></GlassCard>
          )}
        </div>
      )}

      {tab === "reels" && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {reels.length ? (
            reels.map(r => (
              <div key={r.id} className="rounded-lg overflow-hidden">
                <video src={r.video_url} controls className="w-full h-40 object-cover" />
              </div>
            ))
          ) : (
            <GlassCard className="text-center p-8 col-span-2"><p>No reels yet.</p></GlassCard>
          )}
        </div>
      )}

      {/* ----  REPORT MODAL  ---- */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        reportedItem={{ reported_user_id: user.id }}
      />
    </div>
  );
}
