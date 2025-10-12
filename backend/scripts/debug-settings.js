// Debug script to check settings saving
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const TEST_USER_ID = 'user_001';

async function debugSettings() {
  try {
    console.log('🔍 Debugging notification settings flow...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get current settings
    const user = await User.findOne({ _id: TEST_USER_ID });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('📋 Current Database Settings:');
    console.log('─────────────────────────────────');
    if (user.push_notifications) {
      console.log(`  Enabled: ${user.push_notifications.enabled ? '✅' : '❌'}`);
      console.log(`  Meal Reminders: ${user.push_notifications.mealReminders ? '✅' : '❌'}`);
      console.log(`  Sleep Time: ${user.push_notifications.sleepTime}`);
      console.log(`  Sleep Reminder: ${user.push_notifications.sleepReminder ? '✅' : '❌'}`);
    } else {
      console.log('❌ No push notification settings in database');
    }

    console.log('\n🧪 Simulating Settings Update:');
    console.log('─────────────────────────────────');

    // Simulate what happens when user changes sleep time to 13:41
    const newSettings = {
      enabled: true,
      mealReminders: false,
      breakfastTime: '08:00',
      lunchTime: '13:00',
      dinnerTime: '20:00',
      sleepReminder: true,
      sleepTime: '13:41',  // ← User's desired time
      weightReminder: false,
      weightTime: '07:00',
      waterReminder: false,
      waterInterval: 2,
      motivationalQuotes: false,
      quoteTime: '09:00'
    };

    console.log('🔄 Updating settings to:', {
      sleepTime: newSettings.sleepTime,
      sleepReminder: newSettings.sleepReminder,
      mealReminders: newSettings.mealReminders
    });

    // Update in database
    const updated = await User.findOneAndUpdate(
      { _id: TEST_USER_ID },
      { $set: { push_notifications: newSettings } },
      { new: true }
    );

    console.log('\n✅ Settings updated in database!');
    console.log('📋 New Database Settings:');
    console.log('─────────────────────────────────');
    if (updated.push_notifications) {
      console.log(`  Sleep Time: ${updated.push_notifications.sleepTime}`);
      console.log(`  Sleep Reminder: ${updated.push_notifications.sleepReminder ? '✅' : '❌'}`);
      console.log(`  Meal Reminders: ${updated.push_notifications.mealReminders ? '✅' : '❌'}`);
    }

    console.log('\n🔔 Expected Cron Jobs:');
    console.log('─────────────────────────────────');
    if (updated.push_notifications.sleepReminder) {
      console.log(`  ✅ Sleep (${updated.push_notifications.sleepTime})`);
    }
    console.log('\n  Total expected jobs: 1');

    await mongoose.disconnect();
    console.log('\n✅ Debug completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

debugSettings();
