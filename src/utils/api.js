// frontend/src/utils/api.js

export const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://sirverse-backend-production.up.railway.app";


// Automatically attach JWT token if available
export function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Standardized response handler
async function handleResp(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

// ✅ FIXED: Correct ping path for production
export async function ping() {
  const r = await fetch(`${API_URL}/api/ping`);
  return handleResp(r);
}
export async function sendOtp({ email, username }) {
  const r = await fetch(`${API_URL}/api/auth/send_otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username }),
  });
  return handleResp(r);
}

export async function verifyOtp({ email, otp }) {
  const r = await fetch(`${API_URL}/api/auth/verify_otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return handleResp(r);
}

export async function fetchPosts(page = 1, perPage = 10) {
  const r = await fetch(`${API_URL}/api/posts?page=${page}&per_page=${perPage}`);
  return handleResp(r);
}

export async function createPost({ content, image_url }) {
  const r = await fetch(`${API_URL}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ content, image_url }),
  });
  return handleResp(r);
}

export async function deletePost(postId) {
  const r = await fetch(`${API_URL}/api/posts/${postId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  return handleResp(r);
}

// Reels API functions
export async function uploadReel(file) {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(`${API_URL}/api/upload/reel`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  return handleResp(r);
}

export async function fetchReels(page = 1, perPage = 10) {
  const r = await fetch(`${API_URL}/api/reels?page=${page}&per_page=${perPage}`);
  return handleResp(r);
}

export async function createReel({ video_url, caption }) {
  const r = await fetch(`${API_URL}/api/reels`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ video_url, caption }),
  });
  return handleResp(r);
}

export async function toggleReelLike(reelId) {
  const r = await fetch(`${API_URL}/api/reels/${reelId}/like`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function deleteReel(reelId) {
  const r = await fetch(`${API_URL}/api/reels/${reelId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function fetchComments(postId) {
  const r = await fetch(`${API_URL}/api/posts/${postId}/comments`);
  return handleResp(r);
}

export async function addComment(postId, content) {
  const r = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ content }),
  });
  return handleResp(r);
}

export async function toggleLike(postId) {
  const r = await fetch(`${API_URL}/api/posts/${postId}/like`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function fetchUserProfile(username) {
  const r = await fetch(`${API_URL}/api/users/${encodeURIComponent(username)}`);
  return handleResp(r);
}

// Ask Sir G (Hugging Face-backed)
export async function askSirG({ prompt, mode = "explain" }) {
  const r = await fetch(`${API_URL}/api/sirg`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ prompt, mode }),
  });
  // reuse handleResp logic by building result
  let data = null;
  try { data = await r.json(); } catch (_) { data = null; }
  return { ok: r.ok, status: r.status, data };
}

//....
// 🧾 Sir G Chat History APIs
export async function fetchAIHistory() {
  const r = await fetch(`${API_URL}/api/ai/history`, {
    headers: { ...authHeaders() },
  });
  return r.json();
}

export async function saveAIMessage(role, text) {
  const r = await fetch(`${API_URL}/api/ai/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role, text }),
  });
  return r.json();
}

export async function deleteAIHistory() {
  const r = await fetch(`${API_URL}/api/ai/history`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return r.json();
}
//.....
export async function fetchNotes({ q = "", publicOnly = true, page = 1 }) {
  const url = `${API_URL}/api/tools/notes/?q=${encodeURIComponent(q)}&public=${publicOnly}&page=${page}`;
  const r = await fetch(url);
  return handleResp(r);
}

export async function uploadNote({ title, description, file, isPublic = true }) {
  const form = new FormData();
  form.append("title", title);
  form.append("description", description);
  form.append("public", isPublic);
  form.append("file", file);
  const r = await fetch(`${API_URL}/api/tools/notes/`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  return handleResp(r);
}

/* Update user profile */
export async function updateUserProfile(userId, data) {
  const r = await fetch(`${API_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  return handleResp(r);
}

/* Fetch dashboard stats */
export async function fetchUserStats() {
  const r = await fetch(`${API_URL}/api/stats`, {
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

// Add to your api.js file

// Follow/Unfollow APIs
export async function followUser(userId) {
  const r = await fetch(`${API_URL}/api/users/${userId}/follow`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function unfollowUser(userId) {
  const r = await fetch(`${API_URL}/api/users/${userId}/unfollow`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function getFollowStatus(userId) {
  const r = await fetch(`${API_URL}/api/users/${userId}/follow_status`, {
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

// Block/Unblock APIs
export async function blockUser(userId) {
  const r = await fetch(`${API_URL}/api/users/${userId}/block`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function unblockUser(userId) {
  const r = await fetch(`${API_URL}/api/users/${userId}/unblock`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function getBlockedUsers() {
  const r = await fetch(`${API_URL}/api/users/blocked`, {
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

// Report APIs
export async function submitReport(reportData) {
  const r = await fetch(`${API_URL}/api/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(reportData),
  });
  return handleResp(r);
}

export async function getReportTypes() {
  const r = await fetch(`${API_URL}/api/report/types`);
  return handleResp(r);
}

// Privacy & Terms APIs
export async function getPrivacyPolicy() {
  const r = await fetch(`${API_URL}/api/privacy-policy`);
  return handleResp(r);
}

export async function getTermsOfService() {
  const r = await fetch(`${API_URL}/api/terms-of-service`);
  return handleResp(r);
}
// Chat System API functions - ENHANCED VERSION
export async function fetchChatRooms() {
  const r = await fetch(`${API_URL}/api/chats`, {
    headers: authHeaders(),
  });
  return handleResp(r);
}

export async function fetchRoomMessages(roomId) {
  const r = await fetch(`${API_URL}/api/chats/${roomId}/messages`, {
    headers: authHeaders(),
  });
  return handleResp(r);
}

// FIXED: Enhanced createChatRoom with better error handling and debugging
export async function createChatRoom(otherUserId) {
  try {
    console.log("Creating chat room with user ID:", otherUserId);
    
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const r = await fetch(`${API_URL}/api/chats/create_room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ other_user_id: otherUserId }),
    });
    
    const data = await r.json();
    console.log("Chat room creation response:", { status: r.status, data });
    
    return { 
      ok: r.ok, 
      status: r.status, 
      data: data,
      room: data.room || data // Handle both response formats
    };
  } catch (error) {
    console.error("Error creating chat room:", error);
    return { 
      ok: false, 
      error: error.message,
      data: null 
    };
  }
}

// Enhanced create chat room with multiple search options
export async function createChatRoomWithSearch(searchData) {
  try {
    console.log("Creating chat room with search data:", searchData);
    
    const token = localStorage.getItem("access_token");
    const r = await fetch(`${API_URL}/api/chats/create_room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(searchData),
    });
    
    const data = await r.json();
    console.log("Chat room creation response:", { status: r.status, data });
    
    return { 
      ok: r.ok, 
      status: r.status, 
      data: data,
      room: data.room || data
    };
  } catch (error) {
    console.error("Error creating chat room with search:", error);
    return { 
      ok: false, 
      error: error.message,
      data: null 
    };
  }
}

// Search users for messaging
export async function searchUsers(query, searchType = "username") {
  try {
    let body = {};
    
    if (searchType === "username") {
      body.username = query;
    } else if (searchType === "email") {
      body.email = query;
    } else if (searchType === "userid") {
      body.other_user_id = parseInt(query);
    } else if (searchType === "phone") {
      body.phone = query;
    }

    const token = localStorage.getItem("access_token");
    const r = await fetch(`${API_URL}/api/chats/create_room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    
    const data = await r.json();
    return { 
      ok: r.ok, 
      data: data,
      room: data.room || data
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return { 
      ok: false, 
      error: error.message,
      data: null 
    };
  }
}

// Get user by ID (useful for profile navigation)
export async function getUserById(userId) {
  try {
    const r = await fetch(`${API_URL}/api/users/id/${userId}`, {
      headers: authHeaders(),
    });
    return handleResp(r);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return { ok: false, error: error.message };
  }
}

// Get current user info
export async function getCurrentUser() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  
  try {
    // Decode JWT token to get user ID
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub || payload.identity;
    
    if (userId) {
      const r = await fetch(`${API_URL}/api/users/id/${userId}`, {
        headers: authHeaders(),
      });
      if (r.ok) {
        const data = await r.json();
        return data;
      }
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }
  return null;
}

// Get user ID from token
export function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.identity;
  } catch (error) {
    console.error("Error getting user ID from token:", error);
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  const token = localStorage.getItem("access_token");
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    // Check if token is expired
    return Date.now() < exp * 1000;
  } catch (error) {
    return false;
  }
}

// Socket.io connection helper
export function getSocketIO(token) {
  const io = require('socket.io-client');
  return io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling']
  });
}

// Debug function to check current user state
export function debugUserState() {
  const token = localStorage.getItem("access_token");
  const username = localStorage.getItem("username");
  const userId = getUserIdFromToken();
  
  console.log("User State Debug:", {
    hasToken: !!token,
    username: username,
    userId: userId,
    isAuthenticated: isAuthenticated()
  });
  
  return {
    hasToken: !!token,
    username: username,
    userId: userId,
    isAuthenticated: isAuthenticated()
  };
}

export default {
  ping,
  sendOtp,
  verifyOtp,
  fetchPosts,
  createPost,
  deletePost,
  uploadFile,
  uploadReel,
  fetchReels,
  createReel,
  toggleReelLike,
  deleteReel,
  fetchComments,
  addComment,
  toggleLike,
  fetchUserProfile,
  fetchNotes,
  uploadNote,
  updateUserProfile, 
  fetchUserStats,
  askSirG,
  fetchAIHistory,
  saveAIMessage,
  deleteAIHistory,
  createChatRoom,
  createChatRoomWithSearch,
  fetchChatRooms,
  fetchRoomMessages,
  searchUsers,
  getUserById,
  getCurrentUser,
  getUserIdFromToken,
  isAuthenticated,
  getSocketIO,
  debugUserState,
};
