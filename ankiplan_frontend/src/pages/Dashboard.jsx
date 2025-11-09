import React, { useState, useEffect } from 'react';
import { getPriorityTasks, getMotivation, completeTask, deleteTask, createGroup, joinGroup } from '../services/api';
import TaskCard from '../components/TaskCard';
import MotivationCard from '../components/MotivationCard';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [motivation, setMotivation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Groups UI state
  const [groupName, setGroupName] = useState('');
  const [groupIdToJoin, setGroupIdToJoin] = useState('');
  const [groupMessage, setGroupMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, motivationResponse] = await Promise.all([
        getPriorityTasks(),
        getMotivation(),
      ]);
      setTasks(tasksResponse.data);
      setMotivation(motivationResponse.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setGroupMessage('');
    try {
      const DEFAULT_POOL = 1; // backend enforces min 1, max 10
      const res = await createGroup(groupName.trim(), DEFAULT_POOL);
      setGroupMessage(`Group created! Share this ID with friends: ${res.data.id || res.data.group_id || 'created'}`);
      setGroupName('');
    } catch (err) {
      setGroupMessage(err.response?.data?.detail || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setGroupMessage('');
    try {
      await joinGroup(groupIdToJoin.trim());
      setGroupMessage('Joined group successfully!');
      setGroupIdToJoin('');
    } catch (err) {
      setGroupMessage(err.response?.data?.detail || 'Failed to join group');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      await fetchData(); // Refresh tasks
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        await fetchData(); // Refresh tasks
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete task');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Groups: Create / Join (first-time setup) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <form onSubmit={handleCreateGroup} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create Group</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="My Friends"
              />
            </div>
            <p className="text-xs text-gray-500">Pool is fixed between 1–10 for all new groups.</p>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>

        <form onSubmit={handleJoinGroup} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Join Group</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group ID</label>
              <input
                type="text"
                required
                value={groupIdToJoin}
                onChange={(e) => setGroupIdToJoin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste group id"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Join Group
            </button>
          </div>
        </form>
      </div>

      {groupMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-6">{groupMessage}</div>
      )}

      <div className="mb-8">
        <MotivationCard message={motivation} />
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Priority Tasks</h2>
        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No tasks in your priority queue!</p>
            <p className="text-gray-400 mt-2">Create a new task to get started.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

