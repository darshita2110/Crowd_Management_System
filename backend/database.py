from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "crowd_management_system")

# Client and database will be initialized on application startup via init_db()
client = None
_db = None


async def create_indexes():
    """Create database indexes"""
    # Users collection
    db = get_database()
    await db["users"].create_index("email", unique=True)
    await db["users"].create_index("id", unique=True)
    
    # Events collection
    await database["events"].create_index("id", unique=True)
    await database["events"].create_index("organizer_id")
    await database["events"].create_index("status")
    
    # Crowd density collection
    await database["crowd_density"].create_index("id", unique=True)
    await database["crowd_density"].create_index("event_id")
    await database["crowd_density"].create_index("timestamp")
    
    # Medical emergencies collection
    await database["medical_emergencies"].create_index("id", unique=True)
    await database["medical_emergencies"].create_index("event_id")
    await database["medical_emergencies"].create_index("status")
    
    # Lost persons collection
    await database["lost_persons"].create_index("id", unique=True)
    await database["lost_persons"].create_index("event_id")
    await database["lost_persons"].create_index("status")
    
    # Feedback collection
    await database["feedback"].create_index("id", unique=True)
    await database["feedback"].create_index("event_id")
    await database["feedback"].create_index("user_id")
    
    # Facilities collection
    await database["facilities"].create_index("id", unique=True)
    await database["facilities"].create_index("event_id")
    await database["facilities"].create_index("type")
    
    # Alerts collection
    await database["alerts"].create_index("id", unique=True)
    await database["alerts"].create_index("event_id")
    await database["alerts"].create_index("is_active")
    
    # Weather alerts collection
    await database["weather_alerts"].create_index("id", unique=True)
    await database["weather_alerts"].create_index("event_id")

async def init_db():
    """
    Initialize database connection.
    Creates the Motor client if it doesn't already exist.
    In tests, this is called from conftest to ensure client is in correct event loop.
    In production, called from FastAPI lifespan.
    """
    global client, database
    if client is None:
        mongodb_url = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        client = AsyncIOMotorClient(mongodb_url)
        database = client["crowd_management"]
        print("✓ Database connection initialized")
    else:
        print("✓ Database connection already initialized (reusing existing client)")
    
    # Always create indexes (safe to call multiple times)
    try:
        await create_indexes()
        print("✅ Database indexes verified")
    except Exception as e:
        print(f"⚠️  Error with indexes: {e}")


def get_database():
    """Return the motor database instance, creating the client if needed.

    This provides a lazy fallback for tests that import routes before the
    FastAPI lifespan startup runs. Prefer using `init_db` at application
    startup for production, but `get_database()` allows tests to run
    synchronously without depending on lifespan order.
    """
    global client, _db
    if _db is None:
        client = AsyncIOMotorClient(MONGO_URL)
        _db = client[DB_NAME]
    return _db


# Provide a proxy for `database[...]` access so route modules that import
# `database` at import time can still access collections lazily. This avoids
# requiring the FastAPI lifespan to run before imports.
class _DBProxy:
    def __getitem__(self, name):
        return get_database()[name]

# Replace `database` variable with the proxy instance
database = _DBProxy()

