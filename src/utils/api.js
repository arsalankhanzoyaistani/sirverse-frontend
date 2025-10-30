// ✅ FINAL PRODUCTION VERSION — SirVerse GPT (JWT Auth + All Features)
export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

/* 🪄 Send JWT token from localStorage */
export function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* Common response handler */
async function handleResp(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

/* ------------------------ AUTH ------------------------ */
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

/* ------------------------ POSTS ------------------------ */
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

/* ------------------------ UPLOADS ------------------------ */
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

/* ------------------------ COMMENTS ------------------------ */
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

/* ------------------------ LIKES ------------------------ */
export async function toggleLike(postId) {
  const r = await fetch(`${API_URL}/api/posts/${postId}/like`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

/* ------------------------ USER PROFILE ------------------------ */
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

/* ------------------------ DASHBOARD ------------------------ */
export async function fetchUserStats() {
  const r = await fetch(`${API_URL}/api/stats`, {
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

/* ------------------------ REELS SYSTEM ------------------------ */
export async function fetchReels(page = 1, perPage = 10) {
  const r = await fetch(`${API_URL}/api/reels?page=${page}&per_page=${perPage}`);
  return handleResp(r);
}

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

/* ------------------------ AI / Sir G ------------------------ */
export async function askSirG({ prompt, mode = "explain" }) {
  const r = await fetch(`${API_URL}/api/sirg`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ prompt, mode }),
  });
  return handleResp(r);
}

// ✅ AI Chat History (Fix for AI.js)
export async function fetchAIHistory() {
  const r = await fetch(`${API_URL}/api/ai/history`, {
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function saveAIMessage(role, text) {
  const r = await fetch(`${API_URL}/api/ai/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role, text }),
  });
  return handleResp(r);
}

export async function deleteAIHistory() {
  const r = await fetch(`${API_URL}/api/ai/history`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

/* ------------------------ CHATS SYSTEM ------------------------ */
export async function createChatRoom(otherUserId) {
  const r = await fetch(`${API_URL}/api/chats/create_room`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
  return handleResp(r);
}

/* ------------------------ MODERATION SYSTEM ------------------------ */
export async function blockUser(userId) {
  const r = await fetch(`${API_URL}/api/blocks/${userId}`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function unblockUser(userId) {
  const r = await fetch(`${API_URL}/api/blocks/${userId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function getBlockedUsers() {
  const r = await fetch(`${API_URL}/api/blocks`, {
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function submitReport(reportData) {
  const r = await fetch(`${API_URL}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(reportData),
  });
  return handleResp(r);
}

/* ------------------------ FOLLOW SYSTEM ------------------------ */
export async function followUser(userId) {
  const r = await fetch(`${API_URL}/api/follow/${userId}`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function unfollowUser(userId) {
  const r = await fetch(`${API_URL}/api/follow/${userId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function getFollowStatus(userId) {
  const r = await fetch(`${API_URL}/api/follow/status/${userId}`, {
    headers: { ...authHeaders() },
  });
  return handleResp(r);
}

export async function getFollowStats(username) {
  const r = await fetch(`${API_URL}/api/follow/stats/${username}`);
  return handleResp(r);
}

/* ------------------------ LEGAL SYSTEM ------------------------ */
export async function getTermsOfService() {
  const r = await fetch(`${API_URL}/api/legal/terms`);
  return handleResp(r);
}

export async function getPrivacyPolicy() {
  const r = await fetch(`${API_URL}/api/legal/privacy`);
  return handleResp(r);
}

/* ------------------------ HELPERS ------------------------ */
export async function debugUserState() {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("access_token");
  console.log("🧠 Debug User State:", { username, token });
  return { username, token };
}

export function isAuthenticated() {
  return !!localStorage.getItem("access_token");
}

export default {
  sendOtp,
  verifyOtp,
  fetchPosts,
  createPost,
  deletePost,
  uploadFile,
  fetchComments,
  addComment,
  toggleLike,
  fetchUserProfile,
  updateUserProfile,
  fetchUserStats,
  askSirG,
  fetchReels,
  uploadReel,
  createReel,
  toggleReelLike,
  deleteReel,
  fetchAIHistory,
  saveAIMessage,
  deleteAIHistory,
  createChatRoom,
  blockUser,
  unblockUser,
  getBlockedUsers,
  submitReport,
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowStats,
  getTermsOfService,
  getPrivacyPolicy,
  debugUserState,
  isAuthenticated,
};
