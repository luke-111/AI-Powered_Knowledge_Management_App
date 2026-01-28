from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_port: int = Field(default=5432, alias="DB_PORT")
    db_name: str = Field(default="notes", alias="DB_NAME")
    db_user: str = Field(default="postgres", alias="DB_USER")
    db_password: str = Field(default="postgres", alias="DB_PASSWORD")
    db_pass: str | None = Field(default=None, alias="DB_PASS")

    private_key: str = Field(default="thisIsASecretKey", alias="PRIVATE_KEY")
    cors_origins: str = Field(default="", alias="CORS_ORIGINS")

    google_api_key: str = Field(default="", alias="GOOGLE_API_KEY")
    google_completion_model: str = Field(default="gemini-flash-latest", alias="GOOGLE_COMPLETION_MODEL")
    # text-embedding-004 hit end-of-life on January 14, 2026; default to the current Gemini embedding model.
    google_embedding_model: str = Field(default="gemini-embedding-001", alias="GOOGLE_EMBEDDING_MODEL")

    access_token_expire_minutes: int = Field(default=30)
    refresh_token_expire_minutes: int = Field(default=60 * 24)

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    @property
    def password(self) -> str:
        return self.db_pass or self.db_password

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.db_user}:{self.password}@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def allowed_origins(self) -> List[str]:
        default = [
            f"http://localhost:{3000}",
            "http://localhost:3001",
            "http://localhost:3004",
            "http://localhost:8080",
        ]
        if not self.cors_origins:
            return default
        parsed = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return parsed or default


@lru_cache
def get_settings() -> Settings:
    return Settings()
