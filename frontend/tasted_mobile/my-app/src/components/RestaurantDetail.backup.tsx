/**
 * Backup of RestaurantDetail.tsx prior to theme + viewer + budget integration edits
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import RestaurantMenus from './RestaurantMenus';

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
        <a href="/" aria-label="Back to restaurant list">← Back to list</a>
      </p>
      <h2>{restaurant.name}</h2>
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

      {restaurant.menus && restaurant.menus.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <RestaurantMenus menus={restaurant.menus} />
        </div>
      )}
    </article>
  );
};

export default RestaurantDetail;




