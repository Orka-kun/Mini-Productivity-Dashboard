import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoalItem = ({ goal, index, moveGoal, handleUpdate, handleDelete, handleEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editType, setEditType] = useState(goal.type || 'general');
  const holdTimeoutRef = useRef(null);
  const isHoldingRef = useRef(false);

  const saveEdit = () => {
    if (editTitle.trim() !== goal.title || editType !== goal.type) {
      handleEdit(goal._id, editTitle.trim(), editType);
    }
    setIsEditing(false);
  };

  const handleMouseDown = () => {
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
    const element = e.target.closest('.goal-item');
    if (element && isHoldingRef.current) {
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
        moveGoal(currentIndex, targetIndex);
      }
    }
  };

  return (
    <div
      className={`goal-item p-2 mb-2 bg-white dark:bg-gray-800 rounded flex justify-between items-center ${isHoldingRef.current ? 'opacity-50' : ''}`}
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
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
              className="mr-2 p-1 border rounded text-black dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            >
              <option value="general">General</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
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
              checked={goal.completed || false}
              onChange={() => handleUpdate(goal._id, { completed: !(goal.completed || false) })}
              className="mr-2"
            />
            <span className="text-black dark:text-white">
              {goal.title} <span className="text-sm text-gray-500">({goal.type.charAt(0).toUpperCase() + goal.type.slice(1)})</span>
            </span>
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
            onClick={() => handleDelete(goal._id)}
            className="text-red-500"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const GoalList = ({ goals: initialGoals, onGoalUpdate }) => {
  const [goals, setGoals] = useState(initialGoals || []);
  const [newGoal, setNewGoal] = useState('');
  const [goalType, setGoalType] = useState('general');
  const navigate = useNavigate();

  React.useEffect(() => {
    setGoals(initialGoals || []);
  }, [initialGoals]);

  const handleAdd = async () => {
    const trimmedGoal = newGoal.trim();
    if (!trimmedGoal) {
      alert('Goal title cannot be empty!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await axios.post(
        'http://localhost:5000/api/goals',
        { title: trimmedGoal, completed: false, type: goalType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newGoalData = response.data;
      setGoals([...goals, newGoalData]);
      setNewGoal('');
      setGoalType('general');
      if (onGoalUpdate) onGoalUpdate(newGoalData._id, newGoalData.completed !== undefined ? newGoalData.completed : false);
      console.log('Added goal with completed:', newGoalData.completed, 'type:', newGoalData.type);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else if (error.response && error.response.status === 400) {
        console.error('Error adding goal:', error.response.data.message, error.response.data.error);
        alert(`Failed to add goal: ${error.response.data.message}`);
      } else {
        console.error('Error adding goal:', error);
        alert('An unexpected error occurred while adding the goal.');
      }
    }
  };

  const handleUpdate = async (id, updates) => {
    const completed = updates.completed !== undefined ? updates.completed : false;
    if (typeof completed !== 'boolean') {
      console.error('Invalid completed value in handleUpdate:', completed);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await axios.put(
        `http://localhost:5000/api/goals/${id}`,
        { completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedGoal = { ...response.data, completed: response.data.completed !== undefined ? response.data.completed : completed };
      setGoals(goals.map(goal => (goal._id === id ? updatedGoal : goal)));
      if (onGoalUpdate) onGoalUpdate(id, updatedGoal.completed);
      console.log('Updated goal with completed:', updatedGoal.completed);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
      console.error('Error updating goal:', error.response ? error.response.data : error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      await axios.delete(`http://localhost:5000/api/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(goals.filter(goal => goal._id !== id));
      if (onGoalUpdate) onGoalUpdate(null, null);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
      console.error('Error deleting goal:', error.response ? error.response.data : error.message);
    }
  };

  const handleEdit = async (id, newTitle, newType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await axios.put(
        `http://localhost:5000/api/goals/${id}`,
        { title: newTitle, type: newType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGoals(goals.map(goal => (goal._id === id ? { ...response.data, completed: goal.completed } : goal)));
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
      console.error('Error editing goal:', error.response ? error.response.data : error.message);
    }
  };

  const moveGoal = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= goals.length) return;

    const updatedGoals = [...goals];
    const [movedGoal] = updatedGoals.splice(fromIndex, 1);
    updatedGoals.splice(toIndex, 0, movedGoal);
    setGoals(updatedGoals);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await axios.put(
        `http://localhost:5000/api/goals/${movedGoal._id}/reorder`,
        { newOrder: toIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const reorderedGoal = { ...response.data, completed: movedGoal.completed !== undefined ? movedGoal.completed : false };
      setGoals(updatedGoals.map(goal => goal._id === movedGoal._id ? reorderedGoal : goal));
      if (onGoalUpdate) onGoalUpdate(movedGoal._id, reorderedGoal.completed);
      console.log('Reordered goal with completed:', reorderedGoal.completed);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
      console.error('Error reordering goal:', error.response ? error.response.data : error.message);
      setGoals(initialGoals || []);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h2 className="text-xl mb-4 text-black dark:text-white">Goals</h2>
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a new goal"
            className="flex-1 p-2 border rounded text-black dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />
          <div className="ml-2 flex space-x-2">
            <label className="flex items-center text-black dark:text-white">
              <input
                type="checkbox"
                checked={goalType === 'weekly'}
                onChange={() => setGoalType('weekly')}
                className="mr-1"
              />
              Weekly
            </label>
            <label className="flex items-center text-black dark:text-white">
              <input
                type="checkbox"
                checked={goalType === 'monthly'}
                onChange={() => setGoalType('monthly')}
                className="mr-1"
              />
              Monthly
            </label>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          Add Goal
        </button>
      </div>
      <div>
        {goals.length > 0 ? (
          goals.map((goal, index) => (
            <GoalItem
              key={goal._id}
              goal={goal}
              index={index}
              moveGoal={moveGoal}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
            />
          ))
        ) : (
          <p className="text-black dark:text-white">No goals available. Add a goal to get started!</p>
        )}
      </div>
    </div>
  );
};

export default GoalList;