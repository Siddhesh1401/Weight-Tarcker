// Test script to verify push notification cron job setup
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const TEST_USER_ID = 'user_001';

async function testPushSetup() {
  try {
    console.log('🧪 Testing Push Notification Setup...\n');

    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if user exists
    console.log(`🔍 Looking for user: ${TEST_USER_ID}`);
    let user = await User.findOne({ _id: TEST_USER_ID });

    if (!user) {
      console.log('❌ User not found. Creating test user...');
      user = new User({
        _id: TEST_USER_ID,
        name: 'Test User',
        goal_weight: 70,
        push_notifications: {
          enabled: true,
          mealReminders: true,
          breakfastTime: '08:00',
          lunchTime: '13:00',
          dinnerTime: '20:00',
          sleepReminder: true,
          sleepTime: '22:00',
          weightReminder: false,
          weightTime: '07:00',
          waterReminder: false,
          waterInterval: 2,
          motivationalQuotes: false,
          quoteTime: '09:00'
        }
      });
      await user.save();
      console.log('✅ Test user created\n');
    } else {
      console.log('✅ User found\n');
    }

    // Check push notification settings
    console.log('📋 Push Notification Settings:');
    console.log('─────────────────────────────────');
    if (user.push_notifications) {
      console.log(`  Enabled: ${user.push_notifications.enabled ? '✅' : '❌'}`);
      console.log(`  Meal Reminders: ${user.push_notifications.mealReminders ? '✅' : '❌'}`);
      console.log(`    - Breakfast: ${user.push_notifications.breakfastTime}`);
      console.log(`    - Lunch: ${user.push_notifications.lunchTime}`);
      console.log(`    - Dinner: ${user.push_notifications.dinnerTime}`);
      console.log(`  Sleep Reminder: ${user.push_notifications.sleepReminder ? '✅' : '❌'} (${user.push_notifications.sleepTime})`);
      console.log(`  Weight Reminder: ${user.push_notifications.weightReminder ? '✅' : '❌'} (${user.push_notifications.weightTime})`);
      console.log(`  Water Reminder: ${user.push_notifications.waterReminder ? '✅' : '❌'} (every ${user.push_notifications.waterInterval}h)`);
      console.log(`  Motivational Quotes: ${user.push_notifications.motivationalQuotes ? '✅' : '❌'} (${user.push_notifications.quoteTime})`);
    } else {
      console.log('  ❌ No push notification settings found!');
    }
    console.log('');

    // Check push subscription
    console.log('📱 Push Subscription:');
    console.log('─────────────────────────────────');
    if (user.push_subscription) {
      console.log(`  ✅ Subscription exists`);
      console.log(`  Endpoint: ${user.push_subscription.endpoint?.substring(0, 50)}...`);
      console.log(`  Has Keys: ${user.push_subscription.keys ? '✅' : '❌'}`);
    } else {
      console.log('  ⚠️  No push subscription found (user needs to enable notifications in UI)');
    }
    console.log('');

    // Calculate which jobs should be created
    console.log('🔔 Expected Cron Jobs:');
    console.log('─────────────────────────────────');
    const settings = user.push_notifications;
    let expectedJobs = 0;

    if (settings && settings.enabled) {
      if (settings.mealReminders) {
        console.log(`  ✅ Breakfast (${settings.breakfastTime})`);
        console.log(`  ✅ Lunch (${settings.lunchTime})`);
        console.log(`  ✅ Dinner (${settings.dinnerTime})`);
        expectedJobs += 3;
      }
      if (settings.sleepReminder) {
        console.log(`  ✅ Sleep (${settings.sleepTime})`);
        expectedJobs += 1;
      }
      if (settings.weightReminder) {
        console.log(`  ✅ Weight (${settings.weightTime})`);
        expectedJobs += 1;
      }
      if (settings.waterReminder) {
        console.log(`  ✅ Water (every ${settings.waterInterval}h)`);
        expectedJobs += 1;
      }
      if (settings.motivationalQuotes) {
        console.log(`  ✅ Quotes (${settings.quoteTime})`);
        expectedJobs += 1;
      }

      if (expectedJobs === 0) {
        console.log('  ⚠️  No reminders enabled! Enable at least one reminder.');
      }
    } else {
      console.log('  ❌ Push notifications are disabled!');
    }
    console.log(`\n  Total expected jobs: ${expectedJobs}`);
    console.log('');

    // Environment check
    console.log('🔧 Environment Variables:');
    console.log('─────────────────────────────────');
    console.log(`  MONGODB_URI: ${process.env.MONGODB_URI ? '✅' : '❌'}`);
    console.log(`  VAPID_PUBLIC_KEY: ${process.env.VAPID_PUBLIC_KEY ? '✅' : '❌'}`);
    console.log(`  VAPID_PRIVATE_KEY: ${process.env.VAPID_PRIVATE_KEY ? '✅' : '❌'}`);
    console.log(`  CRON_JOB_ORG_API_KEY: ${process.env.CRON_JOB_ORG_API_KEY ? '✅' : '❌'}`);
    console.log('');

    // Instructions
    console.log('📝 Next Steps:');
    console.log('─────────────────────────────────');
    console.log('1. Ensure backend server is running (npm start)');
    console.log('2. Open app in browser and enable notifications');
    console.log('3. Go to Settings → Automation tab');
    console.log('4. Enter Backend URL and Cron-Job.org API Key');
    console.log('5. Click "Setup Push Notification Jobs"');
    console.log(`6. Should create ${expectedJobs} cron jobs`);
    console.log('7. Verify jobs on cron-job.org dashboard');
    console.log('');

    console.log('✅ Test completed successfully!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testPushSetup();
