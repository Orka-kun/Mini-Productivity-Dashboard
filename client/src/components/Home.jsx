import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ toggleTheme, theme }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl mb-8">Welcome to Productivity Dashboard</h1>
      <div className="space-x-4">
        <Link to="/login">
          <button className="bg-blue-500 text-white p-2 rounded">Login</button>
        </Link>
        <Link to="/register">
          <button className="bg-green-500 text-white p-2 rounded">Register</button>
        </Link>
        <button
          onClick={toggleTheme}
          className="bg-gray-500 text-white p-2 rounded"
        >
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
    </div>
  );
};

export default Home;