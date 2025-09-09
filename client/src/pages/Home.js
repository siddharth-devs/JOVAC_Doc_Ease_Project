import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to DocEase
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Book doctor appointments online with ease. Find qualified doctors, 
            schedule appointments, and manage your healthcare needs all in one place.
          </p>
          
          {user ? (
            <div className="space-x-4">
              <Link
                to="/dashboard"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
              {user.role === 'patient' && (
                <Link
                  to="/doctors"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Find Doctors
                </Link>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
     

        {/* CTA Section */}
        {!user && (
          <div className="bg-purple-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6">
              Join thousands of patients who trust DocEase for their healthcare needs.
            </p>
            <Link
              to="/register"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Your Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
