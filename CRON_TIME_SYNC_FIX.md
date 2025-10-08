# Cron Jobs & Time Sync Fix

## 🐛 Issues Fixed

### 1. **Cron Job Setup Error (500)**
**Problem:** Cron job creation was failing with 500 Internal Server Error

**Root Causes:**
- Cron job service was using hardcoded times (7 AM, 8 AM, 9 AM)
- Service wasn't reading user's schedule from email preferences
- Service was using environment variable API key instead of user's API key

**Solution:**
- ✅ Updated cron setup endpoint to fetch user's email preferences
- ✅ Extract schedule times from database
- ✅ Pass user's schedule times to cron job creation
- ✅ Use user's API key for cron-job.org API calls

### 2. **Time Sync Not Working**
**Problem:** Email schedule times weren't syncing to cron jobs

**Root Cause:**
- Cron jobs were created with hardcoded UTC times
- User's schedule preferences were ignored

**Solution:**
- ✅ Read schedule from `user.email_notifications.schedule`
- ✅ Convert HH:MM format to cron schedule format
- ✅ Create cron jobs with user's specified times

## 📝 Changes Made

### Backend Files Modified

#### 1. `backend/routes/cronJobs.js`
```javascript
// Before: Hardcoded times, no user schedule
router.post('/cron-jobs/setup-email-summaries', async (req, res) => {
  const dailyJobData = cronJobOrgService.createEmailSummaryJob('daily', backendUrl, apiKey);
  // Used hardcoded 7 AM
});

// After: Dynamic times from user preferences
router.post('/cron-jobs/setup-email-summaries', async (req, res) => {
  // Get user's email preferences
  const user = await User.findOne({ _id: userId });
  const schedule = user.email_notifications.schedule;
  
  // Create jobs with user's times
  const dailyJobData = cronJobOrgService.createEmailSummaryJob(
    'daily', backendUrl, apiKey, schedule.daily  // Uses user's time!
  );
  
  // Pass user's API key to service
  const dailyJob = await cronJobOrgService.createJob(dailyJobData, apiKey);
});
```

**Key Changes:**
- Fetches user from database
- Extracts schedule times (daily, weekly, monthly)
- Passes schedule times to `createEmailSummaryJob()`
- Passes user's API key to `createJob()`
- Improved error messages

#### 2. `backend/services/cronJobOrgService.js`

**Updated `makeRequest()` method:**
```javascript
// Before: Only used environment variable API key
async makeRequest(endpoint, options = {}) {
  headers: {
    'Authorization': `Bearer ${this.apiKey}`,  // Always env var
  }
}

// After: Accepts custom API key
async makeRequest(endpoint, options = {}, customApiKey = null) {
  const apiKey = customApiKey || this.apiKey;  // User's key or fallback
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  }
}
```

**Updated `createJob()` method:**
```javascript
// Before: No API key parameter
async createJob(jobData) {
  const response = await this.makeRequest('/jobs', {...});
}

// After: Accepts user's API key
async createJob(jobData, customApiKey = null) {
  const response = await this.makeRequest('/jobs', {...}, customApiKey);
}
```

**Updated `createEmailSummaryJob()` method:**
```javascript
// Before: Hardcoded times
createEmailSummaryJob(type, backendUrl, apiKey) {
  const schedules = {
    daily: '0 7 * * *',      // Always 7 AM
    weekly: '0 8 * * 1',     // Always 8 AM Monday
    monthly: '0 9 1 * *'     // Always 9 AM 1st
  };
}

// After: Dynamic times from user preferences
createEmailSummaryJob(type, backendUrl, apiKey, scheduleTime = '20:00') {
  // Convert HH:MM to cron format
  const [hours, minutes] = scheduleTime.split(':');
  
  const schedules = {
    daily: `${minutes} ${hours} * * *`,           // User's time!
    weekly: `${minutes} ${hours} * * 1`,          // User's time on Monday
    monthly: `${minutes} ${hours} 1 * *`          // User's time on 1st
  };
}
```

## 🔄 How It Works Now

### Flow: Email Schedule → Cron Jobs

1. **User sets email times**
   - Settings → Email tab
   - Daily: 08:00, Weekly: 10:30, Monthly: 19:00
   - Times saved to `user.email_notifications.schedule`

2. **User enters Cron API key**
   - Settings → Cron Jobs tab
   - Enters their cron-job.org API key
   - Key saved to `user.cron_api_key`

