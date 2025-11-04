import React, { useState } from "react";
import { uploadFile, createPost } from "../utils/api";

export default function PostComposer({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!content.trim() && !image) {
      alert("Please write something or attach an image");
      return;
    }

    if (!localStorage.getItem("access_token")) {
      alert("Please login first");
      return;
    }

    setUploading(true);
    try {
      let image_url = null;

      if (image) {
        const up = await uploadFile(image);
        if (!up.ok) throw new Error(up.data?.error || "Upload failed");
        image_url = up.data.url;
      }

      const postData = {
        ...(content.trim() && { content: content.trim() }),
        ...(image_url && { image_url }),
      };

      const res = await createPost(postData);
      if (res.ok) {
        setContent("");
        setImage(null);
        setImagePreview(null);
        if (onPostCreated) onPostCreated();
      } else {
        alert(res.data?.error || "Failed to create post");
      }
    } catch (err) {
      console.error("Create post error:", err);
      alert(err.message || "Error creating post");
    } finally {
      setUploading(false);
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 resize-none"
          rows="3"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

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
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-1">
              <span className="text-lg">📷</span>
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

          <button
            type="submit"
            disabled={uploading || (!content.trim() && !image)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
          >
            {uploading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
