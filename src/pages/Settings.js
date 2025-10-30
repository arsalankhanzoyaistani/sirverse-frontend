import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // ✅ ADD THIS IMPORT
import { updateUserProfile, fetchUserProfile, uploadFile } from "../utils/api";
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

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUserProfile();
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

  const handleAvatarClick = () => {
    // Directly trigger file input when avatar is clicked
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    window.location.href = "/send-otp";
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

      <GlassCard className="p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
        
        <div className="flex flex-col items-center space-y-4">
          {/* Clickable Avatar */}
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
              👆 Click on your profile picture to change it
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

          {/* Current avatar preview and URL option */}
          <div className="w-full max-w-md mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userData.avatar}
                onChange={(e) => setUserData({...userData, avatar: e.target.value})}
                className="flex-1 p-3 border border-gray-300 rounded-lg text-sm"
                placeholder="https://example.com/avatar.jpg"
              />
              <button
                onClick={() => setUserData({...userData, avatar: ""})}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

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

      {/* ✅ REPLACED THE OLD ACCOUNT SECTION WITH THIS: */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Legal & Account</h2>
        <div className="space-y-3">
          <Link 
            to="/legal/terms"
            className="block w-full text-left p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            📄 Terms of Service
          </Link>
          <Link 
            to="/legal/privacy" 
            className="block w-full text-left p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            🔒 Privacy Policy
          </Link>
          <Link 
            to="/blocks"
            className="block w-full text-left p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            🚫 Blocked Users
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
