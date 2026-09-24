import os
from typing import Optional
from pydantic import PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "development"
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # DB
    DATABASE_URL: PostgresDsn
    
    # Redis
    REDIS_URL: RedisDsn
    
    # MinIO / S3
    S3_ENDPOINT: str
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET_NAME: str = "mota-documents"
    S3_USE_SSL: bool = False
    
    # MFA
    OTP_PROVIDER: str = "development"
    
    # Providers
    ALLOW_MOCK_PROVIDERS: bool = False
    DATA_GOV_API_KEY: Optional[str] = None
    
    # MSG91
    MSG91_WIDGET_ID: Optional[str] = None
    MSG91_WIDGET_TOKEN: Optional[str] = None
    MSG91_AUTH_KEY: Optional[str] = None

    # Ollama
    OLLAMA_ENABLED: bool = False
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_TEXT_MODEL: str = "llama3:latest"
    OLLAMA_VISION_MODEL: Optional[str] = None
    OLLAMA_TIMEOUT: int = 300

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def validate_production(self):
        if self.APP_ENV == "production":
            if self.SECRET_KEY == "generate-a-secure-random-key-for-production" or len(self.SECRET_KEY) < 32:
                raise ValueError("Insecure SECRET_KEY in production.")
            if self.ALLOW_MOCK_PROVIDERS:
                raise ValueError("ALLOW_MOCK_PROVIDERS must be false in production.")
            if self.OTP_PROVIDER != "production":
                raise ValueError("OTP_PROVIDER must be 'production' in production environment.")
            if not self.DATA_GOV_API_KEY:
                raise ValueError("DATA_GOV_API_KEY is required in production.")

# Instantiate setting singleton
settings = Settings()
settings.validate_production()
