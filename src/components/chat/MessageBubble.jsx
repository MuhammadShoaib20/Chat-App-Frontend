import { useState, useMemo, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import MessageActions from './MessageActions';

const MessageBubble = memo(({ message, isOwn, onEdit, onDelete, onAddReaction, showAvatar }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Media URL ko ek jagah nikal lein
  const mediaUrl = message.fileUrl || message.mediaUrl;

  const reactionCounts = useMemo(() => {
    return message.reactions?.reduce((acc, { emoji }) => {
      acc[emoji] = (acc[emoji] || 0) + 1;
      return acc;
    }, {}) || {};
  }, [message.reactions]);

  const handleEditSave = (newText) => {
    if (newText.trim() && newText !== message.content) {
      onEdit(message._id, newText);
    }
    setIsEditing(false);
  };

  // Improved detection logic
  const isImage = message.messageType === 'image' || 
                  message.type === 'image' || 
                  (mediaUrl && mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i));

  const isFile = message.messageType === 'file' || 
                 message.type === 'file' || 
                 (mediaUrl && !isImage);

  return (
    <div className={`flex w-full mb-4 animate-fadeIn ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        
        {showAvatar && message.sender?.username && !isOwn && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 ml-2">
            {message.sender.username}
          </span>
        )}

        <MessageActions 
          message={message} // Bohat zaroori: download/share ke liye
          isOwn={isOwn} 
          onEdit={() => setIsEditing(true)} 
          onDelete={() => onDelete(message._id)} 
          onReaction={(emoji) => onAddReaction(message._id, emoji)}
        >
          <div className={`relative px-4 py-2 rounded-[1.2rem] shadow-sm transition-all duration-150 ${
            isOwn 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white dark:bg-[#2a2f35] text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700/50'
          }`}>
            
            {isEditing ? (
              <textarea 
                autoFocus
                className="w-full bg-black/10 rounded-lg p-2 text-sm outline-none resize-none border border-white/20 text-inherit"
                defaultValue={message.content}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) handleEditSave(e.target.value);
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                onBlur={(e) => handleEditSave(e.target.value)}
              />
            ) : (
              <div className="space-y-1 py-1">
                {/* Image Rendering */}
                {isImage ? (
                  <div className="pt-0.5">
                    <img 
                      src={mediaUrl} 
                      alt="Shared attachment" 
                      className="rounded-lg max-h-72 w-full object-contain cursor-pointer hover:opacity-95 transition-all shadow-sm"
                      onClick={() => window.open(mediaUrl, '_blank')}
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://placehold.co/400x300?text=Image+Not+Found"; 
                      }}
                    />
                    {message.content && !message.content.includes('🖼️') && (
                      <p className="mt-2 text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>
                ) : 
                /* File Rendering */
                isFile ? (
                  <a 
                    href={mediaUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-2 my-1 bg-black/5 dark:bg-black/20 rounded-xl hover:bg-black/10 transition-all border border-black/5 dark:border-gray-700/50 group/file"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover/file:scale-105 transition-transform">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className={`text-sm font-semibold truncate ${isOwn ? 'text-white' : 'text-inherit'}`}>
                        {message.fileOriginalName || message.content?.replace('📎 ', '') || 'Attachment'}
                      </span>
                      <span className="text-[10px] opacity-70 uppercase font-black text-blue-100 group-hover/file:text-white transition-colors">Download</span>
                    </div>
                  </a>
                ) : (
                  /* Standard Text */
                  <p className="text-[14.5px] font-medium break-words whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                )}
              </div>
            )}

            <div className={`flex items-center gap-1.5 mt-1 text-[9px] font-bold opacity-60 ${isOwn ? 'justify-end text-blue-100' : 'justify-start'}`}>
              <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
              {message.edited && <span>· edited</span>}
              {isOwn && (
                <span className={message.readBy?.length ? 'text-blue-100' : 'text-white/40'}>
                  {message.readBy?.length ? '✓✓' : '✓'}
                </span>
              )}
            </div>
          </div>
        </MessageActions>

        {/* Reactions List */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className={`flex flex-wrap gap-1 -mt-3 z-10 ${isOwn ? 'mr-3' : 'ml-3'}`}>
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <button key={emoji} onClick={() => onAddReaction(message._id, emoji)} className="flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-full text-xs shadow-sm hover:scale-110 active:scale-95 transition-all">
                <span className="leading-none text-sm">{emoji}</span>
                {count > 1 && <span className="font-bold text-[9px] opacity-70 ml-0.5">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;