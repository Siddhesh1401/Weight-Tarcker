# 🏗️ Architecture Overview

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│                    http://localhost:5173                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Components:                                          │  │
│  │  • Dashboard.tsx  - Main view                        │  │
│  │  • Progress.tsx   - Charts & stats                   │  │
│  │  • Settings.tsx   - User settings                    │  │
│  │  • MealLog.tsx    - Meal entry form                  │  │
│  │  • WeightLog.tsx  - Weight entry form                │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Service (api.ts)                                │  │
│  │  • logApi.saveLog()                                  │  │
│  │  • logApi.getLogs()                                  │  │
│  │  • logApi.getProgress()                              │  │
│  │  • settingsApi.getSettings()                         │  │
│  │  • settingsApi.saveSettings()                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API Calls
                              │ (CORS enabled)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                 │
│                    http://localhost:5000                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Routes:                                              │  │
│  │  • POST /api/log        - Save entry                 │  │
│  │  • GET  /api/logs       - Get all logs               │  │
│  │  • GET  /api/progress   - Get statistics             │  │
│  │  • POST /api/settings   - Save settings              │  │
│  │  • GET  /api/settings   - Get settings               │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Mongoose Models:                                     │  │
│  │  • User.js  - User schema                            │  │
│  │  • Log.js   - Log schema                             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Driver
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas (Cloud)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Database: weight_tracker                            │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  Collection: users                              │ │  │
│  │  │  • _id, name, email, goal_weight, created_at    │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  Collection: logs                               │ │  │
│  │  │  • user_id, date, meal_type, meal_notes,        │ │  │
│  │  │    tea_biscuit, cheat_meal, weight, timestamp   │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Logging a Meal

```
User clicks "Breakfast" button
        ↓
MealLog.tsx modal opens
        ↓
User enters meal details
        ↓
User clicks "Save"
        ↓
App.tsx → handleSaveMeal()
        ↓
Optimistic UI update (instant feedback)
        ↓
api.ts → logApi.saveLog()
        ↓
POST /api/log
        ↓
Express routes/logs.js
        ↓
Mongoose Log.save()
        ↓
MongoDB Atlas
        ↓
Success response
        ↓
Console: "✅ Meal saved to backend"
```

### 2. Loading Dashboard Data

```
App.tsx mounts
        ↓
useEffect() runs
        ↓
api.ts → logApi.getLogs()
        ↓
GET /api/logs?user_id=user_001
        ↓
Express routes/logs.js
        ↓
Mongoose Log.find()
        ↓
MongoDB Atlas
        ↓
Returns array of logs
        ↓
Transform to frontend format
        ↓
Update state (meals, weights)
        ↓
Dashboard.tsx renders with data
```

### 3. Viewing Progress

```
User clicks "Progress" tab
        ↓
Progress.tsx component loads
        ↓
Receives meals & weights props
        ↓
Calculates statistics:
  • Weight trend
  • Cheat meal count
  • Meal breakdown
        ↓
Renders charts and stats
```

---

## 🗂️ File Structure & Responsibilities

### Frontend Files

```
src/
├── App.tsx                    # Main app logic, state management
├── main.tsx                   # Entry point
├── types.ts                   # TypeScript interfaces
│
├── components/
│   ├── Dashboard.tsx          # Shows today's summary
│   ├── Progress.tsx           # Charts and statistics
│   ├── Settings.tsx           # User preferences
│   ├── MealLog.tsx            # Meal entry form
│   ├── WeightLog.tsx          # Weight entry form
│   └── BottomNav.tsx          # Navigation bar
│
├── services/
│   └── api.ts                 # Backend API calls
│
└── data/
    └── mockData.ts            # Fallback data (offline mode)
```

### Backend Files

```
backend/
├── server.js                  # Express app setup
│
├── config/
│   └── db.js                  # MongoDB connection
│
├── models/
│   ├── User.js                # User schema & model
│   └── Log.js                 # Log schema & model
│
├── routes/
│   ├── logs.js                # Log endpoints
│   └── settings.js            # Settings endpoints
│
└── scripts/
    └── seed.js                # Sample data generator
```

---

## 🔌 API Endpoints Detail

### POST /api/log

**Purpose**: Save a meal or weight entry

**Request**:
```json
{
  "user_id": "user_001",
  "date": "2025-10-01",
  "meal_type": "breakfast",
  "meal_notes": "Oats with fruits",
  "tea_biscuit": false,
  "cheat_meal": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Log entry saved successfully",
  "data": { ... }
}
```

**Flow**: Request → routes/logs.js → new Log() → save() → MongoDB

---

### GET /api/logs

**Purpose**: Retrieve all logs for a user

