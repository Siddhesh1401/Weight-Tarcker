import mongoose from 'mongoose';

// Enable debug mode for development
if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    console.log(`🔍 MongoDB: ${collectionName}.${method}`, JSON.stringify(query), doc || '');
  });
}

// Add retry logic for database operations
const withRetry = async (operation, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error; // If last retry, throw the error
      console.log(`⚠️ Retry ${i + 1}/${retries} after error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
    }
  }
};

const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const options = {
      // Connection pool settings
      maxPoolSize: 15, // Increased max connections
      minPoolSize: 5,  // Increased min connections
      maxIdleTimeMS: 60000, // Increased to 60 seconds
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 60000, // Increased to 60 seconds
      connectTimeoutMS: 30000, // Added explicit connect timeout
      heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
      // Keep the connection alive
      keepAlive: true,
      keepAliveInitialDelay: 30000, // 30 seconds
      // Retry settings
      retryWrites: true,
      retryReads: true,
      // New options for better stability
      maxConnecting: 10, // Maximum number of simultaneous connections
      waitQueueTimeoutMS: 30000, // Wait queue timeout
      // Disable buffering
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    const conn = await withRetry(
      () => mongoose.connect(process.env.MONGODB_URI, options),
      3, // Retry 3 times
      1000 // Start with 1 second delay
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection pool: ${conn.connections.length} active`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected from DB');
    });

    // Close the Mongoose connection when the application exits
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 Mongoose connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('💡 TIP: Check your MONGODB_URI in .env file and ensure MongoDB is running');
    process.exit(1);
  }
};

export { connectDB, withRetry };
