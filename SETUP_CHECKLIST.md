# ✅ Setup Checklist

Follow this checklist to get your Weight Tracker app running!

---

## 📋 Pre-Setup

- [x] Node.js installed (v22.17.1 ✓)
- [x] Backend dependencies installed ✓
- [x] Frontend dependencies installed ✓
- [x] Backend code created ✓
- [x] Frontend integration added ✓

---

## 🔧 Your Setup Tasks

### 1️⃣ MongoDB Atlas Setup (5 minutes)

- [ ] Go to https://www.mongodb.com/cloud/atlas/register
- [ ] Create free account (or sign in)
- [ ] Create new cluster (M0 Free tier)
- [ ] Create database user:
  - [ ] Username: `weighttracker`
  - [ ] Password: _____________ (save this!)
- [ ] Set up Network Access:
  - [ ] Click "Network Access" → "Add IP Address"
  - [ ] Click "Allow Access from Anywhere" (0.0.0.0/0)
- [ ] Get connection string:
  - [ ] Click "Connect" → "Connect your application"
  - [ ] Copy connection string
  - [ ] Save it: _________________________________

### 2️⃣ Backend Configuration (2 minutes)

- [ ] Navigate to `backend` folder
- [ ] Create `.env` file (copy from `.env.example`)
- [ ] Edit `.env` file:
  ```env
  MONGODB_URI=mongodb+srv://weighttracker:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/weight_tracker?retryWrites=true&w=majority
  PORT=5000
  DEFAULT_USER_ID=user_001
  ```
- [ ] Replace `YOUR_PASSWORD` with your MongoDB password
- [ ] Replace `cluster0.xxxxx.mongodb.net` with your cluster URL
- [ ] Save the file

### 3️⃣ Start Backend Server (1 minute)

- [ ] Open terminal in `backend` folder
- [ ] Run: `npm start`
- [ ] Check for success message:
  ```
  ✅ MongoDB Connected
  🚀 Server is running on http://localhost:5000
  ```
- [ ] Test in browser: http://localhost:5000
- [ ] Should see JSON response with API info

### 4️⃣ Seed Sample Data (Optional, 30 seconds)

- [ ] Open new terminal in `backend` folder
- [ ] Run: `npm run seed`
- [ ] Check for success message:
  ```
  ✨ Database seeded successfully!
  ```
- [ ] Verify in MongoDB Atlas:
  - [ ] Go to "Browse Collections"
  - [ ] See `weight_tracker` database
  - [ ] See `users` and `logs` collections

### 5️⃣ Start Frontend (1 minute)

- [ ] Open new terminal in project root
- [ ] Run: `npm run dev`
- [ ] Check for success message:
  ```
  Local: http://localhost:5173/
  ```
- [ ] Open browser: http://localhost:5173

### 6️⃣ Test the App (2 minutes)

- [ ] App loads without errors
- [ ] No "Offline mode" warning at top
- [ ] Dashboard shows data
- [ ] Click "Log Weight" button
- [ ] Enter weight (e.g., 75)
- [ ] Click Save
- [ ] Weight appears on dashboard
- [ ] Check MongoDB Atlas - new entry in `logs` collection
- [ ] Click "Progress" tab - see charts
- [ ] Click "Settings" tab - update goal weight
- [ ] Log a meal (Breakfast/Lunch/Snacks/Dinner)

---

## 🎉 Success Criteria

Your setup is complete when:

✅ Backend server running on port 5000  
✅ Frontend running on port 5173  
✅ MongoDB Atlas connected  
✅ No "Offline mode" warning  
✅ Can log weight and meals  
✅ Data appears in MongoDB Atlas  
✅ Charts show on Progress page  

---

## 🐛 Troubleshooting

### ❌ Backend won't start

**Check:**
- [ ] `.env` file exists in `backend` folder
- [ ] MongoDB URI is correct
- [ ] Port 5000 is not in use
- [ ] Internet connection is active

**Fix:**
```bash
cd backend
# Check if .env exists
dir .env

# If not, copy from example
copy .env.example .env

# Then edit .env with your MongoDB URI
```

### ❌ "Offline mode" warning

**Check:**
- [ ] Backend is running (check terminal)
- [ ] Backend is on http://localhost:5000
- [ ] No CORS errors in browser console

**Fix:**
```bash
# Restart backend
cd backend
npm start
```

### ❌ Can't connect to MongoDB

**Check:**
- [ ] IP is whitelisted in MongoDB Atlas
- [ ] Username and password are correct
- [ ] Connection string format is correct

**Fix:**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Confirm

### ❌ Port already in use

**Fix:**
```bash
# Change port in backend/.env
PORT=5001

# Or kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📚 Help Resources

- **Quick Start**: `QUICK_START.md`
- **Full Setup Guide**: `SETUP_INSTRUCTIONS.md`
- **Backend API Docs**: `backend/README.md`
- **MongoDB Guide**: `backend/MONGODB_SETUP.md`
- **Project Overview**: `README.md`

---

## 📸 Screenshots to Take (Optional)

Once working, take screenshots of:
- [ ] Dashboard with your data
- [ ] Progress charts
- [ ] MongoDB Atlas collections
- [ ] Backend API response

---

## 🚀 Next Steps After Setup

Once everything works:

1. **Customize**:
   - Update user name in Settings
   - Set your goal weight
   - Log your actual meals

2. **Learn**:
   - Explore the API endpoints
   - Check MongoDB Atlas dashboard
   - View browser DevTools Network tab

3. **Extend** (optional):
   - Add authentication
   - Deploy to production
   - Add more features

---

**Current Status**: Ready to start setup! 🎯

**Estimated Time**: 10-15 minutes

**Start with**: Step 1️⃣ MongoDB Atlas Setup

---

Good luck! 🍀
