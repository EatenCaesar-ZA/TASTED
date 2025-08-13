/**
 * CuisineFilter.tsx — Modular cuisine selection component
 * 
 * Purpose: Handle cuisine filtering with datalist suggestions
 * Function: Provides accessible cuisine selection with type-ahead support
 * 
 * Key principle: This filter works equally with all other filters - no priority override
 */
import React from 'react';
import { CuisineFilterProps } from '../../types/FilterTypes';

/**
 * 🍜 CuisineFilter Component
 * 
 * Responsibilities:
 * - Render cuisine input with datalist suggestions
 * - Handle user input changes
 * - Provide accessible form controls
 * - Support both typed input and selection from suggestions
 */
const CuisineFilter: React.FC<CuisineFilterProps> = ({
  value,
  options,
  onChange,
  disabled = false
}) => {
  return (
    <div className="filter-group">
      <label htmlFor="cuisine-input" className="filter-label">
        🍜 Cuisine:
      </label>
      <input
        id="cuisine-input"
        type="text"
        list="cuisine-options"
        placeholder="Type or choose cuisine"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="filter-input"
        aria-label="Type or choose cuisine"
        aria-describedby="cuisine-help"
      />
      <datalist id="cuisine-options">
        {options.map((option) => (
          <option key={option.id} value={option.name} />
        ))}
      </datalist>
      <small id="cuisine-help" className="filter-help">
        Start typing to see suggestions or select from the dropdown
      </small>
    </div>
  );
};

export default CuisineFilter;
