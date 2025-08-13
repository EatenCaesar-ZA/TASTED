/**
 * SearchFilter.tsx — Modular search input component
 * 
 * Purpose: Handle restaurant name search functionality
 * Function: Provides accessible text search with clear labeling
 * 
 * Key principle: This filter works equally with all other filters - no priority override
 */
import React from 'react';
import { SearchFilterProps } from '../../types/FilterTypes';

/**
 * 🔎 SearchFilter Component
 * 
 * Responsibilities:
 * - Render search input for restaurant names
 * - Handle user input changes
 * - Provide accessible form controls
 * - Support real-time search as user types
 */
const SearchFilter: React.FC<SearchFilterProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="filter-group">
      <label htmlFor="search-input" className="filter-label">
        🔎 Search:
      </label>
      <input
        id="search-input"
        type="text"
        placeholder="Search by restaurant name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="filter-input"
        aria-label="Search by restaurant name"
        aria-describedby="search-help"
      />
      <small id="search-help" className="filter-help">
        Search restaurants by name, description, or related terms
      </small>
    </div>
  );
};

export default SearchFilter;