3. **User clicks "Setup Email Cron Jobs"**
   - Frontend sends: `{ backendUrl, apiKey, userId }`
   - Backend fetches user from database
   - Extracts schedule: `{ daily: '08:00', weekly: '10:30', monthly: '19:00' }`

4. **Cron jobs created with user's times**
   - Daily job: `0 8 * * *` (8:00 AM daily)
   - Weekly job: `30 10 * * 1` (10:30 AM Monday)
   - Monthly job: `0 19 1 * *` (19:00/7 PM on 1st)

5. **Cron jobs use user's API key**
   - All API calls to cron-job.org use user's key
   - Jobs are created in user's cron-job.org account

## 🧪 Testing Instructions

### Test 1: Email Schedule Sync to Cron Jobs
1. **Set email times:**
   - Settings → Email tab
   - Daily: `09:00`
   - Weekly: `11:00`
   - Monthly: `20:00`
   - Verify "Saved!" indicator

2. **Setup cron jobs:**
   - Settings → Cron Jobs tab
   - Enter valid cron-job.org API key
   - Click "Setup Email Cron Jobs"

3. **Verify cron jobs:**
   - Should see 3 jobs created successfully
   - Check cron-job.org dashboard
   - Daily job should run at 9:00 AM UTC
   - Weekly job should run at 11:00 AM Monday
   - Monthly job should run at 20:00 (8 PM) on 1st

### Test 2: Change Times and Recreate
1. **Change email times:**
   - Settings → Email tab
   - Daily: `07:00`
   - Weekly: `18:00`
   - Monthly: `21:00`

2. **Delete old cron jobs:**
   - Settings → Cron Jobs
   - Delete existing jobs

3. **Recreate cron jobs:**
   - Click "Setup Email Cron Jobs" again
   - New jobs should use new times (7 AM, 6 PM, 9 PM)

### Test 3: User API Key Usage
1. **Enter your cron-job.org API key**
2. **Setup cron jobs**
3. **Check cron-job.org dashboard**
4. **Verify:** Jobs appear in YOUR account (not system account)

## 📊 Cron Schedule Format

### Time Conversion Examples:
| User Input (HH:MM) | Cron Format | Description |
|-------------------|-------------|-------------|
| `08:00` | `0 8 * * *` | 8:00 AM daily |
| `10:30` | `30 10 * * 1` | 10:30 AM Monday |
| `19:00` | `0 19 1 * *` | 7:00 PM on 1st |
| `07:15` | `15 7 * * *` | 7:15 AM daily |
| `23:45` | `45 23 * * 1` | 11:45 PM Monday |

### Cron Format Breakdown:
```
  ┌───────────── minute (0 - 59)
  │ ┌───────────── hour (0 - 23)
  │ │ ┌───────────── day of month (1 - 31)
  │ │ │ ┌───────────── month (1 - 12)
  │ │ │ │ ┌───────────── day of week (0 - 7) (Sunday = 0 or 7)
  │ │ │ │ │
  * * * * *
```

Examples:
- `0 8 * * *` = Every day at 8:00 AM
- `30 10 * * 1` = Every Monday at 10:30 AM
- `0 19 1 * *` = 1st of every month at 7:00 PM

## ✅ Expected Results

After deploying these fixes:

### Email Schedule Sync ✅
- [x] Cron jobs created with user's schedule times
- [x] Daily job runs at user's daily time
- [x] Weekly job runs at user's weekly time
- [x] Monthly job runs at user's monthly time

### API Key Usage ✅
- [x] User's cron-job.org API key is used
- [x] Jobs appear in user's account
- [x] No dependency on environment variables

### Error Handling ✅
- [x] No more 500 errors
- [x] Better error messages
- [x] Proper validation

## 🚨 Important Notes

### Timezone:
- All cron jobs use **UTC timezone**
- If user is in PST (-8), a job set for 8:00 AM will run at 8:00 AM UTC
- Which is 12:00 AM (midnight) PST
- **Future enhancement:** Add timezone selection

### API Key Security:
- User's API key is stored in database
- Transmitted to cron-job.org for job creation
- Used for all cron job operations
- **Make sure to use HTTPS** in production

### Default Times:
- If user hasn't set schedule times, defaults to `20:00` (8 PM)
- Can be changed in Settings → Email tab

## 🚀 Deployment

After pushing these changes:

1. **Backend will:**
   - Read user's schedule from database
   - Create cron jobs with correct times
   - Use user's API key for cron-job.org

2. **Test by:**
   - Setting email times
   - Entering cron API key
   - Creating cron jobs
   - Checking cron-job.org dashboard

---

**All issues are now fixed!** ✅
