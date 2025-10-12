// Test settings update endpoint directly
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const TEST_USER_ID = 'user_001';

async function testSettingsUpdate() {
  try {
    console.log('🧪 Testing settings update endpoint...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Simulate the exact request that the frontend sends
    const testSettings = {
      enabled: true,
      mealReminders: false,
      breakfastTime: '08:00',
      lunchTime: '13:00',
      dinnerTime: '20:00',
      sleepReminder: true,
      sleepTime: '15:30',  // Test with a different time
      weightReminder: false,
      weightTime: '07:00',
      waterReminder: false,
      waterInterval: 2,
      motivationalQuotes: false,
      quoteTime: '09:00'
    };

    console.log('🔄 Testing update with settings:', {
      sleepTime: testSettings.sleepTime,
      sleepReminder: testSettings.sleepReminder
    });

    // Update in database (simulating backend endpoint)
    const updated = await User.findOneAndUpdate(
      { _id: TEST_USER_ID },
      { $set: { push_notifications: testSettings } },
      { new: true }
    );

    console.log('\n✅ Settings updated in database!');
    console.log('📋 New Database Settings:');
    console.log('─────────────────────────────────');
    if (updated.push_notifications) {
      console.log(`  Sleep Time: ${updated.push_notifications.sleepTime}`);
      console.log(`  Sleep Reminder: ${updated.push_notifications.sleepReminder ? '✅' : '❌'}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

testSettingsUpdate();
