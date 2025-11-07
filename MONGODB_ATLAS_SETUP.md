# 🌩️ MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account (2 minutes)

1. **Sign Up** at https://www.mongodb.com/cloud/atlas/register
   - Use your email or sign up with Google/GitHub
   - Choose **FREE** tier (M0 Sandbox - perfect for development)

2. **Answer Survey** (optional)
   - Select "Learning MongoDB" or "Building a new application"
   - Click "Finish"

---

## Step 2: Create a Free Cluster (3 minutes)

1. **Choose Deployment Type**
   - Select **Shared** (Free)
   - Click "Create"

2. **Choose Cloud Provider & Region**
   - Provider: **AWS** (recommended) or Google Cloud/Azure
   - Region: Choose closest to you (e.g., `us-east-1` or `ap-south-1` for India)
   - Cluster Tier: **M0 Sandbox** (Free Forever)
   - Click "Create Cluster"

3. **Wait for Cluster Creation**
   - Takes 3-5 minutes
   - You'll see "Your cluster is being created..."

---

## Step 3: Configure Database Access (1 minute)

1. **Create Database User**
   - Go to "Security" → "Database Access"
   - Click "Add New Database User"
   - Authentication Method: **Password**
   - Username: `crowdadmin` (or your choice)
   - Password: Click "Autogenerate Secure Password" and **COPY IT** 📋
   - Database User Privileges: **Built-in Role** → Select "Atlas admin"
   - Click "Add User"

**IMPORTANT**: Save your password somewhere safe! You'll need it in Step 5.

---

## Step 4: Configure Network Access (1 minute)

1. **Allow Access from Anywhere** (for development)
   - Go to "Security" → "Network Access"
   - Click "Add IP Address"
   - Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or click "Add My Current IP Address" for better security
   - Click "Confirm"

⚠️ **Note**: For production, restrict to specific IPs only.

---

## Step 5: Get Connection String (1 minute)

1. **Navigate to Cluster**
   - Go to "Database" → "Clusters"
   - Click "Connect" button on your cluster

2. **Choose Connection Method**
   - Select "Connect your application"
   - Driver: **Python**
   - Version: **3.12 or later**

3. **Copy Connection String**
   - You'll see something like:
   ```
   mongodb+srv://crowdadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Copy this entire string 📋

4. **Replace `<password>`**
   - Replace `<password>` with the password you copied in Step 3
   - Example final string:
   ```
   mongodb+srv://crowdadmin:MySecurePass123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## Step 6: Update Backend Configuration (30 seconds)

### Option A: Update .env file (Recommended)

1. Open `backend/.env` in your editor

2. Replace the MongoDB URI:
   ```env
   # Replace this line:
   MONGODB_URI=mongodb://localhost:27017

   # With your Atlas connection string:
   MONGODB_URI=mongodb+srv://crowdadmin:YourPassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

3. Add database name:
   ```env
   DB_NAME=crowd_management
   ```

### Option B: Direct Edit (if .env doesn't exist)

Create `backend/.env`:
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://crowdadmin:YourPassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=crowd_management

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
```

---

## Step 7: Test Connection (1 minute)

### Start the Backend Server

```bash
cd backend
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Expected Output ✅

```
🚀 Starting Crowd Management System API...
INFO:     Will watch for changes in these directories: ['/path/to/backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
✓ Database connection initialized
✓ Database indexes created successfully
INFO:     Application startup complete.
```

### If You See This - SUCCESS! 🎉

The server should start without connection errors.

### Verify in Browser

Open: http://127.0.0.1:8000/docs

You should see the Swagger UI with all API endpoints!

---

## Step 8: Verify Database Creation

1. **Go to MongoDB Atlas Dashboard**
   - Navigate to "Database" → "Browse Collections"

2. **Check for Database**
   - You should see `crowd_management` database
   - With collections: `users`, `events`, etc. (created automatically on first use)

---

## Troubleshooting

### Error: "Authentication failed"
- Check that you replaced `<password>` in the connection string
- Verify username and password in Atlas Dashboard → Database Access
- Password special characters? URL-encode them (e.g., `@` becomes `%40`)

### Error: "IP not whitelisted"
- Go to Network Access in Atlas
- Add your IP or allow 0.0.0.0/0

### Error: "Connection timeout"
- Check your internet connection
- Verify cluster is active (not paused)
- Try a different region closer to you

### Error: "Database name required"
- Add `DB_NAME=crowd_management` to `.env`
- Or append `/crowd_management` to connection string before `?retryWrites`

---

## Connection String Format

### Full Format with Database Name

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/crowd_management?retryWrites=true&w=majority
```

Where:
- `username`: Your database user (e.g., `crowdadmin`)
- `password`: The password you set (URL-encoded if has special chars)
- `cluster0.xxxxx.mongodb.net`: Your cluster address
- `crowd_management`: Database name
- `retryWrites=true&w=majority`: Connection options

---

## Next Steps After Setup

### 1. Test API Endpoints

```bash
# Health check
curl http://127.0.0.1:8000/health

# Register a user
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "public"
  }'
```

### 2. Import Postman Collections

```bash
# Import these files to Postman:
backend/Crowd_Management_System.postman_collection.json
backend/New_Endpoints.postman_collection.json

# Set environment variable:
base_url = http://127.0.0.1:8000
```

### 3. Run Backend Tests

```bash
cd backend
python3 -m pytest test_api.py -v
```

Expected: `74 passed` ✅

---

## MongoDB Atlas Features (Free Tier)

✅ **512 MB Storage** - Plenty for development
✅ **Shared RAM** - Good performance
✅ **Daily Backups** - Automatic
✅ **Monitoring** - Real-time metrics
✅ **Global Deployment** - Available worldwide
✅ **Free Forever** - No credit card required

---

## Security Best Practices

### For Production:

1. **Use Strong Passwords**
   - At least 16 characters
   - Mix of letters, numbers, symbols

2. **Restrict Network Access**
   - Only whitelist your server IPs
   - Remove 0.0.0.0/0 access

3. **Use Environment Variables**
   - Never commit `.env` to git
   - Add `.env` to `.gitignore`

4. **Rotate Credentials**
   - Change passwords periodically
   - Use different credentials for dev/prod

5. **Enable Auditing**
   - Monitor database access
   - Set up alerts

---

## Quick Reference

### MongoDB Atlas Dashboard URLs

- **Home**: https://cloud.mongodb.com
- **Clusters**: https://cloud.mongodb.com/v2#/clusters
- **Database Access**: Security → Database Access
- **Network Access**: Security → Network Access
- **Browse Collections**: Database → Browse Collections

### Backend Configuration Files

- Connection: `backend/.env`
- Database logic: `backend/database.py`
- Models: `backend/models.py`

### Useful Commands

```bash
# Start backend
cd backend
python3 -m uvicorn main:app --reload

# Run tests
pytest test_api.py -v

# Check connection
curl http://127.0.0.1:8000/health
```

---

## Support

### Need Help?

1. MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
2. Community Forums: https://www.mongodb.com/community/forums/
3. Support: https://support.mongodb.com/

### Common Issues

- **Forgot Password?** - Reset in Database Access
- **Cluster Paused?** - Free clusters pause after 60 days of inactivity
- **Need More Storage?** - Upgrade to paid tier or create additional clusters

---

**You're Ready! 🚀**

Once you complete Steps 1-7, your backend will be fully connected to MongoDB Atlas and ready to handle requests!
