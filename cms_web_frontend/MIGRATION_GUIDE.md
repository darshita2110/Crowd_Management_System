# Frontend Migration to FastAPI Backend

This document outlines the migration from Supabase to FastAPI backend.

## 🔄 Migration Status

### ✅ Completed
- Backend models updated to match frontend types
- New backend endpoints created:
  - `/washroom-facilities/` - Washroom facility management
  - `/emergency-exits/` - Emergency exit tracking
  - `/zones/` - Zone-based crowd density monitoring
  - `/medical-facilities/` - Medical facility directory
- API service layer created (`src/services/api.ts`)
- Environment configuration setup

### 🔨 In Progress
- Installing axios dependency
- Updating frontend components to use API service

### ⏳ Pending
- Replace all Supabase calls with API calls
- Update authentication flow
- Test all CRUD operations
- Update mobile app (Flutter)

## 📋 Installation Steps

### 1. Install Dependencies

```bash
cd cms_web_frontend
npm install
```

This will install:
- `axios` - HTTP client for API requests
- All existing dependencies

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with your backend URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 3. Start Backend Server

Ensure the FastAPI backend is running:

```bash
cd ../backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 4. Start Frontend Development Server

```bash
cd cms_web_frontend
npm run dev
```

## 🏗️ Architecture Changes

### Before (Supabase)
```typescript
import { supabase } from '../../lib/supabase';

const { data } = await supabase.from('events').select('*');
```

### After (FastAPI)
```typescript
import api from '../../services/api';

const data = await api.events.getAll();
```

## 📡 API Service Usage

The API service (`src/services/api.ts`) provides a clean interface for all backend operations:

### Authentication
```typescript
import { authAPI } from '../services/api';

// Login
const { access_token, user } = await authAPI.login('user@example.com', 'password');

// Register
await authAPI.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepass123'
});

// Logout
authAPI.logout();
```

### Events
```typescript
import { eventsAPI } from '../services/api';

// Get all events
const events = await eventsAPI.getAll();

// Get event by ID
const event = await eventsAPI.getById('event123');

// Create event
const newEvent = await eventsAPI.create({
  name: 'Tech Conference 2024',
  location: 'Convention Center',
  date: '2024-12-01',
  attendees_count: 0,
  organizer_id: 'org123'
});

// Update event
await eventsAPI.update('event123', { attendees_count: 150 });

// Delete event
await eventsAPI.delete('event123');
```

### Zones (Crowd Density)
```typescript
import { zonesAPI } from '../services/api';

// Get zones for an event
const zones = await zonesAPI.getAll('event123');

// Create zone
const zone = await zonesAPI.create({
  event_id: 'event123',
  name: 'Main Hall',
  capacity: 500,
  current_density: 0,
  density_status: 'low'
});

// Update density
await zonesAPI.updateDensity('zone123', 350, 'moderate');
```

### Lost Persons
```typescript
import { lostPersonsAPI } from '../services/api';

// Get all lost persons
const lostPersons = await lostPersonsAPI.getAll('event123');

// Report lost person
const report = await lostPersonsAPI.create({
  event_id: 'event123',
  name: 'John Doe',
  age: 8,
  gender: 'male',
  description: 'Wearing blue shirt',
  last_seen_location: 'Food Court',
  last_seen_time: '2024-11-07T14:30:00',
  reporter_name: 'Jane Doe',
  reporter_phone: '+1234567890'
});

// Update status
await lostPersonsAPI.updateStatus('lp123', 'found');
```

### Medical Facilities
```typescript
import { medicalFacilitiesAPI } from '../services/api';

// Get facilities
const facilities = await medicalFacilitiesAPI.getAll('event123');

// Add facility
const facility = await medicalFacilitiesAPI.create({
  event_id: 'event123',
  facility_name: 'First Aid Station A',
  facility_type: 'first-aid',
  contact_number: '+1234567890',
  address: 'Main Entrance, Ground Floor'
});
```

### Emergency Exits
```typescript
import { emergencyExitsAPI } from '../services/api';

// Get exits
const exits = await emergencyExitsAPI.getAll('event123');

// Update exit status
await emergencyExitsAPI.updateStatus('exit123', 'crowded');
```

### Washroom Facilities
```typescript
import { washroomFacilitiesAPI } from '../services/api';

// Get washrooms
const washrooms = await washroomFacilitiesAPI.getAll('event123');

// Update availability
await washroomFacilitiesAPI.updateStatus('wf123', 'occupied');
```

### Feedback
```typescript
import { feedbackAPI } from '../services/api';

// Submit feedback
const feedback = await feedbackAPI.create({
  event_id: 'event123',
  rating: 5,
  category: 'general',
  comment: 'Great event organization!'
});

// Get feedback stats
const stats = await feedbackAPI.getStats('event123');
```

### Image Upload (Crowd Counting)
```typescript
import { inferenceAPI } from '../services/api';

// Upload image for crowd counting
const file = document.querySelector('input[type="file"]').files[0];
const result = await inferenceAPI.countPeople(
  file,
  'event123',  // eventId
  'Main Hall', // areaName
  10          // radiusM
);

console.log(`Detected ${result.person_count} people`);
```

## 🔒 Authentication Flow

The API service automatically handles authentication:

1. **Login**: Token is stored in `localStorage` after successful login
2. **Requests**: Token is automatically added to all API requests
3. **Unauthorized (401)**: Automatically redirects to login page
4. **Logout**: Removes token and redirects to login

## 🛠️ Component Migration Guide

### Example: Migrating EventsPage

**Before (Supabase):**
```typescript
import { supabase } from '../../lib/supabase';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const { error } = await supabase.from('events').insert([formData]);
  if (!error) {
    onEventsUpdate();
  }
};
```

**After (FastAPI):**
```typescript
import { eventsAPI } from '../../services/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await eventsAPI.create(formData);
    onEventsUpdate();
  } catch (error) {
    console.error('Failed to create event:', error);
  }
};
```

## 📚 Next Steps

1. **Install axios**: Run `npm install` in `cms_web_frontend/`
2. **Update components**: Replace Supabase calls with API service
3. **Test endpoints**: Verify all CRUD operations work
4. **Update authentication**: Implement login/register flows
5. **Mobile app**: Migrate Flutter app to use FastAPI

## 🐛 Troubleshooting

### CORS Errors
Ensure backend has CORS configured for your frontend URL:
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Connection Refused
- Verify backend is running: `curl http://127.0.0.1:8000/health`
- Check `.env` has correct `VITE_API_BASE_URL`
- Restart frontend dev server after changing `.env`

### Type Errors
- Run `npm run typecheck` to check TypeScript errors
- Ensure all types in `src/types/index.ts` match backend models

## 📞 Support

For issues or questions:
1. Check backend API docs: http://127.0.0.1:8000/docs
2. Review backend tests: `backend/test_api.py`
3. Check backend documentation: `backend/FRONTEND_INTEGRATION.md`
