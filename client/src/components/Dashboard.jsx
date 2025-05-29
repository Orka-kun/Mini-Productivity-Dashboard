import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './TaskList';
import GoalList from './GoalList';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ username, theme }) => {
  const [quote, setQuote] = useState({});
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuote();
    fetchTasks();
    fetchGoals();
  }, []);

  const fetchQuote = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quote?refresh=true');
      if (response.data && response.data.quote && response.data.author) {
        setQuote(response.data);
        setError(null);
      } else {
        throw new Error('Invalid quote data');
      }
    } catch (error) {
      console.error('Quote fetch error:', error.response ? error.response.data : error.message);
      setError('Failed to fetch quote. Using fallback.');
      setQuote({ quote: 'Stay motivated, keep pushing forward!', author: 'Unknown' });
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in.');
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
      setError(null);
    } catch (error) {
      console.error('Tasks fetch error:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError('Failed to fetch tasks.');
      }
    }
  };

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in.');
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/goals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(response.data);
      console.log('Fetched goals:', response.data);
      setError(null);
    } catch (error) {
      console.error('Goals fetch error:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError('Failed to fetch goals.');
      }
    }
  };

  const updateTaskStatus = async (taskId, completed) => {
    if (taskId === null && completed === null) {
      fetchTasks();
      return;
    }
    if (!taskId) {
      console.error('Invalid taskId:', taskId);
      setError('Invalid task ID for update.');
      return;
    }
    if (typeof completed !== 'boolean') {
      console.error('Invalid completed value for task:', completed);
      setError('Invalid completed value for task update.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in.');
        navigate('/login');
        return;
      }
      await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
      setError(null);
    } catch (error) {
      console.error('Task update error:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError(`Failed to update task ${taskId}.`);
      }
    }
  };

  const updateGoalStatus = async (goalId, completed) => {
    if (goalId === null && completed === null) {
      fetchGoals();
      return;
    }
    if (!goalId) {
      console.error('Invalid goalId:', goalId);
      setError('Invalid goal ID for update.');
      return;
    }
    if (typeof completed !== 'boolean') {
      console.error('Invalid completed value for goal:', completed);
      setError('Invalid completed value for goal update.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in.');
        navigate('/login');
        return;
      }
      const response = await axios.put(
        `http://localhost:5000/api/goals/${goalId}`,
        { completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Goal update response:', response.data); // Debug log
      fetchGoals();
      setError(null);
    } catch (error) {
      console.error('Goal update error:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError(`Failed to update goal ${goalId}.`);
      }
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const incompleteTasks = tasks.length - completedTasks;
  const completedGoals = goals.filter(goal => goal.completed).length;
  const incompleteGoals = goals.length - completedGoals;

  const taskPieData = {
    labels: ['Completed Tasks', 'Incomplete Tasks'],
    datasets: [
      {
        data: [completedTasks, incompleteTasks],
        backgroundColor: ['#6050DC', '#FF2E7E'],
        hoverBackgroundColor: ['#6050DC', '#FF2E7E'],
      },
    ],
  };

  const goalPieData = {
    labels: ['Completed Goals', 'Incomplete Goals'],
    datasets: [
      {
        data: [completedGoals, incompleteGoals],
        backgroundColor: ['#4CAF50', '#FF9800'],
        hoverBackgroundColor: ['#4CAF50', '#FF9800'],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Welcome, {username}</h1>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="mb-4 p-4 bg-blue-100 rounded">
        <p className="italic">"{quote.quote}"</p>
        <p className="text-right">— {quote.author}</p>
        <button
          onClick={fetchQuote}
          className="mt-2 bg-blue-500 text-white p-2 rounded"
        >
          Refresh Quote
        </button>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center md:space-x-8 space-y-6 md:space-y-0">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mb-6">
          <h2 className="text-xl mb-2 text-center text-black dark:text-white">Task Completion Overview</h2>
          {tasks.length > 0 && (completedTasks > 0 || incompleteTasks > 0) ? (
            <div className="w-full aspect-square max-h-[300px] mx-auto">
              <Pie data={taskPieData} options={pieOptions} />
            </div>
          ) : (
            <p className="text-center text-black dark:text-white">No tasks available or no completion data to display. Add some tasks to see the chart!</p>
          )}
        </div>
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mb-6">
          <h2 className="text-xl mb-2 text-center text-black dark:text-white">Goal Completion Overview</h2>
          {goals.length > 0 && (completedGoals > 0 || incompleteGoals > 0) ? (
            <div className="w-full aspect-square max-h-[300px] mx-auto">
              <Pie data={goalPieData} options={pieOptions} />
            </div>
          ) : (
            <p className="text-center text-black dark:text-white">No goals available or no completion data to display. Add some goals to see the chart!</p>
          )}
        </div>
      </div>      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskList tasks={tasks} onTaskUpdate={updateTaskStatus} />
        <GoalList goals={goals} onGoalUpdate={updateGoalStatus} />
      </div>
    </div>
  );
};

export default Dashboard;