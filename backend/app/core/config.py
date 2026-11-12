import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "YTC Campus Navigator"
    INSTITUTION: str = "Yashoda Technical Campus, Satara"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./campus_navigator.db"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]
    SECRET_KEY: str = "ytc-campus-navigator-academic-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
