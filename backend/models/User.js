import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  goal_weight: {
    type: Number,
    required: true
  },
  // Body metrics
  height: {
    type: Number,
    default: null
  },
  current_weight: {
    type: Number,
    default: null
  },
  // Daily goals
  water_goal: {
    type: Number,
    default: 8
  },
  sleep_goal: {
    type: Number,
    default: 8
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const User = mongoose.model('User', userSchema);

export default User;
