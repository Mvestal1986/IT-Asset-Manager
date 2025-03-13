import os
from pydantic import BaseSettings
from typing import Optional
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "IT Asset Management API"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = "API for managing IT assets, users, and assignments"
    
    # Database settings
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "postgresql://username:password@localhost/itassetmanagement")
    
    # CORS settings
    CORS_ORIGINS: list = ["*"]
    
    # Security settings for future JWT implementation
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "your-secret-key-for-development-only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    return Settings()