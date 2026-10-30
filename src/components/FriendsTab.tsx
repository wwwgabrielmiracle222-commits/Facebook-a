import React, { useState } from 'react';
import { UserCheck, UserPlus, UserX, Search, MessageSquare, Check, Users } from 'lucide-react';
import { FriendRequest, User } from '../types';

interface FriendsTabProps {
  friendRequests: FriendRequest[];
  suggestedFriends: User[];
  onConfirmRequest: (reqId: string) => void;
  onDeclineRequest: (reqId: string) => void;
  onAddSuggestedFriend: (userId: string) => void;
  onOpenChatWithUser: (user: User) => void;
  darkMode: boolean;
}

export const FriendsTab: React.FC<FriendsTabProps> = ({
  friendRequests,
  suggestedFriends,
  onConfirmRequest,
  onDeclineRequest,
  onAddSuggestedFriend,
  onOpenChatWithUser,
  darkMode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'suggestions' | 'all'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedUserIds, setAddedUserIds] = useState<Set<string>>(new Set());

  const handleAddClick = (userId: string) => {
    setAddedUserIds((prev) => new Set(prev).add(userId));
    onAddSuggestedFriend(userId);
  };

  return (
    <div className="space-y-3">
      {/* Sub Header & Search Filter */}
      <div
        className={`p-3 rounded-lg border shadow-xs space-y-2 transition-colors ${
          darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1877F2]" />
            <span>Friends</span>
          </h2>
          <span className="text-xs text-gray-500 font-medium">482 Total Friends</span>
        </div>

        {/* Search */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent w-full outline-none text-xs"
          />
        </div>

        {/* Sub Navigation Pills */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeSubTab === 'requests'
                ? 'bg-[#1877F2] text-white'
                : darkMode
                ? 'bg-gray-800 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Requests ({friendRequests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('suggestions')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeSubTab === 'suggestions'
                ? 'bg-[#1877F2] text-white'
                : darkMode
                ? 'bg-gray-800 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Suggestions
          </button>
        </div>
      </div>

      {/* Friend Requests List */}
      {(activeSubTab === 'requests' || activeSubTab === 'all') && (
        <div
          className={`p-3 rounded-lg border shadow-xs transition-colors ${
            darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
          }`}
        >
          <h3 className="font-bold text-sm mb-3 flex items-center justify-between">
            <span>Friend Requests</span>
            <span className="text-xs text-[#1877F2] font-semibold">{friendRequests.length}</span>
          </h3>

          {friendRequests.length > 0 ? (
            <div className="space-y-3">
              {friendRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700/60"
                >
                  <img
                    src={req.user.avatar}
                    alt={req.user.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm truncate">{req.user.name}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {req.mutualFriends} mutual friends • {req.timestamp}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => onConfirmRequest(req.id)}
                        className="flex-1 py-1.5 px-3 bg-[#1877F2] text-white text-xs font-bold rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                      <button
                        onClick={() => onDeclineRequest(req.id)}
                        className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md border transition-colors ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-3 text-center">No pending friend requests.</p>
          )}
        </div>
      )}

      {/* Suggested Friends List */}
      {(activeSubTab === 'suggestions' || activeSubTab === 'all') && (
        <div
          className={`p-3 rounded-lg border shadow-xs transition-colors ${
            darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
          }`}
        >
          <h3 className="font-bold text-sm mb-3">People You May Know</h3>

          <div className="space-y-3">
            {suggestedFriends.map((sug) => {
              const isAdded = addedUserIds.has(sug.id);

              return (
                <div
                  key={sug.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700/60"
                >
                  <img
                    src={sug.avatar}
                    alt={sug.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm truncate">{sug.name}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {sug.livesIn || 'San Francisco, CA'} • {sug.friendsCount || 120} friends
                    </p>

                    <div className="flex gap-2 mt-2">
                      {isAdded ? (
                        <span className="flex-1 py-1.5 px-3 bg-gray-200 dark:bg-gray-700 text-slate-800 dark:text-gray-200 text-xs font-semibold rounded-md flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span>Request Sent</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddClick(sug.id)}
                          className="flex-1 py-1.5 px-3 bg-[#1877F2] text-white text-xs font-bold rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add Friend</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenChatWithUser(sug)}
                        className={`py-1.5 px-3 text-xs font-semibold rounded-md border transition-colors flex items-center justify-center gap-1 ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
