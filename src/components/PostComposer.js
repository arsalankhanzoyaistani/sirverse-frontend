import React, { useState } from "react";
import { createPost } from "../utils/api";

export default function PostComposer({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0); // 👈 progress bar

  // 🧠 Handle Post Submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setProgress(0);

    if (!content.trim() && !image) {
      setError("Please write something or attach an image");
      return;
    }

    if (!localStorage.getItem("access_token")) {
      setError("Please login first");
      return;
    }

    setUploading(true);

    try {
      let image_url = null;

      // ✅ Direct Upload to Cloudinary (unsigned preset)
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "sirverse_unsigned"); // your preset
        formData.append("folder", "sirverse_posts");

        console.log("🌩️ Uploading directly to Cloudinary...");

        const uploadPromise = new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // 🔁 Track upload progress
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setProgress(percent);
            }
          });

          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
              } else {
                reject(new Error(xhr.responseText));
              }
            }
          };

          xhr.open(
            "POST",
            "https://api.cloudinary.com/v1_1/drzadqiyg/image/upload"
          );
          xhr.send(formData);
        });

        const result = await uploadPromise;
        if (!result.secure_url)
          throw new Error("Cloudinary upload failed — no secure URL returned");

        image_url = result.secure_url;
        console.log("✅ Cloudinary upload success:", image_url);
      }

      // ✅ Now send post content + image_url to backend
      const postData = {
        ...(content.trim() && { content: content.trim() }),
        ...(image_url && { image_url }),
      };

      const res = await createPost(postData);

      if (res.ok) {
        setContent("");
        setImage(null);
        setImagePreview(null);
        setError("");
        setProgress(0);
        if (onPostCreated) onPostCreated();
      } else {
        throw new Error(res.data?.error || "Failed to create post");
      }
    } catch (err) {
      console.error("Create post error:", err);
      setError("⚠️ Upload failed: " + err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  // 🖼️ Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  // ❌ Remove selected image
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setError("");
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
      <form onSubmit={handleSubmit}>
        {/* 📝 Text Input */}
        <textarea
          className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          rows="3"
          placeholder="What's on your mind? Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={uploading}
        ></textarea>

        {/* ⚠️ Error */}
        {error && (
          <div className="mt-2 text-red-500 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* 🖼️ Image Preview */}
        {imagePreview && (
          <div className="mt-3 relative">
            <img
              src={imagePreview}
              alt="preview"
              className="rounded-lg max-h-60 w-full object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition shadow-lg"
              disabled={uploading}
            >
              ✕
            </button>

            {/* 📊 Progress Bar */}
            {uploading && progress > 0 && (
              <div className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-lg transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            )}
          </div>
        )}

        {/* 📷 File Upload & Submit */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <label
              className={`cursor-pointer p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="text-xl">📷</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
                disabled={uploading}
              />
            </label>

            {image && (
              <span className="text-xs text-gray-500">
                {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            )}
          </div>

          {/* 🚀 Post Button */}
          <button
            type="submit"
            disabled={uploading || (!content.trim() && !image)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {progress > 0 ? ` ${progress}%` : " Posting..."}
              </>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
