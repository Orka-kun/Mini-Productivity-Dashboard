const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    res.json(goals.map(goal => ({ ...goal.toObject(), completed: goal.completed !== undefined ? goal.completed : false })));
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, type = 'general' } = req.body;
  try {
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!['general', 'weekly', 'monthly'].includes(type)) {
      return res.status(400).json({ message: 'Invalid goal type' });
    }
    const goal = new Goal({ userId: req.user._id, title, completed: false, order: 0, type });
    await goal.save();
    res.status(201).json({ ...goal.toObject(), completed: goal.completed });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(400).json({ message: 'Error creating goal', error: error.message });
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
    if ('title' in req.body) updates.title = req.body.title;
    if ('order' in req.body) updates.order = req.body.order;
    if ('type' in req.body) {
      if (!['general', 'weekly', 'monthly'].includes(req.body.type)) {
        return res.status(400).json({ message: 'Invalid goal type' });
      }
      updates.type = req.body.type;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ ...goal.toObject(), completed: goal.completed });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Error updating goal', error: error.message });
  }
});

router.put('/:id/reorder', auth, async (req, res) => {
  const { newOrder } = req.body;
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { order: newOrder },
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ ...goal.toObject(), completed: goal.completed !== undefined ? goal.completed : false });
  } catch (error) {
    console.error('Error reordering goal:', error);
    res.status(400).json({ message: 'Error reordering goal', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(400).json({ message: 'Error deleting goal', error: error.message });
  }
});

module.exports = router;