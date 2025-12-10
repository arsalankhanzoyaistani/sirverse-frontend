// frontend/src/pages/Reels.jsx - PERFECT TIKTOK SCROLLING
import React, { useEffect, useState, useRef, useCallback } from "react";
import { fetchReels, toggleReelLike } from "../utils/api";

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [likedReels, setLikedReels] = useState(new Set());
  
  const videoRefs = useRef([]);
  const containerRef = useRef();
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);
  const scrollStartY = useRef(0);

  // Load reels
  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      setLoading(true);
      const res = await fetchReels(1, 50);
      
      if (res.ok && res.data) {
        setReels(res.data.items || []);
      } else {
        // Fallback demo reels
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
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading reels:", error);
    } finally {
      setLoading(false);
    }
  };

  // PERFECT TikTok-style scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reels.length === 0) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (isScrolling.current) return;

      isScrolling.current = true;
      const direction = e.deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(reels.length - 1, currentPlayingIndex + direction));
      
      if (newIndex !== currentPlayingIndex) {
        container.scrollTo({
          top: newIndex * window.innerHeight,
          behavior: 'smooth'
        });
        
        setCurrentPlayingIndex(newIndex);
      }
      
      setTimeout(() => {
        isScrolling.current = false;
      }, 500);
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
      scrollStartY.current = container.scrollTop;
    };

    const handleTouchMove = (e) => {
      if (!touchStartY.current) return;
      
      const currentY = e.touches[0].clientY;
      const diff = touchStartY.current - currentY;
      container.scrollTop = scrollStartY.current + diff;
    };

    const handleTouchEnd = () => {
      const currentScroll = container.scrollTop;
      const windowHeight = window.innerHeight;
      const newIndex = Math.round(currentScroll / windowHeight);
      
      container.scrollTo({
        top: newIndex * windowHeight,
        behavior: 'smooth'
      });

      setCurrentPlayingIndex(newIndex);
      touchStartY.current = 0;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [reels.length, currentPlayingIndex]);

  // Video playback management
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      
      if (index === currentPlayingIndex) {
        video.play().catch(error => {
          video.muted = true;
          video.play();
        });
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentPlayingIndex]);

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
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="p-3 border-b border-gray-800 sticky top-0 bg-black/95 backdrop-blur-lg z-50">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Reels</h1>
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🎬</span>
          </div>
        </div>
      </div>

      {/* TikTok-style container */}
      <div 
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {reels.map((reel, index) => (
          <div 
            key={reel.id} 
            className="relative w-full h-screen snap-start flex-shrink-0"
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={reel.video_url}
              className="w-full h-full object-cover bg-black"
              muted={muted}
              loop
              playsInline
              onClick={() => handleVideoClick(index)}
            />
            
            {/* Right action buttons */}
            <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-6">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleLike(reel.id)}
                  className={`bg-black/50 rounded-full p-3 backdrop-blur-sm border transition-all ${
                    likedReels.has(reel.id) 
                      ? 'border-red-500 bg-red-500/20' 
                      : 'border-gray-600'
                  }`}
                >
                  {likedReels.has(reel.id) ? "❤️" : "🤍"}
                </button>
                <span className="text-white text-xs font-medium mt-1">
                  {reel.likes_count || 0}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <button className="bg-black/50 rounded-full p-3 backdrop-blur-sm border border-gray-600">
                  <span className="text-lg">💬</span>
                </button>
                <span className="text-white text-xs font-medium mt-1">0</span>
              </div>

              <button
                onClick={toggleMute}
                className="bg-black/50 rounded-full p-3 backdrop-blur-sm border border-gray-600"
              >
                <span className="text-white text-sm">
                  {muted ? "🔇" : "🔊"}
                </span>
              </button>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-12 pb-6 px-4">
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
                <p className="text-white text-sm leading-tight mb-2">
                  {reel.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
