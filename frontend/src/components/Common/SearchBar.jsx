import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const SearchBar = ({ onSearch, onFilter, placeholder = 'Search...', filters = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    if (onFilter) onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    if (onFilter) onFilter({});
    setShowFilters(false);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="input-field pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-2.5"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>

        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 border rounded-lg ${
              showFilters
                ? 'bg-blue-50 border-blue-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="label">{filter.label}</label>
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="input-field"
                >
                  <option value="">All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};