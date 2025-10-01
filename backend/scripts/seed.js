import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Log from '../models/Log.js';

dotenv.config();

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'user_001';

// Sample data
const sampleUser = {
  _id: DEFAULT_USER_ID,
  name: 'Siddhesh',
  email: 'siddhesh@example.com',
  goal_weight: 75
};

// Generate sample logs for the past 14 days
const generateSampleLogs = () => {
  const logs = [];
  const today = new Date();
  
  // Starting weight
  let currentWeight = 82;
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Add breakfast
    logs.push({
      user_id: DEFAULT_USER_ID,
      date: dateStr,
      meal_type: 'breakfast',
      meal_notes: i % 3 === 0 ? 'Oats with fruits and nuts' : i % 3 === 1 ? 'Poha with vegetables' : 'Idli with sambar',
      tea_biscuit: i % 4 === 0,
      cheat_meal: false,
      timestamp: new Date(date.setHours(8, 30, 0))
    });
    
    // Add lunch
    logs.push({
      user_id: DEFAULT_USER_ID,
      date: dateStr,
      meal_type: 'lunch',
      meal_notes: i % 3 === 0 ? 'Dal, rice, and vegetables' : i % 3 === 1 ? 'Roti with paneer curry' : 'Khichdi with curd',
      tea_biscuit: false,
      cheat_meal: i % 7 === 0,
      timestamp: new Date(date.setHours(13, 0, 0))
    });
    
    // Add snacks (not every day)
    if (i % 2 === 0) {
      logs.push({
        user_id: DEFAULT_USER_ID,
        date: dateStr,
        meal_type: 'snacks',
        meal_notes: i % 4 === 0 ? 'Tea with biscuits' : 'Fruits and nuts',
        tea_biscuit: i % 4 === 0,
        cheat_meal: false,
        timestamp: new Date(date.setHours(16, 30, 0))
      });
    }
    
    // Add dinner
    logs.push({
      user_id: DEFAULT_USER_ID,
      date: dateStr,
      meal_type: 'dinner',
      meal_notes: i % 3 === 0 ? 'Light soup and salad' : i % 3 === 1 ? 'Roti with dal' : 'Vegetable curry with rice',
      tea_biscuit: false,
      cheat_meal: i === 6 || i === 13, // Weekend cheat meals
      timestamp: new Date(date.setHours(20, 0, 0))
    });
    
    // Add weight entry every 2-3 days with gradual decrease
    if (i % 3 === 0) {
      currentWeight -= (Math.random() * 0.5 + 0.2); // Lose 0.2-0.7 kg
      logs.push({
        user_id: DEFAULT_USER_ID,
        date: dateStr,
        meal_type: 'weight',
        meal_notes: '',
        tea_biscuit: false,
        cheat_meal: false,
        weight: parseFloat(currentWeight.toFixed(1)),
        timestamp: new Date(date.setHours(7, 0, 0))
      });
    }
  }
  
  return logs;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Log.deleteMany({});
    console.log('✅ Existing data cleared\n');
    
    // Create sample user
    console.log('👤 Creating sample user...');
    const user = await User.create(sampleUser);
    console.log(`✅ User created: ${user.name} (${user._id})\n`);
    
    // Create sample logs
    console.log('📝 Creating sample logs...');
    const sampleLogs = generateSampleLogs();
    const logs = await Log.insertMany(sampleLogs);
    console.log(`✅ ${logs.length} log entries created\n`);
    
    // Summary
    console.log('📊 Seed Summary:');
    console.log(`   - User: ${user.name}`);
    console.log(`   - Goal Weight: ${user.goal_weight} kg`);
    console.log(`   - Total Logs: ${logs.length}`);
    console.log(`   - Date Range: Last 14 days`);
    
    const weightLogs = logs.filter(log => log.weight);
    if (weightLogs.length > 0) {
      console.log(`   - Weight Entries: ${weightLogs.length}`);
      console.log(`   - Starting Weight: ${weightLogs[0].weight} kg`);
      console.log(`   - Current Weight: ${weightLogs[weightLogs.length - 1].weight} kg`);
    }
    
    const cheatMeals = logs.filter(log => log.cheat_meal);
    console.log(`   - Cheat Meals: ${cheatMeals.length}`);
    
    console.log('\n✨ Database seeded successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
