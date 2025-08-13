/**
 * RestaurantList.tsx — Browse and filter restaurants with integrated menu viewing
 *
 * Responsibilities:
 * - Fetch restaurants from the backend with optional filters (cuisine, location, name search)
 * - Fetch filter option lists (cuisines, locations)
 * - Integrate with MenuViewer for inline menu display
 * - Provide accessible form controls and clear loading/error states
 * - Support budget integration through menu browsing
 *
 * Extension points:
 * - Add pagination controls (we already accept paginated or array responses)
 * - Add client-side caching (React Query/SWR) to avoid repeat fetches
 * - Move inline styles to CSS modules or Tailwind for hybrid builds
 * - Add menu comparison features
 */
import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import CollapsibleSection from './CollapsibleSection';
import MenuViewer from './MenuViewer';
import BudgetPlanner from './BudgetPlanner';

// ✅ Strongly typed Restaurant interface for clarity and maintainability
// Data model from API: Restaurant object with nested relations for display
type Restaurant = {
  id: number;
  name: string;
  cuisines?: { name: string }[];
  locations?: { name: string }[];
  image_url?: string;
  image?: string | null;
  menus?: { id: number; title: string; file_url: string; page_number?: number }[];
  min_item_price?: number | string | null;
  max_item_price?: number | string | null;
  average_item_price?: number | string | null;
  min_price_tag?: number | string | null;
  max_price_tag?: number | string | null;
};

// Lightweight option type for dropdowns
type Option = { id: number; name: string };

// Menu data structure for the viewer
type Menu = {
  id: number;
  title: string;
  file_url: string;
  page_number?: number;
  restaurant?: {
    name: string;
  };
};

// Budget item structure for integration
type BudgetItem = {
  id: string;
  name: string;
  price: number;
  restaurantName?: string;
  addedAt: Date;
};

// Helper: normalize DRF responses (supports both array and paginated { results: [] })
function unwrapResults<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results: unknown[] }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

// Helper: robustly read price bounds from various possible field names
function toNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function getRestaurantPriceRange(r: any): { lower: number; upper: number } | null {
  // Try multiple schema variants that might be present depending on creation path
  const minCandidates = [
    r?.min_price_tag,
    r?.min_item_price,
    r?.min_price,
    r?.price_min,
    r?.minPrice,
    r?.min_price_range,
  ];
  const maxCandidates = [
    r?.max_price_tag,
    r?.max_item_price,
    r?.max_price,
    r?.price_max,
    r?.maxPrice,
    r?.max_price_range,
  ];
  const avgCandidates = [r?.average_item_price, r?.avg_price, r?.averagePrice];

  const minVal = minCandidates.map(toNumber).find(v => v !== undefined);
  const maxVal = maxCandidates.map(toNumber).find(v => v !== undefined);
  const avgVal = avgCandidates.map(toNumber).find(v => v !== undefined);

  if (minVal === undefined && maxVal === undefined && avgVal === undefined) {
    return null;
  }
  if (minVal !== undefined && maxVal !== undefined) {
    return { lower: minVal, upper: maxVal };
  }
  if (avgVal !== undefined) {
    return { lower: avgVal, upper: avgVal };
  }
  // Only one bound known; use it for both as a narrow range
  const known = (minVal ?? maxVal) as number;
  return { lower: known, upper: known };
}

