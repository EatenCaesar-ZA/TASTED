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
import { Link } from 'react-router-dom';
// import RestaurantMenus from './RestaurantMenus'; // Not needed on list cards anymore

// ✅ Strongly typed Restaurant interface for clarity and maintainability
// Data model from API: Restaurant object with nested relations for display
type Restaurant = {
  id: number;
  name: string;
  cuisines?: { name: string }[];
  locations?: { name: string }[];
  image_url?: string;
  image?: string | null;
  menus?: { id: number; title: string; file_url: string }[];
  min_item_price?: number | string | null;
  max_item_price?: number | string | null;
  average_item_price?: number | string | null;
  min_price_tag?: number | string | null;
  max_price_tag?: number | string | null;
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
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);

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

        {/* 💸 Price range */}
        <label htmlFor="min-price">Min price:</label>
        <input
          id="min-price"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          aria-label="Minimum price"
        />
        <label htmlFor="max-price">Max price:</label>
        <input
          id="max-price"
          type="number"
          min="0"
          step="0.01"
          placeholder="100.00"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          aria-label="Maximum price"
        />

        <button type="submit">Apply Filters</button>
        {/* Quick presets for price range */}
        <div style={{ marginTop: '0.5rem' }}>
          <button type="button" onClick={() => { setMinPrice('0'); setMaxPrice('50'); }}>Under 50</button>
          <button type="button" onClick={() => { setMinPrice('50'); setMaxPrice('100'); }} style={{ marginLeft: '0.5rem' }}>50–100</button>
          <button type="button" onClick={() => { setMinPrice('100'); setMaxPrice('200'); }} style={{ marginLeft: '0.5rem' }}>100–200</button>
          <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); }} style={{ marginLeft: '0.5rem' }}>Clear</button>
        </div>
      </form>

      {/* 🧾 Feedback messages */}
      {loading && <p>Loading restaurants...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {restaurants.length === 0 && !loading && !error && (
        <p>No restaurants found.</p>
      )}

      {/* 📋 Restaurant list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {restaurants.map(r => (
          <Link key={r.id} to={`/restaurants/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '1rem', height: '100%' }}>
              {r.image_url && (
                <img src={r.image_url} alt={`Image of ${r.name}`} width="100%" style={{ borderRadius: 6, objectFit: 'cover', maxHeight: 140 }} />
              )}
              <h3 style={{ marginTop: '0.75rem' }}>{r.name}</h3>
              <p style={{ color: '#666' }}>
                {r.cuisines?.map(c => c.name).join(', ') || 'No cuisine'}
              </p>
              <p style={{ color: '#666' }}>
                {r.locations?.map(l => l.name).join(', ') || 'No location'}
              </p>
              {((r.min_price_tag != null && r.max_price_tag != null) || (r.min_item_price != null || r.max_item_price != null)) && (
                <p style={{ color: '#333', fontSize: '0.9rem' }}>
                  {(() => {
                    const min = r.min_price_tag ?? r.min_item_price;
                    const max = r.max_price_tag ?? r.max_item_price;
                    const fmt = (n: any) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(Number(n ?? 0));
                    return `Price range: ${fmt(min)} – ${fmt(max)}`;
                  })()}
                  {r.average_item_price != null && (
                    <>
                      {' '}• Avg: {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(Number(r.average_item_price))}
                    </>
                  )}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;