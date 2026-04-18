import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { getMessages, markAsRead, searchMessages } from '../../services/messageService';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import MessageInput from './MessageInput';
import MessageBubble from './MessageBubble';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { blockUser, getBlockStatus, unblockUser } from '../../services/userService';
import { format } from 'date-fns';

// --- Helper Functions ---
const formatDateHeader = (date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
};

// --- Subcomponents ---

const Avatar = ({ src, name, isOnline, isGroup, className }) => (
  <div className={`relative flex-shrink-0 ${className || ''}`}>
    <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-2 ring-white dark:ring-gray-900">
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=3b82f6&color=fff&bold=true`;
        }} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-base uppercase">
          {(name || 'U').charAt(0)}
        </div>
      )}
    </div>
    {!isGroup && isOnline && (
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
    )}
  </div>
);

const ChatHeader = memo(({ conversation, otherParticipant, isOnline, onOpenInfo, onOpenSidebar, onBlockToggle, blockStatus, onSearchToggle, showSearch }) => {
  const displayName = conversation?.isGroup ? conversation.name : otherParticipant?.userId?.username || 'User';
  const displayAvatar = conversation?.avatar || otherParticipant?.userId?.avatar;

  return (
    <div className="flex-shrink-0 z-20 flex items-center justify-between px-3 py-3 md:px-5 md:py-3.5 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 gap-2 transition-colors duration-300">
      <div className="flex items-center min-w-0 flex-1 gap-2.5">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-90 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Open sidebar"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <Avatar src={displayAvatar} name={displayName} isOnline={isOnline} isGroup={conversation?.isGroup} />

        <div className="truncate min-w-0">
          <h2 className="text-[15px] md:text-base font-bold text-gray-900 dark:text-white truncate leading-tight flex items-center gap-1.5">
            {displayName}
            {conversation?.isGroup && (
              <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md font-semibold uppercase tracking-tight flex-shrink-0">
                Group
              </span>
            )}
          </h2>
          {!conversation?.isGroup ? (
            <p className="text-xs font-medium flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <span className={isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {conversation?.participants?.length || 0} members
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onSearchToggle}
          className={`p-2 rounded-xl transition-all duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            showSearch ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label="Search messages"
        >
          <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {!conversation?.isGroup && otherParticipant && (
          <button
            onClick={onBlockToggle}
            className={`p-2 rounded-xl transition-all duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-400 ${
              blockStatus.hasBlocked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label={blockStatus.hasBlocked ? 'Unblock user' : 'Block user'}
            title={blockStatus.hasBlocked ? 'Unblock user' : 'Block user'}
          >
            <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {conversation?.isGroup && (
          <button
            onClick={onOpenInfo}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Group info"
            title="Group info"
          >
            <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

const SearchBar = memo(({ isOpen, onClose, onSearch, results, query }) => {
  const [searchQuery, setSearchQuery] = useState(query || '');
  const [searchResults, setSearchResults] = useState(results || []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) onSearch(searchQuery);
      else setSearchResults([]);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, onSearch]);

  if (!isOpen) return null;

  return (
    <div className="flex-shrink-0 px-4 py-3 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-10 shadow-sm transition-colors duration-300">
      <div className="relative max-w-2xl mx-auto">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          autoFocus
          type="text"
          placeholder="Search in messages…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-2.5 pl-10 pr-10 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-400/60 dark:focus:border-blue-500/40 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setSearchResults([]); onClose(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="mt-2 max-w-2xl mx-auto max-h-52 overflow-y-auto rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl custom-scrollbar divide-y divide-gray-50 dark:divide-gray-800">
          {searchResults.map((msg) => (
            <div
              key={msg._id}
              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
              onClick={() => onClose()}
            >
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">{msg.sender?.username}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{msg.content}</p>
            </div>
          ))}
        </div>
      )}

      {searchQuery.trim() && searchResults.length === 0 && (
        <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500 max-w-2xl mx-auto">No messages found</p>
      )}
    </div>
  );
});

const TypingIndicator = memo(({ typingUsers }) => {
  if (!typingUsers.length) return null;
  return (
    <div className="flex items-center gap-2 px-1 py-2 mt-1">
      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 italic">
        {typingUsers.length === 1
          ? `${typingUsers[0].username} is typing…`
          : 'Several people are typing…'}
      </span>
    </div>
  );
});

const ScrollToBottomButton = memo(({ visible, onClick }) => {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      className="absolute bottom-24 right-5 z-30 w-9 h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="Scroll to bottom"
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
});

const BlockBanner = memo(({ hasBlocked, isBlockedBy }) => {
  if (!hasBlocked && !isBlockedBy) return null;
  return (
    <div className="flex-shrink-0 px-4 py-2.5 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/20 transition-colors duration-300">
      <p className="text-[11px] text-center text-red-500 dark:text-red-400 font-semibold">
        {hasBlocked
          ? '🚫 You have blocked this user'
          : '⛔ This user has blocked you'}
      </p>
    </div>
  );
});

const MessageList = memo(({ messages, userId, isGroup, onEdit, onDelete, onAddReaction, typingUsers, hasMore, loadingMore, onLoadMore }) => {
  const messagesWithDateHeaders = useMemo(() => {
    const result = [];
    let lastDate = null;
    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt);
      const dateStr = msgDate.toDateString();
      if (dateStr !== lastDate) {
        result.push({ type: 'date', date: msgDate });
        lastDate = dateStr;
      }
      result.push({ type: 'message', message: msg });
    });
    return result;
  }, [messages]);

  return (
    <div className="flex flex-col gap-0.5 pb-2">
      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {loadingMore ? (
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {loadingMore ? 'Loading…' : 'Load older messages'}
          </button>
        </div>
      )}

      {messagesWithDateHeaders.map((item, index) =>
        item.type === 'date' ? (
          <div key={`date-${index}`} className="flex justify-center my-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-1 rounded-lg shadow-sm">
              {formatDateHeader(item.date)}
            </span>
          </div>
        ) : (
          <MessageBubble
            key={item.message._id}
            message={item.message}
            isOwn={item.message.sender?._id === userId}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddReaction={onAddReaction}
            showAvatar={isGroup && item.message.sender?._id !== userId}
          />
        )
      )}

      <TypingIndicator typingUsers={typingUsers} />
    </div>
  );
});

// --- Main Component ---
const ChatWindow = ({ conversationId, conversation, onOpenInfo, onOpenSidebar }) => {
  const [messages, setMessages] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [blockStatus, setBlockStatus] = useState({ hasBlocked: false, isBlockedBy: false });
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { socket, onlineUsers } = useSocket();
  const { user } = useAuth();
  const { darkMode } = useTheme();

  const otherParticipant = useMemo(() => conversation?.participants?.find(p => p.userId?._id !== user?._id), [conversation, user]);
  const otherUserId = otherParticipant?.userId?._id;
  const isOnline = otherUserId ? onlineUsers.includes(otherUserId) : false;

  // --- Fetch block status ---
  useEffect(() => {
    if (!otherUserId || conversation?.isGroup) return;
    let isMounted = true;
    getBlockStatus(otherUserId)
      .then(data => { if (isMounted) setBlockStatus(data); })
      .catch(e => console.error('Block status error:', e));
    return () => { isMounted = false; };
  }, [otherUserId, conversation?.isGroup]);

  // --- Fetch messages (initial load) ---
  const fetchMessages = useCallback(async (pageNum, isInitial = false) => {
    if (!conversationId) return;
    if (isInitial) setLoadingInitial(true);
    else setLoadingMore(true);
    try {
      const data = await getMessages(conversationId, pageNum);
      const newMessages = data.messages || [];
      if (isInitial) {
        setMessages(newMessages);
        setTimeout(() => scrollToBottom(), 100);
      } else {
        const container = messagesContainerRef.current;
        const oldScrollHeight = container?.scrollHeight || 0;
        setMessages(prev => [...newMessages, ...prev]);
        setTimeout(() => {
          if (container) container.scrollTop = container.scrollHeight - oldScrollHeight;
        }, 0);
      }
      setHasMore(data.totalPages ? pageNum < data.totalPages : false);
      setPage(pageNum);
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      if (isInitial) setLoadingInitial(false);
      else setLoadingMore(false);
    }
  }, [conversationId]);

  // Initial load & socket join
  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      fetchMessages(1, true);
      socket?.emit('join-conversation', conversationId);
      return () => socket?.emit('leave-conversation', conversationId);
    }
  }, [conversationId, socket, fetchMessages]);

  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Auto-scroll when near bottom
  useEffect(() => {
    if (!messages.length) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) setTimeout(() => scrollToBottom(true), 50);
  }, [messages]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distFromBottom > 300);
  }, []);

  // --- Socket event handlers (memoized) ---
  const handleNewMessage = useCallback((msg) => {
    if (String(msg.conversation) === String(conversationId)) {
      setMessages(prev => [...prev, msg]);
    }
  }, [conversationId]);

  const handleMessageUpdated = useCallback((updated) => {
    setMessages(prev => prev.map(m => (m._id === updated._id ? updated : m)));
  }, []);

  const handleMessagesRead = useCallback(({ userId, messageIds, conversationId: convId }) => {
    if (String(convId) !== String(conversationId)) return;
    setMessages(prev => prev.map(m =>
      messageIds.includes(m._id)
        ? { ...m, readBy: Array.from(new Set([...(m.readBy || []), userId])) }
        : m
    ));
  }, [conversationId]);

  const handleUserTyping = useCallback(({ userId, username }) => {
    if (userId === user?._id) return;
    setTypingUsers(prev => prev.some(u => u.userId === userId) ? prev : [...prev, { userId, username }]);
  }, [user]);

  const handleUserStoppedTyping = useCallback(({ userId }) => {
    setTypingUsers(prev => prev.filter(u => u.userId !== userId));
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', handleNewMessage);
    socket.on('message-updated', handleMessageUpdated);
    socket.on('messages-read', handleMessagesRead);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stopped-typing', handleUserStoppedTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-updated', handleMessageUpdated);
      socket.off('messages-read', handleMessagesRead);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stopped-typing', handleUserStoppedTyping);
    };
  }, [socket, handleNewMessage, handleMessageUpdated, handleMessagesRead, handleUserTyping, handleUserStoppedTyping]);

  // Mark messages as read
  useEffect(() => {
    if (!conversationId || !user?._id || !messages.length) return;
    const unread = messages.filter(
      m => m?.sender?._id !== user._id && !(m.readBy || []).includes(user._id)
    );
    if (!unread.length) return;
    markAsRead({ conversationId, messageIds: unread.map(m => m._id) }).catch(e => console.error('Mark read error:', e));
  }, [conversationId, user?._id, messages]);

  // --- Message actions ---
  const handleEdit = useCallback((id, content) => {
    socket?.emit('edit-message', { messageId: id, content });
  }, [socket]);

const handleDelete = useCallback((id) => {
  console.log('🟡 Delete clicked, ID:', id);
  console.log('🟡 Socket connected?', socket?.connected);
  socket?.emit('delete-message', { messageId: id });
}, [socket]);

  const handleAddReaction = useCallback((id, emoji) => {
    socket?.emit('add-reaction', { messageId: id, emoji });
  }, [socket]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) fetchMessages(page + 1);
  }, [fetchMessages, loadingMore, hasMore, page]);

  // --- Block handler ---
  const handleBlockToggle = useCallback(async () => {
    try {
      if (blockStatus.hasBlocked) {
        await unblockUser(otherUserId);
        setBlockStatus(prev => ({ ...prev, hasBlocked: false }));
      } else {
        await blockUser(otherUserId);
        setBlockStatus(prev => ({ ...prev, hasBlocked: true }));
      }
    } catch (e) {
      console.error('Block toggle error:', e);
    }
  }, [blockStatus.hasBlocked, otherUserId]);

  // --- Search handler ---
  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q);
    if (!q.trim() || !conversationId) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchMessages({ conversationId, q });
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  }, [conversationId]);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [showSearch]);

  // --- Skeleton colors ---
  const skeletonBase = darkMode ? '#1f2937' : '#f3f4f6';
  const skeletonHighlight = darkMode ? '#374151' : '#e5e7eb';

  // No conversation selected placeholder
  if (!conversationId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-8 text-center transition-colors duration-300">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
          <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-2.555-.337A5.945 5.945 0 015.41 20.97a.598.598 0 01-.784-.57l.028-1.488A5.913 5.913 0 012.13 16H2.13a5.94 5.94 0 01-.63-2.557C1.5 8.582 5.532 5 10.5 5S19.5 8.582 19.5 13z" />
          </svg>
        </div>
        <p className="font-bold text-gray-900 dark:text-white">No conversation selected</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Choose a chat from the sidebar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-screen bg-white dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <ChatHeader
        conversation={conversation}
        otherParticipant={otherParticipant}
        isOnline={isOnline}
        onOpenInfo={onOpenInfo}
        onOpenSidebar={onOpenSidebar}
        onBlockToggle={handleBlockToggle}
        blockStatus={blockStatus}
        onSearchToggle={toggleSearch}
        showSearch={showSearch}
      />

      <SearchBar
        isOpen={showSearch}
        onClose={toggleSearch}
        onSearch={handleSearch}
        results={searchResults}
        query={searchQuery}
      />

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 md:px-5 md:py-4 bg-gray-50 dark:bg-gray-950 custom-scrollbar transition-colors duration-300"
      >
        {loadingInitial ? (
          <div className="space-y-4 pt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton
                  width={i % 3 === 0 ? 220 : i % 3 === 1 ? 160 : 280}
                  height={52}
                  borderRadius={20}
                  baseColor={skeletonBase}
                  highlightColor={skeletonHighlight}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col min-h-full">
            <div className="flex-1" />
            <MessageList
              messages={messages}
              userId={user?._id}
              isGroup={conversation?.isGroup}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddReaction={handleAddReaction}
              typingUsers={typingUsers}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
            />
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>

      <ScrollToBottomButton visible={showScrollBtn} onClick={() => scrollToBottom(true)} />
      <BlockBanner hasBlocked={blockStatus.hasBlocked} isBlockedBy={blockStatus.isBlockedBy} />

      <div className="flex-shrink-0">
        <MessageInput
          conversationId={conversationId}
          onSend={(content, type, mediaUrl) => socket?.emit('send-message', { conversationId, content, type, mediaUrl })}
          disabled={blockStatus.hasBlocked || blockStatus.isBlockedBy}
        />
      </div>
    </div>
  );
};

export default ChatWindow;