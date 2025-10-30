import React, { useState, useEffect } from "react";
import { getBlockedUsers, unblockUser } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";

export default function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const res = await getBlockedUsers();
      if (res.ok) {
        setBlockedUsers(res.data.blocked_users || []);
      }
    } catch (error) {
      console.error("Error loading blocked users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId) => {
    setUnblocking(userId);
    try {
      const res = await unblockUser(userId);
      if (res.ok) {
        // Remove from list
        setBlockedUsers(prev => prev.filter(user => user.id !== userId));
        alert("User unblocked successfully!");
      } else {
        alert("Failed to unblock user");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Error unblocking user");
    } finally {
      setUnblocking(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading blocked users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blocked Users</h1>
        <p className="text-gray-600 mt-1">Manage users you've blocked</p>
      </div>

      {blockedUsers.length > 0 ? (
        <div className="space-y-4">
          {blockedUsers.map(user => (
            <GlassCard key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} emoji="👤" size={50} />
                  <div>
                    <div className="font-semibold text-gray-900">@{user.username}</div>
                    <div className="text-sm text-gray-500">
                      Blocked on {new Date(user.blocked_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleUnblock(user.id)}
                  loading={unblocking === user.id}
                  variant="secondary"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Unblock
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-6 text-center">
          <div className="text-4xl mb-3">🚫</div>
          <p className="text-gray-700 font-medium">No blocked users</p>
          <p className="text-sm text-gray-500 mt-1">
            Users you block will appear here
          </p>
        </GlassCard>
      )}
    </div>
  );
}
