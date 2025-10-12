// Quick database check script
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const TEST_USER_ID = 'user_001';

async function checkSettings() {
  try {
    console.log('🔍 Checking database settings...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get user settings
    const user = await User.findOne({ _id: TEST_USER_ID });

    if (!user || !user.push_notifications) {
      console.log('❌ User not found or no push notification settings');
      return;
    }

    const settings = user.push_notifications;
    console.log('📋 Current Database Settings:');
    console.log('─────────────────────────────────');
    console.log(`  Enabled: ${settings.enabled ? '✅' : '❌'}`);
    console.log(`  Meal Reminders: ${settings.mealReminders ? '✅' : '❌'}`);
    console.log(`    - Breakfast: ${settings.breakfastTime}`);
    console.log(`    - Lunch: ${settings.lunchTime}`);
    console.log(`    - Dinner: ${settings.dinnerTime}`);
    console.log(`  Sleep Reminder: ${settings.sleepReminder ? '✅' : '❌'} (${settings.sleepTime})`);
    console.log(`  Weight Reminder: ${settings.weightReminder ? '✅' : '❌'} (${settings.weightTime})`);
    console.log(`  Water Reminder: ${settings.waterReminder ? '✅' : '❌'} (every ${settings.waterInterval}h)`);
    console.log(`  Motivational Quotes: ${settings.motivationalQuotes ? '✅' : '❌'} (${settings.quoteTime})`);
    console.log('');

    console.log('🔔 Expected Cron Jobs:');
    console.log('─────────────────────────────────');
    if (settings.sleepReminder && settings.enabled) {
      console.log(`  ✅ Sleep (${settings.sleepTime})`);
    }
    console.log('\n  Total expected jobs: 1');

    await mongoose.disconnect();
    console.log('\n✅ Database check completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

checkSettings();
