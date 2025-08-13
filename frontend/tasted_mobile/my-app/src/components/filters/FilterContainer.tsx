/**
 * FilterContainer.tsx — Main filter orchestration component
 * 
 * Purpose: Coordinate all filter components and manage combined state
 * Function: Provides unified filter management with equal priority for all filters
 * 
 * CRITICAL PRINCIPLE: ALL FILTERS WORK TOGETHER - NO FILTER HAS PRIORITY OVER OTHERS
 */
import React, { useState, useEffect, useCallback } from 'react';
import { FilterContainerProps, FilterState, FilterOption } from '../../types/FilterTypes';
import CuisineFilter from './CuisineFilter';
import LocationFilter from './LocationFilter';
import SearchFilter from './SearchFilter';
import PriceFilter from './PriceFilter';
import api from '../../api';

/**
 * Helper function to unwrap DRF responses (array or paginated)
 */
function unwrapResults<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results: unknown[] }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

/**
 * 🎛️ FilterContainer Component
 * 
 * Responsibilities:
 * - Orchestrate all individual filter components
 * - Manage combined filter state
 * - Load filter options from API
 * - Persist filters to localStorage
 * - Ensure all filters work together with equal priority
 * - Provide clean interface to parent components
 */
const FilterContainer: React.FC<FilterContainerProps> = ({
  onFiltersChange,
  onFiltersApply,
  initialFilters = {},
  isLoading = false
}) => {
  // 🔧 Combined filter state - all filters are equal
  const [filterState, setFilterState] = useState<FilterState>({
    cuisine: {
      selectedCuisine: initialFilters.cuisine?.selectedCuisine || '',
      cuisineOptions: initialFilters.cuisine?.cuisineOptions || []
    },
    location: {
      selectedLocation: initialFilters.location?.selectedLocation || '',
      locationOptions: initialFilters.location?.locationOptions || []
    },
    search: {
      searchTerm: initialFilters.search?.searchTerm || ''
    },
    price: {
      minPrice: initialFilters.price?.minPrice || '',
      maxPrice: initialFilters.price?.maxPrice || ''
    },
    isInitialized: false
  });

  /**
   * 🔄 Load filter options from API
   */
  const loadFilterOptions = useCallback(async () => {
    try {
      const [cuisinesResponse, locationsResponse] = await Promise.all([
        api.get('/api/v1/cuisines/'),
        api.get('/api/v1/locations/')
      ]);

      const cuisineOptions = unwrapResults<FilterOption>(cuisinesResponse.data);
      const locationOptions = unwrapResults<FilterOption>(locationsResponse.data);

      setFilterState(prev => ({
        ...prev,
        cuisine: { ...prev.cuisine, cuisineOptions },
        location: { ...prev.location, locationOptions }
      }));
    } catch (error) {
      console.warn('Failed to load filter options:', error);
      // Continue with empty options - don't break the UI
    }
  }, []);

  /**
   * 💾 Load saved filters from localStorage
   */
  const loadSavedFilters = useCallback(() => {
    try {
      const savedFilters = localStorage.getItem('tasted-filters');
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        setFilterState(prev => ({
          ...prev,
          cuisine: {
            ...prev.cuisine,
            selectedCuisine: parsed.selectedCuisine || ''
          },
          location: {
            ...prev.location,
            selectedLocation: parsed.selectedLocation || ''
          },
          search: {
            searchTerm: parsed.searchTerm || ''
          },
          price: {
            minPrice: parsed.minPrice || '',
            maxPrice: parsed.maxPrice || ''
          },
          isInitialized: true
        }));
      } else {
        setFilterState(prev => ({ ...prev, isInitialized: true }));
      }
    } catch (error) {
      console.warn('Failed to load saved filters:', error);
      setFilterState(prev => ({ ...prev, isInitialized: true }));
    }
  }, []);

  /**
   * 💾 Save filters to localStorage
   */
  const saveFilters = useCallback((filters: FilterState) => {
    try {
      const toSave = {
        selectedCuisine: filters.cuisine.selectedCuisine,
        selectedLocation: filters.location.selectedLocation,
        searchTerm: filters.search.searchTerm,
        minPrice: filters.price.minPrice,
        maxPrice: filters.price.maxPrice
      };
      localStorage.setItem('tasted-filters', JSON.stringify(toSave));
    } catch (error) {
      console.warn('Failed to save filters:', error);
    }
  }, []);

  /**
   * 🔄 Update filter state and notify parent
   */
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilterState(prev => {
      const newState = { ...prev, ...updates };
      saveFilters(newState);
      onFiltersChange(newState);
      return newState;
    });
  }, [onFiltersChange, saveFilters]);

  // 🚀 Initialize filters on mount
  useEffect(() => {
    loadFilterOptions();
    loadSavedFilters();
  }, [loadFilterOptions, loadSavedFilters]);

  // 🔄 Notify parent when filters are initialized
  useEffect(() => {
    if (filterState.isInitialized) {
      onFiltersChange(filterState);
    }
  }, [filterState.isInitialized, filterState, onFiltersChange]);

  /**
   * 🎯 Individual filter change handlers
   */
  const handleCuisineChange = (selectedCuisine: string) => {
    updateFilters({
      cuisine: { ...filterState.cuisine, selectedCuisine }
    });
  };

  const handleLocationChange = (selectedLocation: string) => {
    updateFilters({
      location: { ...filterState.location, selectedLocation }
    });
  };

  const handleSearchChange = (searchTerm: string) => {
    updateFilters({
      search: { searchTerm }
    });
  };

  const handleMinPriceChange = (minPrice: string) => {
    updateFilters({
      price: { ...filterState.price, minPrice }
    });
  };

  const handleMaxPriceChange = (maxPrice: string) => {
    updateFilters({
      price: { ...filterState.price, maxPrice }
    });
  };

  /**
   * 🧹 Reset all filters
   */
  const handleResetFilters = () => {
    const resetState: FilterState = {
      cuisine: { ...filterState.cuisine, selectedCuisine: '' },
      location: { ...filterState.location, selectedLocation: '' },
      search: { searchTerm: '' },
      price: { minPrice: '', maxPrice: '' },
      isInitialized: true
    };
    setFilterState(resetState);
    saveFilters(resetState);
    onFiltersChange(resetState);
  };

  return (
    <form 
      className="filter-container card"
      onSubmit={(e) => {
        e.preventDefault();
        onFiltersApply();
      }}
      style={{ marginBottom: '1rem', padding: '1rem' }}
      aria-label="Restaurant filters"
    >
      <h3 className="filter-title">🔍 Filter Restaurants</h3>
      <p className="filter-subtitle">All filters work together - no filter overrides others</p>
      
      <div className="filters-grid">
        {/* All filter components are equal - no priority order */}
        <CuisineFilter
          value={filterState.cuisine.selectedCuisine}
          options={filterState.cuisine.cuisineOptions}
          onChange={handleCuisineChange}
          disabled={isLoading}
        />
        
        <LocationFilter
          value={filterState.location.selectedLocation}
          options={filterState.location.locationOptions}
          onChange={handleLocationChange}
          disabled={isLoading}
        />
        
        <SearchFilter
          value={filterState.search.searchTerm}
          onChange={handleSearchChange}
          disabled={isLoading}
        />
        
        <PriceFilter
          minPrice={filterState.price.minPrice}
          maxPrice={filterState.price.maxPrice}
          onMinPriceChange={handleMinPriceChange}
          onMaxPriceChange={handleMaxPriceChange}
          disabled={isLoading}
        />
      </div>

      {/* Action buttons */}
      <div className="filter-actions">
        <button 
          type="submit" 
          className="accent-border apply-button"
          disabled={isLoading}
          aria-label="Apply all filters"
        >
          {isLoading ? 'Loading...' : 'Apply Filters'}
        </button>
        
        <button 
          type="button" 
          onClick={handleResetFilters}
          className="accent-border reset-button"
          disabled={isLoading}
          aria-label="Reset all filters"
        >
          Reset All
        </button>
      </div>

      <small className="filter-note">
        💡 All filters are applied together - cuisine, location, search, and price work as a team
      </small>
    </form>
  );
};

export default FilterContainer;
