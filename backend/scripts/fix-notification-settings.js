// Fix notification settings in MongoDB
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const TEST_USER_ID = 'user_001';

async function fixNotificationSettings() {
  try {
    console.log('🔧 Fixing notification settings in database...\n');

    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Update user settings
    console.log(`🔄 Updating settings for user: ${TEST_USER_ID}`);
    
    const result = await User.findOneAndUpdate(
      { _id: TEST_USER_ID },
      { 
        $set: { 
          'push_notifications.enabled': true,
          'push_notifications.mealReminders': false,  // Disable meal reminders
          'push_notifications.breakfastTime': '08:00',
          'push_notifications.lunchTime': '13:00',
          'push_notifications.dinnerTime': '20:00',
          'push_notifications.sleepReminder': true,   // Enable sleep reminder
          'push_notifications.sleepTime': '13:41',    // Your desired sleep time (1:41 PM)
          'push_notifications.weightReminder': false,
          'push_notifications.weightTime': '07:00',
          'push_notifications.waterReminder': false,
          'push_notifications.waterInterval': 2,
          'push_notifications.motivationalQuotes': false,
          'push_notifications.quoteTime': '09:00'
        }
      },
      { 
        new: true,
        upsert: true
      }
    );

    if (result) {
      console.log('✅ Settings updated successfully!\n');
      
      console.log('📋 New Settings:');
      console.log('─────────────────────────────────');
      console.log(`  Enabled: ${result.push_notifications.enabled ? '✅' : '❌'}`);
      console.log(`  Meal Reminders: ${result.push_notifications.mealReminders ? '✅' : '❌'}`);
      console.log(`    - Breakfast: ${result.push_notifications.breakfastTime}`);
      console.log(`    - Lunch: ${result.push_notifications.lunchTime}`);
      console.log(`    - Dinner: ${result.push_notifications.dinnerTime}`);
      console.log(`  Sleep Reminder: ${result.push_notifications.sleepReminder ? '✅' : '❌'} (${result.push_notifications.sleepTime})`);
      console.log('\n  Total expected jobs: 1');
      console.log('');

      console.log('✅ Database fixed successfully!\n');
      console.log('📝 Next Steps:');
      console.log('─────────────────────────────────');
      console.log('1. Go to cron-job.org and delete ALL Weight Tracker push notification jobs');
      console.log('2. Open your app → Settings → Automation tab');
      console.log('3. Click "Setup Push Notification Jobs"');
      console.log('4. Should create ONLY 1 job (Sleep Reminder)');
      console.log('');
    } else {
      console.log('❌ User not found or update failed');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing settings:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixNotificationSettings();
