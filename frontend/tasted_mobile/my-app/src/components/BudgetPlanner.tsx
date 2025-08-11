/**
 * BudgetPlanner.tsx — Simple client-side budget tool
 *
 * Responsibilities:
 * - Let users add items with prices, view running total, and remove items
 * - Purely client-side; does not persist data (can be extended later)
 *
 * Extension points:
 * - Persist to localStorage or backend
 * - Add quantity fields and per-item notes
 * - Currency selection and locale-aware formatting
 */
import React, { useMemo, useState } from 'react';

// Internal data structure for user-entered items
type BudgetItem = {
  id: string;
  name: string;
  price: number;
};

// Format numbers as currency using the current locale
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount);
}

const BudgetPlanner: React.FC = () => {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<string>('');
  const [items, setItems] = useState<BudgetItem[]>([]);

  const parsedPrice = useMemo(() => {
    const n = Number(itemPrice);
    return Number.isFinite(n) ? n : 0;
  }, [itemPrice]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);

  function generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as any).randomUUID();
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
    };
    setItems(prev => [newItem, ...prev]);
    setItemName('');
    setItemPrice('');
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
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
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
            <span>{item.name}</span>
            <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <strong>{formatCurrency(item.price)}</strong>
              <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>Remove</button>
            </span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
        <strong>Total: {formatCurrency(total)}</strong>
      </div>
    </section>
  );
};

export default BudgetPlanner;


