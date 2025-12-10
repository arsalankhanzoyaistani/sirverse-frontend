import React, { useState, useEffect } from "react";
import { getIncomingRequests, acceptFriendRequest, denyFriendRequest } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";
import Avatar from "../components/ui/Avatar";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const res = await getIncomingRequests();
    if (res.ok) {
      setRequests(res.data.requests || []);
    }
    setLoading(false);
  }

  async function handleAccept(requestId) {
    const res = await acceptFriendRequest(requestId);
    if (res.ok) {
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } else {
      alert(res.data?.error || "Failed to accept");
    }
  }

  async function handleDeny(requestId) {
    const res = await denyFriendRequest(requestId);
    if (res.ok) {
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } else {
      alert(res.data?.error || "Failed to deny");
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Friend Requests</h1>
        <p className="text-gray-600 mt-1">Accept or deny requests</p>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map(req => (
            <GlassCard key={req.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={req.sender.avatar} emoji="👤" size={50} />
                  <div>
                    <div className="font-semibold text-gray-900">@{req.sender.username}</div>
                    <div className="text-sm text-gray-500">
                      Sent {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeny(req.id)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                  >
                    Deny
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-6 text-center">
          <div className="text-4xl mb-3">💌</div>
          <p className="text-gray-700 font-medium">No pending requests</p>
          <p className="text-sm text-gray-500 mt-1">When someone sends you a request, it’ll appear here</p>
        </GlassCard>
      )}
    </div>
  );
}
