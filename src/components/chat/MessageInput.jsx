import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { uploadFile } from '../../services/uploadService';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const MessageInput = ({ onSend, conversationId, disabled }) => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket } = useSocket();
  const { darkMode } = useTheme();

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket?.emit('typing-stop', { conversationId });
    };
  }, [conversationId, socket]);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    adjustHeight();
    if (!conversationId || disabled) return;
    socket?.emit('typing-start', { conversationId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing-stop', { conversationId });
    }, 2000);
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    setTimeout(adjustHeight, 0);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;
    setUploading(true);
    try {
      const { url, originalName } = await uploadFile(file);
      const isImage = file.type.startsWith('image/');
      onSend(isImage ? '🖼️ Image' : `📎 ${originalName}`, isImage ? 'image' : 'file', url);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message.trim() && conversationId && !disabled) {
      onSend(message.trim(), 'text', '');
      setMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      setShowEmojiPicker(false);
      socket?.emit('typing-stop', { conversationId });
    }
  };

  const canSend = message.trim().length > 0 && !uploading && !disabled;

  return (
    <div className="relative px-3 py-3 md:px-4 md:py-3.5 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
          <div className="absolute bottom-full left-3 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme={darkMode ? 'dark' : 'light'}
              previewPosition="none"
            />
          </div>
        </>
      )}

      <div className={`flex items-end gap-2 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 border rounded-[1.5rem] px-2 py-1.5 transition-all duration-200 ${
        isFocused
          ? 'border-blue-400/60 dark:border-blue-500/40 shadow-lg shadow-blue-500/5 bg-white dark:bg-gray-900'
          : 'border-gray-200 dark:border-gray-800'
      }`}>

        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2 rounded-xl transition-all duration-200 flex-shrink-0 ${showEmojiPicker ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
          aria-label="Emoji"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={disabled ? 'Select a conversation…' : 'Type a message…'}
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none outline-none text-[15px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-2 px-1 min-h-[40px] max-h-36 custom-scrollbar disabled:cursor-not-allowed"
        />

        {/* File attach */}
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || disabled}
          className="p-2 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 flex-shrink-0 disabled:opacity-40"
          aria-label="Attach file"
        >
          {uploading ? (
            <svg className="animate-spin w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          className={`w-9 h-9 flex items-center justify-center rounded-[0.85rem] flex-shrink-0 transition-all duration-200 ${
            canSend
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-90'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Send"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={canSend ? 'translate-x-0.5' : ''}>
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;