/**
 * LocationFilter.tsx — Modular location selection component
 * 
 * Purpose: Handle location filtering with datalist suggestions
 * Function: Provides accessible location selection with type-ahead support
 * 
 * Key principle: This filter works equally with all other filters - no priority override
 */
import React from 'react';
import { LocationFilterProps } from '../../types/FilterTypes';

/**
 * 🌍 LocationFilter Component
 * 
 * Responsibilities:
 * - Render location input with datalist suggestions
 * - Handle user input changes
 * - Provide accessible form controls
 * - Support both typed input and selection from suggestions
 */
const LocationFilter: React.FC<LocationFilterProps> = ({
  value,
  options,
  onChange,
  disabled = false
}) => {
  return (
    <div className="filter-group">
      <label htmlFor="location-input" className="filter-label">
        🌍 Location:
      </label>
      <input
        id="location-input"
        type="text"
        list="location-options"
        placeholder="Type or choose location"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="filter-input"
        aria-label="Type or choose location"
        aria-describedby="location-help"
      />
      <datalist id="location-options">
        {options.map((option) => (
          <option key={option.id} value={option.name} />
        ))}
      </datalist>
      <small id="location-help" className="filter-help">
        Start typing to see suggestions or select from the dropdown
      </small>
    </div>
  );
};

export default LocationFilter;
