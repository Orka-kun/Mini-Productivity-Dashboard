const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { title } = req.body;
  try {
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    const task = new Task({ userId: req.user._id, title, completed: false, order: 0 });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: 'Error creating task', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updates = {};
    if ('completed' in req.body) {
      if (typeof req.body.completed !== 'boolean') {
        return res.status(400).json({ message: 'Completed must be a boolean' });
      }
      updates.completed = req.body.completed;
    }
    if ('title' in req.body) {
      if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
        return res.status(400).json({ message: 'Title must be a non-empty string' });
      }
      updates.title = req.body.title;
    }
    if ('order' in req.body) {
      if (typeof req.body.order !== 'number') {
        return res.status(400).json({ message: 'Order must be a number' });
      }
      updates.order = req.body.order;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

router.put('/:id/reorder', auth, async (req, res) => {
  const { newOrder } = req.body;
  try {
    if (typeof newOrder !== 'number') {
      return res.status(400).json({ message: 'New order must be a number' });
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { order: newOrder },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('Error reordering task:', error);
    res.status(400).json({ message: 'Error reordering task', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(400).json({ message: 'Error deleting task', error: error.message });
  }
});

module.exports = router;