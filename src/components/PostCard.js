import React, { useState, useEffect } from "react";
import { fetchComments, addComment, toggleLike, deletePost } from "../utils/api";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import ReportModal from "../components/ReportModal";
import GlassCard from "../components/ui/GlassCard";
import { motion } from "framer-motion";

export default function PostCard({ post, onRefresh }) {
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [openComments, setOpenComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const navigate = useNavigate();

  // Load comments
  async function loadComments() {
    try {
      const res = await fetchComments(post.id);
      if (res.ok) {
        setComments(res.data.comments || []);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  }

  useEffect(() => {
    if (openComments) loadComments();
  }, [openComments]);

  // Like button
  async function handleLike() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await toggleLike(post.id);

      if (res.ok) {
        setLiked(res.data.liked);
        setLikes(res.data.likes_count);
      } else if (res.status === 401) {
        alert("Please login again.");
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  // Add comment
  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);

    try {
      const res = await addComment(post.id, commentText.trim());
      if (res.ok) {
        setCommentText("");
        loadComments();
      } else {
        alert("Failed to comment");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setCommentLoading(false);
    }
  }

  // Delete post
  async function handleDelete() {
    if (!window.confirm("Delete this post?")) return;

    try {
      const res = await deletePost(post.id);
      if (res.ok && onRefresh) {
        onRefresh();
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      alert("Error deleting post");
    }
  }

  // Navigate to profile
  const handleAvatarClick = () => {
    if (post?.author?.username) {
      navigate(`/profile/${post.author.username}`);
    }
  };

  return (
    <GlassCard className="mb-6 p-5">
      {/* TOP AREA */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-xl transition"
          onClick={handleAvatarClick}
        >
          <Avatar src={post.author?.avatar} size={42} emoji="👤" />
          <div>
            <div className="font-semibold text-gray-800">@{post.author?.username}</div>
            <div className="text-xs text-gray-500">
              {post.created_at_pk_human ||
                new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* DELETE BUTTON (if author is current user) */}
        {localStorage.getItem("username") === post.author?.username && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
          >
            🗑️
          </button>
        )}
      </div>

      {/* CONTENT */}
      <p className="text-gray-800 mt-3 mb-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* IMAGE */}
      {post.image_url && (
        <motion.img
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          src={post.image_url}
          alt="post"
          className="rounded-xl w-full max-h-[500px] object-cover border border-gray-200 shadow-sm mb-3"
        />
      )}

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-5 mt-2 text-gray-600">
        {/* LIKE BUTTON */}
        <button
          onClick={handleLike}
          className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-xl transition"
        >
          {liked ? "❤️" : "🤍"} <span>{likes}</span>
        </button>

        {/* COMMENTS BUTTON */}
        <button
          onClick={() => setOpenComments((prev) => !prev)}
          className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-xl transition"
        >
          💬 <span>{comments.length}</span>
        </button>

        {/* REPORT BUTTON */}
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
        >
          ⚠️ Report
        </button>
      </div>

      {/* COMMENTS SECTION */}
      {openComments && (
        <div className="mt-4 border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Comments ({comments.length})
          </h3>

          {/* SHOW COMMENTS */}
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-100 p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar src={c.user?.avatar} size={26} emoji="👤" />
                  <span className="font-semibold text-sm">
                    @{c.user?.username || "user"}
                  </span>

                  <span className="text-xs text-gray-500 ml-auto">
                    {c.created_at_pk_human ||
                      new Date(c.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-700 text-sm pl-8">{c.content}</div>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                No comments yet
              </p>
            )}
          </div>

          {/* ADD COMMENT */}
          <form
            onSubmit={handleComment}
            className="flex items-center gap-2 mt-3"
          >
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring focus:ring-blue-300 focus:border-blue-400"
              placeholder="Write a comment..."
              disabled={commentLoading}
            />

            <button
              disabled={commentLoading || !commentText.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-600 transition disabled:opacity-40"
            >
              {commentLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedPostId={post.id}
          reportedUserId={post.author?.id}
        />
      )}
    </GlassCard>
  );
}
