# Notes App - Frontend

Web application for managing notes, built with React, Vite, and Tailwind CSS.

## Features

- ✅ Create, edit and delete notes
- ✅ Archive/unarchive notes
- ✅ Filter by category and archive status
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

### Create a Note
1. Click "New Note"
2. Fill in title and content
3. Optionally select a category
4. Click "Create"

### Edit a Note
1. Click the edit button
2. Modify the desired fields
3. Click "Update"

### Archive/Unarchive
- Click the archive button to change status

### Filter Notes
- Use the filters at the top to filter by:
  - Category (including "All categories" and "No category")
  - Status (Active/Archived/All)

### Delete a Note
1. Click the delete button
2. Confirm deletion

## API Endpoints

The application connects to the following endpoints:

- `GET /api/notes` - Get all notes. It can be filtered by query parameters for category and status (archived=true/false)
- `POST /api/notes` - Create new note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/categories` - Get categories

## use:
cd /front 
npm install 
npm run dev

cd backend
npm install
npm start

docker
