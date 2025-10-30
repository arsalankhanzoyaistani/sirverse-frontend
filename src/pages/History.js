import React, { useEffect, useState } from "react";
import { fetchPosts, fetchComments } from "../utils/api";
import GlassCard from "../components/ui/GlassCard";

export default function History() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username");

  useEffect(() => {
    async function loadActivityHistory() {
      try {
        // Get user's posts and comments to build activity history
        const postsRes = await fetchPosts(1, 100);
        let userActivities = [];

        if (postsRes.ok) {
          // Add user's posts as activities
          const userPosts = postsRes.data.items.filter(post => post.author.username === username);
          userPosts.forEach(post => {
            userActivities.push({
              type: 'post',
              action: 'created a post',
              content: post.content,
              timestamp: post.created_at_pk || post.created_at,
              id: `post-${post.id}`,
              likes: post.likes_count,
              comments: post.comments_count
            });
          });

          // Get comments for each post to find user's comments
          for (let post of postsRes.data.items) {
            const commentsRes = await fetchComments(post.id);
            if (commentsRes.ok && commentsRes.data.comments) {
              const userComments = commentsRes.data.comments.filter(
                comment => comment.user.username === username
              );
              userComments.forEach(comment => {
                userActivities.push({
                  type: 'comment',
                  action: 'commented on a post',
                  content: comment.content,
                  timestamp: comment.created_at_pk || comment.created_at,
                  postContent: post.content,
                  id: `comment-${comment.id}`
                });
              });
            }
          }
        }

        // Sort by timestamp (newest first) and limit to 20
        userActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivities(userActivities.slice(0, 20));

      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    }
    loadActivityHistory();
  }, [username]);

  const formatActivity = (activity) => {
    const contentPreview = activity.content.length > 60 
      ? activity.content.substring(0, 60) + '...' 
      : activity.content;

    switch (activity.type) {
      case 'post':
        return `You created a post: "${contentPreview}"`;
      case 'comment':
        return `You commented: "${contentPreview}"`;
      default:
        return 'Unknown activity';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post': return '📝';
      case 'comment': return '💬';
      default: return '📌';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading activity history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
        <p className="text-gray-600 mt-1">Your recent posts and comments</p>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map(activity => (
            <GlassCard key={activity.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg ${
                  activity.type === 'post' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{formatActivity(activity)}</p>
                  {activity.type === 'post' && (
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>❤️ {activity.likes} likes</span>
                      <span>💬 {activity.comments} comments</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="p-6 text-center">
          <div className="text-4xl mb-3">🕒</div>
          <p className="text-gray-700 font-medium">No activity yet</p>
          <p className="text-sm text-gray-500 mt-1">Start posting and commenting to see your history here</p>
        </GlassCard>
      )}
    </div>
  );
}
