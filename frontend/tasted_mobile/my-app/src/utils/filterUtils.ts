/**
 * filterUtils.ts — Utility functions for filter system
 * 
 * Purpose: Convert filter state to API parameters and other filter helpers
 * Function: Clean, reusable functions for filter operations
 * 
 * Key principle: All filters have equal weight in API queries
 */
import { FilterState, RestaurantQueryParams, FilterOption } from '../types/FilterTypes';

/**
 * 🌐 Build API query parameters from filter state
 * 
 * CRITICAL: All filters are applied equally - no filter has priority over others
 * The backend will handle combining all filters using AND logic
 */
export const buildQueryParams = (
  filterState: FilterState,
  cuisineOptions: FilterOption[],
  locationOptions: FilterOption[]
): RestaurantQueryParams => {
  const params: RestaurantQueryParams = {};

  // 🍜 Cuisine filter - try exact match first, fallback to partial search
  if (filterState.cuisine.selectedCuisine.trim()) {
    const exactMatch = cuisineOptions.find(
      c => c.name.toLowerCase() === filterState.cuisine.selectedCuisine.trim().toLowerCase()
    );
    
    if (exactMatch) {
      // Use ID-based filtering for exact matches (more efficient)
      params.cuisines = String(exactMatch.id);
    } else {
      // Use text-based partial matching for typed input
      params.cuisine = filterState.cuisine.selectedCuisine.trim();
    }
  }

  // 🌍 Location filter - try exact match first, fallback to partial search
  if (filterState.location.selectedLocation.trim()) {
    const exactMatch = locationOptions.find(
      l => l.name.toLowerCase() === filterState.location.selectedLocation.trim().toLowerCase()
    );
    
    if (exactMatch) {
      // Use ID-based filtering for exact matches (more efficient)
      params.locations = String(exactMatch.id);
    } else {
      // Use text-based partial matching for typed input
      params.location = filterState.location.selectedLocation.trim();
    }
  }

  // 🔎 Search filter - always use text search
  if (filterState.search.searchTerm.trim()) {
    params.search = filterState.search.searchTerm.trim();
  }

  // 💸 Price filter - both min and max are independent
  if (filterState.price.minPrice.trim()) {
    params.min_price = filterState.price.minPrice.trim();
  }
  
  if (filterState.price.maxPrice.trim()) {
    params.max_price = filterState.price.maxPrice.trim();
  }

  return params;
};

/**
 * 🧮 Convert query parameters to URLSearchParams for API calls
 */
export const paramsToURLSearchParams = (params: RestaurantQueryParams): URLSearchParams => {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.append(key, String(value));
    }
  });
  
  return urlParams;
};

/**
 * 🔍 Check if any filters are active
 */
export const hasActiveFilters = (filterState: FilterState): boolean => {
  return !!(
    filterState.cuisine.selectedCuisine.trim() ||
    filterState.location.selectedLocation.trim() ||
    filterState.search.searchTerm.trim() ||
    filterState.price.minPrice.trim() ||
    filterState.price.maxPrice.trim()
  );
};

/**
 * 📊 Get a summary of active filters for display
 */
export const getActiveFiltersSummary = (filterState: FilterState): string[] => {
  const active: string[] = [];
  
  if (filterState.cuisine.selectedCuisine.trim()) {
    active.push(`Cuisine: ${filterState.cuisine.selectedCuisine}`);
  }
  
  if (filterState.location.selectedLocation.trim()) {
    active.push(`Location: ${filterState.location.selectedLocation}`);
  }
  
  if (filterState.search.searchTerm.trim()) {
    active.push(`Search: "${filterState.search.searchTerm}"`);
  }
  
  if (filterState.price.minPrice.trim() || filterState.price.maxPrice.trim()) {
    const min = filterState.price.minPrice.trim() || '0';
    const max = filterState.price.maxPrice.trim() || '∞';
    active.push(`Price: R${min} - R${max}`);
  }
  
  return active;
};

/**
 * 🔄 Create empty filter state
 */
export const createEmptyFilterState = (): FilterState => ({
  cuisine: {
    selectedCuisine: '',
    cuisineOptions: []
  },
  location: {
    selectedLocation: '',
    locationOptions: []
  },
  search: {
    searchTerm: ''
  },
  price: {
    minPrice: '',
    maxPrice: ''
  },
  isInitialized: false
});

/**
 * 🎯 Validate filter values
 */
export const validateFilters = (filterState: FilterState): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate price range
  if (filterState.price.minPrice.trim() && filterState.price.maxPrice.trim()) {
    const min = Number(filterState.price.minPrice);
    const max = Number(filterState.price.maxPrice);
    
    if (min < 0) {
      errors.push('Minimum price cannot be negative');
    }
    
    if (max < 0) {
      errors.push('Maximum price cannot be negative');
    }
    
    if (min > max) {
      errors.push('Minimum price cannot be greater than maximum price');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
