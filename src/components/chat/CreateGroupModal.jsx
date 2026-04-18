import { useState, useEffect } from 'react';
import { searchUsers } from '../../services/userService';
import { createConversation } from '../../services/conversationService';

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) { setUsers([]); setSearching(false); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(searchTerm);
        setUsers(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectUser = (user) => {
    if (!selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchTerm('');
    }
  };

  const handleRemoveUser = (userId) => setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) return;
    setLoading(true);
    try {
      const newGroup = await createConversation({
        participantIds: selectedUsers.map((u) => u._id),
        isGroup: true,
        name: groupName,
      });
      onGroupCreated(newGroup);
      onClose();
    } catch (err) {
      console.error('Create group error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-t-[2rem] sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Group</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Start a new group conversation</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* Group name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 block ml-1">Group Name</label>
            <input
              type="text"
              autoFocus
              placeholder="Enter group name…"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input-base"
            />
          </div>

          {/* Member search */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 block ml-1">Add Members</label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" /></svg>
              <input
                type="text"
                placeholder="Find people…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-10 pr-10"
              />
              {searching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
              )}
            </div>
          </div>

          {/* Search results */}
          {users.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.username}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-300 dark:text-gray-600 flex-shrink-0" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" /></svg>
                </button>
              ))}
            </div>
          )}

          {/* Selected chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <span
                  key={user._id}
                  className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl pl-3 pr-2 py-1.5 text-xs font-semibold border border-blue-100 dark:border-blue-800/40"
                >
                  {user.username}
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user._id)}
                    className="w-4 h-4 rounded-lg bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-150"
                  >
                    <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all duration-200">Cancel</button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading || !groupName.trim() || selectedUsers.length < 1}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;