/**
 * RestaurantList.tsx — Browse and filter restaurants
 *
 * Responsibilities:
 * - Fetch restaurants from the backend with optional filters (cuisine, location, name search)
 * - Fetch filter option lists (cuisines, locations)
 * - Render menus for each restaurant via RestaurantMenus component
 * - Provide accessible form controls and clear loading/error states
 *
 * Extension points:
 * - Add pagination controls (we already accept paginated or array responses)
 * - Add client-side caching (React Query/SWR) to avoid repeat fetches
 * - Move inline styles to CSS modules or Tailwind for hybrid builds
 */
import { useState, useEffect } from 'react';
import api from '../api';
import RestaurantMenus from './RestaurantMenus'; // 📄 Renders downloadable menus

// ✅ Strongly typed Restaurant interface for clarity and maintainability
// Data model from API: Restaurant object with nested relations for display
type Restaurant = {
  id: number;
  name: string;
  cuisines?: { name: string }[];
  locations?: { name: string }[];
  image_url?: string;
  menus?: { id: number; title: string; file_url: string }[];
};

// Lightweight option type for dropdowns
type Option = { id: number; name: string };

// Helper: normalize DRF responses (supports both array and paginated { results: [] })
function unwrapResults<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
    return (data as any).results as T[];
  }
  return [];
}

/**
 * 📦 RestaurantList component
 * Fetches and displays restaurants from Django REST API.
 * Supports filtering by cuisine, location, and name search.
 * Renders uploaded menus using the RestaurantMenus component.
 */
const RestaurantList = () => {
  // 🔧 State for restaurant data and UI feedback
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔍 Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const [cuisineOptions, setCuisineOptions] = useState<Option[]>([]);
  const [locationOptions, setLocationOptions] = useState<Option[]>([]);

  /**
   * 🔄 Fetch restaurants from Django API with optional filters
   * Filters are passed as query parameters: cuisines, locations, and search
   */
  /**
   * Fetch restaurants from API applying current filters.
   * Accepts both paginated and non-paginated responses.
   */
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError('');

      // 🧮 Build query parameters dynamically
      const params = new URLSearchParams();
      if (selectedCuisine) {
        const match = cuisineOptions.find(
          c => c.name.toLowerCase() === selectedCuisine.trim().toLowerCase()
        );
        if (match) params.append('cuisines', String(match.id));
        else params.append('cuisines__name', selectedCuisine.trim());
      }
      if (selectedLocation) {
        const match = locationOptions.find(
          l => l.name.toLowerCase() === selectedLocation.trim().toLowerCase()
        );
        if (match) params.append('locations', String(match.id));
        else params.append('locations__name', selectedLocation.trim());
      }
      if (searchTerm) params.append('search', searchTerm);

      // 🌐 Make GET request to Django REST API
      const response = await api.get(`/api/v1/restaurants/?${params.toString()}`);
      const list = unwrapResults<Restaurant>(response.data);
      setRestaurants(list);
    } catch (err: any) {
      console.error('API error:', err);
      setError(
        err.response?.status === 404
          ? 'No restaurants found for your filters.'
          : 'Failed to load restaurants. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Initial fetch on component mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // 🔁 Load filter option lists (cuisines, locations) on mount
  useEffect(() => {
    async function loadOptions() {
      try {
        const [cRes, lRes] = await Promise.all([
          api.get('/api/v1/cuisines/'),
          api.get('/api/v1/locations/'),
        ]);
        setCuisineOptions(unwrapResults<Option>(cRes.data));
        setLocationOptions(unwrapResults<Option>(lRes.data));
      } catch (err) {
        // silent fail; options remain empty
      }
    }
    loadOptions();
  }, []);

  return (
    <div>
      <h2>🍽️ Restaurants</h2>

      {/* 🔧 Filter controls */}
      <form
        onSubmit={e => {
          e.preventDefault(); // Prevent page reload
          fetchRestaurants(); // Apply filters
        }}
        style={{ marginBottom: '1rem' }}
        aria-label="Restaurant filters"
      >
        {/* 🍜 Cuisine input with suggestions */}
        <label htmlFor="cuisine-input">Cuisine:</label>
        <input
          id="cuisine-input"
          list="cuisine-options"
          placeholder="Type or choose cuisine"
          value={selectedCuisine}
          onChange={e => setSelectedCuisine(e.target.value)}
          aria-label="Type or choose cuisine"
        />
        <datalist id="cuisine-options">
          {cuisineOptions.map(c => (
            <option key={c.id} value={c.name} />
          ))}
        </datalist>

        {/* 🌍 Location input with suggestions */}
        <label htmlFor="location-input">Location:</label>
        <input
          id="location-input"
          list="location-options"
          placeholder="Type or choose location"
          value={selectedLocation}
          onChange={e => setSelectedLocation(e.target.value)}
          aria-label="Type or choose location"
        />
        <datalist id="location-options">
          {locationOptions.map(l => (
            <option key={l.id} value={l.name} />
          ))}
        </datalist>

        {/* 🔎 Search input */}
        <label htmlFor="search-input">Search:</label>
        <input
          id="search-input"
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label="Search by restaurant name"
        />

        <button type="submit">Apply Filters</button>
      </form>

      {/* 🧾 Feedback messages */}
      {loading && <p>Loading restaurants...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {restaurants.length === 0 && !loading && !error && (
        <p>No restaurants found.</p>
      )}

      {/* 📋 Restaurant list */}
      <ul>
        {restaurants.map(r => (
          <li key={r.id} style={{ marginBottom: '2rem' }}>
            <h3>{r.name}</h3>
            <p>
              {/* 🧠 Handle both object and fallback string formats */}
              {r.cuisines?.map(c => c.name).join(', ') || 'No cuisine'} |{' '}
              {r.locations?.map(l => l.name).join(', ') || 'No location'}
            </p>

            {/* 🖼️ Optional image */}
            {r.image_url && (
              <img
                src={r.image_url}
                alt={`Image of ${r.name}`}
                width="200"
                style={{ borderRadius: '8px' }}
              />
            )}

            {/* 📄 Render menus if available */}
            {r.menus && r.menus.length > 0 && (
              <RestaurantMenus menus={r.menus} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RestaurantList;