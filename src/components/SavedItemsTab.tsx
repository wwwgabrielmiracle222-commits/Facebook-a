import React, { useState, useMemo } from 'react';
import { Bookmark, Search, Image as ImageIcon, FileText, ArrowRight, Sparkles, Video } from 'lucide-react';
import { Post, User } from '../types';
import { PostCard } from './PostCard';

interface SavedItemsTabProps {
  posts: Post[];
  currentUser: User;
  onUpdatePost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onShareToMessenger: (post: Post) => void;
  onToggleSavePost: (post: Post) => void;
  onAddPost?: (newPost: Post) => void;
  darkMode: boolean;
  onExploreFeed?: () => void;
}

type SavedFilterType = 'all' | 'photos' | 'videos' | 'text';

export const SavedItemsTab: React.FC<SavedItemsTabProps> = ({
  posts,
  currentUser,
  onUpdatePost,
  onDeletePost,
  onShareToMessenger,
  onToggleSavePost,
  onAddPost,
  darkMode,
  onExploreFeed,
}) => {
  const [filterType, setFilterType] = useState<SavedFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts where isSaved is true, then apply search/media filters
  const savedPosts = useMemo(() => {
    return posts.filter((p) => Boolean(p.isSaved));
  }, [posts]);

  const filteredSavedPosts = useMemo(() => {
    return savedPosts.filter((post) => {
      // Media type filter
      if (filterType === 'photos') {
        const hasImages = (post.images && post.images.length > 0) || Boolean(post.imageUrl);
        if (!hasImages) return false;
      } else if (filterType === 'videos') {
        if (!post.videoUrl) return false;
      } else if (filterType === 'text') {
        const hasMedia = (post.images && post.images.length > 0) || Boolean(post.imageUrl) || Boolean(post.videoUrl);
        if (hasMedia) return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const contentMatch = post.content.toLowerCase().includes(q);
        const authorMatch = post.author.name.toLowerCase().includes(q);
        const groupMatch = post.groupName?.toLowerCase().includes(q);
        const locationMatch = post.location?.toLowerCase().includes(q);
        return contentMatch || authorMatch || groupMatch || locationMatch;
      }

      return true;
    });
  }, [savedPosts, filterType, searchQuery]);

  return (
    <div className="space-y-3" id="saved-items-container">
      {/* Header Banner */}
      <div
        className={`p-3.5 rounded-xl border shadow-xs transition-colors ${
          darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
              <Bookmark className="w-5 h-5 fill-purple-600 dark:fill-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base tracking-tight">Saved Items</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  {savedPosts.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Posts and updates you have bookmarked for quick access
              </p>
            </div>
          </div>
        </div>

        {/* Filter Chips & Search Bar if there are saved posts */}
        {savedPosts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/70 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in saved items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-colors ${
                    darkMode
                      ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
                      : 'bg-gray-50 border-gray-300 text-slate-900 placeholder-gray-400 focus:border-purple-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({savedPosts.length})
              </button>

              <button
                onClick={() => setFilterType('photos')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'photos'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>With Photos</span>
              </button>

              <button
                onClick={() => setFilterType('videos')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'videos'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Video className="w-3 h-3" />
                <span>With Videos</span>
              </button>

              <button
                onClick={() => setFilterType('text')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterType === 'text'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Text Only</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List of Saved Posts */}
      {filteredSavedPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredSavedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onUpdatePost={onUpdatePost}
              onDeletePost={onDeletePost}
              onShareToMessenger={onShareToMessenger}
              onToggleSavePost={onToggleSavePost}
              onAddPost={onAddPost}
              darkMode={darkMode}
            />
          ))}
        </div>
      ) : savedPosts.length > 0 ? (
        /* Empty search/filter result */
        <div
          className={`p-8 text-center rounded-xl border shadow-xs ${
            darkMode ? 'bg-[#242526] border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
          }`}
        >
          <p className="text-sm font-semibold mb-1 text-slate-800 dark:text-gray-100">
            No saved items match your criteria
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Try resetting your search query or selecting "All".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Zero saved items empty state */
        <div
          className={`p-8 text-center rounded-xl border shadow-xs space-y-3 ${
            darkMode ? 'bg-[#242526] border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-200 dark:border-purple-900/60 shadow-inner">
            <Bookmark className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-gray-100">No Saved Items Yet</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Whenever you find a post, photo, or article you want to read or look at later, tap the menu (•••) and select{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">"Save Post"</span>.
            </p>
          </div>
          {onExploreFeed && (
            <div className="pt-2">
              <button
                onClick={onExploreFeed}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <span>Explore Home Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
