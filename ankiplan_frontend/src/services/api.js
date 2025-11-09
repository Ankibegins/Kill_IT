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

export const addTask = (title, category, priority, description = null, value = 10) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', category);
  formData.append('priority', priority);
  if (description) formData.append('description', description);
  formData.append('value', value);
  return API.post("/tasks/add", formData);
};

export const updateTask = (taskId, updates) => {
  const formData = new FormData();
  if (updates.title) formData.append('title', updates.title);
  if (updates.description !== undefined) formData.append('description', updates.description);
  if (updates.category) formData.append('category', updates.category);
  if (updates.priority !== undefined) formData.append('priority', updates.priority);
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

export default API;

