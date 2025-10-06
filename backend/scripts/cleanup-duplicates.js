import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Log from '../models/Log.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weight-tracker';

async function cleanupDuplicates() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user_id = 'user_001';
    
    console.log('\n🔍 Finding duplicate entries...\n');

    // Find all logs for the user, sorted by timestamp (newest first)
    const allLogs = await Log.find({ user_id }).sort({ timestamp: -1 });
    
    console.log(`📊 Total logs found: ${allLogs.length}`);

    // Group logs by unique key (date + meal_type + time)
    const logGroups = {};
    
    for (const log of allLogs) {
      // Create unique key based on date, meal_type, and time
      // For weight/sleep: just date + type (one per day)
      // For water/meals: date + type + time (multiple per day)
      let key;
      if (log.meal_type === 'weight' || log.meal_type === 'sleep') {
        key = `${log.date}_${log.meal_type}`;
      } else {
        const time = log.time || 'no-time';
        key = `${log.date}_${log.meal_type}_${time}`;
      }
      
      if (!logGroups[key]) {
        logGroups[key] = [];
      }
      logGroups[key].push(log);
    }

    // Find and remove duplicates
    let duplicatesFound = 0;
    let duplicatesRemoved = 0;

    for (const [key, logs] of Object.entries(logGroups)) {
      if (logs.length > 1) {
        duplicatesFound++;
        console.log(`\n🔍 Found ${logs.length} duplicates for: ${key}`);
        
        // Keep the most recent one (first in array due to sort), delete the rest
        const toKeep = logs[0];
        const toDelete = logs.slice(1);
        
        console.log(`   ✅ Keeping: ID=${toKeep._id}, Time=${toKeep.time || 'N/A'}, Created=${new Date(toKeep.timestamp).toLocaleString()}`);
        
        for (const log of toDelete) {
          console.log(`   ❌ Deleting: ID=${log._id}, Time=${log.time || 'N/A'}, Created=${new Date(log.timestamp).toLocaleString()}`);
          await Log.deleteOne({ _id: log._id });
          duplicatesRemoved++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total logs processed: ${allLogs.length}`);
    console.log(`Duplicate groups found: ${duplicatesFound}`);
    console.log(`Duplicate entries removed: ${duplicatesRemoved}`);
    console.log(`Remaining logs: ${allLogs.length - duplicatesRemoved}`);
    console.log('='.repeat(50));

    if (duplicatesRemoved > 0) {
      console.log('\n✨ Cleanup completed successfully!');
    } else {
      console.log('\n✨ No duplicates found - database is clean!');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
console.log('🧹 Starting duplicate cleanup script...\n');
cleanupDuplicates();
