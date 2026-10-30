/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { NavTab, User, Post, Story, ChatThread, FriendRequest, NotificationItem, VideoItem } from './types';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_CHAT_THREADS,
  INITIAL_FRIEND_REQUESTS,
  SUGGESTED_FRIENDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_VIDEOS,
} from './data/initialData';
import { Header } from './components/Header';
import { NavBar } from './components/NavBar';
import { StoriesBar } from './components/StoriesBar';
import { PostComposer } from './components/PostComposer';
import { PostCard } from './components/PostCard';
import { FeedFilterBar, FeedFilterType } from './components/FeedFilterBar';
import { MessengerLite } from './components/MessengerLite';
import { FriendsTab } from './components/FriendsTab';
import { WatchTab } from './components/WatchTab';
import { NotificationsTab } from './components/NotificationsTab';
import { MenuTab } from './components/MenuTab';
import { ProfileView } from './components/ProfileView';
import { AuthView } from './components/AuthView';
import { SavedItemsTab } from './components/SavedItemsTab';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('fblite_is_logged_in');
    return saved !== null ? saved === 'true' : true;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('fblite_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('fblite_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [savedPosts, setSavedPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('fblite_saved_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_POSTS.filter((p) => p.isSaved);
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('fblite_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [threads, setThreads] = useState<ChatThread[]>(() => {
    const saved = localStorage.getItem('fblite_threads');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_THREADS;
  });

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() => {
    const saved = localStorage.getItem('fblite_friend_requests');
    return saved ? JSON.parse(saved) : INITIAL_FRIEND_REQUESTS;
  });

  const [suggestedFriends, setSuggestedFriends] = useState<User[]>(SUGGESTED_FRIENDS);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('fblite_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [videos] = useState<VideoItem[]>(INITIAL_VIDEOS);

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeThreadId, setActiveThreadId] = useState<string | null>('chat_sarah');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('fblite_dark') === 'true';
  });
  const [dataSaver, setDataSaver] = useState<boolean>(true); // Default ON for FB Lite experience
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState<FeedFilterType>('all');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('fblite_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('fblite_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('fblite_saved_posts', JSON.stringify(savedPosts));
  }, [savedPosts]);

  useEffect(() => {
    localStorage.setItem('fblite_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('fblite_threads', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem('fblite_friend_requests', JSON.stringify(friendRequests));
  }, [friendRequests]);

  useEffect(() => {
    localStorage.setItem('fblite_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fblite_is_logged_in', isLoggedIn.toString());
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('fblite_dark', darkMode.toString());
  }, [darkMode]);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('home');
  };

  // Handlers
  const handleAddPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setSavedPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleToggleSavePost = (postToSave: Post) => {
    const isCurrentlySaved = Boolean(postToSave.isSaved) || savedPosts.some((p) => p.id === postToSave.id);
    const newIsSaved = !isCurrentlySaved;
    const updatedPost: Post = { ...postToSave, isSaved: newIsSaved };

    setPosts((prev) => prev.map((p) => (p.id === postToSave.id ? updatedPost : p)));
    setSavedPosts((prev) => {
      if (newIsSaved) {
        return [updatedPost, ...prev.filter((p) => p.id !== postToSave.id)];
      } else {
        return prev.filter((p) => p.id !== postToSave.id);
      }
    });
  };

  const handleAddStory = (newStory: Story) => {
    setStories([newStory, ...stories]);
  };

  const handleUpdateStory = (updatedStory: Story) => {
    setStories((prevStories) =>
      prevStories.map((s) => (s.id === updatedStory.id ? updatedStory : s))
    );
  };

  const handleConfirmRequest = (reqId: string) => {
    setFriendRequests(friendRequests.filter((r) => r.id !== reqId));
    setCurrentUser((prev) => ({
      ...prev,
      friendsCount: (prev.friendsCount || 0) + 1,
    }));
  };

  const handleDeclineRequest = (reqId: string) => {
    setFriendRequests(friendRequests.filter((r) => r.id !== reqId));
  };

  const handleShareToMessenger = (post: Post) => {
    if (!activeThreadId) return;
    const shareText = `Shared post by ${post.author.name}: "${post.content.slice(0, 80)}..."`;

    setThreads(
      threads.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastMessage: shareText,
            lastTimestamp: 'Just now',
            messages: [
              ...t.messages,
              {
                id: `msg_share_${Date.now()}`,
                senderId: currentUser.id,
                text: shareText,
                timestamp: 'Just now',
                isRead: true,
              },
            ],
          };
        }
        return t;
      })
    );
    setActiveTab('messages');
  };

  const handleSelectNotification = (notif: NotificationItem) => {
    setNotifications(
      notifications.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.linkTab) {
      setActiveTab(notif.linkTab);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleResetData = () => {
    localStorage.clear();
    setCurrentUser(CURRENT_USER);
    setPosts(INITIAL_POSTS);
    setSavedPosts(INITIAL_POSTS.filter((p) => p.isSaved));
    setStories(INITIAL_STORIES);
    setThreads(INITIAL_CHAT_THREADS);
    setFriendRequests(INITIAL_FRIEND_REQUESTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveTab('home');
  };

  const handleOpenChatWithUser = (user: User) => {
    const existingThread = threads.find((t) => t.user.id === user.id);
    if (existingThread) {
      setActiveThreadId(existingThread.id);
    } else {
      const newThread: ChatThread = {
        id: `chat_${user.id}`,
        user: user,
        lastMessage: 'Say hi to your new friend!',
        lastTimestamp: 'Just now',
        unreadCount: 0,
        isOnline: true,
        messages: [],
      };
      setThreads([newThread, ...threads]);
      setActiveThreadId(newThread.id);
    }
    setActiveTab('messages');
  };

  // Calculations
  const unreadChatCount = threads.reduce((acc, t) => acc + t.unreadCount, 0);
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;
  const pendingRequestsCount = friendRequests.length;

  const feedCounts = {
    all: posts.length,
    friends: posts.filter((p) => p.category === 'friends' || p.privacy === 'friends' || !p.groupName).length,
    groups: posts.filter((p) => p.category === 'groups' || Boolean(p.groupName)).length,
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.groupName && p.groupName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (feedFilter === 'friends') {
      return p.category === 'friends' || p.privacy === 'friends' || !p.groupName;
    }
    if (feedFilter === 'groups') {
      return p.category === 'groups' || Boolean(p.groupName);
    }
    return true;
  });

  const userOwnPosts = posts.filter((p) => p.author.id === currentUser.id);

  const savedPostsList = useMemo(() => {
    const fromPosts = posts.filter((p) => Boolean(p.isSaved));
    const extra = savedPosts.filter(
      (sp) => Boolean(sp.isSaved) && !fromPosts.some((p) => p.id === sp.id)
    );
    return [...fromPosts, ...extra];
  }, [posts, savedPosts]);

  // Font size scale class
  const fontSizeClass =
    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

  // If user is logged out, show the lightweight Facebook A login screen
  if (!isLoggedIn) {
    return <AuthView onLogin={handleLogin} darkMode={darkMode} />;
  }

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-200 ${
        darkMode ? 'bg-[#18191A] text-gray-100' : 'bg-[#F0F2F5] text-slate-900'
      } ${fontSizeClass}`}
    >
      {/* Facebook A Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dataSaver={dataSaver}
        setDataSaver={setDataSaver}
        unreadChatCount={unreadChatCount}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onLogout={handleLogout}
      />

      {/* Primary Sub-Header Tabs */}
      <NavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadChatCount={unreadChatCount}
        unreadNotifCount={unreadNotifCount}
        pendingFriendRequestsCount={pendingRequestsCount}
        savedPostsCount={savedPostsList.length}
        darkMode={darkMode}
      />

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-2 sm:px-4 py-3 pb-12">
        {/* Home Feed Tab */}
        {activeTab === 'home' && (
          <div className="space-y-3">
            {/* Story Tray Bar */}
            <StoriesBar
              currentUser={currentUser}
              stories={stories}
              onAddStory={handleAddStory}
              onUpdateStory={handleUpdateStory}
              darkMode={darkMode}
            />

            {/* Post Composer Widget */}
            <PostComposer
              currentUser={currentUser}
              onAddPost={handleAddPost}
              darkMode={darkMode}
            />

            {/* Feed Filter Dropdown Bar */}
            <FeedFilterBar
              activeFilter={feedFilter}
              onChangeFilter={setFeedFilter}
              counts={feedCounts}
              darkMode={darkMode}
            />

            {/* Posts Stream */}
            <div className="space-y-3">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onUpdatePost={handleUpdatePost}
                    onDeletePost={handleDeletePost}
                    onShareToMessenger={handleShareToMessenger}
                    onToggleSavePost={handleToggleSavePost}
                    onAddPost={handleAddPost}
                    darkMode={darkMode}
                  />
                ))
              ) : (
                <div
                  className={`p-8 text-center rounded-lg border shadow-xs ${
                    darkMode ? 'bg-[#242526] border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800 dark:text-gray-200 mb-1">
                    No posts found in {feedFilter === 'all' ? 'this search' : feedFilter === 'friends' ? 'Friends feed' : 'Groups feed'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Try switching your filter or searching for another term.
                  </p>
                  {feedFilter !== 'all' && (
                    <button
                      onClick={() => setFeedFilter('all')}
                      className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                    >
                      Show All Posts
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <FriendsTab
            friendRequests={friendRequests}
            suggestedFriends={suggestedFriends}
            onConfirmRequest={handleConfirmRequest}
            onDeclineRequest={handleDeclineRequest}
            onAddSuggestedFriend={() => {}}
            onOpenChatWithUser={handleOpenChatWithUser}
            darkMode={darkMode}
          />
        )}

        {/* Messenger Lite Tab */}
        {activeTab === 'messages' && (
          <MessengerLite
            currentUser={currentUser}
            threads={threads}
            onUpdateThreads={setThreads}
            activeThreadId={activeThreadId}
            setActiveThreadId={setActiveThreadId}
            darkMode={darkMode}
          />
        )}

        {/* Watch Tab */}
        {activeTab === 'watch' && <WatchTab videos={videos} darkMode={darkMode} />}

        {/* Saved Items Tab */}
        {activeTab === 'saved' && (
          <SavedItemsTab
            posts={savedPostsList}
            currentUser={currentUser}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            onShareToMessenger={handleShareToMessenger}
            onToggleSavePost={handleToggleSavePost}
            onAddPost={handleAddPost}
            darkMode={darkMode}
            onExploreFeed={() => setActiveTab('home')}
          />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationsTab
            notifications={notifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onSelectNotification={handleSelectNotification}
            darkMode={darkMode}
          />
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <MenuTab
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            dataSaver={dataSaver}
            setDataSaver={setDataSaver}
            fontSize={fontSize}
            setFontSize={setFontSize}
            onResetData={handleResetData}
            onLogout={handleLogout}
            posts={posts}
            savedPosts={savedPostsList}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            onShareToMessenger={handleShareToMessenger}
            onToggleSavePost={handleToggleSavePost}
            onAddPost={handleAddPost}
          />
        )}

        {/* Profile View */}
        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={setCurrentUser}
            userPosts={userOwnPosts}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            onShareToMessenger={handleShareToMessenger}
            onToggleSavePost={handleToggleSavePost}
            onAddPost={handleAddPost}
            onLogout={handleLogout}
            darkMode={darkMode}
          />
        )}
      </main>
    </div>
  );
}
