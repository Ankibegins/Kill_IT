import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold hover:text-blue-200">
              AnkiPlan
            </Link>
            {token && (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-blue-200 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/tasks"
                  className="hover:text-blue-200 transition-colors"
                >
                  Tasks
                </Link>
                <Link
                  to="/leaderboard"
                  className="hover:text-blue-200 transition-colors"
                >
                  Leaderboard
                </Link>
                <Link
                  to="/ai-coach"
                  className="hover:text-blue-200 transition-colors"
                >
                  AI Coach
                </Link>
              </>
            )}
          </div>
          {token && (
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



