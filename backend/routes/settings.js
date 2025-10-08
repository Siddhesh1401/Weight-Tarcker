import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// POST /api/settings - Save/update goal weight + user settings
router.post('/settings', async (req, res) => {
  try {
    const { user_id, name, email, goal_weight, height, current_weight, water_goal, sleep_goal, hidden_presets, cron_api_key } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    // Find existing user or create new one
    let user = await User.findOne({ _id: user_id }).catch(() => null);

    if (user) {
      // Update existing user
      if (name) user.name = name;
      if (email !== undefined) user.email = email;
      if (goal_weight) user.goal_weight = goal_weight;
      if (height) user.height = height;
      if (current_weight) user.current_weight = current_weight;
      if (water_goal) user.water_goal = water_goal;
      if (sleep_goal) user.sleep_goal = sleep_goal;
      if (hidden_presets) user.hidden_presets = hidden_presets;
      if (cron_api_key !== undefined) user.cron_api_key = cron_api_key;
      
      await user.save();
    } else {
      // Create new user
      user = new User({
        _id: user_id,
        name: name || 'User',
        email: email || null,
        goal_weight: goal_weight || 70,
        height: height || null,
        current_weight: current_weight || null,
        water_goal: water_goal || 8,
        sleep_goal: sleep_goal || 8,
        hidden_presets: hidden_presets || {
          breakfast: [],
          lunch: [],
          snacks: [],
          dinner: []
        },
        cron_api_key: cron_api_key || ''
      });
      
      await user.save();
    }

    res.json({
      success: true,
      message: 'Settings saved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save settings',
      error: error.message
    });
  }
});

// GET /api/settings - Get user's current settings
router.get('/settings', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    let user = await User.findOne({ _id: user_id }).catch(() => null);

    // If user doesn't exist, create default user
    if (!user) {
      user = new User({
        _id: user_id,
        name: 'User',
        goal_weight: 70
      });
      await user.save();
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

export default router;
