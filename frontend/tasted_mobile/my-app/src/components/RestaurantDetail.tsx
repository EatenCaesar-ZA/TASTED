/**
 * RestaurantDetail.tsx — Detail page for a single restaurant with themed UI
 * Integrates MenuViewer and BudgetPlanner so the theme carries through.
 */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
// import RestaurantMenus from './RestaurantMenus';
import MenuViewer from './MenuViewer';
import CollapsibleSection from './CollapsibleSection';
import BudgetPlanner from './BudgetPlanner';

type Restaurant = {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  image?: string | null;
  cuisines?: { name: string }[];
  locations?: { name: string }[];
  menus?: { id: number; title: string; file_url: string; page_number?: number }[];
  min_item_price?: number | string | null;
  max_item_price?: number | string | null;
  average_item_price?: number | string | null;
};

const RestaurantDetail: React.FC = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMenu, setSelectedMenu] = useState<{ id: number; title: string; file_url: string; page_number?: number } | null>(null);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);

  // Effect: fetch the restaurant whenever the :id route param changes
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/restaurants/${id}/`);
        setRestaurant(res.data as Restaurant);
      } catch {
        setError('Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!restaurant) return <p>Not found</p>;

  return (
    <article>
      <p>
        <Link to="/" aria-label="Back to restaurant list" className="accent-text">← Back to list</Link>
      </p>
      <div className="card" style={{ padding: '1rem' }}>
        <h2 className="accent-text" style={{ marginTop: 0 }}>{restaurant.name}</h2>
        <p>
        {restaurant.cuisines?.map(c => c.name).join(', ') || 'No cuisine'} |{' '}
        {restaurant.locations?.map(l => l.name).join(', ') || 'No location'}
        </p>
        {(restaurant.image || restaurant.image_url) && (
          <img src={restaurant.image || restaurant.image_url} alt={`Image of ${restaurant.name}`} width={300} style={{ borderRadius: 8 }} />
        )}
        {restaurant.description && <p style={{ marginTop: '1rem' }}>{restaurant.description}</p>}
        {(restaurant.min_item_price != null || restaurant.max_item_price != null) && (
          <p style={{ marginTop: '0.5rem' }}>
            Price range: {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(Number(restaurant.min_item_price ?? 0))} – {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(Number(restaurant.max_item_price ?? 0))}
            {restaurant.average_item_price != null && (
              <>
                {' '}• Avg: {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(Number(restaurant.average_item_price))}
              </>
            )}
          </p>
        )}
      </div>

      {restaurant.menus && restaurant.menus.length > 0 && (
        <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
          <h3 className="accent-text" style={{ marginTop: 0 }}>Menus</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {restaurant.menus.map(menu => (
              <button
                key={menu.id}
                className="accent-border"
                onClick={() => { setSelectedMenu(menu); setIsMenuExpanded(true); }}
              >
                📄 {menu.title}{menu.page_number && ` (Page ${menu.page_number})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inline menu viewer */}
      {selectedMenu && (
        <CollapsibleSection
          title="Menu Viewer"
          isExpanded={isMenuExpanded}
          onToggle={() => setIsMenuExpanded(!isMenuExpanded)}
          subtitle={`Viewing: ${selectedMenu.title}`}
        >
          <MenuViewer
            menu={selectedMenu}
            onAddToBudget={(name, price) => {
              const newItem = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, price, addedAt: new Date() };
              setBudgetItems(prev => [newItem, ...prev]);
            }}
            isVisible={isMenuExpanded}
            restaurantName={restaurant.name}
          />
        </CollapsibleSection>
      )}

      {/* Budget planner */}
      <CollapsibleSection
        title="Budget Planner"
        isExpanded={true}
        onToggle={() => {}}
        subtitle={`${budgetItems.length} items • Total: ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(budgetItems.reduce((s: number, i: any) => s + i.price * ((i as any).quantity ?? 1), 0))}`}
      >
        <BudgetPlanner
          onItemAdded={(item) => setBudgetItems(prev => [item, ...prev])}
          onItemUpdated={(updated) => setBudgetItems(prev => prev.map(i => i.id === updated.id ? updated : i))}
          onItemRemoved={(id) => setBudgetItems(prev => prev.filter(i => i.id !== id))}
          onClearAll={() => setBudgetItems([])}
          items={budgetItems as any}
        />
      </CollapsibleSection>
    </article>
  );
};

export default RestaurantDetail;


