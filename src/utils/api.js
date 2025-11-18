// src/utils/api.js - UPDATE FOR MOBILE
export let API_URL;

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  API_URL = "http://localhost:8080";
} else {
  // Use your Railway backend for production/mobile
  API_URL = "https://sirverse-backend-production.up.railway.app";
}

// Enhanced error handling with detailed logging
async function handleResp(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }
  
  console.log(`🔍 API Call: ${res.status} ${res.url}`);
  
  return { ok: res.ok, status: res.status, data };
}

// Test backend connection
export async function testBackendConnection() {
  try {
    console.log("🔄 Testing connection to:", `${API_URL}/api/health`);
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    console.log("✅ Backend connection successful:", data);
    return { connected: true, data };
  } catch (error) {
    console.error("❌ Backend connection failed:", error);
    return { 
      connected: false, 
      error: `Cannot connect to backend at ${API_URL}. Make sure the server is running.` 
    };
  }
}

// Enhanced register function
export async function register(userData) {
  try {
    console.log("🚀 Registering user to:", `${API_URL}/api/auth/register`);
    console.log("📝 Registration data:", { ...userData, password: '***', confirm_password: '***' });
    
    const r = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(userData),
    });
    
    console.log("📡 Registration response status:", r.status);
    
    const result = await handleResp(r);
    console.log("📨 Registration result:", result);
    
    return result;
  } catch (error) {
    console.error("💥 Registration network error:", error);
    return { 
      ok: false, 
      status: 0,
      data: { 
        error: `Cannot connect to server. Please ensure the backend is running at ${API_URL}. Error: ${error.message}` 
      }
    };
  }
}

// Enhanced login function
export async function login(identifier, password) {
  try {
    console.log("🚀 Logging in to:", `${API_URL}/api/auth/login`);
    
    const r = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ identifier, password }),
    });
    
    console.log("📡 Login response status:", r.status);
    
    const result = await handleResp(r);
    console.log("📨 Login result:", result.ok ? "Success" : "Failed");
    
    return result;
  } catch (error) {
    console.error("💥 Login network error:", error);
    return { 
      ok: false, 
      status: 0,
      data: { 
        error: `Cannot connect to server. Please ensure the backend is running at ${API_URL}. Error: ${error.message}` 
      }
    };
  }
}

// Automatically attach JWT token if available
export function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Get current user
export async function getCurrentUser() {
  const r = await fetch(`${API_URL}/api/auth/me`, {
    headers: authHeaders(),
  });
  return handleResp(r);
}

// User stats for dashboard
export async function fetchUserStats() {
  const r = await fetch(`${API_URL}/api/stats`, {
    headers: authHeaders(),
  });
  return handleResp(r);
}

// Update user profile
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

// Legal pages
export async function getPrivacyPolicy() {
  const r = await fetch(`${API_URL}/api/privacy-policy`);
  return handleResp(r);
}

export async function getTermsOfService() {
  const r = await fetch(`${API_URL}/api/terms-of-service`);
  return handleResp(r);
}

// Debug function
export function debugUserState() {
  const token = localStorage.getItem("access_token");
  const username = localStorage.getItem("username");
  const userId = getUserIdFromToken();
  
  console.log("👤 User State Debug:", {
    hasToken: !!token,
    username: username,
    userId: userId,
    isAuthenticated: isAuthenticated(),
    apiUrl: API_URL
  });
  
  return {
    hasToken: !!token,
    username: username,
    userId: userId,
    isAuthenticated: isAuthenticated()
  };
}

// ALL YOUR EXISTING API FUNCTIONS
export async function ping() {
  const r = await fetch(`${API_URL}/api/ping`);
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

// Ask Sir G (AI)
export async function askSirG({ prompt, mode = "explain" }) {
  const r = await fetch(`${API_URL}/api/sirg`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ prompt, mode }),
  });
  let data = null;
  try { data = await r.json(); } catch (_) { data = null; }
  return { ok: r.ok, status: r.status, data };
}

// Chat History APIs
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

// Chat System API functions
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

export async function createChatRoom(otherUserId) {
  try {
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
    
    return { 
      ok: r.ok, 
      status: r.status, 
      data: data,
      room: data.room || data
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

// Utility functions
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

export function isAuthenticated() {
  const token = localStorage.getItem("access_token");
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    return Date.now() < exp * 1000;
  } catch (error) {
    return false;
  }
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("username");
  localStorage.removeItem("user_id");
  window.location.href = "/login";
}

// Auto-test connection on import
console.log("🔧 API module loaded. Testing backend connection...");
testBackendConnection().then(result => {
  if (!result.connected) {
    console.warn("⚠️ Backend connection failed. Some features may not work.");
  }
});

export default {
  // Authentication
  register,
  login,
  getCurrentUser,
  logout,
  isAuthenticated,
  testBackendConnection,
  
  // User Management
  fetchUserStats,
  updateUserProfile,
  
  // Legal
  getPrivacyPolicy,
  getTermsOfService,
  
  // Core features
  ping,
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
  askSirG,
  
  // Social features
  followUser,
  unfollowUser,
  getFollowStatus,
  blockUser,
  unblockUser,
  getBlockedUsers,
  submitReport,
  getReportTypes,
  
  // Chat features
  fetchChatRooms,
  fetchRoomMessages,
  createChatRoom,
  
  // AI History
  fetchAIHistory,
  saveAIMessage,
  deleteAIHistory,
  
  // Utility
  getUserIdFromToken,
  debugUserState,
  authHeaders,
  API_URL
};
