import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-purple-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          DocEase
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span>Welcome, {user.name} ({user.role})</span>
              <Link to="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              {user.role === 'patient' && (
                <Link to="/doctors" className="hover:underline">
                  Find Doctors
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
