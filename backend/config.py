"""
Configuration settings for Crowd Management System
"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings"""
    
    # MongoDB
    mongo_url: str = "mongodb://localhost:27017"
    mongo_uri: Optional[str] = None  # Alternative name for MongoDB connection
    db_name: str = "crowd_management_system"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    jwt_secret_key: Optional[str] = None  # Alternative name for JWT secret
    jwt_algorithm: Optional[str] = "HS256"  # JWT algorithm
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    jwt_expiration_minutes: Optional[int] = 1440  # Alternative name
    
    # CORS
    allowed_origins: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields from .env

settings = Settings()
