// frontend/src/utils/api.js

// ✅ PRODUCTION-READY
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

// ✅ Correct ping path for production
export async function ping() {
  const r = await fetch(`${API_URL}/api/ping`);
  return handleResp(r);
}

// OTP System
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

// Posts
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

// Uploads
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

// Reels
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

// Comments & Likes
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

// Profiles
export async function fetchUserProfile(username) {
  const r = await fetch(`${API_URL}/api/users/${encodeURIComponent(username)}`);
  return handleResp(r);
}

// AI Section
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

// ✅ Default Export
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
  askSirG,
  fetchAIHistory,
  saveAIMessage,
  deleteAIHistory,
};
