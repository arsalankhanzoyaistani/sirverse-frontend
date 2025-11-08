// frontend/src/utils/api.js

export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

// Automatically attach JWT token if available
export function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : { 'Content-Type': 'application/json' };
}

// IMPROVED Handle API responses
async function handleResponse(res) {
  const contentType = res.headers.get('content-type');
  
  // Check if response is JSON
  if (contentType && contentType.includes('application/json')) {
    try {
      const data = await res.json();
      return { 
        ok: res.ok, 
        status: res.status, 
        data: data
      };
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return {
        ok: false,
        status: res.status,
        data: { error: 'Invalid JSON response from server' }
      };
    }
  } else {
    // Handle non-JSON responses (HTML errors, etc.)
    const text = await res.text();
    console.error('Non-JSON response received:', text.substring(0, 200));
    
    return {
      ok: false,
      status: res.status,
      data: { 
        error: `Server returned ${res.status}: ${res.statusText}`,
        responseText: text.substring(0, 500)
      }
    };
  }
}

// Enhanced fetch with error handling
async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      ok: false,
      status: 0,
      data: { error: 'Network error - unable to reach server' }
    };
  }
}

// ------------------------------------------------
// ✅ UPLOAD FILE - COMPLETELY FIXED VERSION
// ------------------------------------------------
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  console.log("🚀 UPLOAD - Starting file upload:", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    isImage: file.type.startsWith('image/')
  });
  
  try {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      console.error("❌ UPLOAD - No authentication token found");
      return {
        ok: false,
        status: 401,
        data: { error: "Not authenticated. Please login again." }
      };
    }
    
    console.log("🌐 UPLOAD - Making request to:", `${API_URL}/api/upload`);
    console.log("🔑 UPLOAD - Token exists:", !!token);
    
    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
        // DO NOT set Content-Type - browser will set it automatically with boundary
      },
      body: formData,
    });
    
    console.log("📡 UPLOAD - Response status:", response.status);
    console.log("📡 UPLOAD - Response ok:", response.ok);
    
    const result = await handleResponse(response);
    console.log("📡 UPLOAD - Final result:", result);
    
    return result;
  } catch (error) {
    console.error('💥 UPLOAD - Network error:', error);
    return {
      ok: false,
      status: 0,
      data: { error: 'Network error - unable to reach server: ' + error.message }
    };
  }
}

// ------------------------------------------------
// ✅ BASIC APIs
// ------------------------------------------------
export async function ping() {
  return await apiFetch(`${API_URL}/api/ping`);
}

// ------------------------------------------------
// ✅ AUTH (No OTP)
// ------------------------------------------------
export async function registerUser(payload) {
  return await apiFetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function loginUser(credentials) {
  return await apiFetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    return { ok: false, data: { error: "No refresh token available" } };
  }

  return await apiFetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  });
}

// ------------------------------------------------
// ✅ POSTS
// ------------------------------------------------
export async function fetchPosts(page = 1, perPage = 10) {
  return await apiFetch(`${API_URL}/api/posts?page=${page}&per_page=${perPage}`);
}

