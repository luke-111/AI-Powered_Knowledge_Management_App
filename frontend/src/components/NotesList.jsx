import NoteCard from './NoteCard.jsx';

const NotesList = ({ 
  notes, 
  filters,
  loading, 
  error, 
  onAddNote, 
  onEditNote, 
  onDeleteNote, 
  onToggleArchive,
  onSummarize,
  searchActive = false,
  isSearching = false,
  searchQuery = '',
  searchError = '',
}) => {
  if (searchActive) {
    if (isSearching) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Running semantic search...</p>
        </div>
      );
    }

    if (searchError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{searchError}</p>
        </div>
      );
    }

    if (notes.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">
            No knowledge entries match "{searchQuery}" yet.
          </p>
          <p className="text-sm text-gray-500">Try refining your prompt or capturing a new entry.</p>
        </div>
      );
    }
  }

  if (loading && !searchActive) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error && !searchActive) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No knowledge entries found</p>
        {(!filters.category && !filters.archived) ? (
          <button
            onClick={onAddNote}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Capture first entry
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {searchActive && (
        <div className="flex items-center justify-between bg-white border border-blue-100 rounded-xl px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-600">
            Showing {notes.length} semantic match{notes.length === 1 ? '' : 'es'} for
            <span className="font-semibold text-gray-800"> "{searchQuery}"</span>
          </p>
        </div>
      )}
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEditNote}
          onDelete={onDeleteNote}
          onToggleArchive={onToggleArchive}
          onSummarize={onSummarize}
        />
      ))}
    </div>
  );
};

export default NotesList; 
