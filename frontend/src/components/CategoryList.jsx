import { useState } from 'react';

const CategoryList = ({ categories, onEdit, onDelete, onAdd }) => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="bg-white/90 rounded-xl shadow-lg p-6 max-h-96 overflow-y-auto min-w-[260px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Categories</h2>
        <button
          onClick={onAdd}
          className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-md transition-all"
        >
          + Add
        </button>
      </div>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${selected === cat.id ? 'bg-blue-50' : ''}`}
            onMouseEnter={() => setSelected(cat.id)}
            onMouseLeave={() => setSelected(null)}
          >
            <span className="font-medium text-gray-700 truncate max-w-[120px]">{cat.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(cat)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(cat)}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList; 