// #frontend/src/pages/ProfilePage.js 

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [showOptions, setShowOptions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [followStats, setFollowStats] = useState({
    followers_count: 0,
    following_count: 0,
    is_following: false,
    is_blocked: false
  });
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (profile?.user?.id) {
      loadFollowStats();
    }
  }, [profile]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:8080/api/users/${username}`);
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Error: ${response.status}`);
      }
    } catch (err) {
      setError('Network error - cannot reach server');
    } finally {
      setLoading(false);
    }
  }

  async function loadFollowStats() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token || !profile?.user?.id) return;

      const response = await fetch(`http://localhost:8080/api/users/${profile.user.id}/follow_status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFollowStats(data);
      }
    } catch (err) {
      console.log('Follow stats not available');
    }
  }

  const handleFollow = async () => {
    if (!profile?.user?.id) return;
    
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('access_token');
      const currentUserId = localStorage.getItem('user_id');

      if (!token) {
        navigate('/login');
        return;
      }

      if (parseInt(currentUserId) === profile.user.id) {
        alert("You cannot follow yourself");
        setLoadingAction(false);
        return;
      }

      const action = followStats.is_following ? 'unfollow' : 'follow';
      const url = `http://localhost:8080/api/users/${profile.user.id}/${action}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setFollowStats(prev => ({
          ...prev,
          is_following: !prev.is_following,
          followers_count: data.followers_count || prev.followers_count,
        }));
      } else {
        alert(data.error || `Failed to ${action} user`);
      }
    } catch (err) {
      alert("Network error - please check your connection");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleMessage = async () => {
    if (!profile?.user?.id) return;
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8080/api/chats/create_room', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ other_user_id: profile.user.id })
      });

      if (response.ok) {
        const data = await response.json();
        navigate('/chats', { state: { openRoom: data.room } });
      } else {
        alert('Failed to start conversation');
      }
    } catch (err) {
      console.error('Message action failed:', err);
    }
  };

  const handleBlock = async () => {
    if (!profile?.user?.id) return;
    
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`http://localhost:8080/api/users/${profile.user.id}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert(`You have blocked @${profile.user.username}`);
        navigate('/posts');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to block user');
      }
    } catch (err) {
      console.error('Block action failed:', err);
    } finally {
      setLoadingAction(false);
      setShowBlockModal(false);
    }
  };

  const handleReport = async (reportType) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reported_user_id: profile.user.id,
          report_type: reportType,
          description: `Reported ${profile.user.username} for ${reportType}`
        })
      });

      if (response.ok) {
        alert('Report submitted successfully!');
        setShowReportModal(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit report');
      }
    } catch (err) {
      console.error('Report action failed:', err);
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      alert('Profile link copied to clipboard!');
    } catch (err) {
      const tempInput = document.createElement('input');
      tempInput.value = profileUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      alert('Profile link copied!');
    }
  };

  const getRoleDisplay = (user) => {
    if (user.role === 'student') {
      return `Student${user.class_level ? ` • Class ${user.class_level}` : ''}`;
    } else if (user.role === 'teacher') {
      return 'Teacher';
    }
    return 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Profile Not Found</h1>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button 
            onClick={loadProfile}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const user = profile.user;
  const currentUserId = localStorage.getItem('user_id');
  const isOwnProfile = currentUserId === user.id?.toString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header - Premium Design */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm">
        <div className="max-w-lg mx-auto px-5 py-5">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-5">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50/80 hover:border-gray-300/60 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              ←
            </button>
            <h1 className="text-lg font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              @{username}
            </h1>
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50/80 hover:border-gray-300/60 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              ⋯
            </button>
          </div>

          <div className="flex items-center gap-5">
            {/* Premium Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar 
                  src={user.avatar} 
                  emoji="👤" 
                  size={85} 
                  interactive={false}
                  className="border-3 border-white/80 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Premium Stats */}
            <div className="flex-1 flex justify-around text-center">
              <div className="flex flex-col items-center">
                <span className="font-bold text-xl text-gray-800">{profile.posts?.length || 0}</span>
                <span className="text-gray-500 text-xs font-medium mt-1">Posts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-xl text-gray-800">{followStats.followers_count}</span>
                <span className="text-gray-500 text-xs font-medium mt-1">Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-xl text-gray-800">{followStats.following_count}</span>
                <span className="text-gray-500 text-xs font-medium mt-1">Following</span>
              </div>
            </div>
          </div>

          {/* Premium User Info */}
          <div className="mt-4">
            <h2 className="font-bold text-base text-gray-800">{user.full_name}</h2>
            
            {user.bio && (
              <p className="text-gray-700 text-sm mt-2 leading-relaxed">{user.bio}</p>
            )}

            {/* Premium Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200/50">
                {getRoleDisplay(user)}
              </span>
              
              {user.gender && (
                <span className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200">
                  {user.gender}
                </span>
              )}
              
              {user.dob && (
                <span className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 text-pink-700 px-3 py-1.5 rounded-full text-xs font-medium border border-pink-200/50">
                  🎂 {new Date(user.dob).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Premium Join Date */}
            <div className="mt-3 text-xs text-gray-500 font-medium">
              📅 Joined {new Date(user.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* 🎯 PREMIUM ACTION BUTTONS */}
          <div className="flex gap-3 mt-5">
            {!isOwnProfile ? (
              <>
                <button
                  onClick={handleFollow}
                  disabled={loadingAction}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    followStats.is_following
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-2 border-gray-200/60 hover:from-gray-200 hover:to-gray-100 hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:shadow-xl'
                  } disabled:opacity-50 disabled:transform-none disabled:hover:scale-100`}
                >
                  {loadingAction ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    followStats.is_following ? '✓ Following' : '+ Follow'
                  )}
                </button>
                
                <button
                  onClick={handleMessage}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  💬 Message
                </button>
                
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="w-12 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border-2 border-gray-200/60 hover:from-gray-200 hover:to-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  ⋯
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/settings')}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  ✏️ Edit Profile
                </button>
                <button 
                  onClick={handleShare}
                  className="w-12 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border-2 border-gray-200/60 hover:from-gray-200 hover:to-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  📋
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 BEAUTIFUL THREE-DOTS MENU BUTTONS */}
      {showOptions && !isOwnProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl w-full max-w-sm shadow-2xl border border-white/20 mx-4">
            {/* Share Button - Beautiful */}
            <button 
              onClick={handleShare}
              className="w-full p-5 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 rounded-t-3xl transition-all duration-300 group border-b border-gray-100/50"
            >
              <div className="flex items-center gap-4 group-hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-xl text-white">📤</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800 text-base">Share Profile</div>
                  <div className="text-gray-500 text-sm">Copy profile link to share</div>
                </div>
              </div>
            </button>

            {/* Report Button - Beautiful */}
            <button 
              onClick={() => { setShowReportModal(true); setShowOptions(false); }}
              className="w-full p-5 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-red-50/80 transition-all duration-300 group border-b border-gray-100/50"
            >
              <div className="flex items-center gap-4 group-hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-xl text-white">⚠️</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-red-600 text-base">Report User</div>
                  <div className="text-gray-500 text-sm">Report inappropriate behavior</div>
                </div>
              </div>
            </button>

            {/* Block Button - Beautiful */}
            <button 
              onClick={() => { setShowBlockModal(true); setShowOptions(false); }}
              className="w-full p-5 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-rose-50/80 transition-all duration-300 group rounded-b-3xl"
            >
              <div className="flex items-center gap-4 group-hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-xl text-white">🚫</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-red-600 text-base">Block User</div>
                  <div className="text-gray-500 text-sm">Block and stop seeing their content</div>
                </div>
              </div>
            </button>

            {/* Cancel Button - Beautiful */}
            <div className="p-3 border-t border-gray-100/50">
              <button 
                onClick={() => setShowOptions(false)}
                className="w-full py-4 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 rounded-2xl font-bold text-base hover:from-gray-200 hover:to-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 PREMIUM TABS */}
      <div className="max-w-lg mx-auto bg-white/60 backdrop-blur-sm border-b border-gray-200/40">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 text-center border-b-2 transition-all duration-300 ${
              activeTab === 'posts' 
                ? 'border-blue-500 text-blue-600 font-bold bg-gradient-to-t from-blue-50/50 to-transparent' 
                : 'border-transparent text-gray-500 font-medium hover:text-gray-700'
            } text-sm`}
          >
            📝 POSTS
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`flex-1 py-4 text-center border-b-2 transition-all duration-300 ${
              activeTab === 'reels' 
                ? 'border-purple-500 text-purple-600 font-bold bg-gradient-to-t from-purple-50/50 to-transparent' 
                : 'border-transparent text-gray-500 font-medium hover:text-gray-700'
            } text-sm`}
          >
            🎬 REELS
          </button>
        </div>
      </div>

      {/* 🎯 PREMIUM CONTENT GRID */}
      <div className="max-w-lg mx-auto pb-20 bg-gradient-to-b from-transparent to-gray-50/30">
        {activeTab === 'posts' && (
          <div className="p-1">
            {!profile.posts || profile.posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">📝</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Posts Yet</h3>
                <p className="text-gray-600 text-sm mb-6">
                  {isOwnProfile 
                    ? "Share your first post with the world!" 
                    : `${user.username} hasn't shared any posts yet.`
                  }
                </p>
                {isOwnProfile && (
                  <button 
                    onClick={() => navigate('/posts')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Create Your First Post
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 p-1">
                {profile.posts.map(post => (
                  <div key={post.id} className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden relative group cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg">
                    {post.image_url ? (
                      <img 
                        src={post.image_url} 
                        alt="Post" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-center">
                          <div className="text-3xl mb-1">📝</div>
                          <p className="text-xs text-gray-400">Text Post</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Premium Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
                      <div className="text-white flex gap-4 text-xs font-medium">
                        <span className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full">
                          ❤️ {post.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full">
                          💬 {post.comments_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="p-1">
            {!profile.reels || profile.reels.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">🎬</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Reels Yet</h3>
                <p className="text-gray-600 text-sm mb-6">
                  {isOwnProfile 
                    ? "Create your first amazing reel!" 
                    : `${user.username} hasn't created any reels yet.`
                  }
                </p>
                {isOwnProfile && (
                  <button 
                    onClick={() => navigate('/reels')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Create Your First Reel
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 p-1">
                {profile.reels.map(reel => (
                  <div key={reel.id} className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative group cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg">
                    <video 
                      src={reel.video_url}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      muted
                    />
                    <div className="absolute bottom-2 left-2 text-white text-xs font-medium flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full">
                      ▶️ {reel.likes_count || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🎯 PREMIUM MODALS */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl w-full max-w-sm shadow-2xl border border-white/20">
            <div className="p-5 border-b border-gray-200/50">
              <h3 className="text-xl font-bold text-center text-gray-800">Report User</h3>
            </div>
            <div className="p-3">
              {['harassment', 'spam', 'inappropriate_content', 'false_information', 'other'].map(reason => (
                <button
                  key={reason}
                  onClick={() => handleReport(reason)}
                  className="w-full text-left p-4 hover:bg-blue-50/50 rounded-xl text-sm font-medium border-b border-gray-100/50 last:border-b-0 flex items-center gap-4 transition-all duration-200 hover:scale-105 group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">⚠️</span>
                  <span>{reason.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowReportModal(false)}
              className="w-full p-4 border-t border-gray-200/50 text-sm font-semibold text-gray-600 text-center hover:bg-gray-50/50 rounded-b-2xl transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl w-full max-w-sm shadow-2xl border border-white/20">
            <div className="p-5 border-b border-gray-200/50">
              <h3 className="text-xl font-bold text-center text-gray-800">Block @{username}?</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-600 text-sm text-center mb-6 leading-relaxed">
                They won't be able to find your profile, posts, or send you messages.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={handleBlock}
                  disabled={loadingAction}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
                >
                  {loadingAction ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Blocking...</span>
                    </div>
                  ) : (
                    '🚫 Block User'
                  )}
                </button>
                <button 
                  onClick={() => setShowBlockModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 rounded-xl font-semibold border-2 border-gray-200/60 hover:from-gray-200 hover:to-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
