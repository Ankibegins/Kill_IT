import axios from 'axios';

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const signup = (email, username, password) => {
  return API.post("/auth/signup", {
    email,
    username,
    password,
  });
};

export const login = (email, password) => {
  // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
  const params = new URLSearchParams();
  params.append('username', email); // OAuth2PasswordRequestForm uses 'username' field for email
  params.append('password', password);
  return API.post("/auth/login", params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// Task endpoints
export const getPriorityTasks = () => {
  return API.get("/tasks/priority_queue");
};

export const getAllTasks = (completedOnly = null, category = null) => {
  const params = {};
  if (completedOnly !== null) params.completed_only = completedOnly;
  if (category) params.category = category;
  return API.get("/tasks/", { params });
};

export const completeTask = (taskId) => {
  return API.post(`/tasks/${taskId}/complete`);
};

export const addTask = (title, category, priority, description = null, value = null) => {
  // Validate required fields
  if (!title || !title.trim()) {
    throw new Error('Title is required');
  }
  if (!category) {
    throw new Error('Category is required');
  }
  if (priority === null || priority === undefined) {
    throw new Error('Priority is required');
  }

  const formData = new FormData();
  
  // Ensure all values are strings (FormData requirement)
  const titleStr = String(title || '').trim();
  const categoryStr = String(category || 'daily');
  const priorityNum = Number(priority);
  const priorityStr = String(isNaN(priorityNum) ? 0 : priorityNum);
  
  formData.append('title', titleStr);
  formData.append('category', categoryStr);
  formData.append('priority', priorityStr);
  
  // Description - always append (backend expects Optional[str] = Form(None))
  const descStr = (description !== null && description !== undefined) ? String(description) : '';
  formData.append('description', descStr);
  
  // Calculate value if not provided: priority × 5, then multiply by category
  let calculatedValue = value;
  if (calculatedValue === null || calculatedValue === undefined) {
    const pr = priorityNum || 0;
    calculatedValue = pr * 5;
    if (category === 'weekly') {
      calculatedValue *= 2;
    } else if (category === 'monthly') {
      calculatedValue *= 3;
    }
  }
  formData.append('value', String(Number(calculatedValue) || 0));
  
  // Debug: Log what we're sending
  console.log('Sending FormData to /tasks/add:', {
    title: formData.get('title'),
    category: formData.get('category'),
    priority: formData.get('priority'),
    description: formData.get('description'),
    value: formData.get('value')
  });
  
  // Return with explicit config to ensure FormData is handled correctly
  return API.post("/tasks/add", formData, {
    headers: {
      // Don't set Content-Type - browser will set it with boundary
    },
    transformRequest: [(data) => data], // Don't transform FormData
  });
};

export const updateTask = (taskId, updates) => {
  const formData = new FormData();
  if (updates.title) formData.append('title', updates.title);
  if (updates.description !== undefined) {
    formData.append('description', updates.description || '');
  }
  if (updates.category) formData.append('category', updates.category);
  if (updates.priority !== undefined) formData.append('priority', updates.priority);
  // Note: Backend doesn't support updating value directly in PUT endpoint
  // Points are calculated when task is completed
  return API.put(`/tasks/${taskId}`, formData);
};

export const deleteTask = (taskId) => {
  return API.delete(`/tasks/${taskId}`);
};

// AI endpoints
export const getMotivation = () => {
  return API.get("/ai/motivate");
};

export const getMotivationByUserId = (userId) => {
  return API.get(`/ai/motivate/${userId}`);
};

export const getTaskSuggestion = () => {
  return API.get("/ai/suggest");
};

export const getTaskSuggestionByUserId = (userId) => {
  return API.get(`/ai/suggest/${userId}`);
};

// Leaderboard endpoints
export const getAllTimeLeaderboard = (limit = 100) => {
  return API.get("/leaderboard/all-time", { params: { limit } });
};

export const getGroupLeaderboard = (groupId) => {
  return API.get(`/leaderboard/${groupId}`);
};

export const getGroupsLeaderboard = () => {
  return API.get(`/leaderboard/groups`);
};

// --- Users endpoints ---
export const getCurrentUser = () => {
  return API.get("/users/me");
};

export const getUserProfile = (userId) => {
  return API.get(`/users/${userId}`);
};

// --- Groups endpoints ---
export const createGroup = (groupName, poolAmount = 0) => {
  return API.post("/groups/create", {
    group_name: groupName,
    pool_amount: poolAmount,
  });
};

export const joinGroup = (groupId) => {
  return API.post(`/groups/join/${groupId}`);
};

export const getGroup = (groupId) => {
  return API.get(`/groups/${groupId}`);
};

export const leaveGroup = () => {
  return API.post("/groups/leave");
};

export default API;

