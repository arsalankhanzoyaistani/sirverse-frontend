import React, { useState, useEffect } from "react";
import { fetchComments, addComment, toggleLike, deletePost } from "../utils/api";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import ReportModal from "../components/ReportModal";

export default function PostCard({ post, onRefresh }) {
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [openComments, setOpenComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);  
  const navigate = useNavigate();

  async function loadComments() {
    const res = await fetchComments(post.id);
    if (res.ok) setComments(res.data.comments || []);
  }

  useEffect(() => {
    if (openComments) loadComments();
  }, [openComments]);

  async function handleLike() {
    if (loading) return;
    setLoading(true);
    const res = await toggleLike(post.id);
    setLoading(false);
    if (res.ok) {
      setLiked(res.data.liked);
      setLikes(res.data.likes_count);
    } else if (res.status === 401) {
      alert("Please login again.");
      localStorage.removeItem("access_token");
      window.location.href = "/send-otp";
    } else {
      alert("Failed to like post");
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await addComment(post.id, commentText.trim());
    if (res.ok) {
      setCommentText("");
      loadComments();
    } else {
      alert(res.data?.error || "Failed to add comment");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure to delete this post?")) return;
    const res = await deletePost(post.id);
    if (res.ok && onRefresh) onRefresh();
  }

  return (
    <article className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
      <header className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate(`/profile/${post.author.username}`)}
        >
          <Avatar src={post.author.avatar} emoji="👤" size={40} />
          <div>
            <div className="font-semibold text-gray-800">
              @{post.author.username}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {localStorage.getItem("username") === post.author.username && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 text-sm"
          >
            🗑️ Delete
          </button>
        )}
      </header>

      <p className="text-gray-800 mb-3">{post.content}</p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="post"
          className="rounded-xl max-h-96 object-cover mb-3"
        />
      )}

      <div className="flex items-center gap-3 text-sm">
        <button onClick={handleLike}>
          {liked ? "❤️" : "🤍"} {likes}
        </button>
        <button onClick={() => setOpenComments((p) => !p)}>
          💬 {comments.length}
        </button>
      </div>

      {openComments && (
        <div className="mt-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 p-2 rounded-lg mb-1">
              <div className="text-sm font-medium">@{c.user.username}</div>
              <div className="text-sm text-gray-700">{c.content}</div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2 mt-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border p-2 rounded-lg text-sm"
              placeholder="Write a comment..."
            />
            <button className="bg-blue-500 text-white px-3 rounded-lg text-sm">
              Send
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
