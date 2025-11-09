// frontend/src/utils/api.js
// ============================================
// ✅ SirVerse - Final Production API Utils
// ============================================

// 🔹 Backend base URL
export const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://sirverse-backend-production.up.railway.app";

// 🔹 Cloudinary Config for Direct Frontend Uploads
export const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/drzadqiyg/upload";
export const CLOUDINARY_PRESET = "sirverse_unsigned";

// =================================================
// 🔐 JWT Auth Headers
// =================================================
export function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

// =================================================
// 📡 Response Handler
// =================================================
async function handleResponse(res) {
  const type = res.headers.get("content-type");
  if (type && type.includes("application/json")) {
    try {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      console.error("❌ JSON parse error:", e);
      return { ok: false, status: res.status, data: { error: "Invalid JSON" } };
    }
  }
  const text = await res.text();
  console.error("❌ Non-JSON response:", text.slice(0, 150));
  return { ok: false, status: res.status, data: { error: text.slice(0, 500) } };
}

// =================================================
// 🌐 Fetch Wrapper with Error Handling
// =================================================
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (e) {
    console.error("🌐 API fetch error:", e);
    return { ok: false, status: 0, data: { error: "Network error" } };
  }
}

// =================================================
// ☁️ DIRECT CLOUDINARY UPLOAD (Unsigned)
// =================================================
export async function uploadToCloudinaryDirect(file, folder = "sirverse_posts") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("folder", folder);

  console.log("🚀 Uploading to Cloudinary:", { file: file.name, folder });

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });
    const result = await handleResponse(response);
    if (result.ok) console.log("✅ Cloudinary Upload Success:", result.data.secure_url);
    else console.error("❌ Cloudinary Upload Failed:", result.data);
    return result;
  } catch (err) {
    console.error("💥 Cloudinary upload error:", err);
    return { ok: false, data: { error: err.message } };
  }
}

// =================================================
// ✅ BASIC APIs
// =================================================
export async function ping() {
  return await apiFetch(`${API_URL}/api/ping`);
}

// =================================================
// 🔑 AUTH (Register / Login)
// =================================================
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

// =================================================
// 🧩 POSTS
// =================================================
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

// =================================================
// 🎬 REELS
// =================================================
export async function uploadReel(file) {
  return await uploadToCloudinaryDirect(file, "sirverse_reels");
}

export async function createReel({ video_url, caption }) {
  return await apiFetch(`${API_URL}/api/reels`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ video_url, caption }),
  });
}

export async function fetchReels(page = 1, perPage = 10) {
  return await apiFetch(`${API_URL}/api/reels?page=${page}&per_page=${perPage}`);
}

// =================================================
// 💬 COMMENTS & LIKES
// =================================================
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

// =================================================
// 👤 USER PROFILE, FOLLOW, BLOCK
// =================================================
export async function fetchUserProfile(username) {
  return await apiFetch(`${API_URL}/api/users/${encodeURIComponent(username)}`);
}

export async function updateUserProfile(userId, data) {
  return await apiFetch(`${API_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function fetchUserStats() {
  return await apiFetch(`${API_URL}/api/stats`, { headers: authHeaders() });
}

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

export async function blockUser(userId) {
  return await apiFetch(`${API_URL}/api/users/${userId}/block`, {
    method: "POST",
    headers: authHeaders(),
  });
}

// =================================================
// 🧠 AI / SIR G
// =================================================
export async function askSirG({ prompt, mode = "explain" }) {
  return await apiFetch(`${API_URL}/api/sirg`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ prompt, mode }),
  });
}

// =================================================
// 🧾 UTILITIES
// =================================================
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

export function logout() {
  localStorage.clear();
  window.location.href = "/login";
}

// ------------------------------------------------
// 🧩 LEGACY COMPATIBILITY FIX - Missing Exports
// ------------------------------------------------

// Reports
export async function getReportTypes() {
  return await apiFetch(`${API_URL}/api/report/types`);
}

export async function submitReport(reportData) {
  return await apiFetch(`${API_URL}/api/report`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(reportData),
  });
}

// AI History
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

// Chats
export async function createChatRoom(otherUserId) {
  return await apiFetch(`${API_URL}/api/chats/create_room`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ other_user_id: otherUserId }),
  });
}

// Reels extras
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

// Legal
export async function getPrivacyPolicy() {
  return await apiFetch(`${API_URL}/api/privacy-policy`);
}

export async function getTermsOfService() {
  return await apiFetch(`${API_URL}/api/terms-of-service`);
}

// Blocked Users
export async function getBlockedUsers() {
  return await apiFetch(`${API_URL}/api/users/blocked`, {
    headers: authHeaders(),
  });
}

export async function unblockUser(userId) {
  return await apiFetch(`${API_URL}/api/users/${userId}/unblock`, {
    method: "POST",
    headers: authHeaders(),
  });
}

// ------------------------------------------------
// 🧠 Debug + Upload Compatibility (Chats + Settings)
// ------------------------------------------------
export function debugUserState() {
  const token = localStorage.getItem("access_token");
  const username = localStorage.getItem("username");
  const userId = getUserIdFromToken();

  console.log("🧩 User Debug Info:", {
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

export async function uploadFile(file) {
  console.log("⚙️ Uploading generic file:", file.name);
  return await uploadToCloudinaryDirect(file, "sirverse_uploads");
}

// ------------------------------------------------
// ✅ FINAL EXPORTS
// ------------------------------------------------
export default {
  API_URL,
  uploadToCloudinaryDirect,
  fetchPosts,
  createPost,
  deletePost,
  fetchUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  getFollowStatus,
  blockUser,
  fetchUserStats,
  uploadReel,
  askSirG,
  getReportTypes,
  submitReport,
  fetchAIHistory,
  saveAIMessage,
  deleteAIHistory,
  createChatRoom,
  toggleReelLike,
  deleteReel,
  getPrivacyPolicy,
  getTermsOfService,
  getBlockedUsers,
  unblockUser,
  debugUserState,
  uploadFile,
};
