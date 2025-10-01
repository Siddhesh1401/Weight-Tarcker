# 📊 Weight Tracker

> A comprehensive full-stack health tracking application for monitoring weight, meals, water intake, and sleep quality.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://github.com/Siddhesh1401/Weight-Tarcker)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

### 🏠 Dashboard
- **Quick Actions**: 8 one-tap buttons for instant logging
- **Today's Summary**: Real-time overview of completed activities
- **Motivational Quotes**: Random health and fitness inspiration
- **Smart Greeting**: Personalized time-based messages

### 🍽️ Meal Tracking
- **5 Meal Types**: Breakfast, Lunch, Snacks, Dinner, Other
- **Regular & Cheat Meals**: Track both healthy and indulgent eating
- **Custom Presets**: Save your favorite meals for quick logging
- **Preset Manager**: Add, edit, and delete custom meal options
- **Tea Tracking**: Optional tea/biscuit consumption logging

### 💧 Water Tracking
- **Glass Counter**: Track daily water intake
- **Visual Progress**: See your hydration goals
- **Quick Logging**: One-tap to add glasses

### 😴 Sleep Tracking
- **Hours Input**: Log sleep duration
- **Quality Rating**: Poor, Fair, Good, Excellent
- **Color-coded Display**: Visual quality indicators

### ⚖️ Weight Tracking
- **Daily Logging**: Track weight in kilograms
- **Historical Data**: View weight trends over time
- **Progress Monitoring**: See your fitness journey

### 📊 Data Export (NEW!)
- **Export All Data**: Complete data export with optional date range
- **Export Single Day**: Export specific date logs
- **3 Formats**: CSV (Excel), JSON (Backup), PDF (Printable)
- **Smart Filtering**: Export only what you need

### 📅 History & Management
- **Date-based View**: Browse all logs by date
- **Filter by Type**: Show only Meals/Weight/Water/Sleep
- **Delete Confirmation**: Type "DELETE" for safety
- **Detailed View**: See complete log details for any date

### ⚙️ Settings
- **User Profile**: Name, age, height
- **Goal Weight**: Set and track target weight
- **Daily Goals**: Water and sleep targets
- **Persistent Storage**: All preferences saved

## 🛠️ Tech Stack

### Frontend
- **React** 18.3 with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB Atlas** for cloud database
- **Mongoose** for ODM
- **CORS** enabled for cross-origin requests

## 📦 Project Structure

```
weight tracker/
├── backend/                    # Backend API
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Log.js             # Log schema
│   ├── routes/
│   │   ├── logs.js            # Log endpoints
│   │   └── settings.js        # Settings endpoints
│   ├── scripts/
│   │   └── seed.js            # Sample data generator
│   ├── server.js              # Main Express server
│   ├── test-server.js         # Test server (no DB)
│   ├── package.json
│   ├── .env.example           # Environment template
│   ├── README.md              # Backend documentation
│   └── MONGODB_SETUP.md       # MongoDB setup guide
│
├── src/                       # Frontend
│   ├── components/
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Progress.tsx       # Progress charts
│   │   ├── Settings.tsx       # Settings page
│   │   ├── MealLog.tsx        # Meal logging modal
│   │   ├── WeightLog.tsx      # Weight logging modal
│   │   └── BottomNav.tsx      # Navigation bar
│   ├── services/
│   │   └── api.ts             # Backend API integration
│   ├── data/
│   │   └── mockData.ts        # Mock data for offline mode
│   ├── types.ts               # TypeScript types
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
│
├── SETUP_INSTRUCTIONS.md      # Complete setup guide
├── package.json               # Frontend dependencies
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier)

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Set Up MongoDB Atlas

Follow the detailed guide in `backend/MONGODB_SETUP.md` or:

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create database user
4. Whitelist your IP (or allow all: 0.0.0.0/0)
5. Get connection string

### 3. Configure Backend

Create `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/weight_tracker?retryWrites=true&w=majority
PORT=5000
DEFAULT_USER_ID=user_001
```

### 4. Seed Sample Data (Optional)

```bash
cd backend
npm run seed
```

This creates 14 days of sample logs for testing.

### 5. Start Backend Server

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:5000`

### 6. Start Frontend

