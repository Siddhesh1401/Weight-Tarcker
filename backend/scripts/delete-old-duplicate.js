import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Log from '../models/Log.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weight-tracker';

async function deleteDuplicate() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Delete the older breakfast entry (14:45)
    const result = await Log.deleteOne({ _id: '68e3d5f04384c166357f6c48' });
    
    console.log(`✅ Deleted ${result.deletedCount} entry`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

deleteDuplicate();
