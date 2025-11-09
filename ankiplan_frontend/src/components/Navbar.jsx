import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('groupId');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/my-group" className="font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors">
            Kill It ⚡
          </Link>
          {token ? (
            <div className="flex gap-6 items-center">
              <Link
                to="/my-group"
                className={`font-medium transition-colors ${
                  location.pathname === '/my-group'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-500'
                }`}
              >
                My Group
              </Link>
              <Link
                to="/groups"
                className={`font-medium transition-colors ${
                  location.pathname === '/groups'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-500'
                }`}
              >
                Groups
              </Link>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="font-medium text-gray-700 hover:text-blue-500 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