**Query Params**:
- `user_id` (required)
- `date` (optional) - specific date
- `start_date`, `end_date` (optional) - date range

**Response**:
```json
{
  "success": true,
  "count": 42,
  "data": [ ... array of logs ... ]
}
```

**Flow**: Request → routes/logs.js → Log.find() → MongoDB → Response

---

### GET /api/progress

**Purpose**: Get weight history and statistics

**Query Params**:
- `user_id` (required)
- `days` (optional, default: 30)

**Response**:
```json
{
  "success": true,
  "data": {
    "weightHistory": [ ... ],
    "cheatMealCount": 3,
    "teaBiscuitCount": 5,
    "mealBreakdown": { ... },
    "totalLogs": 49
  }
}
```

**Flow**: Request → routes/logs.js → Log.find() → Calculate stats → Response

---

## 🔐 Security Considerations

### Current Implementation (Development)
- ✅ CORS enabled for all origins
- ✅ Environment variables for secrets
- ✅ .env files gitignored
- ⚠️ No authentication (single user: user_001)
- ⚠️ MongoDB IP whitelist: 0.0.0.0/0 (all IPs)

### For Production (Future)
- 🔒 Add JWT authentication
- 🔒 Restrict CORS to specific domain
- 🔒 Restrict MongoDB IP whitelist
- 🔒 Add rate limiting
- 🔒 Input validation & sanitization
- 🔒 HTTPS only
- 🔒 Secure password hashing

---

## 🚀 Performance Optimizations

### Current
- ✅ Optimistic UI updates (instant feedback)
- ✅ Efficient MongoDB queries with indexes
- ✅ Offline mode with mock data
- ✅ Single API call on mount

### Future Improvements
- 📈 Pagination for large datasets
- 📈 Caching with Redis
- 📈 Lazy loading components
- 📈 Service Worker for PWA
- 📈 Image optimization for meal photos
- 📈 WebSocket for real-time updates

---

## 🧪 Testing Strategy

### Manual Testing
1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test full user flows

### Test Scenarios
- ✅ Save meal log
- ✅ Save weight log
- ✅ Retrieve logs
- ✅ Calculate progress
- ✅ Update settings
- ✅ Offline mode fallback
- ✅ Error handling

---

## 📊 Database Design

### Why Two Collections?

**users** - Static user data
- Changes infrequently
- Small dataset
- One document per user

**logs** - Dynamic log data
- Changes frequently (multiple entries per day)
- Large dataset (grows over time)
- Many documents per user

### Indexes

```javascript
// Log collection indexes
{ user_id: 1, date: -1 }  // Compound index for efficient queries
```

Benefits:
- Fast queries by user_id
- Fast date range queries
- Efficient sorting

---

## 🔄 State Management

### Frontend State (React)

```javascript
App.tsx state:
├── currentPage      // 'dashboard' | 'progress' | 'settings'
├── meals           // Array of MealEntry
├── weights         // Array of WeightLog
├── settings        // UserSettings object
├── activeLogType   // Current modal type
├── isOnline        // Backend connection status
└── isLoading       // Initial load state
```

### State Flow

```
MongoDB Atlas (source of truth)
        ↓
Backend API (server state)
        ↓
Frontend State (client state)
        ↓
React Components (UI)
```

---

## 🎯 Key Design Decisions

### 1. Optimistic UI Updates
**Why**: Better user experience (instant feedback)
**How**: Update UI immediately, sync to backend asynchronously

### 2. Offline Mode
**Why**: App works without backend
**How**: Fallback to mock data if API fails

### 3. Single User System
**Why**: Simplicity for personal use
**How**: Hardcoded user_id = "user_001"

### 4. Unified Log Schema
**Why**: Simpler than separate meals/weights collections
**How**: meal_type field differentiates entry types

### 5. Date as String
**Why**: Easier to query and group by date
**How**: Store as "YYYY-MM-DD" format

---

## 📚 Technology Choices

| Layer | Technology | Why? |
|-------|-----------|------|
| Frontend Framework | React | Component-based, popular, great ecosystem |
| Language | TypeScript | Type safety, better DX |
| Build Tool | Vite | Fast dev server, modern |
| Styling | TailwindCSS | Utility-first, rapid development |
| Backend Framework | Express | Simple, flexible, widely used |
| Database | MongoDB | Flexible schema, JSON-like documents |
| ODM | Mongoose | Schema validation, query helpers |
| Hosting | MongoDB Atlas | Free tier, managed, reliable |

---

**This architecture is designed for**:
- ✅ Personal use (single user)
- ✅ Fast development
- ✅ Easy maintenance
- ✅ Future extensibility
- ✅ Learning full-stack development

**Next evolution**:
- Multi-user with authentication
- Mobile app (React Native)
- Advanced analytics
- Social features
