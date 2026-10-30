import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  X,
  Send,
  Camera,
  Image as ImageIcon,
  Type,
  RefreshCw,
  Sparkles,
  Check,
  Upload,
  Link as LinkIcon,
  Smile,
  Eye,
  Music,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Story, User } from '../types';

interface StoriesBarProps {
  currentUser: User;
  stories: Story[];
  onAddStory: (newStory: Story) => void;
  onUpdateStory?: (updatedStory: Story) => void;
  darkMode: boolean;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  currentUser,
  stories,
  onAddStory,
  onUpdateStory,
  darkMode,
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<'camera' | 'url' | 'text'>('camera');

  // Story state
  const [storyText, setStoryText] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('from-blue-600 to-indigo-800');
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Viewer state
  const [replyMessage, setReplyMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  // Preset sample photos for fast creation
  const samplePhotos = [
    { label: 'Sunset', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&q=80&w=800' },
    { label: 'Coffee', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800' },
    { label: 'Nature', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800' },
    { label: 'City Night', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800' },
  ];

  // Stop camera stream helper
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start camera stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 800 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to access webcam. You can upload an image, enter a URL, or snap a simulated photo below.');
      setIsCameraActive(false);
    }
  };

  // Take photo from video stream
  const handleSnapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 800;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  // Handle simulated photo snapshot fallback
  const handleSimulatedSnap = () => {
    const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    setCapturedImage(randomPhoto.url);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setStoryMediaUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Manage camera cleanup when modal closes or tab changes
  useEffect(() => {
    if (showCreateModal && createMode === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showCreateModal, createMode, capturedImage]);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setStoryProgress(0);
    setIsStoryPaused(false);
    setIsMusicPlaying(true);
    const target = stories[index];
    if (target) {
      const updatedStory: Story = {
        ...target,
        isViewed: true,
        viewCount: (target.viewCount || 0) + 1,
      };
      onUpdateStory?.(updatedStory);
    }
  };

  // 5-second story timer effect
  useEffect(() => {
    if (activeStoryIndex === null || isStoryPaused) return;

    const DURATION_MS = 5000;
    const INTERVAL_MS = 50;
    const step = (INTERVAL_MS / DURATION_MS) * 100;

    const timer = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev + step >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            handleOpenStory(activeStoryIndex + 1);
          } else {
            setActiveStoryIndex(null);
            setStoryProgress(0);
          }
          return 0;
        }
        return prev + step;
      });
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [activeStoryIndex, isStoryPaused, stories.length]);

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    const media = capturedImage || storyMediaUrl.trim();
    if (!storyText.trim() && !media) return;

    const created: Story = {
      id: `story_me_${Date.now()}`,
      author: currentUser,
      text: storyText.trim(),
      bgColor: selectedBgColor,
      mediaUrl: media || undefined,
      timestamp: 'Just now',
      isViewed: true,
      viewCount: 1,
    };

    onAddStory(created);
    resetForm();
    setShowCreateModal(false);
    showToast('Story shared successfully!');
  };

