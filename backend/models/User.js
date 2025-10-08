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
  // Hidden default presets (which built-in presets user has hidden)
  hidden_presets: {
    breakfast: {
      type: [String],
      default: []
    },
    lunch: {
      type: [String],
      default: []
    },
    snacks: {
      type: [String],
      default: []
    },
    dinner: {
      type: [String],
      default: []
    }
  },
  // Email notification preferences
  email_notifications: {
    enabled: {
      type: Boolean,
      default: false
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true
    },
    daily_summary: {
      type: Boolean,
      default: false
    },
    weekly_summary: {
      type: Boolean,
      default: false
    },
    monthly_summary: {
      type: Boolean,
      default: false
    },
    custom_frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', null],
      default: null
    },
    // Delivery schedule times
    schedule: {
      daily: {
        type: String,
        default: '20:00'
      },
      weekly: {
        type: String,
        default: '20:00'
      },
      monthly: {
        type: String,
        default: '20:00'
      }
    }
  },
  // Cron job API key for automated tasks
  cron_api_key: {
    type: String,
    default: ''
  }
}, { _id: false });

const User = mongoose.model('User', userSchema);

export default User;
