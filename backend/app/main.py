from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import SessionLocal, init_db
from app.core.security import ensure_admin_user
from app.routers import ai, categories, notes, sessions

settings = get_settings()

app = FastAPI(
    title="AI Notes Backend",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
api_router.include_router(notes.router)
api_router.include_router(categories.router)
api_router.include_router(sessions.router)
api_router.include_router(ai.router)

app.include_router(api_router)


@app.on_event("startup")
def startup_event():
    init_db()
    db = SessionLocal()
    try:
        ensure_admin_user(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}
