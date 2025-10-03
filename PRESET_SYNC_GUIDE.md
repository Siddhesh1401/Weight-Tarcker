# 🔄 Custom Meal Preset Sync Guide

## How It Works Now

Your custom meal presets are now automatically synced across all devices using the backend database!

## ✅ What's Been Fixed

1. **Auto-Migration**: When you open the preset manager while online, any presets from localStorage will automatically migrate to the backend
2. **Real-time Sync**: New presets are saved to the database and appear on all devices
3. **Offline Support**: Works offline and syncs when connection returns
4. **Visual Indicators**: Shows "Synced" or "Offline" status in the preset manager

## 🧪 How to Test the Sync

### Step 1: Start the Backend Server

On your laptop, open a terminal and run:
```bash
cd "c:\Users\SIDDHESH\Desktop\weight tracker\backend"
npm start
```

The server should start on `http://localhost:5000`

### Step 2: Start the Frontend

In another terminal:
```bash
cd "c:\Users\SIDDHESH\Desktop\weight tracker"
npm run dev
```

The frontend should start on `http://localhost:5173`

### Step 3: Access from Mobile

On your mobile device, connect to the same WiFi network as your laptop, then:
1. Find your laptop's local IP address
   - On Windows: `ipconfig` (look for IPv4 Address)
   - Example: `192.168.1.5`
2. Open on mobile: `http://192.168.1.5:5173`

### Step 4: Test the Sync

**On Mobile:**
1. Open any meal logging screen (Breakfast, Lunch, etc.)
2. Click the Settings icon (⚙️) to manage presets
3. Check the status indicator - should say "Synced" with a green dot
4. Add a custom preset (e.g., "Test Smoothie")
5. Close the preset manager

**On Laptop:**
1. Open the same meal type
2. Click the Settings icon to manage presets
3. You should see "Test Smoothie" appear!

### Step 5: Verify Backend Storage

You can verify the presets are in the database:
1. Go to MongoDB Atlas website
2. Browse Collections → `mealtemplates`
3. You should see your custom presets stored there

## 🔍 Troubleshooting

### "Offline" Status Shows When It Should Be Online

**Check Backend Connection:**
```bash
# Test if backend is running
curl http://localhost:5000
# Should return: {"success":true,"message":"Weight Tracker API is running"...}
```

**Check Network:**
- Make sure both devices are on the same WiFi
- Check firewall isn't blocking port 5000
- Try accessing from laptop browser: `http://localhost:5000`

### Presets Don't Appear on Other Device

1. **Check the sync indicator** - Is it green "Synced" or amber "Offline"?
2. **Refresh the page** on the other device
3. **Check browser console** for error messages (F12 → Console tab)
4. **Verify backend is running** - Check the terminal running `npm start`

### Old LocalStorage Presets Not Appearing

The migration happens automatically when you:
1. Are online (backend connected)
2. Open the Preset Manager
3. Have presets in localStorage

After migration, localStorage is cleared to prevent duplicates.

## 🎯 Expected Behavior

### When Online (Backend Connected):
- ✅ Custom presets save to MongoDB
- ✅ Changes sync across all devices instantly
- ✅ Green "Synced" indicator shows
- ✅ Old localStorage presets auto-migrate

### When Offline (Backend Not Connected):
- ✅ Presets save to localStorage temporarily
- ✅ Amber "Offline" indicator shows
- ✅ Will sync to backend when connection returns

## 📝 Notes

- **Default Presets**: The built-in presets (Oats, Poha, etc.) are the same everywhere
- **Hidden Defaults**: Which defaults you hide stays local (per device preference)
- **Custom Presets**: Your custom additions sync across all devices
- **Backend Required**: The backend must be running for sync to work

## 🚀 For Production Deployment

When you deploy to production (Vercel, etc.), the sync will work automatically because:
1. Backend will be hosted (e.g., on Render, Railway, etc.)
2. Frontend will be on Vercel
3. Both mobile and laptop will connect to the same backend URL
4. No need for local IP addresses

## 📞 Still Having Issues?

Check these files for more details:
- `backend/routes/templates.js` - Backend API endpoints
- `src/services/api.ts` - API client methods
- `src/components/MealPresetManager.tsx` - Preset management UI

Look for console errors in both:
- Browser DevTools (F12 → Console)
- Backend terminal (where npm start is running)
