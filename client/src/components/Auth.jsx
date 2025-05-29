import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setUsername, isLogin = true }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setLocalUsername] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/${endpoint}`, {
        email,
        password,
        username: isLogin ? undefined : username,
      });

      if (isLogin) {
        // For login, set the token and username, then redirect to dashboard
        localStorage.setItem('token', response.data.token);
        setUsername(response.data.username || username);
        setError(null);
        setEmail('');
        setPassword('');
        setLocalUsername('');
        navigate('/dashboard');
      } else {
        // For registration, redirect to login 
        setError(null);
        setEmail('');
        setPassword('');
        setLocalUsername('');
        navigate('/login', { state: { registrationSuccess: true } });
      }
    } catch (error) {
      console.error(`${isLogin ? 'Login' : 'Register'} error:`, error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || `${isLogin ? 'Login' : 'Register'} failed. Please try again.`);
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-md">
        <h2 className="text-2xl mb-4 text-center text-black dark:text-white">{isLogin ? 'Login' : 'Register'}</h2>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="off">
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-black dark:text-white mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setLocalUsername(e.target.value)}
                className="w-full p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                required
                autoComplete="off"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-black dark:text-white mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              required
              autoComplete="off"
            />
          </div>
          <div className="mb-4">
            <label className="block text-black dark:text-white mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              required
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-black dark:text-white">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              navigate(isLogin ? '/register' : '/login');
              setError(null);
              setEmail('');
              setPassword('');
              setLocalUsername('');
            }}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
