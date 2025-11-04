// frontend/src/pages/Reels.jsx
import React, { useEffect, useState, useRef } from "react";
import { fetchReels, toggleReelLike } from "../utils/api";

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [likedReels, setLikedReels] = useState(new Set());
  const videoRefs = useRef([]);
  const observerRef = useRef(null);

  // Load reels
  useEffect(() => {
    loadReels();
  }, []);

  // Setup intersection observer for autoplay
  useEffect(() => {
    if (reels.length === 0) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const videoIndex = parseInt(entry.target.dataset.index);
        const video = videoRefs.current[videoIndex];
        
        if (entry.isIntersecting) {
          setCurrentPlayingIndex(videoIndex);
          if (video) {
            video.play().catch(error => {
              video.muted = true;
              video.play().catch(e => console.log('Autoplay failed'));
            });
          }
        } else {
          if (video && videoIndex !== currentPlayingIndex) {
            video.pause();
            video.currentTime = 0;
          }
        }
      });
    }, options);

    videoRefs.current.forEach((video, index) => {
      if (video && observerRef.current) {
        video.dataset.index = index;
        observerRef.current.observe(video);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [reels, currentPlayingIndex]);

  // Auto-play current video and pause others
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      
      if (index === currentPlayingIndex) {
        video.play().catch(error => {
          video.muted = true;
          video.play().catch(e => console.log('Autoplay failed'));
        });
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentPlayingIndex]);

  const loadReels = async () => {
    try {
      setLoading(true);
      const res = await fetchReels(1, 50);
      
      if (res.ok && res.data) {
        setReels(res.data.items || []);
      } else {
        setReels([
          {
            id: 1,
            video_url: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
            caption: "Beautiful nature scenery with yellow flowers 🌸",
            author: { username: "nature_lover", id: 1 },
            likes_count: 15,
            created_at: new Date().toISOString()
          },
          {
            id: 2, 
            video_url: "https://assets.mixkit.co/videos/preview/mixkit-going-down-a-curved-highway-through-a-mountain-1170-large.mp4",
            caption: "Mountain road journey through scenic landscapes 🏔️",
            author: { username: "adventure_seeker", id: 2 },
            likes_count: 8,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            video_url: "https://assets.mixkit.co/videos/preview/mixkit-a-girl-blowing-a-bubble-gum-at-an-amusement-park-1226-large.mp4",
            caption: "Fun times at the amusement park! 🎡",
            author: { username: "fun_lover", id: 3 },
            likes_count: 23,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading reels:", error);
      setReels([
        {
          id: 1,
          video_url: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
          caption: "Experience the beauty of nature 🌿",
          author: { username: "demo", id: 1 },
          likes_count: 10,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reelId) => {
    try {
      const res = await toggleReelLike(reelId);
      if (res.ok) {
        setReels(prev => prev.map(reel => 
          reel.id === reelId ? { ...reel, likes_count: res.data.likes_count } : reel
        ));
        
        setLikedReels(prev => {
          const newSet = new Set(prev);
          if (newSet.has(reelId)) {
            newSet.delete(reelId);
          } else {
            newSet.add(reelId);
            setTimeout(() => {
              setLikedReels(prev => {
                const updated = new Set(prev);
                updated.delete(reelId);
                return updated;
              });
            }, 1000);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const handleVideoClick = (index) => {
    setCurrentPlayingIndex(index);
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play().catch(error => {
          video.muted = true;
          video.play().catch(e => console.log('Play failed'));
        });
      } else {
        video.pause();
      }
    }
  };

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="p-3 border-b border-gray-800 sticky top-0 bg-black/95 backdrop-blur-lg z-50">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Reels</h1>
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🎬</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {[1, 2, 3].map((skeleton) => (
            <div key={skeleton} className="bg-gray-900 mx-2 my-2 overflow-hidden">
              <div className="relative bg-gray-800" style={{ height: '100vh' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-32 p-4">
                  <div className="flex justify-between items-end">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="h-3 bg-gray-700 rounded w-20 animate-pulse"></div>
                      </div>
                      <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-3">
                      {[1, 2, 3].map((btn) => (
                        <div key={btn} className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-3 border-b border-gray-800 sticky top-0 bg-black/95 backdrop-blur-lg z-50">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Reels</h1>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-xs text-gray-400">{reels.length} videos</div>
            </div>
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🎬</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-0">
        {reels.map((reel, index) => (
          <div key={reel.id} className="relative" style={{ height: '100vh' }}>
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={reel.video_url}
              className="w-full h-full object-cover bg-black"
              muted={muted}
              loop
              playsInline
              onClick={() => handleVideoClick(index)}
              poster={reel.video_url?.replace('.mp4', '.jpg')}
            />
            
            {currentPlayingIndex !== index && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                onClick={() => handleVideoClick(index)}
              >
                <div className="bg-black/50 rounded-full p-4">
                  <span className="text-white text-2xl">▶</span>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              {currentPlayingIndex === index && (
                <div className="bg-black/70 rounded-full px-3 py-1 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium">Playing</span>
                </div>
              )}
              
              <button
                onClick={toggleMute}
                className="bg-black/70 rounded-full p-2 backdrop-blur-sm"
              >
                <span className="text-white text-sm">
                  {muted ? "🔇" : "🔊"}
                </span>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-12 pb-6 px-4">
              <div className="flex justify-between items-end">
                <div className="flex-1 pr-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {reel.author?.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">@{reel.author?.username || "user"}</p>
                    </div>
                  </div>

                  {reel.caption && (
                    <p className="text-white text-sm leading-tight mb-2 line-clamp-2">
                      {reel.caption}
                    </p>
                  )}

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-red-400 text-xs">❤️</span>
                      <span className="text-white text-xs font-medium">
                        {formatCount(reel.likes_count || 0)}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(reel.created_at_pk || reel.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => handleLike(reel.id)}
                      className={`bg-black/70 rounded-full p-2 backdrop-blur-sm border transition-all duration-200 ${
                        likedReels.has(reel.id) 
                          ? 'border-red-500 bg-red-500/20' 
                          : 'border-gray-600'
                      }`}
                    >
                      {likedReels.has(reel.id) ? (
                        <div className="relative">
                          <span className="text-lg">❤️</span>
                          <div className="absolute inset-0 animate-ping">
                            <span className="text-lg">❤️</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-lg">🤍</span>
                      )}
                    </button>
                    <span className="text-white text-xs font-medium mt-1">
                      {formatCount(reel.likes_count || 0)}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button className="bg-black/70 rounded-full p-2 backdrop-blur-sm border border-gray-600">
                      <span className="text-lg">💬</span>
                    </button>
                    <span className="text-white text-xs font-medium mt-1">Comment</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(reel.video_url);
                        alert('Link copied to clipboard!');
                      }}
                      className="bg-black/70 rounded-full p-2 backdrop-blur-sm border border-gray-600"
                    >
                      <span className="text-lg">📤</span>
                    </button>
                    <span className="text-white text-xs font-medium mt-1">Share</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-xs backdrop-blur-lg border border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <span>Tap to play/pause • Scroll for more</span>
        </div>
      </div>
    </div>
  );
}
