import React, { useState } from 'react';
import {
  Bookmark,
  Users,
  Flag,
  ShoppingBag,
  History,
  Calendar,
  Moon,
  Sun,
  WifiOff,
  Wifi,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Type,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { NavTab, User, Post } from '../types';
import { PostCard } from './PostCard';

interface MenuTabProps {
  currentUser: User;
  setActiveTab: (tab: NavTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  dataSaver: boolean;
  setDataSaver: (val: boolean) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  onResetData: () => void;
  onLogout?: () => void;
  posts?: Post[];
  savedPosts?: Post[];
  onUpdatePost?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onShareToMessenger?: (post: Post) => void;
  onToggleSavePost?: (post: Post) => void;
  onAddPost?: (newPost: Post) => void;
}

export const MenuTab: React.FC<MenuTabProps> = ({
  currentUser,
  setActiveTab,
  darkMode,
  setDarkMode,
  dataSaver,
  setDataSaver,
  fontSize,
  setFontSize,
  onResetData,
  onLogout = () => {},
  posts = [],
  savedPosts: savedPostsProp,
  onUpdatePost = () => {},
  onDeletePost = () => {},
  onShareToMessenger = () => {},
  onToggleSavePost,
  onAddPost,
}) => {
  const [showSavedPostsView, setShowSavedPostsView] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const savedPosts = savedPostsProp || posts.filter((p) => p.isSaved);

  const quickLinks = [
    { label: 'Saved Posts', icon: Bookmark, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40', action: () => setActiveTab('saved'), badge: savedPosts.length },
    { label: 'Groups', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Marketplace', icon: ShoppingBag, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40' },
    { label: 'Pages', icon: Flag, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Memories', icon: History, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' },
    { label: 'Events', icon: Calendar, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
  ];

  if (showSavedPostsView) {
    return (
      <div className="space-y-3">
        {/* Saved Posts Subview Header */}
        <div
          className={`p-3 rounded-lg border shadow-xs flex items-center justify-between ${
            darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSavedPostsView(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Back to Menu"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Saved Posts</h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {savedPosts.length} {savedPosts.length === 1 ? 'item' : 'items'} saved in your collection
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Posts List */}
        <div className="space-y-3">
          {savedPosts.length > 0 ? (
            savedPosts.map((post) => (
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
            ))
          ) : (
            <div
              className={`p-8 text-center rounded-lg border shadow-xs ${
                darkMode ? 'bg-[#242526] border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto mb-3">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-gray-200">No saved posts yet</h3>
              <p className="text-xs mt-1 max-w-xs mx-auto text-gray-500 dark:text-gray-400">
                Whenever you find a post you want to keep or view later, tap the menu <span className="font-semibold">(•••)</span> and select <span className="font-semibold text-blue-600 dark:text-blue-400">"Save Post"</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Profile Card Shortcut */}
      <div
        onClick={() => setActiveTab('profile')}
        className={`p-3 rounded-lg border shadow-xs flex items-center justify-between cursor-pointer transition-colors ${
          darkMode
            ? 'bg-[#242526] border-gray-700 hover:bg-gray-800 text-white'
            : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-300 dark:border-gray-600"
          />
          <div>
            <h3 className="font-bold text-sm">{currentUser.name}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 block">
              View your profile
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      {/* Quick Access Grid */}
      <div
        className={`p-3 rounded-lg border shadow-xs transition-colors ${
          darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        <h3 className="font-bold text-xs uppercase text-gray-400 mb-2.5 tracking-wider">
          All Shortcuts
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <div
                key={link.label}
                onClick={link.action}
                className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors ${
                  darkMode
                    ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-700'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`p-2 rounded-lg ${link.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs">{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="ml-auto bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings & Preferences */}
      <div
        className={`p-3 rounded-lg border shadow-xs transition-colors divide-y ${
          darkMode
            ? 'bg-[#242526] border-gray-700 divide-gray-700 text-white'
            : 'bg-white border-gray-200 divide-gray-100 text-slate-900'
        }`}
      >
        <h3 className="font-bold text-xs uppercase text-gray-400 pb-2 tracking-wider">
          Settings & Preferences
        </h3>

        {/* Dark Mode Toggle */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-200">
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-bold text-xs block">Dark Mode</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Adjust the screen display appearance
              </span>
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              darkMode ? 'bg-[#1877F2]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Data Saver Mode Toggle */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600">
              {dataSaver ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-bold text-xs block">Data Saver Mode</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Reduces image size for faster loading
              </span>
            </div>
          </div>

          <button
            onClick={() => setDataSaver(!dataSaver)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              dataSaver ? 'bg-amber-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                dataSaver ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Font Size Selector */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-950/40 text-[#1877F2]">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">Text Size</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Classic Lite font size setting
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-2 py-1 text-[10px] font-bold uppercase rounded border transition-colors ${
                  fontSize === size
                    ? 'bg-[#1877F2] text-white border-[#1877F2]'
                    : darkMode
                    ? 'bg-gray-800 text-gray-300 border-gray-700'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                }`}
              >
                {size[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Reset App Data */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-500">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">Reset Sample Data</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Restore initial Facebook A demo state
              </span>
            </div>
          </div>

          <button
            onClick={onResetData}
            className="px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded hover:bg-orange-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Log Out Button */}
      <div
        className={`p-3 rounded-lg border shadow-xs transition-colors ${
          darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out ({currentUser.name})</span>
        </button>
      </div>

      {/* Log Out Confirmation Dialog */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl transition-colors ${
              darkMode ? 'bg-[#242526] text-white' : 'bg-white text-slate-900'
            }`}
          >
            <div className="p-4 border-b flex items-center gap-3 border-gray-200 dark:border-gray-700">
              <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Log Out of Facebook A?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You can always log back in at any time.
                </p>
              </div>
            </div>

            <div className="p-4 flex items-center justify-end gap-2 bg-gray-50 dark:bg-gray-800/40">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-2xs"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
