const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    enum: ['general', 'weekly', 'monthly'],
    default: 'general',
  },
  __v: { type: Number, select: false },
});

module.exports = mongoose.model('Goal', goalSchema);