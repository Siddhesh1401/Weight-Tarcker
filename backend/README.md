# Weight Tracker Backend API
 
Backend server for the Weight Tracker application built with Node.js, Express, and MongoDB Atlas.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account (if you don't have one)
3. Create a new cluster (free tier M0 is sufficient)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/weight_tracker?retryWrites=true&w=majority
PORT=5000
DEFAULT_USER_ID=user_001
```

**Important:** Replace `YOUR_USERNAME`, `YOUR_PASSWORD`, and `YOUR_CLUSTER` with your actual MongoDB Atlas credentials.

### 4. Seed Sample Data (Optional)

```bash
npm run seed
```

This will create:
- A sample user
- 14 days of meal logs
- Weight entries showing progress
- Some cheat meals for testing

### 5. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```
GET /
```
Returns API status and available endpoints.

### Logs

#### Save a Log Entry
```
POST /api/log
```

**Request Body:**
```json
{
  "user_id": "user_001",
  "date": "2025-10-01",
  "meal_type": "breakfast",
  "meal_notes": "Oats with fruits",
  "tea_biscuit": false,
  "cheat_meal": false,
  "weight": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Log entry saved successfully",
  "data": { ... }
}
```

#### Get All Logs
```
GET /api/logs?user_id=user_001
GET /api/logs?user_id=user_001&date=2025-10-01
GET /api/logs?user_id=user_001&start_date=2025-09-01&end_date=2025-10-01
```

**Response:**
```json
{
  "success": true,
  "count": 42,
  "data": [ ... ]
}
```

#### Get Progress Data
```
GET /api/progress?user_id=user_001&days=30
```

**Response:**
```json
{
  "success": true,
  "data": {
    "weightHistory": [
      { "date": "2025-09-20", "weight": 82, "timestamp": "..." }
    ],
    "cheatMealCount": 3,
    "teaBiscuitCount": 5,
    "mealBreakdown": {
      "breakfast": 14,
      "lunch": 14,
      "snacks": 7,
      "dinner": 14
    },
    "totalLogs": 49,
    "dateRange": {
      "start": "2025-09-01",
      "end": "2025-10-01"
    }
  }
}
```

### Settings

#### Save Settings
```
POST /api/settings
```

**Request Body:**
```json
{
  "user_id": "user_001",
  "name": "Siddhesh",
  "email": "siddhesh@example.com",
  "goal_weight": 75
}
```

#### Get Settings
```
GET /api/settings?user_id=user_001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_001",
    "name": "Siddhesh",
    "email": "siddhesh@example.com",
    "goal_weight": 75,
    "created_at": "2025-10-01T..."
  }
}
```

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: String,           // User ID
  name: String,          // User's name
  email: String,         // Optional email
  goal_weight: Number,   // Target weight in kg
  created_at: Date       // Account creation date
}
```

### Log Collection
```javascript
{
  user_id: String,       // Reference to user
  date: String,          // Date in YYYY-MM-DD format
  meal_type: String,     // 'breakfast', 'lunch', 'snacks', 'dinner', 'weight'
  meal_notes: String,    // Description of the meal
  tea_biscuit: Boolean,  // Had tea/biscuits
  cheat_meal: Boolean,   // Was it a cheat meal
  weight: Number,        // Weight entry (if meal_type is 'weight')
  timestamp: Date        // Exact time of entry
}
```

## 🔧 Testing with cURL

### Save a meal log:
```bash
curl -X POST http://localhost:5000/api/log \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_001",
    "date": "2025-10-01",
    "meal_type": "breakfast",
    "meal_notes": "Healthy breakfast",
    "tea_biscuit": false,
    "cheat_meal": false
  }'
```

### Get logs:
```bash
curl http://localhost:5000/api/logs?user_id=user_001
```

### Get progress:
```bash
curl http://localhost:5000/api/progress?user_id=user_001&days=30
```

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📝 Notes

- The API uses a simple user_id system (no authentication yet)
- All dates are in YYYY-MM-DD format
- Weight is stored in kilograms
- The database name is `weight_tracker`
- CORS is enabled for all origins (configure for production)

## 🚨 Troubleshooting

### Connection Error
If you see "Error connecting to MongoDB":
1. Check your `.env` file has the correct MONGODB_URI
2. Ensure your IP is whitelisted in MongoDB Atlas (Network Access)
3. Verify your username and password are correct

### Port Already in Use
If port 5000 is busy, change the PORT in `.env` file.

## 📚 Next Steps

1. Add user authentication (JWT)
2. Add data validation middleware
3. Implement rate limiting
4. Add unit tests
5. Deploy to production (Render, Railway, or Heroku)
