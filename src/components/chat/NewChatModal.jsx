import { useState, useRef } from 'react';
import { searchUsers } from '../../services/userService';
import { createConversation } from '../../services/conversationService';
import { uploadFile } from '../../services/uploadService';
import { useAuth } from '../../hooks/useAuth';

const NewChatModal = ({ onClose, onChatCreated }) => {
  const [mode, setMode] = useState('chat');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length < 2) { setUsers([]); return; }
    setLoading(true);
    try {
      const results = await searchUsers(term);
      setUsers(results.filter((u) => u._id !== user._id));
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectUser = (targetUser) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u._id === targetUser._id);
      return exists ? prev.filter((u) => u._id !== targetUser._id) : [...prev, targetUser];
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      setGroupAvatar(url);
    } catch {
      alert('Avatar upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const startChat = async () => {
    setCreating(true);
    try {
      if (mode === 'chat' && selectedUsers.length === 1) {
        const conv = await createConversation({ participantIds: [selectedUsers[0]._id], isGroup: false });
        onChatCreated(conv);
      } else if (mode === 'group' && groupName.trim() && selectedUsers.length >= 1) {
        const conv = await createConversation({
          participantIds: selectedUsers.map((u) => u._id),
          isGroup: true,
          name: groupName,
          avatar: groupAvatar || '',
        });
        onChatCreated(conv);
      }
      onClose();
    } catch (err) {
      console.error('Create error:', err);
    } finally {
      setCreating(false);
    }
  };

  const confirmDisabled =
    creating ||
    (mode === 'chat' && selectedUsers.length !== 1) ||
    (mode === 'group' && (!groupName.trim() || selectedUsers.length === 0)) ||
    uploading;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px] flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-t-[2rem] sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {mode === 'chat' ? 'New Message' : 'Create Group'}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {mode === 'chat' ? 'Start a direct conversation' : 'Set up a group chat'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 active:scale-90"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Mode toggle */}
        <div className="px-5 pt-4 flex-shrink-0">
          <div className="relative flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <button
              onClick={() => setMode('chat')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 z-10 relative ${mode === 'chat' ? 'text-blue-600 dark:text-white' : 'text-gray-400'}`}
            >
              Direct
            </button>
            <button
              onClick={() => setMode('group')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 z-10 relative ${mode === 'group' ? 'text-blue-600 dark:text-white' : 'text-gray-400'}`}
            >
              Group
            </button>
            <div className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white dark:bg-gray-700 shadow rounded-xl transition-transform duration-300 ${mode === 'group' ? 'translate-x-full' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar space-y-4">

          {/* Group-only */}
          {mode === 'group' && (
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-blue-50 dark:bg-gray-800 border-2 border-dashed border-blue-200 dark:border-gray-700 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 active:scale-95"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Group" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-400 dark:text-gray-500">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" /></svg>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-blue-600/50 flex items-center justify-center">
                      <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    </div>
                  )}
                </button>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-2">Group photo</p>
              </div>
              {/* Group name */}
              <input
                type="text"
                placeholder="Group name…"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="input-base"
              />
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" /></svg>
            <input
              type="text"
              placeholder="Search by username…"
              value={searchTerm}
              onChange={handleSearch}
              className="input-base pl-10 pr-10"
            />
            {loading && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <svg className="animate-spin w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-1">
            {users.length === 0 && searchTerm.length >= 2 && !loading && (
              <p className="text-center text-sm text-gray-400 py-8">No users found</p>
            )}
            {users.map((u) => {
              const isSelected = selectedUsers.some((s) => s._id === u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => toggleSelectUser(u)}
                  className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-150 active:scale-[0.98] border-2 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400/40' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="relative mr-3">
                    <img
                      src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || 'U')}&background=3b82f6&color=fff&bold=true`}
                      alt={u.username}
                      className={`w-10 h-10 rounded-2xl object-cover ring-2 transition-all ${isSelected ? 'ring-blue-200 dark:ring-blue-800' : 'ring-gray-100 dark:ring-gray-800'}`}
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || 'U')}&background=3b82f6&color=fff&bold=true`; }}
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                        <svg width="9" height="9" fill="none" stroke="white" strokeWidth="3.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{u.username}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={startChat}
            disabled={confirmDisabled}
            className="flex-[1.5] py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              mode === 'chat' ? 'Start Chat' : 'Create Group'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;