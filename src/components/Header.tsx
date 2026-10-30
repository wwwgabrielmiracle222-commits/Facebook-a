import React, { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, Menu, Wifi, WifiOff, X, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { NavTab, User } from '../types';

interface HeaderProps {
  currentUser: User;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  dataSaver: boolean;
  setDataSaver: (val: boolean) => void;
  unreadChatCount: number;
  onSearch: (query: string) => void;
  searchQuery: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  dataSaver,
  setDataSaver,
  unreadChatCount,
  onSearch,
  searchQuery,
  onLogout,
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className="bg-[#1877F2] text-white sticky top-0 z-40 shadow-md">
      {/* Top Banner / Main Header */}
      <div className="max-w-3xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        {!showSearchInput ? (
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setActiveTab('home')}>
            <div className="bg-white text-[#1877F2] font-black text-xl w-8 h-8 rounded flex items-center justify-center shadow-inner tracking-tighter">
              f
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg tracking-tight font-sans">facebook</span>
              <span className="text-[10px] uppercase font-semibold text-blue-100 tracking-widest -mt-0.5">a</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2 bg-blue-700/60 rounded-full px-3 py-1 text-sm border border-blue-400/40">
            <Search className="w-4 h-4 text-blue-200 shrink-0" />
            <input
              type="text"
              placeholder="Search Facebook A..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-transparent text-white placeholder-blue-200 outline-none text-sm"
              autoFocus
            />
            <button
              onClick={() => {
                setShowSearchInput(false);
                onSearch('');
              }}
              className="text-blue-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Actions */}
        {!showSearchInput && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Icon */}
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-2 rounded-full hover:bg-blue-600/80 transition-colors text-white"
              title="Search"
              aria-label="Search Facebook A"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Messenger Lite Shortcut */}
            <button
              onClick={() => setActiveTab('messages')}
              className={`p-2 rounded-full relative transition-colors ${
                activeTab === 'messages' ? 'bg-blue-800' : 'hover:bg-blue-600/80'
              }`}
              title="Messenger Lite"
              aria-label="Open Messenger Lite"
            >
              <MessageSquare className="w-5 h-5 fill-current text-white" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1877F2]">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Data Saver Mode Pill Toggle */}
            <button
              onClick={() => setDataSaver(!dataSaver)}
              className={`hidden sm:flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded border transition-colors ${
                dataSaver
                  ? 'bg-amber-400 text-slate-900 border-amber-300 font-semibold'
                  : 'bg-blue-600 text-blue-100 border-blue-400 hover:bg-blue-700'
              }`}
              title="Toggle Data Saver Mode"
            >
              {dataSaver ? (
                <>
                  <WifiOff className="w-3 h-3 text-slate-900" />
                  <span>Data Saver</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-blue-100" />
                  <span>HQ Data</span>
                </>
              )}
            </button>

            {/* User Avatar / Profile Dropdown Shortcut */}
            <div className="relative ml-1" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-white/50 transition-all cursor-pointer"
                title="Account Menu"
                aria-label="User Account Menu"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-white/40 shadow-2xs"
                />
              </button>

              {/* Quick Account Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#242526] text-slate-900 dark:text-gray-100 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  <div
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab('profile');
                    }}
                    className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/80 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold truncate text-slate-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">View profile</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab('menu');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/80 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400" />
                    <span>Settings & Preferences</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 font-semibold border-t border-gray-100 dark:border-gray-700/80 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lite Data Bar Mobile Notice */}
      {dataSaver && (
        <div className="bg-amber-400 text-slate-900 text-[11px] font-medium py-0.5 px-3 text-center flex items-center justify-center gap-1">
          <WifiOff className="w-3 h-3" />
          <span>Facebook A Data Saver Active — Reduced Image Resolution</span>
          <button
            onClick={() => setDataSaver(false)}
            className="underline ml-2 font-bold hover:text-black text-[10px]"
          >
            Switch to HQ
          </button>
        </div>
      )}
    </header>
  );
};
