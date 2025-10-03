import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  meal_type: {
    type: String,
    enum: ['breakfast', 'lunch', 'snacks', 'dinner', 'other', 'weight', 'water', 'sleep'],
    required: true
  },
  meal_notes: {
    type: String,
    default: ''
  },
  tea_biscuit: {
    type: Boolean,
    default: false
  },
  cheat_meal: {
    type: Boolean,
    default: false
  },
  weight: {
    type: Number,
    default: null
  },
  // Water tracking
  water_glasses: {
    type: Number,
    default: null
  },
  // Sleep tracking
  sleep_hours: {
    type: Number,
    default: null
  },
  sleep_quality: {
    type: String,
    enum: ['poor', 'fair', 'good', 'excellent', null],
    default: null
  },
  time: {
    type: String,
    default: () => {
      const now = new Date();
      return now.toTimeString().slice(0, 5); // HH:MM format
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
logSchema.index({ user_id: 1, date: -1 });

const Log = mongoose.model('Log', logSchema);

export default Log;
