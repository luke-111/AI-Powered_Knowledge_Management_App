import NoteCard from './NoteCard.jsx';

const NotesList = ({ 
  notes, 
  filters,
  loading, 
  error, 
  onAddNote, 
  onEditNote, 
  onDeleteNote, 
  onToggleArchive 
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No notes found</p>
        {(!filters.category && !filters.archived) ? (
          <button
            onClick={onAddNote}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create first note
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEditNote}
          onDelete={onDeleteNote}
          onToggleArchive={onToggleArchive}
        />
      ))}
    </div>
  );
};

export default NotesList; 