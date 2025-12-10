import React, { useState, useEffect } from "react";
import { getFriends } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";
import Avatar from "../components/ui/Avatar";

export default function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  async function loadFriends() {
    const res = await getFriends();
    if (res.ok) {
      setFriends(res.data.friends || []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading friends...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Friends</h1>
        <p className="text-gray-600 mt-1">People you're connected with</p>
      </div>

      {friends.length > 0 ? (
        <div className="space-y-4">
          {friends.map(friend => (
            <GlassCard key={friend.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={friend.avatar} emoji="👤" size={50} />
                  <div>
                    <div className="font-semibold text-gray-900">@{friend.username}</div>
                    <div className="text-sm text-gray-500">{friend.full_name}</div>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = `/profile/${friend.username}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  View Profile
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-6 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-gray-700 font-medium">No friends yet</p>
          <p className="text-sm text-gray-500 mt-1">Send friend requests to connect with classmates</p>
        </GlassCard>
      )}
    </div>
  );
}
