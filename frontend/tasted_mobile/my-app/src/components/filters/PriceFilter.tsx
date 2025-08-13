/**
 * PriceFilter.tsx — Modular price range selection component
 * 
 * Purpose: Handle price range filtering with preset options
 * Function: Provides accessible price range selection with quick presets
 * 
 * CRITICAL: This filter has NO PRIORITY over other filters - it works equally with all others
 */
import React from 'react';
import { PriceFilterProps } from '../../types/FilterTypes';

/**
 * 💸 PriceFilter Component
 * 
 * Responsibilities:
 * - Render min/max price inputs
 * - Provide quick preset buttons for common ranges
 * - Handle user input changes
 * - Provide accessible form controls
 * - Work as ONE OF MANY filters - not override others
 */
const PriceFilter: React.FC<PriceFilterProps> = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  disabled = false
}) => {
  // Quick preset handlers for common price ranges
  const handlePreset = (min: string, max: string) => {
    onMinPriceChange(min);
    onMaxPriceChange(max);
  };

  const handleClearPrice = () => {
    onMinPriceChange('');
    onMaxPriceChange('');
  };

  return (
    <div className="filter-group">
      <label className="filter-label">💸 Price Range:</label>
      
      {/* Min/Max price inputs */}
      <div className="price-inputs">
        <div className="price-input-group">
          <label htmlFor="min-price" className="sr-only">Minimum price</label>
          <input
            id="min-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            disabled={disabled}
            className="filter-input price-input"
            aria-label="Minimum price"
          />
        </div>
        
        <div className="price-input-group">
          <label htmlFor="max-price" className="sr-only">Maximum price</label>
          <input
            id="max-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            disabled={disabled}
            className="filter-input price-input"
            aria-label="Maximum price"
          />
        </div>
      </div>

      {/* Quick preset buttons */}
      <div className="price-presets">
        <button
          type="button"
          onClick={() => handlePreset('0', '50')}
          disabled={disabled}
          className="preset-button"
          aria-label="Set price range to under 50"
        >
          Under R50
        </button>
        <button
          type="button"
          onClick={() => handlePreset('50', '100')}
          disabled={disabled}
          className="preset-button"
          aria-label="Set price range to 50-100"
        >
          R50–100
        </button>
        <button
          type="button"
          onClick={() => handlePreset('100', '200')}
          disabled={disabled}
          className="preset-button"
          aria-label="Set price range to 100-200"
        >
          R100–200
        </button>
        <button
          type="button"
          onClick={handleClearPrice}
          disabled={disabled}
          className="preset-button clear-button"
          aria-label="Clear price range filter"
        >
          Clear
        </button>
      </div>

      <small className="filter-help">
        Price range works WITH other filters - it doesn't override them
      </small>
    </div>
  );
};

export default PriceFilter;
