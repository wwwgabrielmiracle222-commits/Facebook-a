export type NavTab = 'home' | 'friends' | 'messages' | 'watch' | 'notifications' | 'saved' | 'menu' | 'profile';

export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export interface User {
  id: string;
  name: string;
  avatar: string;
  coverImage?: string;
  verified?: boolean;
  bio?: string;
  work?: string;
  education?: string;
  livesIn?: string;
  hometown?: string;
  relationship?: string;
  joinedDate?: string;
  friendsCount?: number;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: string;
  likesCount: number;
  isLiked?: boolean;
  image?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUserIds?: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  isCameraVideo?: boolean;
  isCameraPhoto?: boolean;
  feeling?: string;
  location?: string;
  timestamp: string;
  reactions: Record<ReactionType, number>;
  userReaction?: ReactionType | null;
  comments: Comment[];
  sharesCount: number;
  privacy: 'public' | 'friends' | 'only_me';
  category?: 'friends' | 'groups' | 'public';
  groupName?: string;
  isSaved?: boolean;
  poll?: Poll;
  sharedPost?: {
    id: string;
    author: User;
    content: string;
    imageUrl?: string;
    images?: string[];
    timestamp: string;
  };
}

export interface Story {
  id: string;
  author: User;
  mediaUrl?: string;
  text?: string;
  bgColor?: string;
  timestamp: string;
  isViewed?: boolean;
  reactions?: Record<string, number>;
  userReaction?: string | null;
  viewCount?: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  image?: string;
  isRead?: boolean;
}

export interface ChatThread {
  id: string;
  user: User;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

export interface FriendRequest {
  id: string;
  user: User;
  mutualFriends: number;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface NotificationItem {
  id: string;
  user: User;
  action: string;
  target?: string;
  timestamp: string;
  isRead: boolean;
  type: 'like' | 'comment' | 'friend_request' | 'birthday' | 'group' | 'memory';
  linkTab?: NavTab;
}

export interface VideoItem {
  id: string;
  author: User;
  title: string;
  videoUrl: string;
  thumbnail: string;
  views: string;
  timestamp: string;
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  sharesCount: number;
}
