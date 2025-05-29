import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TaskItem = ({ task, index, moveTask, handleUpdate, handleDelete, handleEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const holdTimeoutRef = useRef(null);
  const isHoldingRef = useRef(false);

  const saveEdit = () => {
    if (editTitle.trim() !== task.title) {
      handleEdit(task._id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }, 500);
  };

  const handleMouseUp = () => {
    clearTimeout(holdTimeoutRef.current);
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseMove = (e) => {
    if (!isHoldingRef.current) return;
    const element = e.target.closest('.task-item');
    if (element) {
      const rect = element.getBoundingClientRect();
      const mouseY = e.clientY;
      const parent = element.parentElement;
      const items = Array.from(parent.children);
      const currentIndex = items.indexOf(element);
      const targetIndex = mouseY < rect.top + rect.height / 2 && currentIndex > 0
        ? currentIndex - 1
        : mouseY > rect.bottom - rect.height / 2 && currentIndex < items.length - 1
        ? currentIndex + 1
        : currentIndex;
      if (targetIndex !== currentIndex) {
        moveTask(currentIndex, targetIndex);
      }
    }
  };

  return (
    <div
      className={`task-item p-2 mb-2 bg-white dark:bg-gray-800 rounded flex justify-between items-center ${isHoldingRef.current ? 'opacity-50' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="flex items-center">
        {isEditing ? (
          <div className="flex items-center">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mr-2 p-1 border rounded text-black dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              autoFocus
            />
            <button
              onClick={saveEdit}
              className="ml-2 bg-green-500 text-white p-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="ml-2 bg-red-500 text-white p-1 rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleUpdate(task._id, { completed: !task.completed })}
              className="mr-2"
            />
            <span className="text-black dark:text-white">{task.title}</span>
          </>
        )}
      </div>
      {!isEditing && (
        <div>
          <button
            onClick={() => setIsEditing(true)}
            className="mr-2 bg-yellow-500 text-white p-1 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(task._id)}
            className="text-red-500"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const TaskList = ({ tasks: initialTasks, onTaskUpdate }) => {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [newTask, setNewTask] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    setTasks(initialTasks || []);
  }, [initialTasks]);

  const handleAdd = async () => {
    const trimmedTask = newTask.trim();
    if (!trimmedTask) {
      alert('Task title cannot be empty!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await axios.post(
        'http://localhost:5000/api/tasks',
        { title: trimmedTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([...tasks, response.data]);
      setNewTask('');
      if (onTaskUpdate) onTaskUpdate(response.data._id, response.data.completed);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else if (error.response && error.response.status === 400) {
        console.error('Error adding task:', error.response.data.message, error.response.data.error);
        alert(`Failed to add task: ${error.response.data.message}`);
      } else {
        console.error('Error adding task:', error);
        alert('An unexpected error occurred while adding the task.');
      }
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map(task => (task._id === id ? response.data : task)));
      if (onTaskUpdate) onTaskUpdate(id, updates.completed);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
      console.error('Error updating task:', error.response ? error.response.data : error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter(task => task._id !== id));
      if (onTaskUpdate) onTaskUpdate(null, null);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
      console.error('Error deleting task:', error.response ? error.response.data : error.message);
    }
  };

  const handleEdit = async (id, newTitle) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map(task => (task._id === id ? response.data : task)));
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
      console.error('Error editing task:', error.response ? error.response.data : error.message);
    }
  };

  const moveTask = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= tasks.length) return;

    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(fromIndex, 1);
    updatedTasks.splice(toIndex, 0, movedTask);
    setTasks(updatedTasks);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      await axios.put(
        `http://localhost:5000/api/tasks/${movedTask._id}/reorder`,
        { newOrder: toIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onTaskUpdate) onTaskUpdate(movedTask._id, movedTask.completed);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
      console.error('Error reordering task:', error.response ? error.response.data : error.message);
      setTasks(initialTasks || []);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h2 className="text-xl mb-4 text-black dark:text-white">Daily Tasks</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
          className="w-full p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
        />
        <button
          onClick={handleAdd}
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
        >
          Add Task
        </button>
      </div>
      <div>
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <TaskItem
              key={task._id}
              task={task}
              index={index}
              moveTask={moveTask}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
            />
          ))
        ) : (
          <p className="text-black dark:text-white">No tasks available. Add a task to get started!</p>
        )}
      </div>
    </div>
  );
};

export default TaskList;