  const resetForm = () => {
    setStoryText('');
    setStoryMediaUrl('');
    setCapturedImage(null);
    stopCamera();
    setCameraError(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);

  const triggerEmojiBurst = (emoji: string) => {
    const burst = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      emoji,
      left: Math.floor(Math.random() * 60) + 20,
    }));
    setFloatingEmojis((prev) => [...prev, ...burst]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => !burst.some((b) => b.id === item.id)));
    }, 900);
  };

  const handleSendReaction = (emoji: string) => {
    if (!activeStory) return;

    const currentReactions: Record<string, number> = { ...(activeStory.reactions || {}) };
    const prevReaction = activeStory.userReaction;

    let newUserReaction: string | null = emoji;

    if (prevReaction === emoji) {
      // Toggle off reaction
      if (currentReactions[emoji]) {
        currentReactions[emoji] -= 1;
        if (currentReactions[emoji] <= 0) {
          delete currentReactions[emoji];
        }
      }
      newUserReaction = null;
      showToast(`Removed reaction`);
    } else {
      // Remove previous reaction if any
      if (prevReaction && currentReactions[prevReaction]) {
        currentReactions[prevReaction] -= 1;
        if (currentReactions[prevReaction] <= 0) {
          delete currentReactions[prevReaction];
        }
      }
      // Add new reaction
      currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
      triggerEmojiBurst(emoji);
      showToast(`Reacted with ${emoji} to ${activeStory.author.name}`);
    }

    const updatedStory: Story = {
      ...activeStory,
      reactions: currentReactions,
      userReaction: newUserReaction,
    };

    onUpdateStory?.(updatedStory);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeStory) return;
    showToast(`Replied to ${activeStory.author.name}: "${replyMessage}"`);
    setReplyMessage('');
  };

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs z-50 shadow-lg font-medium animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Horizontal Scroll Story Tray */}
      <div
        className={`p-3 rounded-lg border shadow-xs transition-colors ${
          darkMode ? 'bg-[#242526] border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-0.5 select-none">
          {/* Create Story Button Card */}
          <div
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className={`w-28 h-40 sm:w-32 sm:h-44 rounded-xl flex flex-col justify-between overflow-hidden relative group cursor-pointer shrink-0 border border-gray-200 shadow-xs hover:opacity-95 transition-all ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'
            }`}
          >
            <div className="h-28 sm:h-32 w-full overflow-hidden bg-slate-200 relative">
              <img
                src={currentUser.avatar}
                alt="Create Story"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute top-[100px] sm:top-[116px] left-1/2 -translate-x-1/2 bg-[#1877F2] text-white p-1.5 rounded-full border-4 border-white dark:border-gray-800 shadow-md">
              <Plus className="w-4 h-4 stroke-[3px]" />
            </div>
            <div className="pb-2 pt-3 text-center">
              <span
                className={`text-[11px] font-bold block leading-tight ${
                  darkMode ? 'text-gray-200' : 'text-slate-800'
                }`}
              >
                Create story
              </span>
            </div>
          </div>

          {/* Friend Story Cards */}
          {stories.map((story, index) => (
            <div
              key={story.id}
              onClick={() => handleOpenStory(index)}
              className="w-28 h-40 sm:w-32 sm:h-44 rounded-xl overflow-hidden relative cursor-pointer shrink-0 border border-black/10 shadow-xs hover:scale-[1.02] transition-all group"
            >
              {story.mediaUrl ? (
                <img
                  src={story.mediaUrl}
                  alt={story.author.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-b ${
                    story.bgColor || 'from-indigo-600 to-purple-800'
                  } p-3 flex items-center justify-center text-center`}
                >
                  <p className="text-white font-semibold text-xs leading-snug line-clamp-4">
                    {story.text}
                  </p>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

              {/* Author Ring Avatar */}
              <div
                className={`absolute top-2 left-2 p-0.5 rounded-full z-10 ${
                  story.isViewed ? 'bg-gray-400' : 'bg-[#1877F2] ring-2 ring-[#1877F2]'
                }`}
              >
                <img
                  src={story.author.avatar}
                  alt={story.author.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
              </div>

              {/* Views Count Badge */}
              {story.viewCount !== undefined && story.viewCount > 0 && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-white/20 z-10 shadow-xs">
                  <Eye className="w-2.5 h-2.5 text-blue-300" />
                  <span>{story.viewCount}</span>
                </div>
              )}

              {/* Reaction Badge on Tray Card */}
              {story.reactions && Object.keys(story.reactions).length > 0 && (
                <div className="absolute top-9 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-white/20 z-10 shadow-xs">
                  <span>{Object.keys(story.reactions).slice(0, 2).join('')}</span>
                  <span className="ml-0.5">
                    {(Object.values(story.reactions) as number[]).reduce((a: number, b: number) => a + b, 0)}
                  </span>
                </div>
              )}

              {/* Author Name */}
              <div className="absolute bottom-2 left-2 right-2 z-10">
                <span className="text-white text-[11px] font-bold drop-shadow-md line-clamp-1">
                  {story.author.name}
                </span>
                <span className="text-gray-200 text-[9px] block opacity-80">
                  {story.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeStoryIndex !== null && activeStory && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-0 sm:p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm h-full sm:h-[600px] bg-slate-900 sm:rounded-2xl overflow-hidden flex flex-col justify-between">
            {/* Top Bar Progress & Header */}
            <div className="absolute top-0 inset-x-0 p-3 z-20 bg-gradient-to-b from-black/80 to-transparent">
              {/* Progress Bars */}
              <div className="flex gap-1 mb-2">
                {stories.map((s, idx) => {
                  let fillPercent = 0;
                  if (idx < activeStoryIndex) {
                    fillPercent = 100;
                  } else if (idx === activeStoryIndex) {
                    fillPercent = storyProgress;
                  } else {
                    fillPercent = 0;
                  }

                  return (
                    <div
                      key={s.id}
                      className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden relative"
                    >
                      <div
                        className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <img
                    src={activeStory.author.avatar}
                    alt={activeStory.author.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#1877F2]"
                  />
                  <div>
                    <span className="font-bold text-xs block leading-tight">
                      {activeStory.author.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
                      <span>{activeStory.timestamp}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 bg-white/20 backdrop-blur-xs px-1.5 py-0.2 rounded-full text-white font-medium">
                        <Eye className="w-3 h-3 text-blue-300" />
                        <span>{activeStory.viewCount || 1} {activeStory.viewCount === 1 ? 'view' : 'views'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Background Music Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMusicPlaying((prev) => !prev);
                    }}
                    className={`p-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-1.5 px-2.5 border ${
                      isMusicPlaying
                        ? 'bg-blue-600/80 border-blue-400 text-white shadow-xs'
                        : 'bg-black/50 border-white/20 text-gray-300 hover:text-white'
                    }`}
                    title={isMusicPlaying ? 'Turn music off' : 'Turn music on'}
                  >
                    {isMusicPlaying ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-blue-200" />
                        <span className="text-[10px] font-bold">Music ON</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-medium text-gray-300">Music OFF</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveStoryIndex(null)}
                    className="p-1.5 bg-black/50 hover:bg-black/80 rounded-full text-white border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Story Main Visual Body */}
            <div
              onMouseDown={() => setIsStoryPaused(true)}
              onMouseUp={() => setIsStoryPaused(false)}
              onTouchStart={() => setIsStoryPaused(true)}
              onTouchEnd={() => setIsStoryPaused(false)}
              className="w-full h-full flex items-center justify-center relative overflow-hidden select-none"
            >
              {/* Background Music Sound Visualizer Badge */}
              {isMusicPlaying && (
                <div className="absolute top-16 right-3 z-30 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20 flex items-center gap-2 text-white shadow-lg pointer-events-none">
                  <Music className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
                  <div className="flex items-end gap-0.5 h-4 w-5">
                    <span className="w-1 bg-blue-400 rounded-t animate-equalizer-1" />
                    <span className="w-1 bg-indigo-400 rounded-t animate-equalizer-2" />
                    <span className="w-1 bg-purple-400 rounded-t animate-equalizer-3" />
                    <span className="w-1 bg-pink-400 rounded-t animate-equalizer-4" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-200 tracking-tight">
                    Story Beats
                  </span>
                </div>
              )}
              {/* Floating Emojis Burst */}
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {floatingEmojis.map((item) => (
                  <div
                    key={item.id}
                    style={{ left: `${item.left}%` }}
                    className="absolute bottom-16 text-3xl animate-float-burst"
                  >
                    {item.emoji}
                  </div>
                ))}
              </div>

              {activeStory.mediaUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={activeStory.mediaUrl}
                    alt="Story content"
                    className="w-full h-full object-contain"
                  />
                  {activeStory.text && (
                    <div className="absolute bottom-16 inset-x-4 bg-black/60 backdrop-blur-sm p-3 rounded-xl text-center text-white text-sm font-semibold">
                      {activeStory.text}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${
                    activeStory.bgColor || 'from-blue-600 to-indigo-900'
                  } flex items-center justify-center p-8 text-center`}
                >
                  <p className="text-white text-xl font-bold leading-relaxed">
                    {activeStory.text}
                  </p>
                </div>
              )}

              {/* Reactions Summary Pill Overlay */}
              {activeStory.reactions && Object.keys(activeStory.reactions).length > 0 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
                  {Object.entries(activeStory.reactions).map(([emo, count]) => (
                    <span
                      key={emo}
                      className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold ${
                        activeStory.userReaction === emo
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-white/10 text-gray-200'
                      }`}
                    >
                      <span>{emo}</span>
                      <span>{count}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Tap Left/Right Navigation Areas */}
              <div
                onClick={() => {
                  if (activeStoryIndex !== null && activeStoryIndex > 0) {
                    handleOpenStory(activeStoryIndex - 1);
                  }
                }}
                className="absolute left-0 top-16 bottom-20 w-1/3 cursor-pointer"
              />
              <div
                onClick={() => {
                  if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
                    handleOpenStory(activeStoryIndex + 1);
                  }
                }}
                className="absolute right-0 top-16 bottom-20 w-1/3 cursor-pointer"
              />
            </div>

            {/* Bottom Reactions & Reply Bar */}
            <div className="p-3 bg-black/80 backdrop-blur-md z-20 border-t border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-around py-1">
                {['👍', '❤️', '😆', '😮', '😢', '🔥'].map((emoji) => {
                  const isSelected = activeStory.userReaction === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendReaction(emoji)}
                      className={`text-2xl transition-all p-1.5 rounded-full relative ${
                        isSelected
                          ? 'scale-125 bg-blue-600/40 border border-blue-400 ring-2 ring-blue-500/80'
                          : 'hover:scale-125 hover:bg-white/10 active:scale-95'
                      }`}
                      title={isSelected ? `Remove ${emoji}` : `React with ${emoji}`}
                    >
                      {emoji}
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Reply to ${activeStory.author.name.split(' ')[0]}...`}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onFocus={() => setIsStoryPaused(true)}
                  onBlur={() => setIsStoryPaused(false)}
                  className="flex-1 bg-white/10 text-white placeholder-gray-400 rounded-full px-4 py-2 text-xs border border-white/20 outline-none focus:border-[#1877F2]"
                />
                <button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="bg-[#1877F2] disabled:opacity-50 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div
            className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl transition-colors my-auto ${
              darkMode ? 'bg-[#242526] text-white' : 'bg-white text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="p-3.5 border-b flex items-center justify-between border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Create Your Story</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Snap a photo with camera or select an image URL
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(false);
                }}
                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selection Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setCreateMode('camera');
                  setCapturedImage(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  createMode === 'camera'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Camera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreateMode('url');
                  stopCamera();
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  createMode === 'url'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Image / URL</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreateMode('text');
                  stopCamera();
                  setCapturedImage(null);
                  setStoryMediaUrl('');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  createMode === 'text'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Text Only</span>
              </button>
            </div>

            {/* Main Form Body */}
            <form onSubmit={handleCreateStory} className="p-4 space-y-4">
              {/* CANVAS HIDDEN FOR CAMERA CAPTURE */}
              <canvas ref={canvasRef} className="hidden" />

              {/* CAMERA MODE VIEW */}
              {createMode === 'camera' && (
                <div className="space-y-3">
                  {capturedImage ? (
                    <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-black border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedImage(null);
                          startCamera();
                        }}
                        className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake Photo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-slate-900 border border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-white">
                      {isCameraActive ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/20">
                            <button
                              type="button"
                              onClick={handleSnapPhoto}
                              className="w-12 h-12 rounded-full bg-white border-4 border-[#1877F2] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                              title="Snap Photo"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#1877F2]" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 text-center space-y-3 max-w-xs">
                          <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                            <Camera className="w-6 h-6" />
                          </div>
                          {cameraError && (
                            <p className="text-xs text-amber-300 bg-amber-950/60 p-2 rounded-lg border border-amber-800/50">
                              {cameraError}
                            </p>
                          )}
                          <div className="flex flex-col gap-2 pt-1">
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Camera className="w-4 h-4" />
                              <span>Open Web Camera</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSimulatedSnap}
                              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>Take Sample Photo</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* IMAGE URL / FILE UPLOAD MODE */}
              {createMode === 'url' && (
                <div className="space-y-3">
                  {/* File Upload / Image URL inputs */}
                  <div>
                    <label className="text-xs font-bold block mb-1">Enter Image URL</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="https://example.com/my-photo.jpg"
                          value={storyMediaUrl}
                          onChange={(e) => {
                            setStoryMediaUrl(e.target.value);
                            setCapturedImage(null);
                          }}
                          className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border outline-none ${
                            darkMode
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                              : 'bg-gray-50 border-gray-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Local File Upload Button */}
                  <div>
                    <label className="text-xs font-bold block mb-1">Or Upload From Device</label>
                    <label
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed cursor-pointer text-xs font-medium transition-colors ${
                        darkMode
                          ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800 text-gray-300'
                          : 'bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Upload className="w-4 h-4 text-blue-500" />
                      <span>Choose Image File...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preset Photos Gallery */}
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-500 dark:text-gray-400">
                      Or pick a sample photo:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {samplePhotos.map((sample) => (
                        <div
                          key={sample.label}
                          onClick={() => {
                            setStoryMediaUrl(sample.url);
                            setCapturedImage(null);
                          }}
                          className={`h-16 rounded-lg overflow-hidden relative cursor-pointer border-2 transition-all ${
                            storyMediaUrl === sample.url
                              ? 'border-blue-600 ring-2 ring-blue-500/50 scale-95'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={sample.url}
                            alt={sample.label}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/60 px-1 rounded">
                            {sample.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BACKGROUND COLOR (If Text Mode or overlaying background) */}
              {createMode === 'text' && (
                <div>
                  <label className="text-xs font-bold block mb-1.5">Select Background Gradient</label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {[
                      'from-blue-600 to-indigo-800',
                      'from-purple-600 to-pink-600',
                      'from-emerald-500 to-teal-800',
                      'from-amber-500 to-orange-700',
                      'from-rose-600 to-red-800',
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedBgColor(color)}
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} border-2 shrink-0 transition-transform ${
                          selectedBgColor === color
                            ? 'border-white ring-2 ring-blue-500 scale-110'
                            : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STORY TEXT INPUT */}
              <div>
                <label className="text-xs font-bold block mb-1">
                  Story Caption / Text
                </label>
                <textarea
                  rows={2}
                  placeholder="Type a message or caption for your story..."
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-lg border outline-none resize-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-gray-50 border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* LIVE PREVIEW BOX */}
              <div>
                <span className="text-xs font-bold block mb-1 text-gray-500 dark:text-gray-400">
                  Story Live Preview
                </span>
                <div
                  className={`w-full h-44 rounded-xl overflow-hidden relative flex items-center justify-center p-4 bg-gradient-to-br ${selectedBgColor} border border-gray-200 dark:border-gray-700 shadow-inner`}
                >
                  {capturedImage || storyMediaUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={capturedImage || storyMediaUrl}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {storyText && (
                        <div className="absolute bottom-2 inset-x-2 bg-black/60 backdrop-blur-xs p-2 rounded-lg text-center text-white text-xs font-semibold">
                          {storyText}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-white text-sm font-bold text-center leading-relaxed">
                      {storyText || 'Your Story Text Here'}
                    </p>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!storyText.trim() && !capturedImage && !storyMediaUrl.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Share to Story</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
