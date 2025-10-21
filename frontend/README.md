# AI-Powered Knowledge Management Application - Frontend

Web application for managing structured knowledge entries, built with React, Vite, and Tailwind CSS.

## Features

- ✅ Create, edit and delete knowledge entries
- ✅ Archive/unarchive knowledge entries
- ✅ Filter by category and archive status
- ✅ Real-time semantic search powered by Google Generative AI embeddings
- ✅ One-click AI summaries for rapid knowledge digestion
- ✅ AI-assisted entry drafting from natural language prompts
- ✅ Responsive interface
- ✅ Form validation
- ✅ State management with Context API
- ✅ REST API communication

## Technologies

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - CSS framework
- **Axios** - HTTP client
- **React Router** - Routing

## Usage

### Create an Entry
1. Click "New Entry"
2. Fill in title and content
3. Optionally select a category
4. Click "Create"

### Edit an Entry
1. Click the edit button
2. Modify the desired fields
3. Click "Update"

### Archive/Unarchive
- Click the archive button to change status

### Semantic Search
- Type natural language questions into the semantic search bar to surface the most relevant entries in real time.

### Summarize an Entry
- Click "Summarize" on any card to generate a concise executive summary for quick review.

### Filter Knowledge
- Use the filters at the top to filter by:
  - Category (including "All categories" and "No category")
  - Status (Active/Archived/All)

### Delete an Entry
1. Click the delete button
2. Confirm deletion

## API Endpoints

The application connects to the following endpoints:

- `GET /api/notes` - Get all knowledge entries. It can be filtered by query parameters for category and status (archived=true/false)
- `POST /api/notes` - Create new entry
- `PATCH /api/notes/:id` - Update entry
- `DELETE /api/notes/:id` - Delete entry
- `POST /api/notes/search` - Run semantic search against stored knowledge
- `POST /api/notes/:id/summarize` - Produce an AI summary for a specific entry
- `GET /api/categories` - Get categories

## use:
cd /front 
npm install 
npm run dev

cd backend
npm install
npm start

docker
