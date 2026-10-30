import React, { useState } from 'react';
import { Tv, ThumbsUp, MessageSquare, Share2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { VideoItem } from '../types';

interface WatchTabProps {
  videos: VideoItem[];
  darkMode: boolean;
}

export const WatchTab: React.FC<WatchTabProps> = ({ videos, darkMode }) => {
  const [playingId, setPlayingId] = useState<string | null>(videos[0]?.id || null);
  const [isMuted, setIsMuted] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const toggleLike = (videoId: string) => {
    setLikedMap((prev) => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  return (
    <div className="space-y-3">
      {/* Watch Header */}
      <div
        className={`p-3 rounded-lg border shadow-xs flex items-center justify-between transition-colors ${
          darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-[#1877F2]" />
          <h2 className="font-bold text-base">Watch (Lite Video Feed)</h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">Auto-play ON</span>
      </div>

      {/* Video Cards */}
      {videos.map((video) => {
        const isPlaying = playingId === video.id;
        const isLiked = likedMap[video.id] || video.isLiked;

        return (
          <div
            key={video.id}
            className={`rounded-lg border shadow-xs overflow-hidden transition-colors ${
              darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
            }`}
          >
            {/* Author Bar */}
            <div className="p-3 flex items-center gap-2.5">
              <img
                src={video.author.avatar}
                alt={video.author.name}
                className="w-9 h-9 rounded-full object-cover border"
              />
              <div>
                <h4 className="font-bold text-xs sm:text-sm">{video.author.name}</h4>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <span>{video.timestamp}</span>
                  <span>•</span>
                  <span>{video.views}</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="px-3 pb-2 text-xs sm:text-sm font-semibold">{video.title}</div>

            {/* Video Player Box */}
            <div className="relative aspect-video bg-black flex items-center justify-center group">
              {isPlaying ? (
                <video
                  src={video.videoUrl}
                  poster={video.thumbnail}
                  autoPlay
                  loop
                  muted={isMuted}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      onClick={() => setPlayingId(video.id)}
                      className="w-14 h-14 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                    >
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </button>
                  </div>
                </div>
              )}

              {/* Sound Toggle Overlay */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Interaction Bar */}
            <div className="p-2 flex items-center justify-around border-t border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <button
                onClick={() => toggleLike(video.id)}
                className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/60 ${
                  isLiked ? 'text-[#1877F2]' : ''
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>
                  Like ({video.likesCount + (isLiked && !video.isLiked ? 1 : 0)})
                </span>
              </button>

              <button className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/60">
                <MessageSquare className="w-4 h-4" />
                <span>Comment ({video.commentsCount})</span>
              </button>

              <button className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/60">
                <Share2 className="w-4 h-4" />
                <span>Share ({video.sharesCount})</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
