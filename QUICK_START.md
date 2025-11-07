# 🚀 Quick Start Guide

## Immediate Setup (5 minutes)

### 1. Install MongoDB

**Option A: Local (macOS)**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongosh  # Should connect successfully
```

**Option B: Cloud (MongoDB Atlas) - FREE**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (takes ~5 min)
3. Get connection string
4. Update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

### 2. Start Backend (30 seconds)

```bash
cd backend
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Expected output:
```
🚀 Starting Crowd Management System API...
✓ Database connection initialized
INFO:     Application startup complete.
```

### 3. Verify Backend (10 seconds)

```bash
# Terminal 2
curl http://127.0.0.1:8000/health
```

Should return:
```json
{"status": "healthy", "service": "Crowd Management System API"}
```

### 4. Test in Browser (10 seconds)

Open: http://127.0.0.1:8000/docs

You should see the Swagger UI with all endpoints!

---

## Test New Endpoints (2 minutes)

### Import Postman Collection

1. Open Postman
2. File → Import
3. Import both:
   - `backend/Crowd_Management_System.postman_collection.json` (original)
   - `backend/New_Endpoints.postman_collection.json` (new)

### Set Environment Variables

In Postman:
- `base_url` = `http://127.0.0.1:8000`

### Test Flow

1. **Register User**
   - POST `/auth/register`
   - Save the user ID

2. **Create Event**
   - POST `/events/`
   - Save event ID to environment variable

3. **Test New Endpoints:**

**Create Washroom:**
```json
POST /washroom-facilities/
{
  "event_id": "{{event_id}}",
  "name": "Men's Washroom A",
  "gender": "male",
  "capacity": 10,
  "availability_status": "available"
}
```

**Create Zone:**
```json
POST /zones/
{
  "event_id": "{{event_id}}",
  "name": "Main Hall",
  "capacity": 500,
  "current_density": 0,
  "density_status": "low"
}
```

**Create Emergency Exit:**
```json
POST /emergency-exits/
{
  "event_id": "{{event_id}}",
  "exit_name": "Exit A - North",
  "location": "North Wing",
  "status": "clear"
}
```

---

## Frontend Setup (2 minutes)

### 1. Start Frontend

```bash
cd cms_web_frontend
npm run dev
```

Expected output:
```
VITE ready in 500 ms
➜  Local:   http://localhost:5173/
```

### 2. Test API Connection

Open browser console on http://localhost:5173

Test API:
```javascript
fetch('http://127.0.0.1:8000/health')
  .then(r => r.json())
  .then(console.log)
```

Should log: `{status: "healthy", service: "Crowd Management System API"}`

---

## Common Commands

### Backend
```bash
# Start server
cd backend
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Run tests
pytest test_api.py -v

# Run specific test
pytest test_api.py::TestWashroomFacilities -v

# Check test coverage
pytest test_api.py --cov=. --cov-report=html
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck
```

---

## API Quick Reference

### Base URL
```
http://127.0.0.1:8000
```

### Authentication
```bash
# Register
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "role": "public"
}

# Login (returns JWT token)
POST /auth/login
username=john@example.com&password=secure123
```

### New Endpoints

#### Washroom Facilities
```bash
GET    /washroom-facilities/?event_id={id}
POST   /washroom-facilities/
PATCH  /washroom-facilities/{id}/status?status=occupied
DELETE /washroom-facilities/{id}
```

#### Emergency Exits
```bash
GET    /emergency-exits/?event_id={id}
POST   /emergency-exits/
PATCH  /emergency-exits/{id}/status?status=crowded
DELETE /emergency-exits/{id}
```

#### Zones
```bash
GET    /zones/?event_id={id}
POST   /zones/
PATCH  /zones/{id}/density?current_density=250
DELETE /zones/{id}
```

#### Medical Facilities
```bash
GET    /medical-facilities/?event_id={id}
POST   /medical-facilities/
DELETE /medical-facilities/{id}
```

---

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
brew services start mongodb-community

# Or use MongoDB Atlas (cloud)
```

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### CORS Errors
Backend is already configured for CORS. Ensure:
- Backend is running on port 8000
- Frontend `.env` has `VITE_API_BASE_URL=http://127.0.0.1:8000`
- Restart frontend after changing `.env`

### Import Errors
```bash
# Backend
cd backend
pip3 install -r requirements.txt

# Frontend
cd cms_web_frontend
npm install
```

---

## Test Results

All tests passing ✅
```bash
cd backend
pytest test_api.py -v
```

Expected:
```
======================== 74 passed, 56 warnings in 61.50s ========================
```

---

## URLs

### Backend
- API Docs: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- Health: http://127.0.0.1:8000/health

### Frontend
- Dev Server: http://localhost:5173

---

## File Structure

```
Crowd_Management_System/
├── backend/
│   ├── main.py                    # FastAPI app
│   ├── models.py                  # Updated models
│   ├── routes/
│   │   ├── washroom_facilities.py # NEW
│   │   ├── emergency_exits.py     # NEW
│   │   ├── zones.py              # NEW
│   │   └── medical_facilities.py  # NEW
│   ├── test_api.py               # 74 tests
│   └── New_Endpoints.postman_collection.json
│
├── cms_web_frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts            # NEW API client
│   │   └── types/
│   │       └── index.ts          # TypeScript types
│   ├── .env                      # Configuration
│   └── MIGRATION_GUIDE.md        # How to migrate
│
├── FRONTEND_BACKEND_SYNC.md      # Complete overview
└── COMPLETION_SUMMARY.md         # What was done

```

---

## Next Steps

1. ✅ **Setup Complete** - MongoDB + Backend + Frontend
2. ⏳ **Frontend Migration** - Replace Supabase with API service
3. ⏳ **Authentication** - Implement JWT flow
4. ⏳ **Testing** - Test all CRUD operations
5. ⏳ **Mobile App** - Migrate Flutter app

---

## Need Help?

### Documentation
- Complete guide: `FRONTEND_BACKEND_SYNC.md`
- Frontend migration: `cms_web_frontend/MIGRATION_GUIDE.md`
- Completion summary: `COMPLETION_SUMMARY.md`

### API Testing
- Swagger UI: http://127.0.0.1:8000/docs
- Postman: Import collections from `backend/`

### Backend Tests
```bash
cd backend
pytest test_api.py -v
```

---

**You're all set! 🎉**

Everything is configured and ready to go. Just start MongoDB and the servers!
