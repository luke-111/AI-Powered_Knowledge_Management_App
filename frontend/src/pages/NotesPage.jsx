import { useEffect, useRef, useState } from 'react';
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
    semanticSearch,
    summarizeNote,
  } = useNotes();
  const { logout } = useAuth();

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState([]);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [summaryModal, setSummaryModal] = useState({ open: false, title: '', summary: '', loading: false, error: '' });
  const searchDebounceRef = useRef(null);

  const handleAddNote = () => {
    setEditingNote(null);
    setShowNoteForm(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleSaveNote = async (noteData) => {
    if (editingNote) {
      await updateNote(editingNote.id, noteData);
    } else {
      await createNote(noteData);
    }
    setShowNoteForm(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id) => {
    setConfirmModal({
      open: true,
      message: 'Are you sure you want to delete this knowledge entry?',
      onConfirm: async () => {
        await deleteNote(id);
        closeConfirmModal();
      },
    });
  };

  const handleToggleArchive = async (note) => {
    await updateNote(note.id, { archived: !note.archived });
  };

  const handleSemanticSearchChange = (value) => {
    setSearchQuery(value);
    setSearchError('');

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!value.trim()) {
      setSemanticResults([]);
      setIsSemanticSearching(false);
      return;
    }

    setIsSemanticSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await semanticSearch(value);
        setSemanticResults(results);
      } catch (err) {
        console.error('Semantic search error:', err);
        setSearchError('Unable to run semantic search right now. Please try again.');
      } finally {
        setIsSemanticSearching(false);
      }
    }, 400);
  };

  const handleSummarizeNote = async (note) => {
    setSummaryModal({ open: true, title: note.title, summary: '', loading: true, error: '' });
    try {
      const { summary } = await summarizeNote(note.id);
      setSummaryModal((prev) => ({ ...prev, summary, loading: false }));
    } catch (err) {
      console.error('Error summarizing entry:', err);
      setSummaryModal((prev) => ({ ...prev, loading: false, error: 'Could not summarize. Please try again later.' }));
    }
  };

  const closeSummaryModal = () => setSummaryModal({ open: false, title: '', summary: '', loading: false, error: '' });
  const closeConfirmModal = () => setConfirmModal({ open: false, message: '', onConfirm: null });

  const searchActive = Boolean(searchQuery.trim());
  const notesToDisplay = searchActive ? semanticResults : notes;

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

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
            onEdit={(cat) => {
              setEditingCat(cat);
              setShowCatForm(true);
            }}
            onDelete={(cat) => {
              setConfirmModal({
                open: true,
                message: `Are you sure you want to delete the category "${cat.name}"?`,
                onConfirm: async () => {
                  await deleteCategory(cat.id);
                  closeConfirmModal();
                },
              });
            }}
            onAdd={() => {
              setEditingCat(null);
              setShowCatForm(true);
            }}
          />
        </aside>
        <main className="flex-1">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Knowledge Workspace
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={handleAddNote}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  + New Entry
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
              onFilterChange={setFilters}
              searchQuery={searchQuery}
              onSearchChange={handleSemanticSearchChange}
              isSearching={isSemanticSearching}
              searchError={searchError}
            />
            <NotesList
              notes={notesToDisplay}
              filters={filters}
              loading={loading}
              error={error}
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
              onToggleArchive={handleToggleArchive}
              onSummarize={handleSummarizeNote}
              searchActive={searchActive}
              isSearching={isSemanticSearching}
              searchQuery={searchQuery}
              searchError={searchError}
            />
          </div>
        </main>
      </div>

      <Modal open={showNoteForm} onClose={() => setShowNoteForm(false)}>
        <NoteForm
          note={editingNote}
          categories={categories}
          onSubmit={handleSaveNote}
          onCancel={() => {
            setShowNoteForm(false);
            setEditingNote(null);
          }}
        />
      </Modal>

      <Modal open={showCatForm} onClose={() => setShowCatForm(false)}>
        <CategoryForm
          category={editingCat}
          onSubmit={async (data) => {
            if (editingCat) {
              await updateCategory(editingCat.id, data);
            } else {
              await createCategory(data);
            }
            setShowCatForm(false);
            setEditingCat(null);
          }}
          onCancel={() => {
            setShowCatForm(false);
            setEditingCat(null);
          }}
        />
      </Modal>

      <Modal open={confirmModal.open} onClose={closeConfirmModal}>
        <div className="text-center space-y-6">
          <div className="text-xl text-gray-800 font-semibold">{confirmModal.message}</div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={closeConfirmModal}
              className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
            >
              Cancel
            </button>
           <button
              onClick={async () => {
                if (confirmModal.onConfirm) {
                  await confirmModal.onConfirm();
                }
              }}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={summaryModal.open} onClose={closeSummaryModal}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Summary: {summaryModal.title}</h2>
            <button
              onClick={closeSummaryModal}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          {summaryModal.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : summaryModal.error ? (
            <p className="text-sm text-red-600">{summaryModal.error}</p>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-gray-800 space-y-2">
              {summaryModal.summary.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          )}
          <button
            onClick={closeSummaryModal}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState(category ? category.name : '');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    onSubmit({ name: trimmed });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError('');
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
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