export async function createPost({ content, image_url }) {
  return await apiFetch(`${API_URL}/api/posts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content, image_url }),
  });
}

export async function deletePost(postId) {
  return await apiFetch(`${API_URL}/api/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

// ------------------------------------------------
// ✅ REELS
// ------------------------------------------------
export async function uploadReel(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/api/upload/reel`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    
    return await handleResponse(response);
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { error: 'Reel upload failed - network error' }
    };
  }
}

export async function fetchReels(page = 1, perPage = 10) {
  return await apiFetch(`${API_URL}/api/reels?page=${page}&per_page=${perPage}`);
}

export async function createReel({ video_url, caption }) {
  return await apiFetch(`${API_URL}/api/reels`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ video_url, caption }),
  });
}

export async function toggleReelLike(reelId) {
  return await apiFetch(`${API_URL}/api/reels/${reelId}/like`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function deleteReel(reelId) {
  return await apiFetch(`${API_URL}/api/reels/${reelId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

// Reel Comments
export async function fetchReelComments(reelId) {
  return await apiFetch(`${API_URL}/api/reels/${reelId}/comments`);
}

export async function addReelComment(reelId, content) {
  return await apiFetch(`${API_URL}/api/reels/${reelId}/comments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
}

// ------------------------------------------------
// ✅ COMMENTS & LIKES
// ------------------------------------------------
export async function fetchComments(postId) {
  return await apiFetch(`${API_URL}/api/posts/${postId}/comments`);
}

export async function addComment(postId, content) {
  return await apiFetch(`${API_URL}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
}

export async function toggleLike(postId) {
  return await apiFetch(`${API_URL}/api/posts/${postId}/like`, {
    method: "POST",
    headers: authHeaders(),
  });
}

// ------------------------------------------------
// ✅ USER PROFILE, FOLLOW, BLOCK
// ------------------------------------------------
export async function fetchUserProfile(username) {
  console.log(`🔍 Fetching profile for: ${username}`);
  const result = await apiFetch(`${API_URL}/api/users/${encodeURIComponent(username)}`);
  console.log(`📡 Profile API Response for ${username}:`, result);
  return result;
}

export async function updateUserProfile(userId, data) {
  return await apiFetch(`${API_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function fetchUserStats() {
  return await apiFetch(`${API_URL}/api/stats`, {
    headers: authHeaders(),
  });
}

// Follow / Unfollow
export async function followUser(userId) {
  return await apiFetch(`${API_URL}/api/users/${userId}/follow`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function unfollowUser(userId) {
  return await apiFetch(`${API_URL}/api/users/${userId}/unfollow`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function getFollowStatus(userId) {
  return await apiFetch(`${API_URL}/api/users/${userId}/follow_status`, {
    headers: authHeaders(),
  });
}

// Block / Unblock
export async function blockUser(userId) {
  return await apiFetch(`${API_URL}/api/users/${userId}/block`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function unblockUser(userId) {
  return await apiFetch(`${API_URL}/api/users/${userId}/unblock`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function getBlockedUsers() {
  return await apiFetch(`${API_URL}/api/users/blocked`, {
    headers: authHeaders(),
  });
}

// ------------------------------------------------
// ✅ REPORTS
// ------------------------------------------------
export async function submitReport(reportData) {
  return await apiFetch(`${API_URL}/api/report`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(reportData),
  });
}

export async function getReportTypes() {
  return await apiFetch(`${API_URL}/api/report/types`);
}

export async function getMyReports() {
  return await apiFetch(`${API_URL}/api/reports/my`, {
    headers: authHeaders(),
  });
}

// Admin Reports (if user is admin)
export async function getAllReports(status = 'all', type = 'all') {
  return await apiFetch(`${API_URL}/api/admin/reports?status=${status}&type=${type}`, {
    headers: authHeaders(),
  });
}

export async function getReportDetails(reportId) {
  return await apiFetch(`${API_URL}/api/admin/reports/${reportId}`, {
    headers: authHeaders(),
  });
}

export async function updateReportStatus(reportId, status) {
  return await apiFetch(`${API_URL}/api/admin/reports/${reportId}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function getReportStats() {
  return await apiFetch(`${API_URL}/api/admin/reports/stats`, {
    headers: authHeaders(),
  });
}

// ------------------------------------------------
// ✅ PRIVACY / TERMS
// ------------------------------------------------
export async function getPrivacyPolicy() {
  return await apiFetch(`${API_URL}/api/privacy-policy`);
}

export async function getTermsOfService() {
  return await apiFetch(`${API_URL}/api/terms-of-service`);
}

// ------------------------------------------------
// ✅ AI (Sir G)
// ------------------------------------------------
export async function askSirG({ prompt, mode = "explain" }) {
  return await apiFetch(`${API_URL}/api/sirg`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ prompt, mode }),
  });
}

// Alternative AI endpoint
export async function askAI(prompt) {
  return await apiFetch(`${API_URL}/api/ai/ask`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ prompt }),
  });
}

export async function fetchAIHistory() {
  return await apiFetch(`${API_URL}/api/ai/history`, {
    headers: authHeaders(),
  });
}

export async function saveAIMessage(role, text) {
  return await apiFetch(`${API_URL}/api/ai/history`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ role, text }),
  });
}

