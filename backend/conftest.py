"""
Pytest Configuration and Shared Fixtures
"""

import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import database as db_module
from database import init_db
import os


@pytest.fixture(scope="session")
def event_loop():
    """Create a session-scoped event loop for all tests"""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_test_database(event_loop):
    """Initialize database connection once for all tests"""
    # Create Motor client in the session event loop
    db_module.client = None
    db_module.database = None
    
    # Initialize the database
    await init_db()
    
    # Override with test database
    if db_module.database is not None:
        db_module.database = db_module.client["crowd_management_test"]
    
    yield
    
    # Close the client after all tests
    if db_module.client is not None:
        db_module.client.close()
