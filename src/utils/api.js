// frontend/src/utils/api.js

export const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://sirverse-backend-production.up.railway.app";

// Automatically attach JWT token if available
export function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Handle API responses
async function handleResp(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

// ------------------------------------------------
// ✅ BASIC APIs
// ------------------------------------------------
export async function ping() {
  const r = await fetch(`${API_URL}/api/ping`);
  return handleResp(r);
}

// ------------------------------------------------
// ✅ AUTH (No OTP)
// ------------------------------------------------
export async function registerUser(payload) {
  const r = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResp(r);
}

export async function loginUser(credentials) {
  const r = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResp(r);
}

// ------------------------------------------------
// ✅ POSTS
// ------------------------------------------------
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

// ✅ Upload file (used in PostComposer, Settings)
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

// ------------------------------------------------
// ✅ REELS
// ------------------------------------------------
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

// ------------------------------------------------
// ✅ COMMENTS
// ------------------------------------------------
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

// ------------------------------------------------
// ✅ USER PROFILE, FOLLOW, BLOCK
// ------------------------------------------------
export async function fetchUserProfile(username) {
  const r = await fetch(`${API_URL}/api/users/${encodeURIComponent(username)}`);
  return handleResp(r);
}

export async function updateUserProfile(userId, data) {
  const r = await fetch(`${API_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResp(r);
}

export async function fetchUserStats() {
  const r = await fetch(`${API_URL}/api/stats`, {
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

// Follow / Unfollow
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

// Block / Unblock
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

// ------------------------------------------------
// ✅ REPORTS / PRIVACY / TERMS
// ------------------------------------------------
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

export async function getPrivacyPolicy() {
  const r = await fetch(`${API_URL}/api/privacy-policy`);
  return handleResp(r);
}

export async function getTermsOfService() {
  const r = await fetch(`${API_URL}/api/terms-of-service`);
  return handleResp(r);
}

// ------------------------------------------------
// ✅ AI (Sir G)
// ------------------------------------------------
export async function askSirG({ prompt, mode = "explain" }) {
  const r = await fetch(`${API_URL}/api/sirg`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ prompt, mode }),
  });
  let data = null;
  try {
    data = await r.json();
  } catch (_) {
    data = null;
  }
  return { ok: r.ok, status: r.status, data };
}

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

// ------------------------------------------------
// ✅ CHATS
// ------------------------------------------------
export async function fetchChatRooms() {
  const r = await fetch(`${API_URL}/api/chats`, { headers: authHeaders() });
  return handleResp(r);
}

export async function fetchRoomMessages(roomId) {
  const r = await fetch(`${API_URL}/api/chats/${roomId}/messages`, { headers: authHeaders() });
  return handleResp(r);
}

export async function createChatRoom(otherUserId) {
  const token = localStorage.getItem("access_token");
  const r = await fetch(`${API_URL}/api/chats/create_room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
  return handleResp(r);
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

export default {
  ping,
  registerUser,
  loginUser,
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
  updateUserProfile,
  fetchUserStats,
  followUser,
  unfollowUser,
  getFollowStatus,
  blockUser,
  unblockUser,
  getBlockedUsers,
  submitReport,
  getReportTypes,
  getPrivacyPolicy,
  getTermsOfService,
  askSirG,
  fetchAIHistory,
  saveAIMessage,
  deleteAIHistory,
  fetchChatRooms,
  fetchRoomMessages,
  createChatRoom,
  getUserIdFromToken,
  isAuthenticated,
  debugUserState,
};
