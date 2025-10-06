import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Log from '../models/Log.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weight-tracker';

async function viewAllLogs() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const user_id = 'user_001';
    
    // Find all logs for the user
    const allLogs = await Log.find({ user_id }).sort({ date: -1, timestamp: -1 });
    
    console.log('=' .repeat(80));
    console.log('📊 ALL LOGS IN DATABASE');
    console.log('='.repeat(80));
    console.log(`Total logs: ${allLogs.length}\n`);

    allLogs.forEach((log, index) => {
      console.log(`\n[${index + 1}] ${log.meal_type.toUpperCase()}`);
      console.log('─'.repeat(80));
      console.log(`ID:          ${log._id}`);
      console.log(`Date:        ${log.date}`);
      console.log(`Time:        ${log.time || 'Not set'}`);
      console.log(`Timestamp:   ${new Date(log.timestamp).toLocaleString()}`);
      
      if (log.meal_notes) console.log(`Notes:       ${log.meal_notes}`);
      if (log.weight) console.log(`Weight:      ${log.weight} kg`);
      if (log.water_glasses) console.log(`Water:       ${log.water_glasses} glasses`);
      if (log.sleep_hours) console.log(`Sleep:       ${log.sleep_hours} hours (${log.sleep_quality})`);
      if (log.tea_biscuit) console.log(`Tea:         Yes`);
      if (log.cheat_meal) console.log(`Cheat Meal:  Yes`);
    });

    console.log('\n' + '='.repeat(80));

    // Group by date and type
    console.log('\n📋 GROUPED BY DATE + TYPE:');
    console.log('='.repeat(80));
    
    const grouped = {};
    allLogs.forEach(log => {
      const key = `${log.date} - ${log.meal_type}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(log);
    });

    Object.entries(grouped).forEach(([key, logs]) => {
      console.log(`\n${key}: ${logs.length} entr${logs.length === 1 ? 'y' : 'ies'}`);
      if (logs.length > 1) {
        console.log('  ⚠️ POTENTIAL DUPLICATE!');
        logs.forEach((log, i) => {
          console.log(`    [${i+1}] Time: ${log.time || 'none'}, ID: ${log._id}`);
        });
      }
    });

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

viewAllLogs();
