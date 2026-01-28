import time
from typing import Callable

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import get_settings

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _wait_for_engine(timeout: int = 30) -> None:
    deadline = time.time() + timeout
    last_error: Exception | None = None
    while time.time() < deadline:
        try:
            with engine.connect():
                return
        except OperationalError as exc:
            last_error = exc
            time.sleep(0.5)
    raise RuntimeError("Failed to connect to the database within timeout") from last_error


def init_db():
    import app.models.db_models  # noqa: F401

    _wait_for_engine()
    Base.metadata.create_all(bind=engine)