In a new terminal:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📱 Usage

### Logging a Meal
1. Click on a meal button (Breakfast, Lunch, Snacks, Dinner)
2. Enter meal description
3. Optionally mark "Had tea + biscuit" or "Cheat Meal"
4. Click Save

### Logging Weight
1. Click the "Log Weight" button
2. Enter your current weight in kg
3. Click Save

### Viewing Progress
1. Click the "Progress" tab in bottom navigation
2. View weight trends and meal statistics

### Updating Settings
1. Click the "Settings" tab
2. Update goal weight and meal times
3. Click Save

## 🔌 API Endpoints

### Logs
- `POST /api/log` - Save a meal/weight entry
- `GET /api/logs?user_id=user_001` - Get all logs
- `GET /api/logs?user_id=user_001&date=2025-10-01` - Get logs for specific date
- `GET /api/progress?user_id=user_001&days=30` - Get progress data

### Settings
- `POST /api/settings` - Save user settings
- `GET /api/settings?user_id=user_001` - Get user settings

See `backend/README.md` for detailed API documentation.

## 🧪 Testing

### Test Backend (Without Database)
```bash
cd backend
node test-server.js
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/

# Get logs
curl http://localhost:5000/api/logs?user_id=user_001

# Save a meal
curl -X POST http://localhost:5000/api/log \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_001",
    "date": "2025-10-01",
    "meal_type": "breakfast",
    "meal_notes": "Healthy breakfast"
  }'
```

## 🎨 Features in Detail

### Offline Mode
- App works without backend connection
- Uses mock data when offline
- Shows warning banner when backend unavailable
- Automatically syncs when backend comes online

### Data Persistence
- All data stored in MongoDB Atlas
- Optimistic UI updates for better UX
- Automatic retry on failed requests

### Responsive Design
- Mobile-first design
- Works on all screen sizes
- Touch-friendly interface

## 🔧 Development

### Frontend Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
npm run dev          # Start with auto-restart
npm start            # Start normally
npm run seed         # Seed sample data
```

## 📚 Documentation

- **Setup Guide**: `SETUP_INSTRUCTIONS.md`
- **Backend API**: `backend/README.md`
- **MongoDB Setup**: `backend/MONGODB_SETUP.md`

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file exists in `backend` folder
- Verify MongoDB connection string
- Ensure port 5000 is available

### Can't connect to MongoDB
- Check IP whitelist in MongoDB Atlas
- Verify credentials in connection string
- Try "Allow Access from Anywhere" (0.0.0.0/0)

### Frontend shows offline mode
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify CORS is enabled on backend

### Data not saving
- Check backend logs for errors
- Verify MongoDB connection is active
- Check browser Network tab for failed requests

## 🚀 Deployment

### Quick Deploy to Vercel (Recommended)

Deploy frontend + backend together in 10 minutes! See `SIMPLE_DEPLOY.md` for step-by-step guide.

**What you need:**
1. MongoDB Atlas account (free)
2. GitHub account (free)
3. Vercel account (free)

**Steps:**
1. Push code to GitHub
2. Connect Vercel to GitHub
3. Add MongoDB connection string
4. Deploy!

**Result:** Get a live URL like `https://weight-tracker-xxxxx.vercel.app`

### Alternative Deployment Options

**Backend:**
- Render (free tier, auto-deploy from GitHub)
- Railway (free tier, simple setup)
- Heroku (paid)

**Frontend:**
- Netlify (free, drag & drop)
- GitHub Pages (free, static hosting)

**See detailed guides:**
- `SIMPLE_DEPLOY.md` - 10-minute Vercel deployment
- `DEPLOYMENT_GUIDE.md` - Advanced multi-service deployment

## 🔐 Security Notes

- `.env` files are gitignored
- Never commit sensitive credentials
- Use environment variables for all secrets
- Restrict MongoDB IP whitelist in production
- Add authentication before deploying publicly

## 📝 License

MIT License - Feel free to use for personal projects

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📧 Support

For issues or questions, check the documentation files:
- `SETUP_INSTRUCTIONS.md`
- `backend/README.md`
- `backend/MONGODB_SETUP.md`

---

**Built with ❤️ for personal health tracking**
