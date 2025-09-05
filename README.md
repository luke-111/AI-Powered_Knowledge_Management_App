# 📝 Notes App - Full Stack Implementation Exercise

---

## 🚀 Features

- **User Authentication** (login/logout)
- **Create, edit, and delete notes**
- **Archive and unarchive notes**
- **List active and archived notes**
- **Create, edit, and delete categories**
- **Assign categories to notes**
- **Filter notes by category**
- **Responsive UI**
- **RESTful API backend**
- **Persistent storage with PostgreSQL**
- **Protected routes for authenticated users**
- **Dockerized for easy deployment**
- **Backend API documentation with Swagger**

---

## 🛠️ Tech Stack & Dependencies

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js 
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT Authentication
- CORS
- Passport
- Swagger for API documentation
- Winston for logging

### DevOps
- Docker & Docker Compose

---

## ⚡ Quick Start

### Prerequisites
- **Docker** (and Docker Compose) installed on your system. No need to install Node, npm, or PostgreSQL locally.

### How to Run
1. **Clone this repository** and navigate to the project root.
2. **Start the app with Docker Compose:**

   ```bash
   docker compose up --build
   ```

   This command will:
   - Build and start both the frontend and backend containers.
   - Automatically create a `dbdata` directory in the project root to persist the PostgreSQL database used by the backend container.

3. **Access the app:**
   - Frontend: [http://localhost:3001](http://localhost:3001)
   - Backend API: [http://localhost:3000/api](http://localhost:3000/api)

4. **Open Swagger UI for API documentation:**
   - [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🔑 Default Login Credentials

> **Username:** `admin`  
> **Password:** `admin`

---

## 📚 Requirements & Notes
- All dependencies are listed in the respective `package.json` files in `frontend/` and `backend/`.
- The backend uses a layered architecture (Controllers, Services, Models, DTOs, etc.)
- The database is persisted in the `dbdata` directory at the project root.