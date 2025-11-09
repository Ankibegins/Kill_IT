import React, { useState, useEffect } from 'react';
import { getAllTimeLeaderboard, getGroupLeaderboard, getGroupsLeaderboard } from '../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('all-time'); // 'all-time' or 'group'
  const [groupId, setGroupId] = useState('');

  const fetchAllTimeLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await getAllTimeLeaderboard(100);
      setLeaderboard(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupsLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await getGroupsLeaderboard();
      setLeaderboard(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load group leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'all-time') {
      fetchAllTimeLeaderboard();
    } else {
      fetchGroupsLeaderboard();
    }
  }, [viewMode]);

  const renderAllTime = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leaderboard.map((entry, index) => (
            <tr key={entry.user_id} className={index < 3 ? 'bg-yellow-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{entry.total_points.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGroups = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leaderboard.map((entry, index) => (
            <tr key={entry.group_id} className={index < 3 ? 'bg-yellow-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.group_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{entry.total_points.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leaderboard</h1>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setViewMode('all-time')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            viewMode === 'all-time' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All-Time
        </button>
        <button
          onClick={() => setViewMode('group')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            viewMode === 'group' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Group Leaderboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}

      {viewMode === 'all-time' ? renderAllTime() : renderGroups()}
    </div>
  );
};

export default Leaderboard;

