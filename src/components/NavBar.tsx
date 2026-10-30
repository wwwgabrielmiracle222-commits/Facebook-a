import React from 'react';
import { Home, Users, MessageSquare, Tv, Bell, Menu, Bookmark } from 'lucide-react';
import { NavTab } from '../types';

interface NavBarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadChatCount: number;
  unreadNotifCount: number;
  pendingFriendRequestsCount: number;
  savedPostsCount?: number;
  darkMode: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({
  activeTab,
  setActiveTab,
  unreadChatCount,
  unreadNotifCount,
  pendingFriendRequestsCount,
  savedPostsCount = 0,
  darkMode,
}) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: Home,
      badge: 0,
    },
    {
      id: 'friends' as NavTab,
      label: 'Friends',
      icon: Users,
      badge: pendingFriendRequestsCount,
    },
    {
      id: 'messages' as NavTab,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadChatCount,
    },
    {
      id: 'watch' as NavTab,
      label: 'Watch',
      icon: Tv,
      badge: 0,
    },
    {
      id: 'saved' as NavTab,
      label: 'Saved Items',
      icon: Bookmark,
      badge: 0,
    },
    {
      id: 'notifications' as NavTab,
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifCount,
    },
    {
      id: 'menu' as NavTab,
      label: 'Menu',
      icon: Menu,
      badge: 0,
    },
  ];

  return (
    <nav
      className={`border-b sticky top-[48px] sm:top-[52px] z-30 transition-colors ${
        darkMode
          ? 'bg-[#242526] border-gray-700 text-gray-300'
          : 'bg-white border-gray-200 text-gray-600'
      }`}
    >
      <div className="max-w-3xl mx-auto flex justify-between items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'menu' && activeTab === 'profile');

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 sm:py-2.5 flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
                isActive
                  ? darkMode
                    ? 'text-[#4599FF] font-semibold border-b-2 border-[#4599FF]'
                    : 'text-[#1877F2] font-semibold border-b-2 border-[#1877F2]'
                  : darkMode
                  ? 'hover:text-gray-100 text-gray-400'
                  : 'hover:text-slate-900 text-gray-500'
              }`}
              title={tab.label}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#242526]">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight hidden sm:block truncate max-w-full px-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
