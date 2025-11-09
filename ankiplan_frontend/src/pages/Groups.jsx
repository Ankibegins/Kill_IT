import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup, joinGroup, getCurrentUser, getGroup, leaveGroup } from '../services/api';
import Card from '../components/Card';

const Groups = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Form states (only shown when not in a group)
  const [groupName, setGroupName] = useState('');
  const [groupIdOrName, setGroupIdOrName] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  // Add member state
  const [newMemberId, setNewMemberId] = useState('');

  useEffect(() => {
    loadUserAndGroup();
  }, []);

  const loadUserAndGroup = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current user
      const userRes = await getCurrentUser();
      const currentUser = userRes.data;
      setUser(currentUser);
      
      // Check if user has groups
      const userGroupIds = currentUser.group_ids || [];
      if (userGroupIds.length > 0) {
        // Get the first group (or use stored groupId)
        const storedGroupId = localStorage.getItem('groupId');
        const activeGroupId = storedGroupId && userGroupIds.includes(storedGroupId) 
          ? storedGroupId 
          : userGroupIds[0];
        
        localStorage.setItem('groupId', activeGroupId);
        
        // Load group details
        const groupRes = await getGroup(activeGroupId);
        setGroup(groupRes.data.group);
      } else {
        setGroup(null);
      }
    } catch (err) {
      console.error('Failed to load user/group:', err);
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to load data';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setFormLoading(true);

    try {
      const DEFAULT_POOL = 1;
      const res = await createGroup(groupName.trim(), DEFAULT_POOL);
      const groupData = res.data;
      
      setMessage(`✅ Group created! Loading group details...`);
      setGroupName('');
      
      // Reload user and group data
      await loadUserAndGroup();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to create group';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setFormLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setFormLoading(true);

    try {
      const res = await joinGroup(groupIdOrName.trim());
      setMessage('✅ Joined group successfully! Loading group details...');
      setGroupIdOrName('');
      
      // Reload user and group data
      await loadUserAndGroup();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to join group';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setFormLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      setMessage('');
      setFormLoading(true);
      
      await leaveGroup();
      setMessage('✅ Left group successfully!');
      
      // Clear localStorage
      localStorage.removeItem('groupId');
      
      // Reload user and group data
      await loadUserAndGroup();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to leave group';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    try {
      setError('');
      setMessage('');
      setFormLoading(true);
      
      // Use join endpoint to add the member
      await joinGroup(group.id);
      
      // Actually, we need to add a different user. For now, let's use a prompt
      // In a real app, you'd have an endpoint like POST /groups/{group_id}/add-member
      const userIdToAdd = prompt('Enter the user ID to add to the group:');
      if (!userIdToAdd) {
        setFormLoading(false);
        return;
      }
      
      // Note: This requires the other user to join themselves, or we need a new endpoint
      // For now, we'll show a message that they need to share the group ID
      setMessage(`✅ Share this group ID with the user: ${group.id}`);
      setNewMemberId('');
      
      // Reload group to show updated members
      await loadUserAndGroup();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to add member';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setFormLoading(false);
    }
  };

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ User is in a group - show group management UI
  if (group) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Groups</h1>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-soft">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="text-sm">
                  {typeof error === 'string' ? error : JSON.stringify(error)}
                </span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-soft">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span className="text-sm">{message}</span>
              </div>
            </div>
          )}

          {/* Group Header */}
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  🔥 {group.group_name || 'My Group'}
                </h2>
                <p className="text-sm text-gray-500">
                  Group ID: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{group.id}</span>
                </p>
              </div>
              <button
                onClick={handleLeaveGroup}
                disabled={formLoading}
                className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {formLoading ? 'Leaving...' : 'Leave Group'}
              </button>
            </div>
          </Card>

          {/* Add Member Section */}
          <Card>
            <h3 className="font-semibold text-lg mb-4">➕ Add Member</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Share Group ID with new member"
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(group.id);
                  setMessage('✅ Group ID copied to clipboard! Share this with the user.');
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium"
              >
                Copy ID
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share the Group ID above with the user. They can join using the "Join Group" option.
            </p>
          </Card>

          {/* Members List */}
          <Card>
            <h3 className="font-semibold text-lg mb-4">🏆 Members Leaderboard</h3>
            {group.members_info && group.members_info.length > 0 ? (
              <div className="space-y-3">
                {group.members_info.map((member, index) => (
                  <div
                    key={member.user_id}
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getRankEmoji(index)}</span>
                      <div>
                        <span className="font-medium text-gray-800 block">
                          {member.username || member.email || 'Unknown User'}
                        </span>
                        {member.email && member.email !== member.username && (
                          <span className="text-xs text-gray-500">{member.email}</span>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {member.total_points || 0} XP
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No members in the group yet.
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // ❌ User is not in a group - show Create/Join UI
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Groups</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl shadow-soft">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="text-sm">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-soft">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Group Card */}
          <Card>
            <h2 className="font-semibold text-lg mb-4">🛠 Create Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="border border-gray-300 rounded-xl w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="bg-blue-500 text-white px-4 py-3 rounded-xl w-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {formLoading ? 'Creating...' : 'Create Group'}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Create your own group and invite friends to compete!
              </p>
            </form>
          </Card>

          {/* Join Group Card */}
          <Card>
            <h2 className="font-semibold text-lg mb-4">🤝 Join Group</h2>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter Group ID"
                  value={groupIdOrName}
                  onChange={(e) => setGroupIdOrName(e.target.value)}
                  className="border border-gray-300 rounded-xl w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={formLoading || !groupIdOrName.trim()}
                className="bg-green-500 text-white w-full py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {formLoading ? 'Joining...' : 'Join Group'}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Enter the Group ID shared by a group member.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Groups;
