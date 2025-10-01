// Simple test server to verify Express setup without MongoDB
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '✅ Backend server is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API endpoint is working!',
    data: {
      server: 'Express',
      database: 'MongoDB (not connected yet)',
      status: 'Ready for MongoDB setup'
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ Test server running on http://localhost:${PORT}`);
  console.log(`📝 Try: http://localhost:${PORT}/api/test\n`);
  console.log('Next steps:');
  console.log('1. Set up MongoDB Atlas (see MONGODB_SETUP.md)');
  console.log('2. Create .env file with your MONGODB_URI');
  console.log('3. Run: npm start\n');
});
