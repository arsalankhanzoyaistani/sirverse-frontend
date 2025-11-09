// frontend/src/components/ui/AvatarUploader.jsx
// ===============================================
// ✅ SirVerse Avatar Uploader (Final Version)
// Directly uploads to Cloudinary (unsigned preset)
// Then updates backend with the new avatar URL
// ===============================================

import React, { useState } from "react";
import { uploadToCloudinaryDirect, updateUserProfile } from "../../utils/api";
import Button from "./Button";

export default function AvatarUploader({ user, onAvatarUpdated }) {
  const [preview, setPreview] = useState(user?.avatar || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------------------------
  // 🖼️ Handle File Select
  // -----------------------------------------------
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image (JPG, PNG, WEBP)");
      return;
    }

    // ✅ Validate file size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max size 5 MB.");
      return;
    }

    setError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      // ☁️ Upload to Cloudinary
      const uploadRes = await uploadToCloudinaryDirect(file, "sirverse_avatars");
      if (!uploadRes.ok || !uploadRes.data?.secure_url) {
        throw new Error(uploadRes.data?.error || "Upload failed");
      }

      const newAvatarUrl = uploadRes.data.secure_url;
      console.log("✅ Avatar uploaded to Cloudinary:", newAvatarUrl);

      // 💾 Save avatar in backend
      const backendRes = await updateUserProfile(user.id, { avatar: newAvatarUrl });
      if (backendRes.ok) {
        console.log("✅ Avatar updated in backend:", backendRes.data.user.avatar);
        setPreview(newAvatarUrl);
        if (onAvatarUpdated) onAvatarUpdated(newAvatarUrl);
      } else {
        throw new Error(backendRes.data?.error || "Failed to save avatar");
      }
    } catch (err) {
      console.error("💥 Avatar upload error:", err);
      setError(err.message || "Error uploading avatar");
    } finally {
      setUploading(false);
    }
  };

  // -----------------------------------------------
  // 🧹 Remove Avatar
  // -----------------------------------------------
  const handleRemoveAvatar = async () => {
    if (!window.confirm("Remove your profile picture?")) return;
    try {
      const res = await updateUserProfile(user.id, { avatar: "" });
      if (res.ok) {
        setPreview(null);
        if (onAvatarUpdated) onAvatarUpdated(null);
      } else {
        alert(res.data?.error || "Failed to remove avatar");
      }
    } catch (err) {
      console.error("Remove avatar error:", err);
    }
  };

  // -----------------------------------------------
  // 🎨 Render UI
  // -----------------------------------------------
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar Preview */}
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="avatar preview"
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-md">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Loading Spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col items-center gap-2">
        <label className="cursor-pointer text-blue-600 hover:underline text-sm">
          {uploading ? "Uploading..." : "Change Avatar"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        {preview && (
          <button
            onClick={handleRemoveAvatar}
            className="text-xs text-red-500 hover:underline disabled:opacity-50"
            disabled={uploading}
          >
            Remove
          </button>
        )}

        {error && (
          <p className="text-xs text-red-500 text-center mt-1 bg-red-50 px-2 py-1 rounded">
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  );
}
