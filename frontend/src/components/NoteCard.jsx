import { useState } from 'react';

const NoteCard = ({ note, onEdit, onDelete, onToggleArchive }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(note.id);
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 mb-6 transition-all duration-200 hover:shadow-lg ${
      note.archived ? 'opacity-70 bg-gray-50' : 'card-shadow'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-xl text-gray-900 pr-4">{note.title}</h3>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleArchive(note)}
            className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {note.archived ? 'Activate' : 'Archive'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isDeleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 leading-relaxed">{note.content}</p>
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex gap-2">
          {note.Category && (
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full font-medium">
              {note.Category.name}
            </span>
          )}
          {note.archived && (
            <span className="bg-gray-500 text-white px-3 py-1 rounded-full font-medium">
              Archived
            </span>
          )}
        </div>
        <span className="text-gray-500 font-medium">{formatDate(note.createdAt)}</span>
      </div>
    </div>
  );
};

export default NoteCard;