# 🤖 AI-Powered Knowledge Management

A full-stack knowledge workspace that blends a modern React experience with an Express/Sequelize API and Google Generative AI for content drafting, semantic search, and summarisation.

---

## Highlights
- Capture, edit, archive, and categorise knowledge entries with inline AI assistance.
- Semantic search backed by Google embeddings keeps discovery fast even as the library grows.
- One-click AI summaries turn dense entries into executive-ready highlights.
- Secure REST API with JWT auth, Postgres persistence, and Swagger documentation.
- Docker-first workflow plus optional local development scripts.

---

## Architecture Overview
- **Frontend:** React + Vite + Tailwind CSS, React Router, Axios.
- **Backend:** Node.js, Express, Sequelize, PostgreSQL, Passport JWT, Winston logging.
- **AI Layer:** Google Generative AI (`generateContent` + `embedContent`).
- **Tooling:** Docker Compose, Swagger UI, Postman collection (`backend/src/docs/postman/...`).

---

## Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin).
- Google Generative AI API key with access to the models you plan to use.
- Optional: Node.js ≥ 18 and npm if you want to run services without Docker.

---

## Quick Start (Docker)
1. Clone the repo and `cd` into the project root.
2. Create `backend/.env` (or export these variables before running Compose):
   ```ini
   GOOGLE_API_KEY=your_google_api_key
   # Optional overrides:
   GOOGLE_COMPLETION_MODEL=gemini-1.5-flash-latest
   GOOGLE_EMBEDDING_MODEL=text-embedding-004
   PRIVATE_KEY=super-secret-jwt-key
   ```
3. Launch the stack:
   ```bash
   docker compose up --build
   ```
4. Visit the services:
   - Frontend UI: http://localhost:3001
   - REST API root: http://localhost:3000/api
   - Swagger docs: http://localhost:3000/api/docs

Docker creates a `dbdata/` folder to persist PostgreSQL between runs.

---

## Optional Local Development
Run the services outside Docker when you need faster feedback loops:
```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```
Make sure PostgreSQL is running locally and environment variables are exported before starting the backend.

---

## Configuration Reference
- `GOOGLE_API_KEY` – required for content generation, embeddings, and summaries.
- `GOOGLE_COMPLETION_MODEL` – defaults to `gemini-2.5-flash-latest`.
- `GOOGLE_EMBEDDING_MODEL` – defaults to `text-embedding-004`.
- `PRIVATE_KEY` – JWT signing key used by the auth layer.
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` – inherited from `docker-compose.yml` or your local environment.
- `CORS_ORIGINS` – optional comma-separated list that overrides the default local origins.

---

## Key Workflows
- **Capture knowledge:** Draft entries manually or let the AI assistant scaffold content from a prompt.
- **Categorise effortlessly:** Create, update, and delete categories without leaving the workspace.
- **Semantic search:** Ask full questions; embeddings score and return the most relevant entries (with similarity percentages).
- **Summaries on demand:** Open a card, hit “Summarize”, and surface the main ideas in seconds.
- **Access control:** JWT-protected routes guard all write operations; default credentials are below for local testing.

---

## API & Tooling
- Swagger UI ( `/api/docs` ) mirrors the live routes and schemas.
- Postman collection: `backend/src/docs/postman/ai-knowledge-management.postman_collection.json`.
- Semantic endpoints:
  - `POST /api/notes/search` – semantic vector search.
  - `POST /api/notes/:id/summarize` – AI summary of a single entry.
- AI helper endpoint:
  - `POST /api/ai/generate` – free-form content generation from a prompt.

---

## Testing & Quality Notes
- ESLint and prettier configs live in the frontend for linting React code.
- Backend logs write to `backend/logs/errors.log` via Winston.
- Add unit/integration tests as needed (Jest or Vitest slot in cleanly).

---

## Troubleshooting
- **500 errors on create/search:** check `backend/logs/errors.log` for AI-related issues (model access, quota, etc.).
- **Google API 404/403:** verify the exact model name you are requesting and your key’s permissions.
- **Docker build failures:** ensure the `.env` variables exist before building; missing AI keys will abort the backend start-up.
- **Semantic search returns nothing:** embeddings are generated lazily; first requests may trigger model calls to back-fill vectors.

---

## Default Credentials
- Username: `admin`
- Password: `admin`

Update or remove the seeded admin user before deploying to production.

---

Made with ❤️ for knowledge-savvy teams who want AI superpowers without sacrificing structure.
