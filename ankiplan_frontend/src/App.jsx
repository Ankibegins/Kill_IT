import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import MyGroup from './pages/MyGroup';
import Groups from './pages/Groups';
import Login from './pages/Login';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/my-group"
          element={
            <ProtectedRoute>
              <MyGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/my-group" replace />} />
        {/* Redirect old routes to new ones */}
        <Route path="/dashboard" element={<Navigate to="/my-group" replace />} />
        <Route path="/tasks" element={<Navigate to="/my-group" replace />} />
        <Route path="/leaderboard" element={<Navigate to="/my-group" replace />} />
        <Route path="/ai-coach" element={<Navigate to="/my-group" replace />} />
      </Routes>
    </div>
  );
}

export default App;
