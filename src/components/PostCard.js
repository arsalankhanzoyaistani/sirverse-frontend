// frontend/src/components/PostCard.js
import React, { useState, useEffect } from "react";
import { fetchComments, addComment, toggleLike, deletePost } from "../utils/api";
import { useNavigate } from "react-router-dom";
import Avatar from "./ui/Avatar";
import ReportModal from "./ReportModal";
import { motion, AnimatePresence } from "framer-motion";

export default function PostCard({ post, onRefresh }) {
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [openComments, setOpenComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const currentUserId = localStorage.getItem("user_id");
    setIsOwner(post.author?.id?.toString() === currentUserId);
  }, [post]);

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

    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : likes - 1;
    setLiked(newLiked);
    setLikes(newLikes);

    try {
      const res = await toggleLike(post.id);
      if (res.ok) {
        setLiked(res.data.liked);
        setLikes(res.data.likes_count);
      } else if (res.status === 401) {
        setLiked(!newLiked);
        setLikes(likes);
        alert("Please login again.");
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    } catch (error) {
      setLiked(!newLiked);
      setLikes(likes);
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
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCommentLoading(false);
    }
  }

  // Delete post
  async function handleDelete() {
    if (!window.confirm("Delete this post? This action cannot be undone.")) return;

    try {
      const res = await deletePost(post.id);
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  // Handle image error
  const handleImageError = () => {
    console.error("❌ Failed to load image:", post.image_url);
    setImageError(true);
  };

  // Check if image URL is valid
  const isValidImageUrl = (url) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null || 
           url.includes('cloudinary') || 
           url.includes('upload');
  };

  return (
    <div className="bg-white rounded-xl mb-3 border border-gray-200 shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => post.author?.username && navigate(`/profile/${post.author.username}`)}
          >
            <Avatar 
              src={post.author?.avatar} 
              emoji={post.author?.username?.charAt(0) || "👤"} 
              size={40}
            />
            <div>
              <div className="font-semibold text-gray-900">
                {post.author?.username ? `@${post.author.username}` : 'Unknown User'}
              </div>
              <div className="text-xs text-gray-500">
                {formatTimestamp(post.created_at)}
              </div>
            </div>
          </div>
          
          {/* Post Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {isOwner ? (
                    <>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Edit Post
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete Post
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Report Post
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Post Content */}
        {post.content && (
          <p className="mt-3 text-gray-900 whitespace-pre-wrap">
            {post.content}
          </p>
        )}
      </div>

      {/* Post Image - FIXED DISPLAY */}
      {post.image_url && isValidImageUrl(post.image_url) && !imageError && (
        <div className="border-t border-gray-100">
          <div className="relative">
            <img 
              src={post.image_url} 
              alt="Post content"
              className="w-full h-auto max-h-96 object-contain bg-gray-50"
              loading="lazy"
              onError={handleImageError}
              onLoad={() => console.log("✅ Image loaded:", post.image_url)}
            />
            {post.image_url.includes('cloudinary') && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                📷
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug info for image URLs */}
      {post.image_url && !isValidImageUrl(post.image_url) && (
        <div className="border-t border-gray-100 p-4 bg-yellow-50">
          <p className="text-sm text-yellow-700">
            <strong>Debug:</strong> Invalid image URL: {post.image_url}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Check if the image was properly uploaded to Cloudinary
          </p>
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 pt-3 pb-2 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-500">
          <span>{likes} likes</span>
          <span>{comments.length} comments</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 border-t border-gray-100">
        <div className="grid grid-cols-3">
          <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center justify-center gap-2 py-3 text-sm font-medium ${liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
          >
            <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Like
          </button>
          
          <button
            onClick={() => setOpenComments(!openComments)}
            className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-blue-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comment
          </button>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/posts`);
              alert("Link copied to clipboard!");
            }}
            className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-green-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {openComments && (
          <motion.div 
            className="border-t border-gray-100 bg-gray-50"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Comment Input */}
            <div className="p-4 border-b border-gray-200">
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm"
                  disabled={commentLoading}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || commentLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium disabled:opacity-50"
                >
                  {commentLoading ? "..." : "Post"}
                </button>
              </form>
            </div>

            {/* Comments List */}
            <div className="max-h-64 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 border-b border-gray-100">
                    <div className="flex gap-3">
                      <Avatar 
                        src={comment.user?.avatar} 
                        emoji={comment.user?.username?.charAt(0) || "👤"} 
                        size={32}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.user?.username ? `@${comment.user.username}` : 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm mt-1">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No comments yet. Be the first!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedItem={{ reported_post_id: post.id }}
      />
    </div>
  );
}
