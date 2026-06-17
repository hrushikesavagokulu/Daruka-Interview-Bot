"""
Daruka Interview Bot — Application Settings
Reads config from environment variables (set in docker-compose) with
optional .env file fallback for local non-Docker runs.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Security
    SECRET_KEY: str = "changeme_replace_with_32_random_hex_chars"

    # Database
    DATABASE_URL: str = "mysql+aiomysql://root:daruka@mysql_db:3306/daruka"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # Ollama
    OLLAMA_URL: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "qwen3:8b"

    # SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


# Singleton — import this everywhere
settings = Settings()