export async function deleteAIHistory() {
  return await apiFetch(`${API_URL}/api/ai/history`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

// ------------------------------------------------
// ✅ CHATS
// ------------------------------------------------
export async function fetchChatRooms() {
  return await apiFetch(`${API_URL}/api/chats`, { 
    headers: authHeaders() 
  });
}

export async function fetchRoomMessages(roomId) {
  return await apiFetch(`${API_URL}/api/chats/${roomId}/messages`, { 
    headers: authHeaders() 
  });
}

export async function createChatRoom(otherUserId) {
  return await apiFetch(`${API_URL}/api/chats/create_room`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
}

export async function createChatRoomByUsername(username) {
  return await apiFetch(`${API_URL}/api/chats/create_room`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ username }),
  });
}

export async function createChatRoomByPhone(phone) {
  return await apiFetch(`${API_URL}/api/chats/create_room`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ phone }),
  });
}

// ------------------------------------------------
// ✅ SEARCH & DISCOVERY
// ------------------------------------------------
export async function searchUsers(query) {
  return await apiFetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
    headers: authHeaders(),
  });
}

export async function getSuggestedUsers() {
  return await apiFetch(`${API_URL}/api/users/suggested`, {
    headers: authHeaders(),
  });
}

// ------------------------------------------------
// ✅ AUTH HELPERS / DEBUG
// ------------------------------------------------
export function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.identity;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const token = localStorage.getItem("access_token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp;
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

export function debugUserState() {
  const token = localStorage.getItem("access_token");
  const username = localStorage.getItem("username");
  const userId = getUserIdFromToken();

  console.log("User State Debug:", {
    hasToken: !!token,
    username,
    userId,
    isAuthenticated: isAuthenticated(),
  });

  return {
    hasToken: !!token,
    username,
    userId,
    isAuthenticated: isAuthenticated(),
  };
}

// Enhanced fetch with auto token refresh
export async function fetchWithAuth(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders(),
    },
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed.ok) {
      localStorage.setItem("access_token", refreshed.data.access_token);
      // Retry the request with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...authHeaders(),
        },
      });
    } else {
      // Refresh failed, clear storage and redirect
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Authentication failed");
    }
  }

  return await handleResponse(response);
}

// Utility to check if user is online
export function isOnline() {
  return navigator.onLine;
}

// Network status listener
export function setupNetworkListener() {
  window.addEventListener('online', () => {
    console.log('🟢 App is online');
  });
  
  window.addEventListener('offline', () => {
    console.log('🔴 App is offline');
  });
}

// Logout helper
export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
  localStorage.removeItem("user_id");
  window.location.href = "/login";
}

// Export all functions as default object
export default {
  // Basic
  ping,
  
  // Auth
  registerUser,
  loginUser,
  refreshAccessToken,
  logout,
  
  // Posts
  fetchPosts,
  createPost,
  deletePost,
  uploadFile,
  
  // Reels
  uploadReel,
  fetchReels,
  createReel,
  toggleReelLike,
  deleteReel,
  fetchReelComments,
  addReelComment,
  
  // Comments & Likes
  fetchComments,
  addComment,
  toggleLike,
  
  // User Profile
  fetchUserProfile,
  updateUserProfile,
  fetchUserStats,
  
  // Follow/Block
  followUser,
  unfollowUser,
  getFollowStatus,
  blockUser,
  unblockUser,
  getBlockedUsers,
  
  // Reports
  submitReport,
  getReportTypes,
  getMyReports,
  getAllReports,
  getReportDetails,
  updateReportStatus,
  getReportStats,
  
  // Legal
  getPrivacyPolicy,
  getTermsOfService,
  
  // AI
  askSirG,
  askAI,
  fetchAIHistory,
  saveAIMessage,
  deleteAIHistory,
  
  // Chats
  fetchChatRooms,
  fetchRoomMessages,
  createChatRoom,
  createChatRoomByUsername,
  createChatRoomByPhone,
  
  // Search
  searchUsers,
  getSuggestedUsers,
  
  // Utilities
  getUserIdFromToken,
  isAuthenticated,
  debugUserState,
  fetchWithAuth,
  isOnline,
  setupNetworkListener
};
