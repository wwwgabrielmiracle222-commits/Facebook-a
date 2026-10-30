import React from 'react';
import { Bell, Heart, MessageSquare, UserPlus, Cake, Users, CheckCheck } from 'lucide-react';
import { NotificationItem, NavTab } from '../types';

interface NotificationsTabProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
  darkMode: boolean;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  onMarkAllRead,
  onSelectNotification,
  darkMode,
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-green-500 fill-green-500" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-[#1877F2]" />;
      case 'birthday':
        return <Cake className="w-4 h-4 text-amber-500" />;
      case 'group':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#1877F2]" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Notifications Header */}
      <div
        className={`p-3 rounded-lg border shadow-xs flex items-center justify-between transition-colors ${
          darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#1877F2]" />
          <h2 className="font-bold text-base">Notifications</h2>
        </div>

        <button
          onClick={onMarkAllRead}
          className="text-xs text-[#1877F2] hover:underline font-semibold flex items-center gap-1"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div
        className={`rounded-lg border shadow-xs overflow-hidden divide-y transition-colors ${
          darkMode
            ? 'bg-[#242526] border-gray-700 divide-gray-800 text-white'
            : 'bg-white border-gray-200 divide-gray-100 text-slate-900'
        }`}
      >
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => onSelectNotification(notif)}
            className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
              !notif.isRead
                ? darkMode
                  ? 'bg-blue-950/40 hover:bg-blue-900/50'
                  : 'bg-blue-50/70 hover:bg-blue-100/70'
                : darkMode
                ? 'hover:bg-gray-800'
                : 'hover:bg-gray-50'
            }`}
          >
            {/* Avatar & Badge */}
            <div className="relative shrink-0">
              <img
                src={notif.user.avatar}
                alt={notif.user.name}
                className="w-11 h-11 rounded-full object-cover border border-gray-300 dark:border-gray-600"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-gray-800 rounded-full shadow-xs">
                {getIcon(notif.type)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-xs sm:text-sm">
              <p className="leading-snug">
                <span className="font-bold text-slate-900 dark:text-gray-100">{notif.user.name}</span>{' '}
                <span className="text-gray-700 dark:text-gray-300">{notif.action}</span>{' '}
                {notif.target && (
                  <span className="font-semibold text-slate-800 dark:text-gray-200">{notif.target}</span>
                )}
              </p>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block">
                {notif.timestamp}
              </span>
            </div>

            {/* Unread Blue Dot */}
            {!notif.isRead && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
