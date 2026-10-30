import React, { useState } from 'react';
import {
  Camera,
  Briefcase,
  GraduationCap,
  Home,
  MapPin,
  Heart,
  Calendar,
  Edit3,
  X,
  Plus,
  Image,
  Users,
  LogOut,
} from 'lucide-react';
import { User, Post } from '../types';
import { PostCard } from './PostCard';

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  userPosts: Post[];
  onUpdatePost: (updatedPost: Post) => void;
  onDeletePost: (postId: string) => void;
  onShareToMessenger: (post: Post) => void;
  darkMode: boolean;
  onToggleSavePost?: (post: Post) => void;
  onAddPost?: (newPost: Post) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  userPosts,
  onUpdatePost,
  onDeletePost,
  onShareToMessenger,
  darkMode,
  onToggleSavePost,
  onAddPost,
  onLogout,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [work, setWork] = useState(currentUser.work || '');
  const [education, setEducation] = useState(currentUser.education || '');
  const [livesIn, setLivesIn] = useState(currentUser.livesIn || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [coverImage, setCoverImage] = useState(currentUser.coverImage || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      bio,
      work,
      education,
      livesIn,
      avatar,
      coverImage,
    });
    setShowEditModal(false);
  };

  return (
    <div className="space-y-3">
      {/* Cover & Profile Header Card */}
      <div
        className={`rounded-lg border shadow-xs overflow-hidden transition-colors ${
          darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        {/* Cover Photo */}
        <div className="relative h-44 sm:h-56 bg-slate-300 dark:bg-gray-800">
          {currentUser.coverImage ? (
            <img
              src={currentUser.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-800" />
          )}

          <button
            onClick={() => setShowEditModal(true)}
            className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-md hover:bg-black flex items-center gap-1.5 font-medium backdrop-blur-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Edit Cover</span>
          </button>
        </div>

        {/* Profile Avatar & Primary Info */}
        <div className="px-4 pb-4 relative pt-12 sm:pt-14 text-center sm:text-left">
          {/* Avatar floating above cover border */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0">
            <div className="relative group">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-[#242526] shadow-md"
              />
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-1 right-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow-md text-slate-800 dark:text-gray-200 hover:scale-110 transition-transform"
                title="Change Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black">{currentUser.name}</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-lg">
                {currentUser.bio}
              </p>
              <span className="text-xs text-[#1877F2] font-semibold mt-1 block">
                {currentUser.friendsCount || 482} Friends
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 sm:pt-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3.5 py-2 bg-[#1877F2] text-white text-xs font-bold rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              {onLogout && (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-red-950/40 text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 border border-gray-300 dark:border-gray-600 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Intro Details Grid */}
      <div
        className={`p-3 rounded-lg border shadow-xs transition-colors space-y-2.5 ${
          darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        <h3 className="font-bold text-sm border-b pb-2 dark:border-gray-700">Intro Details</h3>

        <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
          {currentUser.work && (
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Works at <strong className="text-slate-900 dark:text-white">{currentUser.work}</strong></span>
            </div>
          )}
          {currentUser.education && (
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Studied at <strong className="text-slate-900 dark:text-white">{currentUser.education}</strong></span>
            </div>
          )}
          {currentUser.livesIn && (
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Lives in <strong className="text-slate-900 dark:text-white">{currentUser.livesIn}</strong></span>
            </div>
          )}
          {currentUser.hometown && (
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>From <strong className="text-slate-900 dark:text-white">{currentUser.hometown}</strong></span>
            </div>
          )}
          {currentUser.joinedDate && (
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Joined <strong className="text-slate-900 dark:text-white">{currentUser.joinedDate}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* User's Personal Feed */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm px-1">Your Posts</h3>

        {userPosts.length > 0 ? (
          userPosts.map((post) => (
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
            className={`p-6 text-center text-xs text-gray-500 rounded-lg border ${
              darkMode ? 'bg-[#242526] border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            You haven't posted anything yet!
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3">
          <div
            className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transition-colors ${
              darkMode ? 'bg-[#242526] text-white' : 'bg-white text-slate-900'
            }`}
          >
            <div className="p-3 border-b flex items-center justify-between border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-sm">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none resize-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Workplace</label>
                <input
                  type="text"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Education</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Lives in</label>
                <input
                  type="text"
                  value={livesIn}
                  onChange={(e) => setLivesIn(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#1877F2] rounded-lg hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && onLogout && (
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
                  Are you sure you want to log out of {currentUser.name}?
                </p>
              </div>
            </div>

            <div className="p-4 flex items-center justify-end gap-2 bg-gray-50 dark:bg-gray-800/40">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
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
