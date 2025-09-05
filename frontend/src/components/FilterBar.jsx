const FilterBar = ({ categories, filters, onFilterChange }) => {
  const handleFilterChange = (filterType, value) => {
    onFilterChange({ [filterType]: value });
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="font-semibold text-lg text-gray-900 mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All categories</option>
            <option value="-1">No category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.archived}
            onChange={(e) => handleFilterChange('archived', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All notes</option>
            <option value="false">Active</option>
            <option value="true">Archived</option>
          </select>
        </div>
      </div>
      
      {(filters.category || filters.archived) && (
        <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex gap-3">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            {filters.category && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {filters.category === '-1' ? 'No category' : 
                 categories.find(c => c.id == filters.category)?.name || 'Category'}
              </span>
            )}
            {filters.archived && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {filters.archived === 'true' ? 'Archived' : 'Active'}
              </span>
            )}
          </div>
          <button
            onClick={() => onFilterChange({ category: '', archived: '' })}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;