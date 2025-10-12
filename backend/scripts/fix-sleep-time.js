// Fix sleep time to 2:50 PM (14:50)
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const TEST_USER_ID = 'user_001';

async function fixSleepTime() {
  try {
    console.log('🔧 Fixing sleep time to 2:50 PM (14:50)...\n');

    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Update sleep time to 14:50 (2:50 PM)
    console.log(`🔄 Updating sleep time for user: ${TEST_USER_ID}`);

    const result = await User.findOneAndUpdate(
      { _id: TEST_USER_ID },
      {
        $set: {
          'push_notifications.sleepTime': '14:50'
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    if (result) {
      console.log('✅ Sleep time updated successfully!\n');

      console.log('📋 Updated Settings:');
      console.log('─────────────────────────────────');
      console.log(`  Sleep Reminder: ${result.push_notifications.sleepReminder ? '✅' : '❌'} (${result.push_notifications.sleepTime})`);

      console.log('\n  Expected cron job: 2:50 PM daily');

      console.log('\n✅ Database updated successfully!\n');
      console.log('📝 Next Steps:');
      console.log('─────────────────────────────────');
      console.log('1. Go to cron-job.org and delete old job');
      console.log('2. Open app → Settings → Automation → "Setup Push Notification Jobs"');
      console.log('3. Should create job for 2:50 PM');
      console.log('');
    } else {
      console.log('❌ User not found or update failed');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing sleep time:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixSleepTime();