/**
 * 📦 RestaurantList component
 * Fetches and displays restaurants from Django REST API with integrated menu viewing.
 * Supports filtering by cuisine, location, and name search.
 * Integrates with MenuViewer for inline menu display and budget planning.
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
  // Indicates filters restored from storage; prevents premature fetch
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  const [cuisineOptions, setCuisineOptions] = useState<Option[]>([]);
  const [locationOptions, setLocationOptions] = useState<Option[]>([]);

  // 🍽️ Menu viewer state
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isMenuViewerExpanded, setIsMenuViewerExpanded] = useState(false);
  const [selectedRestaurantName, setSelectedRestaurantName] = useState<string>('');

  // 💰 Budget integration state
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isBudgetExpanded, setIsBudgetExpanded] = useState(false);

  // Load budget items from localStorage on component mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('tasted-budget-items');
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems);
        // Convert string dates back to Date objects
        const itemsWithDates = parsedItems.map((item: { addedAt: string; [key: string]: unknown }) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        setBudgetItems(itemsWithDates);
      }
    } catch (error) {
      console.warn('Failed to load budget items from localStorage:', error);
    }
  }, []);

  // Save budget items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('tasted-budget-items', JSON.stringify(budgetItems));
    } catch (error) {
      console.warn('Failed to save budget items to localStorage:', error);
    }
  }, [budgetItems]);

  /**
   * 🍽️ Handle menu selection from restaurant
   */
  const handleMenuSelect = (menu: Menu, restaurantName: string) => {
    setSelectedMenu(menu);
    setSelectedRestaurantName(restaurantName);
    setIsMenuViewerExpanded(true);
    // Auto-collapse budget if it's taking up too much space
    if (isBudgetExpanded) {
      setIsBudgetExpanded(false);
    }
  };

  /**
   * 💰 Handle adding items to budget from menu viewer
   */
  const handleAddToBudget = (itemName: string, price: number, restaurantName?: string) => {
    const newItem: BudgetItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: itemName,
      price,
      restaurantName: restaurantName || selectedRestaurantName,
      addedAt: new Date(),
    };
    setBudgetItems(prev => [newItem, ...prev]);
    setIsBudgetExpanded(true); // Auto-expand budget to show new item
  };

  /**
   * 💰 Handle removing items from budget
   */
  const handleRemoveFromBudget = (itemId: string) => {
    setBudgetItems(prev => prev.filter(item => item.id !== itemId));
  };

  /**
   * 💰 Handle clearing all budget items
   */
  const handleClearAllBudget = () => {
    setBudgetItems([]);
  };

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
        // If the user selected a known option, filter by ID (supports multi-value too)
        if (match) params.append('cuisines', String(match.id));
        // If the user typed free text, use the backend's icontains alias
        else params.append('cuisine', selectedCuisine.trim());
      }
      if (selectedLocation) {
        const match = locationOptions.find(
          l => l.name.toLowerCase() === selectedLocation.trim().toLowerCase()
        );
        // If the user selected a known option, filter by ID
        if (match) params.append('locations', String(match.id));
        // Free text: use icontains alias on backend
        else params.append('location', selectedLocation.trim());
      }
      if (searchTerm) params.append('search', searchTerm);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);

      // 🌐 Make GET request to Django REST API
      const response = await api.get(`/api/v1/restaurants/?${params.toString()}`);
      const list = unwrapResults<Restaurant>(response.data);
      setRestaurants(list);
    } catch (err: unknown) {
      console.error('API error:', err);
      const error = err as { response?: { status?: number } };
      setError(
        error.response?.status === 404
          ? 'No restaurants found for your filters.'
          : 'Failed to load restaurants. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Restore filters on mount, then trigger initial fetch once
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tasted-filters');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSearchTerm(parsed.searchTerm ?? '');
        setSelectedCuisine(parsed.selectedCuisine ?? '');
        setSelectedLocation(parsed.selectedLocation ?? '');
        setMinPrice(parsed.minPrice ?? '');
        setMaxPrice(parsed.maxPrice ?? '');
      }
    } catch {}
    setFiltersInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After filters are initialized, perform the initial fetch
  useEffect(() => {
    if (filtersInitialized) {
      fetchRestaurants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersInitialized]);

  // 💾 Persist filters to localStorage when they change
  useEffect(() => {
    const toSave = {
      searchTerm,
      selectedCuisine,
      selectedLocation,
      minPrice,
      maxPrice,
    };
    try {
      localStorage.setItem('tasted-filters', JSON.stringify(toSave));
    } catch {}
  }, [searchTerm, selectedCuisine, selectedLocation, minPrice, maxPrice]);

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
             } catch {
         // silent fail; options remain empty
       }
    }
    loadOptions();
  }, []);

  return (
    <div>
      <h2 className="accent-text">🍽️ Restaurants</h2>

      {/* 🔧 Filter controls */}
      <form className="card"
        onSubmit={e => {
          e.preventDefault(); // Prevent page reload
          fetchRestaurants(); // Apply filters
        }}
        style={{ marginBottom: '1rem', padding: '1rem' }}
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

        <button type="submit" className="accent-border">Apply Filters</button>
        {/* Quick presets for price range */}
        <div style={{ marginTop: '0.5rem' }}>
          <button type="button" className="accent-border" onClick={() => { setMinPrice('0'); setMaxPrice('50'); }}>Under 50</button>
          <button type="button" className="accent-border" onClick={() => { setMinPrice('50'); setMaxPrice('100'); }} style={{ marginLeft: '0.5rem' }}>50–100</button>
          <button type="button" className="accent-border" onClick={() => { setMinPrice('100'); setMaxPrice('200'); }} style={{ marginLeft: '0.5rem' }}>100–200</button>
          <button type="button" className="accent-border" onClick={() => { setMinPrice(''); setMaxPrice(''); }} style={{ marginLeft: '0.5rem' }}>Clear</button>
        </div>
      </form>

      {/* 🧾 Feedback messages */}
      {loading && <p>Loading restaurants...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {restaurants.length === 0 && !loading && !error && (
        <p>No restaurants found.</p>
      )}

      {/* 🍽️ Menu Viewer Section */}
      {selectedMenu && (
        <CollapsibleSection
          title="Menu Viewer"
          isExpanded={isMenuViewerExpanded}
          onToggle={() => setIsMenuViewerExpanded(!isMenuViewerExpanded)}
          subtitle={`Viewing: ${selectedMenu.title} from ${selectedRestaurantName}`}
        >
          <MenuViewer
            menu={selectedMenu}
            onAddToBudget={handleAddToBudget}
            isVisible={isMenuViewerExpanded}
            restaurantName={selectedRestaurantName}
          />
        </CollapsibleSection>
      )}

      {/* 💰 Budget Planner Section */}
      <CollapsibleSection
        title="Budget Planner"
        isExpanded={isBudgetExpanded}
        onToggle={() => setIsBudgetExpanded(!isBudgetExpanded)}
        subtitle={`${budgetItems.length} items • Total: ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(budgetItems.reduce((sum, item) => sum + item.price * ((item as any).quantity ?? 1), 0))}`}
      >
        <BudgetPlanner
          onItemAdded={(item) => {
            setBudgetItems(prev => {
              const idx = prev.findIndex(p => p.name === item.name && p.restaurantName === item.restaurantName);
              if (idx >= 0) {
                const copy = [...prev];
                const existing: any = copy[idx];
                const quantity = (existing.quantity ?? 1) + ((item as any).quantity ?? 1);
                copy[idx] = { ...existing, quantity };
                return copy;
              }
              return [item, ...prev];
            });
          }}
          onItemUpdated={(updated) => {
            setBudgetItems(prev => prev.map(p => p.id === updated.id ? (updated as any) : p));
          }}
          onItemRemoved={handleRemoveFromBudget}
          onClearAll={handleClearAllBudget}
          items={budgetItems as any}
        />
      </CollapsibleSection>

             {/* 📋 Restaurant list */}
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
         {(() => {
            // Client-side fallback price filtering to handle cases where backend doesn't filter
            const parsedMin = Number(minPrice);
            const parsedMax = Number(maxPrice);
            const hasMin = Number.isFinite(parsedMin);
            const hasMax = Number.isFinite(parsedMax);

            const list = restaurants.filter(r => {
              if (!hasMin && !hasMax) return true;
              const range = getRestaurantPriceRange(r);
              // If we have no numeric info, include by default (do not hide possibly relevant entries)
              if (!range) return true;
              const { lower, upper } = range;

              // Overlap check between [lower, upper] and [parsedMin, parsedMax]
              const filterMin = hasMin ? parsedMin : -Infinity;
              const filterMax = hasMax ? parsedMax : Infinity;
              const overlaps = Math.max(lower, filterMin) <= Math.min(upper, filterMax);
              return overlaps;
            });
            return list.map(r => (
           <Link key={r.id} to={`/restaurants/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
             <div className="card" style={{ padding: '1rem', height: '100%', cursor: 'pointer', transition: 'all 0.2s ease' }}
             onMouseEnter={(e) => {
               e.currentTarget.style.borderColor = 'var(--primary)';
               e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.borderColor = '#eee';
               e.currentTarget.style.boxShadow = 'none';
             }}
             >
               {r.image_url && (
                 <img src={r.image_url} alt={`Image of ${r.name}`} width="100%" style={{ borderRadius: 6, objectFit: 'cover', maxHeight: 140 }} />
               )}
                <h3 className="accent-text" style={{ marginTop: '0.75rem' }}>{r.name}</h3>
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
                     const fmt = (n: number | string | null | undefined) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(Number(n ?? 0));
                     return `Price range: ${fmt(min)} – ${fmt(max)}`;
                   })()}
                   {r.average_item_price != null && (
                     <>
                       {' '}• Avg: {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(Number(r.average_item_price))}
                     </>
                   )}
                 </p>
               )}
               
               {/* Menu buttons - prevent event bubbling to avoid triggering the link */}
               {r.menus && r.menus.length > 0 && (
                 <div style={{ marginTop: '1rem' }}>
                   <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#333' }}>Menus:</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     {r.menus.map(menu => (
                       <button
                         key={menu.id}
                         onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           handleMenuSelect(menu, r.name);
                         }}
                          style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid var(--primary)',
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            textAlign: 'left'
                          }}
                         onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--primary)';
                            e.currentTarget.style.color = 'var(--primary-contrast)';
                         }}
                         onMouseLeave={(e) => {
                           e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--primary)';
                         }}
                       >
                         📄 {menu.title}
                         {menu.page_number && ` (Page ${menu.page_number})`}
                       </button>
                     ))}
                   </div>
                 </div>
               )}
               
               {/* View details indicator */}
               <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                 <span style={{ 
                   color: '#666',
                   fontSize: '0.9rem',
                   fontStyle: 'italic'
                 }}>
                   Click to view full details →
                 </span>
               </div>
             </div>
           </Link>
          ));
         })()}
        </div>

      {/* Pagination controls removed in revert */}
    </div>
  );
};

export default RestaurantList;