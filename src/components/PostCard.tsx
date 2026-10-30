import React, { useState } from 'react';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Globe,
  Lock,
  Users,
  Bookmark,
  Trash2,
  X,
  Send,
  CheckCircle2,
  Heart,
  Smile,
  Flag,
  Pencil,
  BarChart2,
  Check,
} from 'lucide-react';
import { Post, ReactionType, User, Comment } from '../types';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onUpdatePost: (updatedPost: Post) => void;
  onDeletePost: (postId: string) => void;
  onShareToMessenger: (post: Post) => void;
  darkMode: boolean;
  onToggleSavePost?: (post: Post) => void;
  onAddPost?: (newPost: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onUpdatePost,
  onDeletePost,
  onShareToMessenger,
  darkMode,
  onToggleSavePost,
  onAddPost,
}) => {
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);
  const [isPressingLike, setIsPressingLike] = useState(false);
  const [showReactionsBreakdown, setShowReactionsBreakdown] = useState(false);
  const [selectedBreakdownTab, setSelectedBreakdownTab] = useState<'all' | ReactionType>('all');
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  const [sharePrivacy, setSharePrivacy] = useState<'public' | 'friends' | 'only_me'>('public');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const commentInputRef = React.useRef<HTMLInputElement>(null);

  interface BurstParticle {
    id: number;
    emoji: string;
    x: number;
    y: number;
    scale: number;
  }
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const hoverOpenTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const hoverCloseTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = React.useRef<boolean>(false);
  const touchStartPosRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Range of emoji reactions requested: like, love, haha, wow, sad, angry
  const reactionsList: { type: ReactionType; emoji: string; label: string; color: string; bgColor: string }[] = [
    { type: 'like', emoji: '👍', label: 'Like', color: 'text-[#1877F2]', bgColor: 'bg-blue-50 dark:bg-blue-950/60' },
    { type: 'love', emoji: '❤️', label: 'Love', color: 'text-[#FA383E]', bgColor: 'bg-red-50 dark:bg-red-950/60' },
    { type: 'haha', emoji: '😆', label: 'Haha', color: 'text-[#F7B125]', bgColor: 'bg-amber-50 dark:bg-amber-950/60' },
    { type: 'wow', emoji: '😮', label: 'Wow', color: 'text-[#F7B125]', bgColor: 'bg-amber-50 dark:bg-amber-950/60' },
    { type: 'sad', emoji: '😢', label: 'Sad', color: 'text-[#E2A727]', bgColor: 'bg-amber-50 dark:bg-amber-950/60' },
    { type: 'angry', emoji: '😡', label: 'Angry', color: 'text-[#F35369]', bgColor: 'bg-rose-50 dark:bg-rose-950/60' },
  ];

  // Close reactions on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowReactionsMenu(false);
        setHoveredReaction(null);
        setShowReactionsBreakdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const playReactionSound = (type: ReactionType) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      let startFreq = 440;
      let endFreq = 880;
      let oscType: OscillatorType = 'sine';

      switch (type) {
        case 'love':
          startFreq = 523;
          endFreq = 784;
          oscType = 'triangle';
          break;
        case 'haha':
          startFreq = 587;
          endFreq = 880;
          oscType = 'sine';
          break;
        case 'wow':
          startFreq = 350;
          endFreq = 1046;
          oscType = 'sine';
          break;
        case 'care':
          startFreq = 440;
          endFreq = 659;
          oscType = 'triangle';
          break;
        case 'sad':
          startFreq = 400;
          endFreq = 260;
          oscType = 'sine';
          break;
        case 'angry':
          startFreq = 220;
          endFreq = 110;
          oscType = 'sawtooth';
          break;
        case 'like':
        default:
          startFreq = 440;
          endFreq = 660;
          oscType = 'sine';
          break;
      }

      osc.type = oscType;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio context restricted or unavailable
    }
  };

  const triggerBurstAnimation = (emoji: string, e?: React.MouseEvent | React.TouchEvent) => {
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;

    if (e) {
      if ('touches' in e && e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
    }

    const newParticles: BurstParticle[] = Array.from({ length: 7 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      emoji,
      x: clientX + (Math.random() * 70 - 35),
      y: clientY + (Math.random() * 20 - 10),
      scale: 0.8 + Math.random() * 0.7,
    }));

    setBurstParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setBurstParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 900);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 1) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    isLongPressTriggeredRef.current = false;
    setIsPressingLike(true);

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setShowReactionsMenu(true);
      playReactionSound('like');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(25);
        } catch {}
      }
    }, 350);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 1) return;
    const touch = e.touches[0];

    // If long press has not triggered yet, cancel if finger moved significantly (scroll)
    if (!isLongPressTriggeredRef.current) {
      const dist = Math.hypot(
        touch.clientX - touchStartPosRef.current.x,
        touch.clientY - touchStartPosRef.current.y
      );
      if (dist > 12) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        setIsPressingLike(false);
      }
      return;
    }

    // Long press IS triggered! Detect reaction emoji under finger for scrubbing
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const btn = elem?.closest('[data-reaction-type]');
    if (btn) {
      const rType = btn.getAttribute('data-reaction-type') as ReactionType;
      if (rType && rType !== hoveredReaction) {
        setHoveredReaction(rType);
        playReactionSound(rType);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(10);
          } catch {}
        }
      }
    } else {
      setHoveredReaction(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPressingLike(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isLongPressTriggeredRef.current) {
      // If user was scrubbing over an emoji when releasing
      if (hoveredReaction) {
        handleSelectReaction(hoveredReaction, e);
      }
      // If finger was released on the like button, keep the dock open for tapping
      return;
    }

    // Short tap (< 350ms): toggle Like
    if (post.userReaction) {
      handleSelectReaction(post.userReaction, e);
    } else {
      triggerBurstAnimation('👍', e);
      handleSelectReaction('like', e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    isLongPressTriggeredRef.current = false;
    setIsPressingLike(true);

    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setShowReactionsMenu(true);
      playReactionSound('like');
    }, 350);
  };

  const handleMouseUp = () => {
    setIsPressingLike(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMouseEnterButton = () => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
    // Hover on desktop shows tray after 450ms
    if (hoverOpenTimerRef.current) clearTimeout(hoverOpenTimerRef.current);
    hoverOpenTimerRef.current = setTimeout(() => {
      setShowReactionsMenu(true);
    }, 450);
  };

  const handleMouseLeaveButton = () => {
    setIsPressingLike(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    // Close with short grace period unless mouse moves onto the dock
    hoverCloseTimerRef.current = setTimeout(() => {
      setShowReactionsMenu(false);
      setHoveredReaction(null);
    }, 350);
  };

  const handleMouseEnterDock = () => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  const handleMouseLeaveDock = () => {
    hoverCloseTimerRef.current = setTimeout(() => {
      setShowReactionsMenu(false);
      setHoveredReaction(null);
    }, 300);
  };

  const handleClickLikeButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }

    if (post.userReaction) {
      handleSelectReaction(post.userReaction, e);
    } else {
      triggerBurstAnimation('👍', e);
      handleSelectReaction('like', e);
    }
  };

  const handleSelectReaction = (type: ReactionType, e?: React.MouseEvent | React.TouchEvent) => {
    const isSameReaction = post.userReaction === type;
    const newReactions = { ...post.reactions };

    if (post.userReaction) {
      newReactions[post.userReaction] = Math.max(0, (newReactions[post.userReaction] || 1) - 1);
    }

    let nextUserReaction: ReactionType | null = type;
    if (isSameReaction) {
      nextUserReaction = null;
      showToast('Reaction removed');
    } else {
      newReactions[type] = (newReactions[type] || 0) + 1;
      playReactionSound(type);
      const chosen = reactionsList.find((r) => r.type === type);
      if (chosen) {
        triggerBurstAnimation(chosen.emoji, e);
        showToast(`Reacted with ${chosen.label}!`);
      }
    }

    onUpdatePost({
      ...post,
      reactions: newReactions,
      userReaction: nextUserReaction,
    });

    setShowReactionsMenu(false);
    setHoveredReaction(null);
    isLongPressTriggeredRef.current = false;
  };

  const mockReactors = [
    { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250', type: 'love' as ReactionType, emoji: '❤️', relationship: 'Friend' },
    { name: 'David Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', type: 'like' as ReactionType, emoji: '👍', relationship: 'Mutual friend' },
    { name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250', type: 'haha' as ReactionType, emoji: '😆', relationship: 'Friend' },
    { name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', type: 'wow' as ReactionType, emoji: '😮', relationship: 'Tech Group Member' },
    { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250', type: 'sad' as ReactionType, emoji: '😢', relationship: 'Friend' },
  ];

  const getFilteredReactors = (tab: 'all' | ReactionType) => {
    if (tab === 'all') return mockReactors;
    return mockReactors.filter((u) => u.type === tab);
  };

  const totalReactionsCount = (Object.values(post.reactions) as number[]).reduce((acc, c) => acc + c, 0);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      author: currentUser,
      text: newCommentText.trim(),
      timestamp: 'Just now',
      likesCount: 0,
    };

    onUpdatePost({
      ...post,
      comments: [...post.comments, newComment],
    });

    setNewCommentText('');
  };

  const handleToggleLikeComment = (commentId: string) => {
    const updatedComments = post.comments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          isLiked: !c.isLiked,
          likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
        };
      }
      return c;
    });

    onUpdatePost({
      ...post,
      comments: updatedComments,
    });
  };

  const handleToggleComments = () => {
    const nextShow = !showComments;
    setShowComments(nextShow);
    if (nextShow) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 50);
    }
  };

  const handleReplyToComment = (authorName: string) => {
    if (!showComments) setShowComments(true);
    setNewCommentText(`@${authorName} `);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 50);
  };

  const handleDeleteComment = (commentId: string) => {
    const updatedComments = post.comments.filter((c) => c.id !== commentId);
    onUpdatePost({
      ...post,
      comments: updatedComments,
    });
    showToast('Comment deleted');
  };

  const handleSavePost = () => {
    if (onToggleSavePost) {
      onToggleSavePost(post);
    } else {
      onUpdatePost({ ...post, isSaved: !post.isSaved });
    }
    showToast(post.isSaved ? 'Post removed from saved items' : 'Post saved to your collection!');
    setShowMenu(false);
  };

  const handleReportPost = () => {
    setShowMenu(false);
    showToast('Report submitted to the moderation team!');
    alert('Thank you! Your report has been submitted to the moderation team for review.');
  };

  const handleSaveEdit = () => {
    if (!editedContent.trim()) {
      showToast('Post content cannot be empty');
      return;
    }
    onUpdatePost({
      ...post,
      content: editedContent.trim(),
    });
    setIsEditing(false);
    showToast('Post updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditedContent(post.content);
    setIsEditing(false);
  };

  const handleShareToTimeline = () => {
    const newPost: Post = {
      id: `post_shared_${Date.now()}`,
      author: currentUser,
      content: shareCaption.trim() || `Shared a post from ${post.author.name}`,
      timestamp: 'Just now',
      reactions: { like: 0, love: 0, care: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
      comments: [],
      sharesCount: 0,
      privacy: sharePrivacy,
      category: 'public',
      sharedPost: {
        id: post.id,
        author: post.author,
        content: post.content,
        imageUrl: post.imageUrl || (post.images && post.images.length > 0 ? post.images[0] : undefined),
        images: post.images,
        timestamp: post.timestamp,
      },
    };

    onUpdatePost({
      ...post,
      sharesCount: post.sharesCount + 1,
    });

    if (onAddPost) {
      onAddPost(newPost);
    }

    showToast(`Shared to your timeline with a reference to ${post.author.name}!`);
    setShowShareModal(false);
    setShareCaption('');
  };

  const handleVotePoll = (optionId: string) => {
    if (!post.poll) return;
    const currentPoll = post.poll;
    const userId = currentUser.id;
    const previousVotedOptionId = currentPoll.userVotedOptionId;

    // Check if clicking same option user already voted for
    if (previousVotedOptionId === optionId) {
      // Undo vote
      const updatedOptions = currentPoll.options.map((opt) => {
        if (opt.id === optionId) {
          return {
            ...opt,
            votes: Math.max(0, opt.votes - 1),
            votedUserIds: (opt.votedUserIds || []).filter((id) => id !== userId),
          };
        }
        return opt;
      });

      onUpdatePost({
        ...post,
        poll: {
          ...currentPoll,
          options: updatedOptions,
          totalVotes: Math.max(0, currentPoll.totalVotes - 1),
          userVotedOptionId: undefined,
        },
      });
      showToast('Vote removed');
      return;
    }

    // Switch vote or new vote
    let newTotalVotes = currentPoll.totalVotes;
    if (!previousVotedOptionId) {
      newTotalVotes += 1;
    }

    const updatedOptions = currentPoll.options.map((opt) => {
      // Remove vote from previous option if switching
      if (opt.id === previousVotedOptionId) {
        return {
          ...opt,
          votes: Math.max(0, opt.votes - 1),
          votedUserIds: (opt.votedUserIds || []).filter((id) => id !== userId),
        };
      }
      // Add vote to new option
      if (opt.id === optionId) {
        return {
          ...opt,
          votes: opt.votes + 1,
          votedUserIds: [...(opt.votedUserIds || []).filter((id) => id !== userId), userId],
        };
      }
      return opt;
    });

    onUpdatePost({
      ...post,
      poll: {
        ...currentPoll,
        options: updatedOptions,
        totalVotes: newTotalVotes,
        userVotedOptionId: optionId,
      },
    });

    showToast('Vote recorded!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const currentReactionConfig = reactionsList.find((r) => r.type === post.userReaction);

  const activeReactions = reactionsList
    .map((r) => ({ ...r, count: post.reactions?.[r.type] || 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const topReactionsToShow =
    activeReactions.length > 0
      ? activeReactions.slice(0, 3)
      : [{ ...reactionsList[0], count: post.reactions?.['like'] || 0 }];

  const postImages =
    post.images && post.images.length > 0
      ? post.images
      : post.imageUrl
      ? [post.imageUrl]
      : [];

  return (
    <article
      className={`rounded-lg border shadow-xs transition-colors relative ${
        darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
      }`}
    >
      {/* Floating Reaction Burst Particles */}
      {burstParticles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-50 animate-float-burst text-2xl select-none"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            transform: `scale(${p.scale})`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-[#1877F2] text-white text-xs font-semibold py-1.5 px-3 text-center">
          {toastMessage}
        </div>
      )}

      {/* Post Header */}
      <div className="p-3 pb-2 flex items-start justify-between relative">
        <div className="flex items-center gap-2.5">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />
          <div>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-bold text-xs sm:text-sm hover:underline cursor-pointer">
                {post.author.name}
              </span>
              {post.author.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1877F2] fill-[#1877F2]/10 inline" />
              )}
              {post.groupName && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  posted in <span className="text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer">{post.groupName}</span>
                </span>
              )}
              {post.feeling && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  is feeling <span className="text-slate-800 dark:text-gray-200 font-medium">{post.feeling}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              <span>{post.timestamp}</span>
              <span>•</span>
              {post.location && (
                <>
                  <span>📍 {post.location}</span>
                  <span>•</span>
                </>
              )}
              {post.privacy === 'public' && <Globe className="w-3 h-3" />}
              {post.privacy === 'friends' && <Users className="w-3 h-3" />}
              {post.privacy === 'only_me' && <Lock className="w-3 h-3" />}
            </div>
          </div>
        </div>

        {/* Dropdown Options Button & Saved Badge */}
        <div className="relative flex items-center gap-1">
          {post.isSaved && (
            <span
              className="p-1 rounded-full text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800"
              title="Saved Post"
            >
              <Bookmark className="w-3.5 h-3.5 fill-purple-600 dark:fill-purple-400" />
            </span>
          )}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div
              className={`absolute right-0 top-8 w-48 rounded-lg shadow-xl border z-20 text-xs py-1 transition-colors ${
                darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-slate-800'
              }`}
            >
              <button
                onClick={handleSavePost}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4 text-blue-500" />
                <span>{post.isSaved ? 'Unsave Post' : 'Save Post'}</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Post link copied to clipboard!');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4 text-green-500" />
                <span>Copy Link</span>
              </button>
              <button
                onClick={handleReportPost}
                className="w-full text-left px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center gap-2"
              >
                <Flag className="w-4 h-4 text-amber-500" />
                <span>Report Post</span>
              </button>
              {post.author.id === currentUser.id && (
                <>
                  <button
                    onClick={() => {
                      setEditedContent(post.content);
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-t dark:border-gray-700"
                  >
                    <Pencil className="w-4 h-4 text-blue-500" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Post</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content / Edit Mode */}
      {isEditing ? (
        <div className="px-3 pb-3">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            className={`w-full p-2.5 text-xs sm:text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-y ${
              darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-800'
            }`}
            placeholder="Edit your post..."
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="px-3 pb-2 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      )}

      {/* Post Video Player */}
      {post.videoUrl && (
        <div className="relative my-1 bg-black overflow-hidden group/vid max-h-[460px] flex items-center justify-center">
          <video
            src={post.videoUrl}
            controls
            playsInline
            className="w-full max-h-[460px] object-contain bg-black"
          />
          {post.isCameraVideo && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 pointer-events-none z-10 shadow-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Camera Video Clip</span>
            </div>
          )}
        </div>
      )}

      {/* Post Images Gallery */}
      {postImages.length > 0 && !post.videoUrl && (
        <div
          className={`grid gap-0.5 overflow-hidden my-1 bg-black/5 cursor-pointer ${
            postImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {postImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(img)}
              className="relative aspect-video sm:aspect-square max-h-[380px] bg-slate-100 dark:bg-gray-800 overflow-hidden group"
            >
              <img
                src={img}
                alt={`Post media ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Interactive Poll Card */}
      {post.poll && (
        <div className="mx-3 my-2.5 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
          <div className="flex items-center gap-2 border-b pb-2 border-blue-100 dark:border-blue-900/40">
            <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-gray-100 flex-1">
              {post.poll.question}
            </h4>
          </div>

          <div className="space-y-2">
            {post.poll.options.map((option) => {
              const totalVotes = post.poll?.totalVotes || 0;
              const isSelected = post.poll?.userVotedOptionId === option.id;
              const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVotePoll(option.id)}
                  className={`w-full relative overflow-hidden rounded-lg border text-left p-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-100/60 dark:bg-blue-900/40 font-semibold ring-1 ring-blue-500'
                      : 'border-gray-200 dark:border-gray-700/80 hover:border-blue-300 dark:hover:border-blue-700 bg-white/80 dark:bg-gray-800/80'
                  }`}
                >
                  {/* Vote Progress Fill Bar */}
                  {totalVotes > 0 && (
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                        isSelected
                          ? 'bg-blue-300/40 dark:bg-blue-600/40'
                          : 'bg-gray-200/60 dark:bg-gray-700/50'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  )}

                  {/* Option Label & Stats */}
                  <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-400 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate text-slate-900 dark:text-gray-100">
                        {option.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {totalVotes > 0 && <span>{pct}%</span>}
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal">
                        ({option.votes})
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-0.5">
            <span>
              {post.poll.totalVotes} {post.poll.totalVotes === 1 ? 'vote' : 'votes'}
            </span>
            {post.poll.userVotedOptionId && (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                You voted • Click option to change or remove
              </span>
            )}
          </div>
        </div>
      )}

      {/* Shared Post Reference Card */}
      {post.sharedPost && (
        <div className="mx-3 my-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-800/60 space-y-2">
          <div className="flex items-center gap-2">
            <img
              src={post.sharedPost.author.avatar}
              alt={post.sharedPost.author.name}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-gray-100">
                  {post.sharedPost.author.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800">
                  Original Author
                </span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                {post.sharedPost.timestamp}
              </span>
            </div>
          </div>
          {post.sharedPost.content && (
            <p className="text-xs text-slate-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
              {post.sharedPost.content}
            </p>
          )}
          {(post.sharedPost.imageUrl || (post.sharedPost.images && post.sharedPost.images.length > 0)) && (
            <img
              src={post.sharedPost.imageUrl || post.sharedPost.images?.[0]}
              alt="Shared attachment"
              className="rounded-lg max-h-52 w-full object-cover border border-gray-200 dark:border-gray-700 mt-2"
            />
          )}
        </div>
      )}

      {/* Stats Summary Bar (Reactions & Comments count) */}
      <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/60">
        <button
          type="button"
          onClick={() => setShowReactionsBreakdown(true)}
          className="flex items-center gap-1.5 group cursor-pointer hover:opacity-80 transition-opacity"
          title="Click to view all reactions breakdown"
        >
          {totalReactionsCount > 0 ? (
            <div className="flex -space-x-1">
              {topReactionsToShow.map((r) => (
                <span
                  key={r.type}
                  className="w-4.5 h-4.5 rounded-full bg-slate-100 dark:bg-gray-700 shadow-xs flex items-center justify-center text-[11px] z-10 border border-white dark:border-gray-800"
                  title={`${r.label}: ${r.count}`}
                >
                  {r.emoji}
                </span>
              ))}
            </div>
          ) : (
            <span className="w-4.5 h-4.5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px]">
              👍
            </span>
          )}
          <span className="font-medium text-slate-700 dark:text-gray-300 hover:underline">
            {totalReactionsCount > 0 ? `${totalReactionsCount} reactions` : '0 reactions'}
          </span>

          {/* Reaction Breakdown Tooltip */}
          {activeReactions.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:flex items-center gap-2 bg-gray-900/95 text-white text-[11px] py-1.5 px-2.5 rounded-lg shadow-lg z-20 whitespace-nowrap pointer-events-none transition-all">
              {activeReactions.map((r) => (
                <span key={r.type} className="flex items-center gap-1">
                  <span>{r.emoji}</span>
                  <span className="font-semibold">{r.count}</span>
                </span>
              ))}
            </div>
          )}
        </button>

        <div className="flex items-center gap-3 text-[11px]">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline cursor-pointer"
          >
            {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
          </button>
          <span>•</span>
          <span>{post.sharesCount} shares</span>
        </div>
      </div>

      {/* Action Buttons Bar (Like, Comment, Share) */}
      <div
        className="px-1 py-1 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 relative text-xs font-semibold text-gray-600 dark:text-gray-300"
      >
        {/* Full-screen backdrop to dismiss dock when tapping outside */}
        {showReactionsMenu && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              setShowReactionsMenu(false);
              setHoveredReaction(null);
            }}
            onTouchStart={() => {
              setShowReactionsMenu(false);
              setHoveredReaction(null);
            }}
          />
        )}

        {/* Long-Press Reaction Popover Dock */}
        {showReactionsMenu && (
          <div
            onMouseEnter={handleMouseEnterDock}
            onMouseLeave={handleMouseLeaveDock}
            className={`absolute bottom-full mb-2 left-0 sm:left-1 z-50 flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.22)] border backdrop-blur-md select-none animate-reaction-dock ${
              darkMode
                ? 'bg-[#242526]/95 border-gray-700/80 shadow-black/70'
                : 'bg-white/95 border-gray-200/90 shadow-slate-500/25'
            }`}
          >
            {reactionsList.map((r, idx) => {
              const isHovered = hoveredReaction === r.type;
              const isCurrent = post.userReaction === r.type;
              return (
                <button
                  key={r.type}
                  type="button"
                  data-reaction-type={r.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectReaction(r.type, e);
                  }}
                  onMouseEnter={() => {
                    setHoveredReaction(r.type);
                    playReactionSound(r.type);
                  }}
                  onMouseLeave={() => setHoveredReaction(null)}
                  className={`relative flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-full transition-all duration-200 cursor-pointer animate-emoji-pop ${
                    isHovered
                      ? 'scale-135 -translate-y-2.5 z-20'
                      : 'hover:scale-125 hover:-translate-y-1'
                  } ${isCurrent ? 'ring-2 ring-[#1877F2] bg-blue-50/50 dark:bg-blue-900/30' : ''}`}
                  style={{ animationDelay: `${idx * 25}ms` }}
                  title={`${r.label} (Click to select)`}
                >
                  {/* Floating tooltip label */}
                  {isHovered && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white text-[10px] font-semibold py-0.5 px-2 rounded-full pointer-events-none whitespace-nowrap shadow-md flex items-center gap-1 z-30">
                      {r.label}
                      {isCurrent && <span className="text-[9px] text-blue-300 font-normal">• Active</span>}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl filter drop-shadow-xs active:scale-90 transition-transform">
                    {r.emoji}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Like Button with Long Press Support */}
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnterButton}
          onMouseLeave={handleMouseLeaveButton}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            setIsPressingLike(false);
            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
          }}
          onContextMenu={(e) => e.preventDefault()}
          onClick={handleClickLikeButton}
          title={
            currentReactionConfig
              ? `${currentReactionConfig.label} (Hold to change reaction)`
              : 'Like (Hold to react with emojis: like, love, haha, wow, sad, angry)'
          }
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all select-none touch-manipulation cursor-pointer ${
            isPressingLike ? 'scale-95 bg-gray-100 dark:bg-gray-700/40' : ''
          } ${currentReactionConfig ? currentReactionConfig.color + ' font-semibold' : ''}`}
        >
          {currentReactionConfig ? (
            <span className="text-lg leading-none animate-in zoom-in-75 duration-150">
              {currentReactionConfig.emoji}
            </span>
          ) : (
            <ThumbsUp className="w-4 h-4" />
          )}
          <span>{currentReactionConfig ? currentReactionConfig.label : 'Like'}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={handleToggleComments}
          className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Comment Section Expansion */}
      {showComments && (
        <div className="p-3 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/60 space-y-3">
          {/* List of Comments */}
          {post.comments.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 text-xs group/comment">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-200/80 dark:bg-gray-700/90 p-2.5 rounded-2xl inline-block max-w-[92%] relative shadow-2xs">
                      <span className="font-bold text-slate-900 dark:text-gray-100 block hover:underline cursor-pointer text-xs">
                        {comment.author.name}
                      </span>
                      <p className="text-slate-800 dark:text-gray-200 text-xs mt-0.5 whitespace-pre-wrap">
                        {comment.text}
                      </p>
                      {comment.image && (
                        <img
                          src={comment.image}
                          alt="Comment attachment"
                          className="mt-2 rounded-lg max-h-40 object-cover border border-gray-300 dark:border-gray-600"
                        />
                      )}
                    </div>

                    {/* Comment Meta & Actions */}
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400 mt-1 pl-2">
                      <span>{comment.timestamp}</span>
                      <button
                        onClick={() => handleToggleLikeComment(comment.id)}
                        className={`font-semibold hover:underline ${
                          comment.isLiked ? 'text-[#1877F2]' : 'hover:text-slate-700 dark:hover:text-gray-200'
                        }`}
                      >
                        Like {comment.likesCount > 0 ? `(${comment.likesCount})` : ''}
                      </button>
                      <button
                        onClick={() => handleReplyToComment(comment.author.name)}
                        className="font-semibold hover:underline hover:text-slate-700 dark:hover:text-gray-200"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover/comment:opacity-100 transition-opacity text-gray-400 hover:text-red-500 ml-auto flex items-center gap-0.5"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2 italic">
              No comments yet. Be the first to start the conversation!
            </p>
          )}

          {/* Quick Emoji Bar & Add Comment Form */}
          <div className="pt-1 space-y-1.5">
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs text-gray-500">
              <span className="text-[10px] uppercase font-medium text-gray-400 mr-1">Quick emoji:</span>
              {['❤️', '🔥', '😆', '👍', '🎉', '😍', '👏'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setNewCommentText((prev) => prev + emoji);
                    commentInputRef.current?.focus();
                  }}
                  className="hover:scale-125 transition-transform p-0.5 text-sm"
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="flex-1 flex items-center bg-white dark:bg-gray-700 rounded-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-[#1877F2]/40 transition-all">
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder="Write a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full bg-transparent text-xs outline-none text-slate-900 dark:text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="text-[#1877F2] disabled:opacity-40 p-1 hover:scale-110 transition-transform shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-2xl p-4 shadow-2xl transition-colors ${
              darkMode ? 'bg-[#242526] text-white' : 'bg-white text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-3 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#1877F2]" />
                <h3 className="font-bold text-base">Share to Your Timeline</h3>
              </div>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareCaption('');
                }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current User Info & Privacy selector */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 border dark:border-gray-700"
              />
              <div>
                <span className="font-bold text-sm block">{currentUser.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <select
                    value={sharePrivacy}
                    onChange={(e) => setSharePrivacy(e.target.value as 'public' | 'friends' | 'only_me')}
                    className={`text-[11px] py-0.5 px-2 rounded-md border font-medium outline-none cursor-pointer ${
                      darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-100 border-gray-200 text-gray-700'
                    }`}
                  >
                    <option value="public">🌐 Public</option>
                    <option value="friends">👥 Friends</option>
                    <option value="only_me">🔒 Only me</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User Thoughts Input */}
            <div className="mb-3">
              <textarea
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                rows={2}
                placeholder={`Say something about this post by ${post.author.name}...`}
                className={`w-full p-2.5 text-xs sm:text-sm rounded-lg border focus:ring-2 focus:ring-[#1877F2] focus:outline-none transition-all resize-y ${
                  darkMode ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-slate-800 placeholder-gray-400'
                }`}
                autoFocus
              />
            </div>

            {/* Original Post Preview Box */}
            <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/60 mb-4 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2 mb-1.5">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-gray-100">
                    {post.author.name}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block -mt-0.5">
                    {post.timestamp}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                {post.content}
              </p>
              {(post.imageUrl || (post.images && post.images.length > 0)) && (
                <img
                  src={post.imageUrl || post.images?.[0]}
                  alt="Original post preview"
                  className="mt-2 rounded-lg max-h-32 w-full object-cover border border-gray-200 dark:border-gray-700"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onShareToMessenger(post);
                  showToast('Sent in Messenger Lite!');
                  setShowShareModal(false);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400 flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send in Chat</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareCaption('');
                  }}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleShareToTimeline}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#1877F2] hover:bg-blue-600 text-white transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 backdrop-blur-md">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Expanded view"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

      {/* Reactions Breakdown Modal */}
      {showReactionsBreakdown && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-2xl p-4 shadow-2xl transition-colors ${
              darkMode ? 'bg-[#242526] text-white' : 'bg-white text-slate-900'
            }`}
          >
            <div className="flex justify-between items-center border-b pb-2.5 mb-3 dark:border-gray-700">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span>Post Reactions</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold">
                  {totalReactionsCount}
                </span>
              </h3>
              <button
                onClick={() => setShowReactionsBreakdown(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reaction Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b dark:border-gray-700/60 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setSelectedBreakdownTab('all')}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  selectedBreakdownTab === 'all'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                All {totalReactionsCount}
              </button>
              {reactionsList.map((r) => {
                const count = post.reactions?.[r.type] || 0;
                if (count === 0) return null;
                const isSelected = selectedBreakdownTab === r.type;
                return (
                  <button
                    key={r.type}
                    type="button"
                    onClick={() => setSelectedBreakdownTab(r.type)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-500'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{r.emoji}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Reacting Users List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
              {/* If current user reacted and matches filter */}
              {post.userReaction && (selectedBreakdownTab === 'all' || selectedBreakdownTab === post.userReaction) && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border dark:border-gray-700"
                    />
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">
                        {currentUser.name} (You)
                      </span>
                      <span className="text-[10px] text-gray-500">Reacted to this post</span>
                    </div>
                  </div>
                  <span className="text-xl">
                    {reactionsList.find((r) => r.type === post.userReaction)?.emoji || '👍'}
                  </span>
                </div>
              )}

              {/* Sample reactors */}
              {getFilteredReactors(selectedBreakdownTab).map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border dark:border-gray-700"
                    />
                    <div>
                      <span className="font-semibold block text-slate-800 dark:text-gray-200">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-gray-400">{user.relationship}</span>
                    </div>
                  </div>
                  <span className="text-xl">{user.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
