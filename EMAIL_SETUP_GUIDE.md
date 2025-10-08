# 📧 Email Notifications Setup Guide

## 🚀 Quick Setup

### 1. Configure Email Settings

1. **Set up Gmail App Password:**
   - Go to Google Account settings
   - Enable 2-Factor Authentication
   - Generate an App Password for "Mail"
   - Use this 16-character password (not your regular password)

2. **Update `.env` file in backend folder:**
   ```env
   # Email Configuration (Gmail SMTP - Free)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM=Weight Tracker <your-email@gmail.com>

   # Cron Job API Key (generate a secure random string)
   CRON_API_KEY=your-secure-api-key-here
   ```

3. **Set up your email in the app:**
   - Open Weight Tracker app
   - Go to Settings → Email tab
   - Enable email notifications
   - Enter your email address
   - Select which summaries you want (daily/weekly/monthly)
   - Click "Send Test Email" to verify

### 2. Set Up Cron Jobs

**Choose one of these free cron job services:**

#### Option A: cron-job.org (Recommended - Free)
1. Create account at [cron-job.org](https://cron-job.org)
2. Add new cron job with these settings:

**Daily Summary (7:00 AM):**
- URL: `https://your-backend-url.vercel.app/api/email/send-daily-summary`
- Schedule: `0 7 * * *` (every day at 7 AM)
- Method: POST
- Headers: `x-api-key: your-cron-api-key`

**Weekly Summary (Monday 8:00 AM):**
- URL: `https://your-backend-url.vercel.app/api/email/send-weekly-summary`
- Schedule: `0 8 * * 1` (every Monday at 8 AM)
- Method: POST
- Headers: `x-api-key: your-cron-api-key`

**Monthly Summary (1st day 9:00 AM):**
- URL: `https://your-backend-url.vercel.app/api/email/send-monthly-summary`
- Schedule: `0 9 1 * *` (1st day of every month at 9 AM)
- Method: POST
- Headers: `x-api-key: your-cron-api-key`

#### Option B: EasyCron (Free tier)
1. Create account at [easycron.com](https://www.easycron.com)
2. Similar setup as above, but use their interface

#### Option C: Local Cron (if you have a VPS/server)
```bash
# Edit crontab
crontab -e

# Add these lines (adjust paths as needed):
# Daily at 7 AM
0 7 * * * cd /path/to/weight-tracker/backend && npm run cron-daily

# Weekly on Monday at 8 AM
0 8 * * 1 cd /path/to/weight-tracker/backend && npm run cron-weekly

# Monthly on 1st day at 9 AM
0 9 1 * * cd /path/to/weight-tracker/backend && npm run cron-monthly
```

### 3. Test Everything

1. **Test Email Configuration:**
   - Use the "Send Test Email" button in the app

2. **Test Cron Jobs:**
   - Manually trigger each cron job to verify they work

3. **Check Logs:**
   - Monitor your backend logs for any errors

## 📋 Email Summary Content

### Daily Summary
- Previous day's meals with details
- Weight change from previous day
- Water intake vs goal
- Sleep quality and duration
- Achievement highlights

### Weekly Summary
- Weekly meal patterns and trends
- Average daily nutrition stats
- Weight progress over the week
- Weekly water and sleep averages
- Consistency metrics and insights

### Monthly Summary
- Monthly trends and patterns
- Weight loss/gain progress
- Goal achievement percentages
- Long-term insights
- Monthly achievements and streaks

## 🔧 Troubleshooting

### Email not sending?
- Check your Gmail app password is correct
- Verify the email address in settings
- Check backend logs for errors

### Cron jobs not working?
- Verify the API key matches your .env file
- Check that your backend is running and accessible
- Test the cron job URLs manually

### Need help?
Check the backend console logs and ensure all environment variables are set correctly.

---

**🎉 You're all set!** You'll now receive automated email summaries of your health journey!
