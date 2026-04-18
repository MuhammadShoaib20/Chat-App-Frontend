import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import GroupInfoPanel from '../components/chat/GroupInfoPanel';
import { useSocket } from '../hooks/useSocket';

const ChatPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedConv, setSelectedConv] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { socket } = useSocket();

  const handleSelectConversation = (id, conv) => {
    setSelectedId(id);
    setSelectedConv(conv);
    setShowSidebar(false);
  };

  useEffect(() => {
    if (!socket || !selectedId) return;
    const onConversationUpdated = (conv) => {
      if (String(conv?._id) !== String(selectedId)) return;
      setSelectedConv((prev) => ({ ...(prev || {}), ...conv }));
    };
    socket.on('conversation-updated', onConversationUpdated);
    return () => socket.off('conversation-updated', onConversationUpdated);
  }, [socket, selectedId]);

  return (
    <div
      className="flex overflow-hidden relative transition-colors duration-300 bg-white dark:bg-gray-900"
      style={{ height: '100dvh' }}
    >
      {/* Mobile backdrop */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[45] lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 w-[300px] sm:w-80
          lg:static lg:z-auto lg:w-80 lg:flex-shrink-0
          bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800/50
          transition-transform duration-300 ease-in-out
          ${showSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800/50">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <span className="font-black text-base tracking-tight text-gray-900 dark:text-white">
              Sync<span className="text-blue-600">Chat</span>
            </span>
          </Link>
          <button
            onClick={() => setShowSidebar(false)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ConversationList */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-gray-900">
          <ConversationList
            selectedId={selectedId}
            onSelectConversation={handleSelectConversation}
          />
        </div>
      </aside>

      {/* Main content - Doodle Pattern Applied Here */}
      <main
        className={`flex-1 flex flex-col min-w-0 relative overflow-hidden transition-all duration-300 ${
          selectedId ? 'chat-bg chat-window-gradient' : 'bg-gray-50 dark:bg-[#0b141a]'
        }`}
        style={{ minHeight: 0 }}
      >
        {/* Mobile Toggle Button */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden fixed top-3.5 left-3.5 z-40 w-10 h-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-blue-600 dark:text-blue-400 active:scale-95 transition-all"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {selectedId ? (
          <ChatWindow
            conversationId={selectedId}
            conversation={selectedConv}
            onOpenInfo={() => setShowInfoPanel(true)}
            onOpenSidebar={() => setShowSidebar(true)}
          />
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent">
            <div className="w-20 h-20 mb-6 rounded-[1.8rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 animate-bounce-slow">
              <svg width="36" height="36" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25-9 3.694-9 8.25c0 1.618.504 3.12 1.365 4.365L3 20.25l4.365-1.365A8.947 8.947 0 0012 20.25z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sync Your Conversations</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              Select a chat to start messaging. Your privacy is our priority.
            </p>
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden mt-6 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg active:scale-95 transition-all"
            >
              Start Chatting
            </button>
          </div>
        )}
      </main>

      {/* Info Panel */}
      {showInfoPanel && selectedConv?.isGroup && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[55] lg:hidden" onClick={() => setShowInfoPanel(false)} />
          <aside className="fixed inset-y-0 right-0 z-[60] w-full sm:w-80 lg:w-96 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800/50 shadow-2xl overflow-y-auto custom-scrollbar">
            <GroupInfoPanel
              conversation={selectedConv}
              onClose={() => setShowInfoPanel(false)}
              onUpdate={setSelectedConv}
            />
          </aside>
        </>
      )}
    </div>
  );
};

export default ChatPage;