import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Phone,
  Video,
  Send,
  Image,
  Smile,
  ThumbsUp,
  ArrowLeft,
  MoreVertical,
  Check,
  CheckCheck,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
} from 'lucide-react';
import { ChatThread, Message, User } from '../types';

interface MessengerLiteProps {
  currentUser: User;
  threads: ChatThread[];
  onUpdateThreads: (updated: ChatThread[]) => void;
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  darkMode: boolean;
}

export const MessengerLite: React.FC<MessengerLiteProps> = ({
  currentUser,
  threads,
  onUpdateThreads,
  activeThreadId,
  setActiveThreadId,
  darkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [callState, setCallState] = useState<{ type: 'audio' | 'video'; user: User } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threadsRef = useRef(threads);
  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  const activeThreadIdRef = useRef(activeThreadId);
  useEffect(() => {
    activeThreadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  const typingTimeoutsRef = useRef<{ [threadId: string]: ReturnType<typeof setTimeout>[] }>({});

  // Cleanup pending typing timers on unmount
  useEffect(() => {
    const activeTimersMap = typingTimeoutsRef.current;
    return () => {
      Object.keys(activeTimersMap).forEach((threadId) => {
        const timers = activeTimersMap[threadId];
        if (timers && Array.isArray(timers)) {
          timers.forEach((t) => clearTimeout(t));
        }
      });
    };
  }, []);

  const selectedThread = threads.find((t) => t.id === activeThreadId);
  const isOtherTyping = Boolean(selectedThread && typingStatus[selectedThread.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThread?.messages, isOtherTyping]);

  const simulateContactTypingAndReply = (targetThreadId: string, replyText?: string) => {
    const currentThreads = threadsRef.current;
    const targetThread = currentThreads.find((t) => t.id === targetThreadId);
    if (!targetThread) return;

    // Clear any previous scheduled timers for this thread
    if (typingTimeoutsRef.current[targetThreadId]) {
      typingTimeoutsRef.current[targetThreadId].forEach((t) => clearTimeout(t));
    }
    typingTimeoutsRef.current[targetThreadId] = [];

    // Step 1: Small realistic delay before starting to type (e.g. 500ms)
    const startTypingTimer = setTimeout(() => {
      setTypingStatus((prev) => ({ ...prev, [targetThreadId]: true }));
    }, 500);

    // Step 2: Realistic typing duration (2.2s) followed by message dispatch
    const sendReplyTimer = setTimeout(() => {
      setTypingStatus((prev) => ({ ...prev, [targetThreadId]: false }));

      const friendReplies = [
        'That sounds awesome! Thanks for sharing.',
        'Got it! Chat with you in a bit 👍',
        'Haha amazing! Let me know when you are free.',
        'Super cool, appreciate the update!',
        'Sounds good to me!',
        'Hey! Just caught your message, completely agree.',
        'Great talking with you! Catch up soon.',
      ];
      const randomReply = replyText || friendReplies[Math.floor(Math.random() * friendReplies.length)];

      const replyMsg: Message = {
        id: `msg_reply_${Date.now()}`,
        senderId: targetThread.user.id,
        text: randomReply,
        timestamp: 'Just now',
        isRead: activeThreadIdRef.current === targetThreadId,
      };

      const updated = threadsRef.current.map((t) => {
        if (t.id === targetThreadId) {
          const isActive = activeThreadIdRef.current === targetThreadId;
          return {
            ...t,
            lastMessage: randomReply,
            lastTimestamp: 'Just now',
            unreadCount: isActive ? 0 : (t.unreadCount || 0) + 1,
            messages: [...t.messages, replyMsg],
          };
        }
        return t;
      });

      onUpdateThreads(updated);
    }, 2400);

    typingTimeoutsRef.current[targetThreadId].push(startTypingTimer, sendReplyTimer);
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    // Mark messages as read
    const updated = threads.map((t) => {
      if (t.id === threadId) {
        return {
          ...t,
          unreadCount: 0,
          messages: t.messages.map((m) => ({ ...m, isRead: true })),
        };
      }
      return t;
    });
    onUpdateThreads(updated);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !selectedThread) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      text: text.trim(),
      timestamp: 'Just now',
      isRead: false,
    };

    const updatedThreads = threads.map((t) => {
      if (t.id === selectedThread.id) {
        return {
          ...t,
          lastMessage: text.trim(),
          lastTimestamp: 'Just now',
          messages: [...t.messages, newMsg],
        };
      }
      return t;
    });

    onUpdateThreads(updatedThreads);
    setInputText('');

    // Trigger typing indicator and simulated response for this thread
    simulateContactTypingAndReply(selectedThread.id);
  };

  const filteredThreads = threads.filter((t) =>
    t.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`rounded-lg border shadow-xs overflow-hidden h-[75vh] flex flex-col md:flex-row transition-colors ${
        darkMode ? 'bg-[#242526] border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'
      }`}
    >
      {/* Threads List Sidebar / Screen */}
      {(!activeThreadId || window.innerWidth >= 768) && (
        <div
          className={`w-full md:w-80 border-r flex flex-col transition-colors ${
            darkMode ? 'border-gray-700 bg-[#242526]' : 'border-gray-200 bg-white'
          }`}
        >
          {/* Header & Search */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-1.5">
                <span>Chats</span>
                <span className="text-[10px] bg-[#1877F2] text-white px-1.5 py-0.5 rounded-full font-sans">
                  Lite
                </span>
              </h2>
            </div>

            {/* Search Input */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Messenger Lite..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent w-full outline-none text-xs"
              />
            </div>
          </div>

          {/* Active Online Row */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700/60 overflow-x-auto scrollbar-none flex gap-3">
            {threads.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectThread(t.id)}
                className="flex flex-col items-center cursor-pointer shrink-0 group"
              >
                <div className="relative">
                  <img
                    src={t.user.avatar}
                    alt={t.user.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                  {t.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#242526]" />
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1 truncate w-12 text-center text-gray-600 dark:text-gray-300">
                  {t.user.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Threads Item List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {filteredThreads.map((t) => {
              const isSelected = t.id === activeThreadId;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectThread(t.id)}
                  className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? darkMode
                        ? 'bg-gray-800'
                        : 'bg-blue-50'
                      : darkMode
                      ? 'hover:bg-gray-800/60'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={t.user.avatar}
                      alt={t.user.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    {t.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#242526]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-xs sm:text-sm truncate">{t.user.name}</h4>
                      <span className="text-[10px] text-gray-400 ml-1">{t.lastTimestamp}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      {typingStatus[t.id] ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1877F2] dark:text-blue-400">
                          <span className="italic">typing</span>
                          <span className="inline-flex gap-0.5 items-center">
                            <span className="w-1 h-1 rounded-full bg-[#1877F2] dark:bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1 rounded-full bg-[#1877F2] dark:bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1 rounded-full bg-[#1877F2] dark:bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </div>
                      ) : (
                        <p
                          className={`text-xs truncate ${
                            t.unreadCount > 0
                              ? 'font-bold text-slate-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {t.lastMessage}
                        </p>
                      )}
                      {t.unreadCount > 0 && (
                        <span className="bg-[#1877F2] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-1">
                          {t.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Conversation Main Chat Window */}
      {selectedThread ? (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-gray-900">
          {/* Active Chat Header */}
          <div className="p-3 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveThreadId(null)}
                className="md:hidden p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <img
                  src={selectedThread.user.avatar}
                  alt={selectedThread.user.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                {selectedThread.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm leading-tight">
                  {selectedThread.user.name}
                </h3>
                {isOtherTyping ? (
                  <span className="text-[10px] text-[#1877F2] dark:text-blue-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] dark:bg-blue-400 animate-ping inline-block" />
                    typing...
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                    {selectedThread.isOnline ? 'Active now' : 'Offline'}
                  </span>
                )}
              </div>
            </div>

            {/* Audio & Video Call Buttons + Wave Action */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  if (!isOtherTyping) {
                    handleSendMessage('👋 *Waves hello*');
                  }
                }}
                disabled={isOtherTyping}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1 disabled:opacity-50"
                title="Wave to get attention and trigger live reply"
              >
                <span>👋</span>
                <span className="hidden sm:inline">Wave</span>
              </button>
              <button
                onClick={() => setCallState({ type: 'audio', user: selectedThread.user })}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-[#1877F2]"
                title="Audio Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCallState({ type: 'video', user: selectedThread.user })}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-[#1877F2]"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {selectedThread.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img
                      src={selectedThread.user.avatar}
                      alt={selectedThread.user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm shadow-2xs ${
                      isMe
                        ? 'bg-[#1877F2] text-white rounded-br-xs'
                        : darkMode
                        ? 'bg-gray-800 text-gray-100 rounded-bl-xs'
                        : 'bg-white text-slate-800 rounded-bl-xs border border-gray-200'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] opacity-75">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Real-time typing indicator bubble */}
            {isOtherTyping && (
              <div className="flex items-end gap-1.5 justify-start animate-in fade-in slide-in-from-bottom-1 duration-200">
                <img
                  src={selectedThread.user.avatar}
                  alt={selectedThread.user.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
                <div
                  className={`px-3.5 py-2.5 rounded-2xl rounded-bl-xs text-xs sm:text-sm shadow-2xs flex items-center gap-2 border transition-colors ${
                    darkMode
                      ? 'bg-gray-800 text-gray-200 border-gray-700'
                      : 'bg-white text-slate-800 border-gray-200'
                  }`}
                  role="status"
                  aria-label={`${selectedThread.user.name} is typing`}
                >
                  <div className="flex items-center gap-1 py-0.5">
                    <span
                      className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: '0ms', animationDuration: '800ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: '180ms', animationDuration: '800ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: '360ms', animationDuration: '800ms' }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    {selectedThread.user.name.split(' ')[0]} is typing...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Chat Box */}
          <div className="p-2.5 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <button
              onClick={() => handleSendMessage('👍')}
              className="text-xl p-1 hover:scale-125 transition-transform"
              title="Quick Thumbs Up"
            >
              👍
            </button>

            <input
              type="text"
              placeholder="Aa (Type a message...)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className={`flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-full border outline-none ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-100 border-gray-300 text-slate-900 placeholder-gray-500'
              }`}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2 rounded-full bg-[#1877F2] text-white disabled:opacity-40 hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-6 text-center text-gray-400">
          <div className="w-16 h-16 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center mb-3">
            <Send className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-gray-200">
            Messenger Lite Chat
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mt-1">
            Select a conversation on the left to start messaging your friends instantly.
          </p>
        </div>
      )}

      {/* Simulated Audio/Video Call Screen Modal */}
      {callState && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-between p-6 text-white backdrop-blur-md">
          {/* Header */}
          <div className="text-center pt-8">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
              Messenger Lite {callState.type === 'video' ? 'Video' : 'Audio'} Call
            </span>
            <h2 className="text-xl font-bold mt-2">{callState.user.name}</h2>
            <span className="text-xs text-gray-400 animate-pulse mt-1 block">Ringing...</span>
          </div>

          {/* Center Avatar / Video Box */}
          <div className="flex flex-col items-center">
            {callState.type === 'video' ? (
              <div className="w-64 h-80 bg-slate-800 rounded-2xl overflow-hidden relative border-2 border-white/20 shadow-2xl">
                <img
                  src={callState.user.avatar}
                  alt={callState.user.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-full text-[10px] font-medium">
                  Connected HD Video
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={callState.user.avatar}
                  alt={callState.user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#1877F2] ring-8 ring-blue-500/20 animate-pulse"
                />
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-6 pb-8">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full text-white transition-colors ${
                isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setCallState(null)}
              className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl transition-transform active:scale-95"
            >
              <PhoneOff className="w-7 h-7" />
            </button>

            {callState.type === 'video' && (
              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-4 rounded-full text-white transition-colors ${
                  isCameraOff ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
