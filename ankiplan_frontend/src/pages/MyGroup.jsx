import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroupLeaderboard, getAllTasks, completeTask, deleteTask, getMotivationByUserId, addTask, updateTask, getCurrentUser, getGroup } from '../services/api';
import Card from '../components/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import SimpleTaskCard from '../components/SimpleTaskCard';
import TaskFormModal from '../components/TaskFormModal';

const MyGroup = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [motivation, setMotivation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupId, setGroupId] = useState(null);
  const [groupName, setGroupName] = useState('Loading...');
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalCategory, setModalCategory] = useState('daily');
  const [editingTask, setEditingTask] = useState(null);

  // Filter tasks by category (show incomplete tasks in tabs)
  // For specific-day tasks, check if description contains "Due:" 
  const dailyTasks = tasks.filter(t => {
    const isDaily = t.category === 'daily';
    const hasDateInDesc = t.description && t.description.includes('Due:');
    // Daily tasks without dates in description (exclude specific-day tasks)
    return isDaily && !hasDateInDesc && t.status !== 'completed';
  });
  
  const weeklyTasks = tasks.filter(t => t.category === 'weekly' && t.status !== 'completed');
  const monthlyTasks = tasks.filter(t => t.category === 'monthly' && t.status !== 'completed');
  
  // Separate specific-day tasks (those with dates in description)
  const specificDayTasks = tasks.filter(t => {
    const hasDate = t.description && t.description.includes('Due:');
    return hasDate && t.status !== 'completed';
  });

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array - only run on mount

  // Also update group name when group state changes
  useEffect(() => {
    if (group && group.group_name) {
      setGroupName(`🔥 ${group.group_name}`);
    }
  }, [group]);

  const fetchData = async () => {
    let mounted = true;
    try {
      setLoading(true);
      setError('');
      
      // Step 1: Get current user profile
      let currentUser;
      try {
        const userRes = await getCurrentUser();
        if (!mounted) return;
        currentUser = userRes.data;
        setUser(currentUser);
        console.log('Current user:', currentUser);
      } catch (err) {
        console.error('Failed to load user:', err);
        if (err.response?.status === 401) {
          // Not authenticated, redirect to login
          navigate('/login', { replace: true });
          return;
        }
        throw err;
      }
      
      // Step 2: Check if user has any groups
      const userGroupIds = currentUser.group_ids || [];
      if (!userGroupIds || userGroupIds.length === 0) {
        // User has no groups - redirect to /groups
        console.log('User has no groups, redirecting to /groups');
        navigate('/groups', { replace: true });
        return;
      }
      
      // Step 3: Get the first group (or use stored groupId)
      const storedGroupId = localStorage.getItem('groupId');
      let activeGroupId = storedGroupId || userGroupIds[0];
      
      // Verify the groupId is in user's group_ids
      if (!userGroupIds.includes(activeGroupId)) {
        activeGroupId = userGroupIds[0];
        localStorage.setItem('groupId', activeGroupId);
      }
      
      setGroupId(activeGroupId);
      
      // Step 4: Fetch group details and leaderboard in parallel
      try {
        const [groupRes, leaderboardRes] = await Promise.all([
          getGroup(activeGroupId),
          getGroupLeaderboard(activeGroupId)
        ]);
        
        if (!mounted) return;
        
        // Set group data
        const groupData = groupRes.data;
        setGroup(groupData);
        console.log('Group data received:', groupData);
        
        // Set leaderboard data
        const lbData = leaderboardRes.data;
        console.log('Leaderboard data received:', lbData);
        
        // Update group name - try group data first, then leaderboard data as fallback
        let name = groupData.group_name || groupData.name || groupData.groupName;
        if (!name && lbData) {
          name = lbData.group_name || lbData.name;
        }
        
        if (name) {
          setGroupName(`🔥 ${name}`);
          console.log('Group name set to:', name);
        } else {
          console.warn('No group name found in either response. Group:', groupData, 'Leaderboard:', lbData);
          // Fallback: use a generic name
          setGroupName(`🔥 My Group`);
        }
        
        // Set leaderboard rankings
        if (lbData && lbData.rankings) {
          setLeaderboard(lbData.rankings);
        } else if (Array.isArray(lbData)) {
          setLeaderboard(lbData);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        console.error('Failed to load group/leaderboard:', err);
        console.error('Error details:', err.response?.data);
        if (err.response?.status === 404) {
          setError('Group not found. Please join or create a group.');
          // Redirect to groups after 3 seconds
          setTimeout(() => {
            navigate('/groups', { replace: true });
          }, 3000);
        } else {
          const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to load group data. Please try again.';
          setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        }
      }

      // Step 5: Fetch tasks (only if we have a group)
      if (activeGroupId && mounted) {
        try {
          const tasksRes = await getAllTasks(false, null); // Get all incomplete tasks
          if (mounted) {
            console.log('Fetched tasks:', tasksRes.data);
            setTasks(tasksRes.data || []);
          }
        } catch (err) {
          console.error('Failed to load tasks:', err);
          if (mounted) {
            setTasks([]);
          }
        }
      }

      // Step 6: Fetch motivation
      if (currentUser && currentUser.id && mounted) {
        try {
          const motivationRes = await getMotivationByUserId(currentUser.id);
          if (mounted) {
            setMotivation(motivationRes.data?.message || 'Stay focused and kill your goals! 💪');
          }
        } catch (err) {
          console.error('Failed to load motivation:', err);
          if (mounted) {
            setMotivation('Stay focused and kill your goals! 💪');
          }
        }
      }
    } catch (err) {
      console.error('MyGroup load error:', err);
      if (mounted) {
        const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to load data';
        setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
    
    return () => { mounted = false; };
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      // Refresh both tasks and leaderboard to show updated points
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        await fetchData();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete task');
      }
    }
  };

  const handleAddTask = (category) => {
    setModalCategory(category);
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setModalCategory(task.category);
    setShowModal(true);
  };

  const handleSaveTask = async (taskData, taskId = null) => {
    try {
      setError('');
      
      // Validation
      if (!taskData.title || taskData.title.trim().length < 2) {
        setError('Task title must be at least 2 characters.');
        return;
      }
      
      const pr = Number(taskData.priority);
      if (Number.isNaN(pr) || pr < 0 || pr > 10) {
        setError('Priority must be a number between 0 and 10.');
        return;
      }

      console.log('Saving task:', taskData);
      
      // Ensure all required fields are present and valid
      if (!taskData.title || !taskData.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!taskData.category) {
        setError('Category is required');
        return;
      }
      if (taskData.priority === undefined || taskData.priority === null) {
        setError('Priority is required');
        return;
      }
      
      if (taskId) {
        // Update existing task
        await updateTask(taskId, taskData);
      } else {
        // Create new task - ensure priority is a number
        const priorityNum = Number(taskData.priority);
        if (isNaN(priorityNum)) {
          setError('Priority must be a valid number');
          return;
        }
        
        console.log('Calling addTask with:', {
          title: taskData.title,
          category: taskData.category,
          priority: priorityNum,
          description: taskData.description,
          value: taskData.value
        });
        
        await addTask(
          taskData.title,
          taskData.category,
          priorityNum,
          taskData.description || null,
          taskData.value || null
        );
      }
      
      console.log('Task saved successfully');
      setShowModal(false);
      setEditingTask(null);
      setError(''); // Clear any previous errors
      await fetchData();
    } catch (err) {
      console.error('SaveTaskError:', err);
      
      // Safely extract error message
      let userMessage = `Failed to ${taskId ? 'update' : 'create'} task.`;
      
      if (err?.response?.data) {
        const d = err.response.data;
        if (typeof d === 'string') {
          userMessage = d;
        } else if (d.detail) {
          // FastAPI validation errors can be objects or strings
          if (typeof d.detail === 'string') {
            userMessage = d.detail;
          } else if (Array.isArray(d.detail)) {
            // Validation error array: [{type, loc, msg, input}]
            userMessage = d.detail.map(e => e.msg || JSON.stringify(e)).join('; ');
          } else if (typeof d.detail === 'object') {
            userMessage = JSON.stringify(d.detail);
          }
        } else if (d.message) {
          userMessage = d.message;
        } else if (d.errors) {
          if (Array.isArray(d.errors)) {
            userMessage = d.errors.map(e => e.msg || JSON.stringify(e)).join('; ');
          } else {
            userMessage = Object.values(d.errors).flat().map(v => v.msg || v).join('; ');
          }
        }
      } else if (err.message) {
        userMessage = err.message;
      }
      
      setError(userMessage);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
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
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded-xl"></div>
              <div className="h-16 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Message - Subtle notification */}
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

        {/* Tasks Section */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">My Tasks</h2>
          </div>
          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="specific">Specific Day</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-3">
              <button
                onClick={() => handleAddTask('daily')}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium mb-4"
              >
                + Add Daily Task
              </button>
              {dailyTasks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No daily tasks. Create one to get started!
                </div>
              ) : (
                dailyTasks.map((task) => (
                  <SimpleTaskCard
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    points={task.value || 10}
                    priority={task.priority}
                    completed={task.status === 'completed'}
                    onMarkDone={() => handleCompleteTask(task.id)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="weekly" className="space-y-3">
              <button
                onClick={() => handleAddTask('weekly')}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium mb-4"
              >
                + Add Weekly Task
              </button>
              {weeklyTasks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No weekly tasks. Create one to get started!
                </div>
              ) : (
                weeklyTasks.map((task) => (
                  <SimpleTaskCard
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    points={task.value || 10}
                    priority={task.priority}
                    completed={task.status === 'completed'}
                    onMarkDone={() => handleCompleteTask(task.id)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="monthly" className="space-y-3">
              <button
                onClick={() => handleAddTask('monthly')}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium mb-4"
              >
                + Add Monthly Task
              </button>
              {monthlyTasks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No monthly tasks. Create one to get started!
                </div>
              ) : (
                monthlyTasks.map((task) => (
                  <SimpleTaskCard
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    points={task.value || 10}
                    priority={task.priority}
                    completed={task.status === 'completed'}
                    onMarkDone={() => handleCompleteTask(task.id)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="specific" className="space-y-3">
              <button
                onClick={() => handleAddTask('specific')}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium mb-4"
              >
                + Add Specific Day Task
              </button>
              {specificDayTasks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No specific-day tasks. Create one to get started!
                </div>
              ) : (
                specificDayTasks.map((task) => (
                  <SimpleTaskCard
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    points={task.value || 10}
                    priority={task.priority}
                    completed={task.status === 'completed'}
                    onMarkDone={() => handleCompleteTask(task.id)}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Leaderboard Section */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{groupName}</h2>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">🏆 Leaderboard</h3>
          <div className="space-y-3">
            {leaderboard.map((member, index) => (
              <div
                key={member.user_id || member.id || index}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRankEmoji(index)}</span>
                  <span className="font-medium text-gray-800">{member.username || member.name || 'Unknown'}</span>
                </div>
                <span className="font-semibold text-blue-600">
                  {(member.total_points !== undefined && member.total_points !== null) 
                    ? member.total_points 
                    : (member.points !== undefined && member.points !== null) 
                      ? member.points 
                      : 0} XP
                </span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No members in the leaderboard yet.
              </div>
            )}
          </div>
        </Card>

        {/* AI Motivation Banner */}
        <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 text-white p-6 rounded-2xl shadow-medium">
          <h3 className="font-semibold text-lg mb-2">💪 Daily Motivation</h3>
          <p className="italic text-white/90">{motivation || 'Loading motivation...'}</p>
        </div>

        {/* Task Form Modal */}
        <TaskFormModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          category={modalCategory}
          task={editingTask}
        />
      </div>
    </div>
  );
};

export default MyGroup;

