// ConversationList.jsx (updated)
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations } from '../../services/conversationService';
import { useSocketEvent } from '../../hooks/useSocketEvents';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '../../services/api';
import toast from 'react-hot-toast';
import NewChatModal from './NewChatModal';

const ConversationList = ({ selectedId, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [mobileHeight, setMobileHeight] = useState(null);

  // Dynamically set container height on mobile to ensure scrolling works
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      setMobileHeight(null);
      return;
    }

    const updateHeight = () => {
      if (containerRef.current) {
        containerRef.current.style.height = `${window.innerHeight}px`;
        setMobileHeight(window.innerHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id) => {
    if (!window.confirm('Delete this conversation permanently?')) return;
    try {
      await api.delete(`/api/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  useSocketEvent('new-message', (message) => {
    const convId = message.conversation?.toString?.() ?? message.conversation;
    setConversations((prev) =>
      [...prev.map((conv) =>
        String(conv._id) === String(convId)
          ? { ...conv, lastMessage: message, updatedAt: new Date().toISOString() }
          : conv
      )].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  });

  useSocketEvent('conversation-updated', (conv) => {
    if (!conv?._id) return;
    setConversations((prev) => {
      const exists = prev.some((c) => String(c._id) === String(conv._id));
      const next = exists
        ? prev.map((c) => (String(c._id) === String(conv._id) ? { ...c, ...conv } : c))
        : [conv, ...prev];
      return [...next].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  });

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d`;
  };

  const filtered = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const otherParticipant = !conv.isGroup
      ? conv.participants?.find((p) => p.userId?._id !== user?._id)
      : null;
    const name = conv.isGroup
      ? conv.name
      : otherParticipant?.userId?.username || '';
    return name.toLowerCase().includes(q);
  });

  const skeletonBase = darkMode ? '#1f2937' : '#f3f4f6';
  const skeletonHighlight = darkMode ? '#374151' : '#e5e7eb';

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-1">
            <Skeleton circle width={48} height={48} baseColor={skeletonBase} highlightColor={skeletonHighlight} />
            <div className="flex-1 space-y-2">
              <Skeleton height={12} width="55%" baseColor={skeletonBase} highlightColor={skeletonHighlight} />
              <Skeleton height={10} width="38%" baseColor={skeletonBase} highlightColor={skeletonHighlight} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300"
      style={{
        height: mobileHeight ? `${mobileHeight}px` : '100%',
        minHeight: 0,
      }}
    >
      {/* Top: title + new chat button */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Messages</h2>
        <button
          onClick={() => setShowNewChat(true)}
          className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="New chat"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-2 pb-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400 dark:text-gray-600">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-2.555-.337A5.945 5.945 0 015.41 20.97a.598.598 0 01-.784-.57l.028-1.488A5.913 5.913 0 012.13 16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {search ? 'No results found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {search ? 'Try a different search' : 'Tap + to start chatting'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((conv) => {
              let displayName = conv.name;
              let avatar = conv.avatar;
              let isOnline = false;
              let otherParticipant = null;

              if (!conv.isGroup) {
                otherParticipant = conv.participants?.find((p) => p.userId?._id !== user?._id);
                if (otherParticipant) {
                  displayName = otherParticipant.userId?.username || 'User';
                  avatar = otherParticipant.userId?.avatar;
                  isOnline = onlineUsers.includes(otherParticipant.userId?._id);
                }
              }

              const isSelected = selectedId === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => onSelectConversation(conv._id, conv)}
                  className={`group relative flex items-center p-3 cursor-pointer rounded-2xl transition-all duration-150 active:scale-[0.99] ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/25'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900/60'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative mr-3 flex-shrink-0">
                    <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-white dark:ring-gray-950 shadow-sm">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'U')}&background=3b82f6&color=fff&bold=true`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-base font-black uppercase">
                          {displayName?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    {!conv.isGroup && isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5 gap-2">
                      <span className={`text-sm font-bold truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                        {displayName}
                        {conv.isGroup && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md font-semibold uppercase tracking-tight">
                            Group
                          </span>
                        )}
                      </span>
                      {conv.lastMessage && (
                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <p className={`text-xs truncate flex-1 ${isSelected ? 'text-blue-500/80 dark:text-blue-400/70' : 'text-gray-500 dark:text-gray-400'}`}>
                        {conv.lastMessage ? (
                          <>
                            {conv.lastMessage.sender?._id === user?._id && (
                              <span className="font-semibold">You: </span>
                            )}
                            {conv.lastMessage.content}
                          </>
                        ) : (
                          <span className="italic opacity-60">No messages yet</span>
                        )}
                      </p>
                      {/* Delete */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv._id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all duration-150 flex-shrink-0 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label="Delete conversation"
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0 ring-2 ring-white dark:ring-gray-950">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{user?.username}</p>
            <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              Active
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 active:scale-90 flex-shrink-0"
            aria-label="Logout"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onChatCreated={() => { setShowNewChat(false); fetchConversations(); }}
        />
      )}
    </div>
  );
};

export default ConversationList;