/**
 * Backup of BudgetPlanner.tsx prior to edits
 */
import React, { useMemo, useState } from 'react';

type BudgetItem = {
  id: string;
  name: string;
  price: number;
  restaurantName?: string;
  addedAt: Date;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(amount);
}

interface BudgetPlannerProps {
  onItemAdded?: (item: BudgetItem) => void;
  onItemRemoved?: (itemId: string) => void;
  onClearAll?: () => void;
  items: BudgetItem[];
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ 
  onItemAdded,
  onItemRemoved,
  onClearAll,
  items
}) => {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<string>('');

  const parsedPrice = useMemo(() => {
    const n = Number(itemPrice);
    return Number.isFinite(n) ? n : 0;
  }, [itemPrice]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);

  function generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as Crypto).randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(itemPrice);
    if (!itemName.trim() || !Number.isFinite(price)) return;
    const newItem: BudgetItem = {
      id: generateId(),
      name: itemName.trim(),
      price,
      addedAt: new Date(),
    };
    onItemAdded?.(newItem);
    setItemName('');
    setItemPrice('');
  }

  function removeItem(id: string) {
    onItemRemoved?.(id);
  }

  return (
    <section aria-labelledby="budget-planner-heading">
      <h2 id="budget-planner-heading">Budget Planner</h2>

      <form onSubmit={addItem} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Item name"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          aria-label="Budget item name"
          required
          style={{ padding: '0.5rem', minWidth: '12rem' }}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={itemPrice}
          onChange={e => setItemPrice(e.target.value)}
          aria-label="Budget item price"
          required
          style={{ padding: '0.5rem', minWidth: '8rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Add</button>
      </form>

      <div aria-live="polite" style={{ marginBottom: '0.75rem' }}>
        Current: {itemName ? `"${itemName}"` : '—'} {Number.isFinite(parsedPrice) ? formatCurrency(parsedPrice) : ''}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map(item => (
          <li key={item.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '0.75rem 0', 
            borderBottom: '1px solid #eee' 
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500', color: '#333' }}>{item.name}</div>
              {item.restaurantName && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: '#666', 
                  fontStyle: 'italic',
                  marginTop: '0.25rem'
                }}>
                  from {item.restaurantName}
                </div>
              )}
            </div>
            <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <strong style={{ color: '#28a745' }}>{formatCurrency(item.price)}</strong>
              <button 
                onClick={() => removeItem(item.id)} 
                aria-label={`Remove ${item.name}`}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease'
                }}
              >
                Remove
              </button>
            </span>
          </li>
        ))}
      </ul>

      <div style={{ 
        marginTop: '1rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: '1.1rem' 
      }}>
        <strong>Total: {formatCurrency(total)}</strong>
        {items.length > 0 && (
          <button
            onClick={onClearAll}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #dc3545',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            🗑️ Clear All
          </button>
        )}
      </div>
    </section>
  );
};

export default BudgetPlanner;



