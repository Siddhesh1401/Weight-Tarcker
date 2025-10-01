# Weight Tracker App - Complete Setup Instructions

## 📋 Overview

Your weight tracker app now has:
- ✅ **Frontend**: React + TypeScript + Vite (already working)
- ✅ **Backend**: Node.js + Express + MongoDB Atlas (just created)

## 🚀 Quick Setup (5 Minutes)

### Step 1: Set Up MongoDB Atlas

1. **Create a free MongoDB Atlas account**: [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)

2. **Create a cluster** (M0 Free tier)

3. **Create a database user**:
   - Username: `weighttracker`
   - Password: (save this!)

4. **Whitelist your IP**: Click "Allow Access from Anywhere" (for development)

5. **Get connection string**: Click "Connect" → "Connect your application" → Copy the string

📖 **Detailed guide**: See `backend/MONGODB_SETUP.md`

### Step 2: Configure Backend

1. **Create `.env` file** in the `backend` folder:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/weight_tracker?retryWrites=true&w=majority
PORT=5000
DEFAULT_USER_ID=user_001
```

Replace:
- `YOUR_USERNAME` with your MongoDB username
- `YOUR_PASSWORD` with your MongoDB password
- `YOUR_CLUSTER` with your cluster URL

### Step 3: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected
🚀 Server is running on http://localhost:5000
```

### Step 4: Seed Sample Data (Optional but Recommended)

In a new terminal:
```bash
cd backend
npm run seed
```

This creates 14 days of sample meal logs and weight entries for testing.

### Step 5: Update Frontend to Use Backend

The frontend files need to be updated to call the backend API instead of using mock data. I'll do this next!

## 📁 Project Structure

```
weight tracker/
├── backend/                    # Backend API (NEW!)
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
│   ├── package.json
│   ├── .env                   # Your secrets (create this!)
│   ├── .env.example           # Template
│   ├── README.md              # API documentation
│   └── MONGODB_SETUP.md       # MongoDB setup guide
│
└── src/                       # Frontend (existing)
    ├── components/
    ├── App.tsx
    └── ...
```

## 🔌 API Endpoints

Once your backend is running, you can test these endpoints:

### Health Check
```bash
curl http://localhost:5000/
```

### Save a Meal Log
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

### Get All Logs
```bash
curl http://localhost:5000/api/logs?user_id=user_001
```

### Get Progress Data
```bash
curl http://localhost:5000/api/progress?user_id=user_001&days=30
```

### Save Settings
```bash
curl -X POST http://localhost:5000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_001",
    "name": "Siddhesh",
    "goal_weight": 75
  }'
```

## 🧪 Testing Checklist

- [ ] Backend server starts without errors
- [ ] MongoDB connection successful
- [ ] Seed script runs and creates sample data
- [ ] Can fetch logs via API
- [ ] Can create new log entries
- [ ] Can fetch progress data
- [ ] Can save/retrieve settings

## 🔄 Next Steps

1. **Test the backend** - Use the curl commands above or tools like Postman
2. **Connect frontend to backend** - Update React components to call API
3. **Test the full app** - Log meals and see them saved to MongoDB
4. **Deploy** (optional) - Deploy backend to Render/Railway and frontend to Vercel

## 🐛 Troubleshooting

### Backend won't start
- Check that `.env` file exists in `backend` folder
- Verify MongoDB connection string is correct
- Ensure port 5000 is not in use

### Can't connect to MongoDB
- Check your IP is whitelisted in MongoDB Atlas
- Verify username and password are correct
- Try "Allow Access from Anywhere" in Network Access

### Frontend can't reach backend
- Make sure backend is running on port 5000
- Check for CORS errors in browser console
- Verify API URLs in frontend code

## 📚 Documentation

- **Backend API**: `backend/README.md`
- **MongoDB Setup**: `backend/MONGODB_SETUP.md`
- **API Testing**: Use the curl commands in this file

## 💡 Tips

- Use `npm run dev` in backend for auto-restart during development
- Check MongoDB Atlas dashboard to view your data
- Use browser DevTools Network tab to debug API calls
- Keep your `.env` file secret (it's in `.gitignore`)

---

**Ready to proceed?** Let me know when your backend is running, and I'll update the frontend to connect to it! 🚀
