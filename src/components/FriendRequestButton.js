import React, { useState, useEffect } from "react";
import {
  sendFriendRequest,
  cancelFriendRequest,
  getFollowStatus,
  getIncomingRequests,
  getSentRequests,
  acceptFriendRequest,
  denyFriendRequest
} from "../utils/api";

export default function FriendRequestButton({ userId, username }) {
  const [status, setStatus] = useState("none"); // none, pending_sent, pending_received, friends
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    loadStatus();
  }, [userId]);

  async function loadStatus() {
    const res = await getFollowStatus(userId);
    if (res.ok && res.data.is_following) {
      setStatus("friends");
      return;
    }
    // Check incoming requests
    const incoming = await getIncomingRequests();
    if (incoming.ok && incoming.data.requests?.find(r => r.sender.id === userId)) {
      setStatus("pending_received");
      setRequestId(incoming.data.requests.find(r => r.sender.id === userId).id);
      return;
    }
    // Check sent requests
    const sent = await getSentRequests();
    if (sent.ok && sent.data.requests?.find(r => r.receiver.id === userId)) {
      setStatus("pending_sent");
      setRequestId(sent.data.requests.find(r => r.receiver.id === userId).id);
    }
  }

  async function handleSend() {
    setLoading(true);
    const res = await sendFriendRequest(userId);
    if (res.ok) {
      setStatus("pending_sent");
      setRequestId(res.data.request.id);
    } else {
      alert(res.data?.error || "Failed to send request");
    }
    setLoading(false);
  }

  async function handleCancel() {
    if (!requestId) return;
    setLoading(true);
    const res = await cancelFriendRequest(requestId);
    if (res.ok) {
      setStatus("none");
      setRequestId(null);
    } else {
      alert(res.data?.error || "Failed to cancel");
    }
    setLoading(false);
  }

  if (status === "friends") {
    return (
      <button className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
        ✓ Friends
      </button>
    );
  }

  if (status === "pending_received") {
    return (
      <div className="flex gap-2">
        <button
          onClick={async () => {
            const res = await acceptFriendRequest(requestId);
            if (res.ok) {
              setStatus("friends");
            } else {
              alert(res.data?.error || "Failed to accept");
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          Accept
        </button>
        <button
          onClick={async () => {
            const res = await denyFriendRequest(requestId);
            if (res.ok) {
              setStatus("none");
              setRequestId(null);
            } else {
              alert(res.data?.error || "Failed to deny");
            }
          }}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium"
        >
          Deny
        </button>
      </div>
    );
  }

  if (status === "pending_sent") {
    return (
      <button
        onClick={handleCancel}
        disabled={loading}
        className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50"
      >
        {loading ? "..." : "Pending"}
      </button>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
    >
      {loading ? "Sending..." : "Add Friend"}
    </button>
  );
}
