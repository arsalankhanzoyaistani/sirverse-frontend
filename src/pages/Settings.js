import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { updateUserProfile, fetchUserProfile, uploadFile, getBlockedUsers } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";

export default function Settings() {
  const username = localStorage.getItem("username");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState({
    full_name: "",
    bio: "",
    avatar: ""
  });
  const [blockedUsersCount, setBlockedUsersCount] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUserProfile();
    loadBlockedUsersCount();
  }, []);

  const loadUserProfile = async () => {
    try {
      const res = await fetchUserProfile(username);
      if (res.ok) {
        setUserData({
          full_name: res.data.user.full_name || "",
          bio: res.data.user.bio || "",
          avatar: res.data.user.avatar || ""
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadBlockedUsersCount = async () => {
    try {
      const res = await getBlockedUsers();
      if (res.ok) {
        setBlockedUsersCount(res.data.blocked_users?.length || 0);
      }
    } catch (error) {
      console.error("Error loading blocked users count:", error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setMessage("❌ Please select an image file (PNG, JPG, GIF)");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const uploadRes = await uploadFile(file);
      if (uploadRes.ok) {
        const imageUrl = uploadRes.data.url;
        setUserData({...userData, avatar: imageUrl});
        setMessage("✅ Profile picture updated! Click 'Save Changes' below to make it permanent.");
      } else {
        setMessage(uploadRes.data?.error || "Failed to upload image");
      }
    } catch (error) {
      setMessage("Error uploading image");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      // Get current user ID from profile
      const profileRes = await fetchUserProfile(username);
      if (!profileRes.ok) {
        setMessage("Failed to load user profile");
        return;
      }

      const userId = profileRes.data.user.id;
      const res = await updateUserProfile(userId, userData);
      
      if (res.ok) {
        setMessage("✅ Profile updated successfully!");
        // Reload profile to get updated data
        await loadUserProfile();
      } else {
        setMessage(res.data?.error || "Failed to update profile");
      }
    } catch (error) {
      setMessage("Error updating profile");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");
      localStorage.removeItem("user_id");
      window.location.href = "/send-otp";
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("🚨 DANGER: This will permanently delete your account and all your data. This action cannot be undone. Are you absolutely sure?")) {
      alert("Account deletion feature will be implemented soon. Please contact support for immediate account deletion.");
      // TODO: Implement account deletion API
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen pb-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message}
        </div>
      )}

      {/* Profile Picture Section - SIMPLIFIED */}
      <GlassCard className="p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
        
        <div className="flex flex-col items-center space-y-4">
          {/* Clickable Avatar - Only Option */}
          <div 
            className="flex flex-col items-center cursor-pointer group"
            onClick={handleAvatarClick}
          >
            <div className="relative">
              <Avatar 
                src={userData.avatar} 
                emoji="👤" 
                size={120} 
                glow={true}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-white text-center">
                  <div className="text-2xl">📷</div>
                  <div className="text-xs font-medium mt-1">Change Photo</div>
                </div>
              </div>
              
              {/* Uploading indicator */}
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div className="text-xs font-medium mt-1">Uploading...</div>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-3 text-center group-hover:text-blue-600 transition-colors">
              👆 Click to upload a new profile picture
            </p>
          </div>

          {/* Hidden file input */}
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleAvatarUpload}
          />
        </div>
      </GlassCard>

      {/* Profile Information Section */}
      <GlassCard className="p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Username</label>
            <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-200">
              @{username}
            </div>
            <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Full Name</label>
            <input
              type="text"
              value={userData.full_name}
              onChange={(e) => setUserData({...userData, full_name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Bio</label>
            <textarea
              value={userData.bio}
              onChange={(e) => setUserData({...userData, bio: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Tell us about yourself..."
              rows="3"
            />
          </div>

          <Button
            onClick={handleUpdateProfile}
            loading={loading}
            full
          >
            Save Changes
          </Button>
        </div>
      </GlassCard>

      {/* Privacy & Security Section */}
      <GlassCard className="p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h2>
        <div className="space-y-3">
          <Link 
            to="/blocked-users"
            className="flex justify-between items-center w-full text-left p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🚫</span>
              <span>Blocked Users</span>
            </div>
            {blockedUsersCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {blockedUsersCount}
              </span>
            )}
          </Link>
        </div>
      </GlassCard>

      {/* Legal Section */}
      <GlassCard className="p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Legal</h2>
        <div className="space-y-3">
          <Link 
            to="/terms-of-service"
            className="flex items-center gap-3 w-full text-left p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">📄</span>
            <span>Terms of Service</span>
          </Link>
          
          <Link 
            to="/privacy-policy"
            className="flex items-center gap-3 w-full text-left p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">🔒</span>
            <span>Privacy Policy</span>
          </Link>
        </div>
      </GlassCard>

      {/* Account Actions Section */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
        <div className="space-y-3">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
          
          <button 
            onClick={handleDeleteAccount}
            className="flex items-center gap-3 w-full text-left p-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
          >
            <span className="text-xl">🗑️</span>
            <span>Delete Account</span>
          </button>
        </div>
      </GlassCard>

      {/* App Info Section */}
      <GlassCard className="p-6 mt-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>App Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Build Date</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>User ID</span>
            <span className="font-medium">{localStorage.getItem("user_id") || "N/A"}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
