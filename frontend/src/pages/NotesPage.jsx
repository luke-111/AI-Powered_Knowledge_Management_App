import { useState } from 'react';
import { useNotes } from '../context/NotesContext.jsx';
import { useAuth } from '../components/auth/AuthProvider';
import FilterBar from '../components/FilterBar.jsx';
import NotesList from '../components/NotesList.jsx';
import NoteForm from '../components/NoteForm.jsx';
import CategoryList from '../components/CategoryList.jsx';
import Modal from '../components/Modal.jsx';

const NotesPage = () => {
  const {
    notes,
    categories,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    createCategory,
    updateCategory,
    deleteCategory,
    filters,
    setFilters,
  } = useNotes();
  const { logout } = useAuth();

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });

  const handleAddNote = () => {
    setEditingNote(null);
    setShowNoteForm(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleFormSubmit = async (noteData) => {
    if (editingNote) {
      await updateNote(editingNote.id, noteData);
    } else {
      await createNote(noteData);
    }
    setShowNoteForm(false);
    setEditingNote(null);
  };

  const handleFormCancel = () => {
    setShowNoteForm(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id) => {
    setConfirmModal({
      open: true,
      message: 'Are you sure you want to delete this note?',
      onConfirm: async () => {
        await deleteNote(id);
        setConfirmModal({ open: false, message: '', onConfirm: null });
      },
    });
  };

  const handleToggleArchive = async (note) => {
    await updateNote(note.id, { archived: !note.archived });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAddCategory = () => {
    setEditingCat(null);
    setShowCatForm(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCat(cat);
    setShowCatForm(true);
  };

  const handleDeleteCategory = (cat) => {
    setConfirmModal({
      open: true,
      message: `Are you sure you want to delete the category "${cat.name}"?`,
      onConfirm: async () => {
        await deleteCategory(cat.id);
        setConfirmModal({ open: false, message: '', onConfirm: null });
      },
    });
  };

  const handleCatFormSubmit = async (catData) => {
    if (editingCat) {
      await updateCategory(editingCat.id, catData);
    } else {
      await createCategory(catData);
    }
    setShowCatForm(false);
    setEditingCat(null);
  };

  const handleCatFormCancel = () => {
    setShowCatForm(false);
    setEditingCat(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl text-red-600 font-bold mb-4">Error</div>
          <div className="text-gray-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-0 md:p-6 bg-gradient-to-br from-[#e0e7ff] via-[#f3e8ff] to-[#f0fdfa]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-80 flex-shrink-0 mb-6 md:mb-0">
          <CategoryList
            categories={categories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onAdd={handleAddCategory}
          />
        </aside>
        <main className="flex-1">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Notes
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={handleAddNote}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  + New Note
                </button>
                <button
                  onClick={logout}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
            <FilterBar
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <NotesList
              notes={notes}
              filters={filters}
              loading={loading}
              error={error}
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              onToggleArchive={handleToggleArchive}
            />
          </div>
        </main>
      </div>
      <Modal open={showNoteForm} onClose={handleFormCancel}>
        <NoteForm
          note={editingNote}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
      <Modal open={showCatForm} onClose={handleCatFormCancel}>
        <CategoryForm
          category={editingCat}
          onSubmit={handleCatFormSubmit}
          onCancel={handleCatFormCancel}
        />
      </Modal>
      <Modal open={confirmModal.open} onClose={() => setConfirmModal({ open: false, message: '', onConfirm: null })}>
        <div className="text-center space-y-6">
          <div className="text-xl text-gray-800 font-semibold">{confirmModal.message}</div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setConfirmModal({ open: false, message: '', onConfirm: null })}
              className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={async () => { await confirmModal.onConfirm(); }}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState(category ? category.name : '');
  const [error, setError] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    onSubmit({ name: name.trim() });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Category name"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
        >
          {category ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default NotesPage;