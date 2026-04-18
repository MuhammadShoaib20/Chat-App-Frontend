import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { searchUsers } from '../../services/userService';

const GroupInfoPanel = ({ conversation, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState(conversation.participants || []);
  const [groupName, setGroupName] = useState(conversation.name || '');
  const [groupAvatar, setGroupAvatar] = useState(conversation.avatar || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const isAdmin = members.some(p => p.userId?._id === user?._id && p.role === 'admin');

  // Debounced user search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(searchTerm);
        const existingIds = members.map(m => m.userId?._id);
        setSearchResults(results.filter(u => !existingIds.includes(u._id)));
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, members]);

  // Update group info
  const handleUpdateGroup = async () => {
    try {
      setLoading(true);
      const { data } = await api.put(`/api/conversations/${conversation._id}`, {
        name: groupName,
        avatar: groupAvatar,
      });
      onUpdate(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add member
  const handleAddMember = async (userId) => {
    try {
      setLoading(true);
      const { data } = await api.post(`/api/conversations/${conversation._id}/participants`, {
        userIds: [userId],
      });
      setMembers(data.participants);
      setShowAddMember(false);
      setSearchTerm('');
      onUpdate(data);
    } catch (error) {
      console.error('Add member failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove member
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      setLoading(true);
      await api.delete(`/api/conversations/${conversation._id}/participants/${userId}`);
      const updated = members.filter(p => p.userId?._id !== userId);
      setMembers(updated);
      onUpdate({ ...conversation, participants: updated });
    } catch (error) {
      console.error('Remove member failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Leave group
  const handleLeaveGroup = async () => {
    if (!window.confirm('Leave this group?')) return;
    try {
      await api.delete(`/api/conversations/${conversation._id}/participants/${user._id}`);
      onClose();
      window.location.reload(); // or navigate away
    } catch (error) {
      console.error('Leave group failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[380px] bg-white dark:bg-gray-950 shadow-2xl overflow-hidden z-50 border-l border-gray-100 dark:border-gray-800 flex flex-col animate-in slide-in-from-right duration-300">
      {/* ── Header ── */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Group Info</h3>
          <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest mt-0.5">
            Settings & Members
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90"
          aria-label="Close panel"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* Group Identity */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-xl ring-4 ring-gray-50 dark:ring-gray-900 transition-transform group-hover:scale-[1.03] duration-300">
              {groupAvatar ? (
                <img
                  src={groupAvatar}
                  alt={groupName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white">
                  {groupName?.charAt(0).toUpperCase() || 'G'}
                </div>
              )}
            </div>
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 p-2 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all border border-gray-100 dark:border-gray-700"
                aria-label="Edit group"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="w-full space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 rounded-2xl text-gray-900 dark:text-white outline-none transition-all text-sm"
                placeholder="Group name"
              />
              <input
                type="text"
                value={groupAvatar}
                onChange={(e) => setGroupAvatar(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 rounded-2xl text-gray-900 dark:text-white outline-none transition-all text-xs"
                placeholder="Avatar image URL"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleUpdateGroup}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{groupName}</h4>
              {isAdmin && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                  Admin Access
                </span>
              )}
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-900 w-full" />

        {/* Members Section Header */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Members</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{members.length} people in this group</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                showAddMember
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              }`}
              aria-label={showAddMember ? 'Close search' : 'Add member'}
            >
              {showAddMember ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Add Member Search */}
        {showAddMember && (
          <div className="animate-in slide-in-from-top-2 duration-300 space-y-3">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              )}
              <input
                type="text"
                placeholder="Find a user to add..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-blue-500 rounded-2xl text-sm text-gray-900 dark:text-white outline-none transition-all"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-lg divide-y divide-gray-50 dark:divide-gray-800">
                {searchResults.map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{u.username}</p>
                        <p className="text-[10px] text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(u._id)}
                      className="px-3 py-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Member List */}
        <div className="space-y-0.5">
          {members.map((m) => (
            <div
              key={m.userId?._id}
              className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={m.userId?.avatar || '/default-avatar.png'}
                  alt=""
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white dark:ring-gray-950 shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.userId?.username || 'U')}&background=random&bold=true`;
                  }}
                />
                {m.role === 'admin' && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white dark:border-gray-950 flex items-center justify-center shadow-sm"
                    title="Admin"
                  >
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {m.userId?.username}
                  {m.userId?._id === user?._id && (
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(You)</span>
                  )}
                </p>
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                  {m.role === 'admin' ? 'Group Administrator' : 'Member'}
                </p>
              </div>

              {isAdmin && m.userId?._id !== user?._id && (
                <button
                  onClick={() => handleRemoveMember(m.userId?._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all transform hover:scale-110"
                  aria-label="Remove member"
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Leave Group Footer ── */}
      <div className="p-4 bg-gray-50/60 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleLeaveGroup}
          className="w-full py-3.5 px-4 bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 text-red-500 font-black uppercase tracking-[0.15em] text-[11px] rounded-2xl shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 group"
        >
          <svg
            className="group-hover:translate-x-0.5 transition-transform"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Leave Conversation
        </button>
      </div>
    </div>
  );
};

export default GroupInfoPanel;