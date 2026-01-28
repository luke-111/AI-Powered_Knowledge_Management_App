# 🤖 AI-Powered Knowledge Management

A Docker-native knowledge workspace with:
- **React + Vite + Tailwind** for the responsive SPA and stateful UI.
- **FastAPI + SQLAlchemy + PostgreSQL** for the REST surface, JWT auth, and persistence.
- **Google Gemini** for content generation, embeddings, and summaries.

---

## Architecture Overview
- **Frontend:** React, Vite, Axios, Tailwind CSS, and context-based state management.
- **Backend:** FastAPI, SQLAlchemy ORM, PostgreSQL, JWT access/refresh tokens, and built-in Swagger docs.
- **AI Layer:** `google-genai` client talking to Gemini for `generate_content` and `embed_content`.
- **Tooling:** Docker Compose, Uvicorn, and a persistent `dbdata/` volume for the database.

---

## Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin).
- Google Generative AI API key with access to the models you need.
- Optional: Python 3.12 and `pip` if you want to run the FastAPI service locally.

---

## Quick Start (Docker)
1. Clone the repo and `cd` into the project root.
2. Provide the secrets via environment variables (a `.env` file is supported):
   ```ini
   GOOGLE_API_KEY=your_google_api_key
   PRIVATE_KEY=super-secret-jwt-key
   GOOGLE_COMPLETION_MODEL=gemini-2.5-flash-latest
   GOOGLE_EMBEDDING_MODEL=gemini-embedding-001
   ```
3. Start everything in one command:
   ```bash
   docker compose up --build
   ```
4. Access the services:
   - Frontend UI: http://localhost:3001
   - API docs & Swagger: http://localhost:3000/api/docs
   - Health check: http://localhost:3000/api/health

Docker keeps Postgres data in `dbdata/` so it survives restarts.

---

## Optional Local Development
1. **Backend**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   export GOOGLE_API_KEY=...
   export PRIVATE_KEY=...
   uvicorn app.main:app --reload --port 3000
   ```
2. **Frontend** (new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev -- --port 3001
   ```
3. Ensure PostgreSQL is reachable (adjust `DB_HOST`, `DB_USER`, etc. as needed).

---

## Configuration Reference
- `GOOGLE_API_KEY` – required for Gemini calls.
- `GOOGLE_COMPLETION_MODEL` – defaults to `gemini-2.5-flash-latest`.
- `GOOGLE_EMBEDDING_MODEL` – defaults to `gemini-embedding-001`.
- `PRIVATE_KEY` – JWT signing secret for FastAPI.
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – SQLAlchemy connection vars.
- `CORS_ORIGINS` – comma-separated list overriding the default local origins.

---

## Core Workflows
- Capture entries manually or auto-fill them using the AI prompt box.
- Manage categories alongside notes (create/update/delete).
- Semantic search (`POST /api/notes/search`) ranks entries by relevance.
- Summaries (`POST /api/notes/{id}/summarize`) generate bulletized ideas.
- JWT/refresh cookie pair protect write operations; default admin credentials are provided for local dev.

---

## API & Tooling
- Swagger documentation lives at `/api/docs`.
- Postman reference: `backend/src/docs/postman/ai-knowledge-management.postman_collection.json`.
- Semantic endpoints:
  - `POST /api/notes/search` – vector search.
  - `POST /api/notes/{id}/summarize` – AI summary for a single note.
- AI helper endpoint:
  - `POST /api/ai/generate` – write content from a prompt.

---

## Testing & Monitoring
- Frontend uses ESLint/Prettier in `frontend/` for linting.
- Backend logs appear via Uvicorn; add custom handlers if you need file logging.
- Extend coverage with Pytest (FastAPI) or Vitest/Jest (React) as needed.

---

## Troubleshooting
- **AI 500s:** ensure `GOOGLE_API_KEY` is valid and not expired.
- **JWT refresh issues:** check `refreshToken` cookies and token expiration.
- **Postgres connection failures:** verify Docker Compose started `db` before the backend or point to an existing database.
- **Frontend not reachable:** the React dev server runs on port `3001` via Docker Compose (`3001:8080`).

---

## Default Credentials (Local Only)
- Username: `admin`
- Password: `admin`

Rotate or remove this user before deploying to production.

---

Made with ❤️ for knowledge workers who want structure plus AI insights.
