# ⚡ Quick Start Guide

## 🎯 What You Need to Do Next

### Step 1: Set Up MongoDB Atlas (5 minutes)

1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** for free account
3. **Create cluster** (M0 Free tier)
4. **Create database user**:
   - Username: `weighttracker`
   - Password: (save this!)
5. **Network Access**: Click "Allow Access from Anywhere"
6. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string

### Step 2: Configure Backend

1. **Create `.env` file** in `backend` folder:
   ```bash
   cd backend
   copy .env.example .env
   ```

2. **Edit `backend/.env`** with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://weighttracker:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/weight_tracker?retryWrites=true&w=majority
   PORT=5000
   DEFAULT_USER_ID=user_001
   ```
   
   Replace:
   - `YOUR_PASSWORD` with your MongoDB password
   - `cluster0.xxxxx.mongodb.net` with your cluster URL

### Step 3: Start Backend

```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected
🚀 Server is running on http://localhost:5000
```

### Step 4: Seed Sample Data (Optional)

In a new terminal:
```bash
cd backend
npm run seed
```

This creates 14 days of sample logs for testing charts.

### Step 5: Start Frontend

In a new terminal:
```bash
npm run dev
```

Open: http://localhost:5173

---

## 🎉 You're Done!

Your app is now running with:
- ✅ Backend API on port 5000
- ✅ Frontend UI on port 5173
- ✅ MongoDB Atlas database
- ✅ Sample data loaded

## 🧪 Quick Test

1. **Open** http://localhost:5173
2. **Click** "Log Weight" button
3. **Enter** your weight (e.g., 75)
4. **Click** Save
5. **Check** MongoDB Atlas dashboard to see your data!

## 📱 Features to Try

- **Dashboard**: View today's summary
- **Log Meals**: Click Breakfast/Lunch/Snacks/Dinner
- **Track Weight**: Click "Log Weight" button
- **View Progress**: Click Progress tab (bottom nav)
- **Settings**: Click Settings tab to set goal weight

## 🔍 Verify Backend is Working

Open in browser: http://localhost:5000

You should see:
```json
{
  "success": true,
  "message": "Weight Tracker API is running",
  "endpoints": { ... }
}
```

## 📊 View Your Data in MongoDB

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. See `weight_tracker` database with:
   - `users` collection
   - `logs` collection

## 🆘 Troubleshooting

### Backend won't start?
- Check `.env` file exists in `backend` folder
- Verify MongoDB connection string is correct
- Make sure port 5000 is not in use

### Shows "Offline mode"?
- Backend is not running or not reachable
- Check backend terminal for errors
- Verify backend is on http://localhost:5000

### Can't connect to MongoDB?
- Check IP whitelist in MongoDB Atlas
- Verify username and password
- Try "Allow Access from Anywhere" (0.0.0.0/0)

## 📚 Full Documentation

- **Complete Setup**: `SETUP_INSTRUCTIONS.md`
- **Backend API**: `backend/README.md`
- **MongoDB Setup**: `backend/MONGODB_SETUP.md`
- **Main README**: `README.md`

---

**Need help?** Check the documentation files above! 🚀
