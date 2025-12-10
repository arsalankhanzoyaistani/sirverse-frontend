// src/utils/api.js - ULTIMATE PRODUCTION MOBILE VERSION
export let API_URL = "https://sirverse-backend-production.up.railway.app";

// For local development testing:
//export let API_URL = "http://localhost:8080";

console.log("🚀 API Module Loaded - URL:", API_URL);

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
    console.log("🔄 Testing connection to:", `${API_URL}/api/ping`);
    const response = await fetch(`${API_URL}/api/ping`);
    const data = await response.json();
    console.log("✅ Backend connection successful:", data);
    return { connected: true, data };
  } catch (error) {
    console.error("❌ Backend connection failed:", error);
    return { 
      connected: false, 
      error: `Cannot connect to backend at ${API_URL}. Make sure your Railway backend is running.` 
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

// Get JWT token for headers - FIXED VERSION
export function getAuthHeaders(contentType = "application/json") {
  const token = localStorage.getItem("access_token");
  const headers = {};
  
  if (contentType && contentType !== "multipart/form-data") {
    headers["Content-Type"] = contentType;
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

// For backward compatibility
export function authHeaders() {
  return getAuthHeaders();
}

// Get current user
export async function getCurrentUser() {
  const r = await fetch(`${API_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

// User stats for dashboard
export async function fetchUserStats() {
  const r = await fetch(`${API_URL}/api/stats`, {
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

// Update user profile
export async function updateUserProfile(userId, data) {
  const r = await fetch(`${API_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
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

// FIXED: createPost function
export async function createPost({ content, image_url }) {
  try {
    console.log("📝 Creating post with data:", { 
      content_length: content?.length || 0, 
      has_image: !!image_url 
    });

    const postData = {};
    if (content) postData.content = content;
    if (image_url) postData.image_url = image_url;

    // Check if we have data
    if (!content && !image_url) {
      return {
        ok: false,
        data: { error: "Either content or image is required" }
      };
    }

    const r = await fetch(`${API_URL}/api/posts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    });
    
    console.log("📡 Create post response status:", r.status);
    
    return await handleResp(r);
  } catch (error) {
    console.error("💥 Create post error:", error);
    return {
      ok: false,
      status: 0,
      data: { error: "Network error: " + error.message }
    };
  }
}

export async function deletePost(postId) {
  const r = await fetch(`${API_URL}/api/posts/${postId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

// FIXED: Enhanced uploadFile function for images
export async function uploadFile(file) {
  try {
    console.log("📤 Starting upload process...");
    console.log("📁 File details:", {
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });

    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("❌ No authentication token found");
      return {
        ok: false,
        status: 401,
        data: { error: "Please login first. No authentication token found." }
      };
    }

    // Validate file
    if (!file) {
      return {
        ok: false,
        data: { error: "No file selected" }
      };
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        ok: false,
        data: { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." }
      };
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return {
        ok: false,
        data: { error: "File too large. Maximum size is 10MB." }
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);
    
    console.log("🚀 Uploading to:", `${API_URL}/api/upload`);

    // Make the request - IMPORTANT: Don't set Content-Type header for FormData
    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
        // Let browser set Content-Type with boundary automatically
      },
      body: formData,
    });

    console.log("📡 Upload response status:", response.status);
    
    // Try to parse response
    let responseData;
    try {
      responseData = await response.json();
      console.log("📄 Response data:", responseData);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", parseError);
      const text = await response.text();
      console.error("📄 Raw response text:", text);
      
      return {
        ok: false,
        status: response.status,
        data: { error: "Server returned invalid response. Please try again." }
      };
    }

    if (!response.ok) {
      console.error("❌ Upload failed:", responseData);
      return {
        ok: false,
        status: response.status,
        data: responseData || { error: `Upload failed with status ${response.status}` }
      };
    }

    console.log("✅ Upload successful:", responseData);
    return {
      ok: true,
      status: response.status,
      data: responseData
    };

  } catch (error) {
    console.error("💥 Upload network error:", error);
    console.error("💥 Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return {
      ok: false,
      status: 0,
      data: { 
        error: `Upload failed: ${error.message}. Please check:
        1. Your internet connection
        2. Backend server is running
        3. File meets requirements (image, <10MB)` 
      }
    };
  }
}

// Enhanced uploadReel function for videos
export async function uploadReel(file) {
  try {
    console.log("🎬 Uploading reel:", {
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });

    const token = localStorage.getItem("access_token");
    if (!token) {
      return {
        ok: false,
        status: 401,
        data: { error: "Please login first" }
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    
    const r = await fetch(`${API_URL}/api/upload/reel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });
    
    console.log("📡 Reel upload response status:", r.status);
    
    if (!r.ok) {
      const errorText = await r.text();
      console.error("❌ Reel upload failed:", errorText);
      let errorMessage = `Reel upload failed: ${r.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      return { 
        ok: false, 
        status: r.status,
        data: { error: errorMessage }
      };
    }
    
    const result = await r.json();
    console.log("✅ Reel upload successful:", result);
    
    return { 
      ok: true, 
      status: r.status,
      data: result 
    };
  } catch (error) {
    console.error("💥 Reel upload error:", error);
    return { 
      ok: false, 
      status: 0,
      data: { error: "Network error: " + error.message }
    };
  }
}

// Reels API functions
export async function fetchReels(page = 1, perPage = 10) {
  const r = await fetch(`${API_URL}/api/reels?page=${page}&per_page=${perPage}`);
  return handleResp(r);
}

export async function createReel({ video_url, caption }) {
  const r = await fetch(`${API_URL}/api/reels`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ video_url, caption }),
  });
  return handleResp(r);
}

export async function toggleReelLike(reelId) {
  const r = await fetch(`${API_URL}/api/reels/${reelId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function deleteReel(reelId) {
  const r = await fetch(`${API_URL}/api/reels/${reelId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResp(r);
}

export async function toggleLike(postId) {
  const r = await fetch(`${API_URL}/api/posts/${postId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, mode }),
  });
  let data = null;
  try { data = await r.json(); } catch (_) { data = null; }
  return { ok: r.ok, status: r.status, data };
}

// Chat History APIs
export async function fetchAIHistory() {
  const r = await fetch(`${API_URL}/api/ai/history`, {
    headers: getAuthHeaders(),
  });
  return r.json();
}

export async function saveAIMessage(role, text) {
  const r = await fetch(`${API_URL}/api/ai/history`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role, text }),
  });
  return r.json();
}

export async function deleteAIHistory() {
  const r = await fetch(`${API_URL}/api/ai/history`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return r.json();
}

// Follow/Unfollow APIs
export async function followUser(userId) {
  const r = await fetch(`${API_URL}/api/users/${userId}/follow`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function unfollowUser(userId) {
  const r = await fetch(`${API_URL}/api/users/${userId}/unfollow`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function getFollowStatus(userId) {
  const r = await fetch(`${API_URL}/api/users/${userId}/follow_status`, {
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

// Block/Unblock APIs
export async function blockUser(userId) {
  const r = await fetch(`${API_URL}/api/users/${userId}/block`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function unblockUser(userId) {
  const r = await fetch(`${API_URL}/api/users/${userId}/unblock`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function getBlockedUsers() {
  const r = await fetch(`${API_URL}/api/users/blocked`, {
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

// Report APIs
export async function submitReport(reportData) {
  const r = await fetch(`${API_URL}/api/report`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(reportData),
  });
  return handleResp(r);
}

export async function getReportTypes() {
  const r = await fetch(`${API_URL}/api/report/types`);
  return handleResp(r);
}

// Friend Request APIs
export async function sendFriendRequest(receiverId) {
  const r = await fetch(`${API_URL}/api/friends/requests`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ receiver_id: receiverId }),
  });
  return handleResp(r);
}

export async function getIncomingRequests() {
  const r = await fetch(`${API_URL}/api/friends/requests/incoming`, {
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function getSentRequests() {
  const r = await fetch(`${API_URL}/api/friends/requests/sent`, {
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function acceptFriendRequest(requestId) {
  const r = await fetch(`${API_URL}/api/friends/requests/${requestId}/accept`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function denyFriendRequest(requestId) {
  const r = await fetch(`${API_URL}/api/friends/requests/${requestId}/deny`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function cancelFriendRequest(requestId) {
  const r = await fetch(`${API_URL}/api/friends/requests/${requestId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function getFriends() {
  const r = await fetch(`${API_URL}/api/friends`, {
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

// Chat System API functions
export async function fetchChatRooms() {
  const r = await fetch(`${API_URL}/api/chats`, {
    headers: getAuthHeaders(),
  });
  return handleResp(r);
}

export async function fetchRoomMessages(roomId) {
  const r = await fetch(`${API_URL}/api/chats/${roomId}/messages`, {
    headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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

// Debug upload issues
export async function debugUploadIssue(file) {
  try {
    console.log("🔍 Debugging upload issue...");
    
    // Check backend
    console.log("🌐 Backend URL:", API_URL);
    const pingRes = await ping();
    console.log("🌐 Backend ping:", pingRes);
    
    // Check auth
    const token = localStorage.getItem("access_token");
    console.log("🔑 Auth token exists:", !!token);
    if (token) {
      console.log("🔑 Token first 20 chars:", token.substring(0, 20) + "...");
    }
    
    // Check file
    console.log("📁 File info:", {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });
    
    // Test direct upload
    console.log("🧪 Testing direct upload...");
    const testFormData = new FormData();
    testFormData.append("file", file);
    
    const testResponse = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: testFormData,
    });
    
    console.log("🧪 Direct upload status:", testResponse.status);
    const testText = await testResponse.text();
    console.log("🧪 Direct upload response:", testText);
    
    return {
      backendConnected: pingRes.ok,
      hasToken: !!token,
      fileValid: file && file.size > 0,
      directUploadStatus: testResponse.status,
      directUploadResponse: testText
    };
    
  } catch (error) {
    console.error("❌ Debug error:", error);
    return { error: error.message };
  }
}

// Upload helper with progress
export async function uploadFileWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = localStorage.getItem("access_token");
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(Math.round(percentComplete));
      }
    });
    
    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            ok: true,
            status: xhr.status,
            data: response
          });
        } else {
          resolve({
            ok: false,
            status: xhr.status,
            data: response || { error: `Upload failed: ${xhr.status}` }
          });
        }
      } catch (error) {
        resolve({
          ok: false,
          status: xhr.status,
          data: { error: "Invalid server response" }
        });
      }
    });
    
    xhr.addEventListener('error', () => {
      resolve({
        ok: false,
        status: 0,
        data: { error: "Network error" }
      });
    });
    
    xhr.open('POST', `${API_URL}/api/upload`);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

// Auto-test connection on import
console.log("🔧 API module loaded. Testing backend connection...");
testBackendConnection().then(result => {
  if (result.connected) {
    console.log("✅ Backend is reachable");
  } else {
    console.warn("⚠️ Backend connection failed:", result.error);
    console.log("💡 Try these fixes:");
    console.log("1. Check if backend is running on Railway");
    console.log("2. Check if CORS is properly configured");
    console.log("3. Check browser console for network errors");
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
  uploadFileWithProgress,
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
  
  // Friend features
  sendFriendRequest,
  getIncomingRequests,
  getSentRequests,
  acceptFriendRequest,
  denyFriendRequest,
  cancelFriendRequest,
  getFriends,
  
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
  debugUploadIssue,
  getAuthHeaders,
  authHeaders,
  API_URL
};
