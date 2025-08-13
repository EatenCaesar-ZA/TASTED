/**
 * FilterTypes.ts — TypeScript interfaces for the modular filter system
 * 
 * Purpose: Define strong types for all filter-related data structures
 * Following protocols: Clean, readable, reusable type definitions
 * 
 * Key principle: All filters have equal priority - no filter overrides another
 */

// 🏷️ Base option type for dropdowns and selections
export interface FilterOption {
  id: number;
  name: string;
}

// 🎯 Individual filter state interfaces
export interface CuisineFilter {
  selectedCuisine: string;
  cuisineOptions: FilterOption[];
}

export interface LocationFilter {
  selectedLocation: string;
  locationOptions: FilterOption[];
}

export interface SearchFilter {
  searchTerm: string;
}

export interface PriceFilter {
  minPrice: string;
  maxPrice: string;
}

// 🔧 Combined filter state - all filters work together with equal priority
export interface FilterState {
  cuisine: CuisineFilter;
  location: LocationFilter;
  search: SearchFilter;
  price: PriceFilter;
  isInitialized: boolean;
}

// 📤 Filter change event types for component communication
export interface FilterChangeEvent {
  type: 'cuisine' | 'location' | 'search' | 'price' | 'reset';
  payload: Partial<FilterState>;
}

// 🎛️ Props interfaces for filter components
export interface CuisineFilterProps {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export interface LocationFilterProps {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export interface PriceFilterProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  disabled?: boolean;
}

// 🎯 Main filter container props
export interface FilterContainerProps {
  onFiltersChange: (filters: FilterState) => void;
  onFiltersApply: () => void;
  initialFilters?: Partial<FilterState>;
  isLoading?: boolean;
}

// 🌐 API query parameters - built from filter state
export interface RestaurantQueryParams {
  search?: string;
  cuisine?: string;
  cuisines?: string;
  location?: string;
  locations?: string;
  min_price?: string;
  max_price?: string;
}

// 🏪 Restaurant data structure (for reference)
export interface Restaurant {
  id: number;
  name: string;
  cuisines?: { name: string }[];
  locations?: { name: string }[];
  image_url?: string;
  image?: string | null;
  menus?: {
    id: number;
    title: string;
    file_url: string;
    page_number?: number;
  }[];
  min_item_price?: number | string | null;
  max_item_price?: number | string | null;
  average_item_price?: number | string | null;
  min_price_tag?: number | string | null;
  max_price_tag?: number | string | null;
}
