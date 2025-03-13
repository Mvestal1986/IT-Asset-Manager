import os
from typing import List
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "IT Asset Management API"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = "API for managing IT assets, users, and assignments"
    
    # Database settings
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "postgresql://username:password@localhost/itassetmanagement")
    
    # CORS settings - defaults to allow all
    CORS_ORIGINS: List[str] = ["*"]
    
    # Security settings for future JWT implementation
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "your-secret-key-for-development-only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }

    @classmethod
    def load_env(cls):
        env_file = ".env"
        print(f"Looking for .env file at: {os.path.abspath(env_file)}")
        if os.path.isfile(env_file):
            print(f".env file found")
        else:
            print(f".env file not found")
        return cls()

@lru_cache()
def get_settings():
    settings = Settings.load_env()
    print(f"Database URL from settings: {settings.DATABASE_URL}")
    return settings