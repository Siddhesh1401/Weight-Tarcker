# MongoDB Atlas Setup Guide

Follow these steps to set up your MongoDB Atlas database for the Weight Tracker app.

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email or Google account
3. Complete the registration process

## Step 2: Create a New Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (perfect for development)
3. Select your preferred cloud provider and region (choose one closest to you)
4. Give your cluster a name (or keep the default)
5. Click **"Create"**
6. Wait 3-5 minutes for the cluster to be created

## Step 3: Create Database User

1. Click **"Database Access"** in the left sidebar (under Security)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a username (e.g., `weighttracker`)
5. Click **"Autogenerate Secure Password"** or create your own
6. **IMPORTANT:** Copy and save this password somewhere safe!
7. Under "Database User Privileges", select **"Read and write to any database"**
8. Click **"Add User"**

## Step 4: Whitelist Your IP Address

1. Click **"Network Access"** in the left sidebar (under Security)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - This adds `0.0.0.0/0` to the whitelist
   - For production, you should restrict this to specific IPs
4. Click **"Confirm"**

## Step 5: Get Your Connection String

1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Choose **"Node.js"** as the driver
5. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Configure Your Backend

1. Open the `backend` folder
2. Create a `.env` file (copy from `.env.example`)
3. Paste your connection string and modify it:

```env
MONGODB_URI=mongodb+srv://weighttracker:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/weight_tracker?retryWrites=true&w=majority
PORT=5000
DEFAULT_USER_ID=user_001
```

**Important modifications:**
- Replace `<username>` with your database username (e.g., `weighttracker`)
- Replace `<password>` with the password you saved earlier
- Add `/weight_tracker` before the `?` to specify the database name
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL

### Example:
If your username is `weighttracker`, password is `MyPass123`, and cluster is `cluster0.abc123.mongodb.net`, your connection string should be:

```
mongodb+srv://weighttracker:MyPass123@cluster0.abc123.mongodb.net/weight_tracker?retryWrites=true&w=majority
```

## Step 7: Test the Connection

1. Open a terminal in the `backend` folder
2. Run:
   ```bash
   npm start
   ```
3. You should see:
   ```
   ✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
   📊 Database: weight_tracker
   🚀 Server is running on http://localhost:5000
   ```

## Step 8: Seed Sample Data

1. Run the seed script:
   ```bash
   npm run seed
   ```
2. This will create:
   - A sample user
   - 14 days of meal logs
   - Weight entries
   - Some cheat meals

## Troubleshooting

### Error: "Authentication failed"
- Double-check your username and password in the connection string
- Make sure there are no special characters that need URL encoding
- If your password has special characters, encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

### Error: "Connection timeout"
- Check that your IP is whitelisted in Network Access
- Try using "Allow Access from Anywhere" (0.0.0.0/0)
- Check your firewall settings

### Error: "Could not connect to any servers"
- Verify your cluster is running (not paused)
- Check your internet connection
- Ensure the cluster URL is correct

## Viewing Your Data

1. Go to MongoDB Atlas dashboard
2. Click **"Browse Collections"** on your cluster
3. You'll see:
   - `weight_tracker` database
   - `users` collection
   - `logs` collection
4. You can view, edit, and delete data directly from here

## Next Steps

Once connected:
1. Test the API endpoints using the examples in `README.md`
2. Connect your frontend to the backend
3. Start logging your meals and weight!

## Security Best Practices (For Production)

- [ ] Use environment variables for sensitive data
- [ ] Restrict IP whitelist to specific addresses
- [ ] Use strong, unique passwords
- [ ] Enable MongoDB Atlas audit logs
- [ ] Set up database backups
- [ ] Implement rate limiting on your API
- [ ] Add user authentication (JWT)
