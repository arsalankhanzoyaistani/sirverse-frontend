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
    try {
      const res = await fetchComments(post.id);
      if (res.ok) {
        setComments(res.data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }

  useEffect(() => {
    if (openComments) {
      loadComments();
    }
  }, [openComments]);

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
      } else {
        alert(res.data?.error || "Failed to like post");
      }
    } catch (error) {
      alert("Network error - please try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setLoading(true);
    
    try {
      const res = await addComment(post.id, commentText.trim());
      
      if (res.ok) {
        setCommentText("");
        await loadComments();
      } else {
        alert(res.data?.error || "Failed to add comment");
      }
    } catch (error) {
      alert("Network error - please try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const res = await deletePost(post.id);
      
      if (res.ok && onRefresh) {
        onRefresh();
      } else {
        alert(res.data?.error || "Failed to delete post");
      }
    } catch (error) {
      alert("Network error - please try again");
    }
  }

  const handleAvatarClick = () => {
    if (post.author && post.author.username) {
      navigate(`/profile/${post.author.username}`);
    }
  };

  const handleCommentToggle = () => {
    setOpenComments(prev => !prev);
  };

  return (
    <article className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
      {/* Post Header */}
      <header className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition"
          onClick={handleAvatarClick}
          title={`View ${post.author?.username}'s profile`}
        >
          <Avatar 
            src={post.author?.avatar} 
            emoji="👤" 
            size={40} 
          />
          <div>
            <div className="font-semibold text-gray-800 hover:text-blue-600 transition">
              @{post.author?.username || "Unknown User"}
            </div>
            <div className="text-xs text-gray-500">
              {post.created_at_pk_human || new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Delete button (only for post owner) */}
        {localStorage.getItem("username") === post.author?.username && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 text-sm p-2 rounded-lg hover:bg-red-50 transition"
            title="Delete this post"
          >
            🗑️ Delete
          </button>
        )}
      </header>

      {/* Post Content */}
      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>

      {/* Post Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt="post"
          className="rounded-xl max-h-96 object-cover mb-3 w-full border border-gray-200"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-4 text-sm">
        <button 
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-1 p-2 rounded-lg transition ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          } ${liked ? 'text-red-500' : 'text-gray-500'}`}
          title={liked ? "Unlike post" : "Like post"}
        >
          {liked ? "❤️" : "🤍"} 
          <span className="min-w-[20px] text-center">{likes}</span>
        </button>
        
        <button 
          onClick={handleCommentToggle}
          className="flex items-center gap-1 p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
          title="View comments"
        >
          💬 
          <span className="min-w-[20px] text-center">{comments.length}</span>
        </button>
        
        <button 
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1 p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
          title="Report post"
        >
          ⚠️ Report
        </button>
      </div>

      {/* Comments Section */}
      {openComments && (
        <div className="mt-3 border-t pt-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Comments ({comments.length})
          </h4>
          
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar 
                      src={comment.user?.avatar} 
                      emoji="👤" 
                      size={24} 
                    />
                    <div className="text-sm font-medium text-gray-800">
                      @{comment.user?.username || "Unknown User"}
                    </div>
                    <div className="text-xs text-gray-500 ml-auto">
                      {comment.created_at_pk_human || new Date(comment.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 ml-8">{comment.content}</div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleComment} className="flex gap-2 mt-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border border-gray-300 p-2 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="Write a comment..."
              disabled={loading}
              maxLength={500}
            />
            <button 
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              disabled={loading || !commentText.trim()}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>...</span>
                </>
              ) : (
                "Send"
              )}
            </button>
          </form>
          
          {commentText.length > 400 && (
            <p className="text-xs text-orange-500 mt-1">
              {500 - commentText.length} characters remaining
            </p>
          )}
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedPostId={post.id}
          reportedUserId={post.author?.id}
          onReportSubmitted={() => setShowReportModal(false)}
        />
      )}
    </article>
  );
}
