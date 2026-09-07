import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Multi-Agent AI Recruitment Assessment System"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # LLM Settings
    GEMINI_API_KEY: str = ""
    DEFAULT_MODEL: str = "gemini-3.6-flash"
    OPENAI_API_KEY: str = ""
    DEFAULT_LLM_PROVIDER: str = "gemini"  # "gemini" | "openai" | "demo"
    
    # Code Execution Settings
    EXECUTION_PROVIDER: str = "docker"  # "docker" | "e2b" | "subprocess"
    E2B_API_KEY: str = ""
    
    # Database & Cache
    DATABASE_URL: str = "sqlite:///./recruitment_system.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()
