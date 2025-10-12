// Simple database check
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const TEST_USER_ID = 'user_001';

async function checkCurrentSettings() {
  try {
    console.log('🔍 Checking current sleep time...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const user = await User.findOne({ _id: TEST_USER_ID });

    if (!user || !user.push_notifications) {
      console.log('❌ User not found');
      return;
    }

    console.log('📋 Current Sleep Settings:');
    console.log('─────────────────────────────────');
    console.log(`  Sleep Time: ${user.push_notifications.sleepTime}`);
    console.log(`  Sleep Reminder: ${user.push_notifications.sleepReminder ? '✅' : '❌'}`);
    console.log(`  Time Format: ${user.push_notifications.sleepTime} = ${parseInt(user.push_notifications.sleepTime.split(':')[0])}:${user.push_notifications.sleepTime.split(':')[1]} PM`);

    await mongoose.disconnect();
    console.log('\n✅ Check completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

checkCurrentSettings();
