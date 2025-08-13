/**
 * BudgetPlanner.tsx — Enhanced budget tool with menu integration
 *
 * Responsibilities:
 * - Let users add items with prices, view running total, and remove items
 * - Integrate with MenuViewer to receive items from menu browsing
 * - Support restaurant context for better item organization
 * - Purely client-side; does not persist data (can be extended later)
 *
 * Extension points:
 * - Persist to localStorage or backend
 * - Add quantity fields and per-item notes
 * - Currency selection and locale-aware formatting
 * - Export budget plans
 * - Share budget with friends
 */
import React, { useMemo, useState } from 'react';

// Enhanced data structure for budget items with restaurant context
type BudgetItem = {
  id: string;
  name: string;
  price: number;
  restaurantName?: string; // Optional restaurant context
  addedAt: Date; // Timestamp for sorting and tracking
  /** Optional quantity for the item; defaults to 1 when omitted */
  quantity?: number;
  /** Optional free-text note for the item */
  note?: string;
};

// Format numbers as currency using the current locale
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR' }).format(amount);
}

// Props for the BudgetPlanner component
interface BudgetPlannerProps {
  /** Callback to receive items added from menu integration or manual entry */
  onItemAdded?: (item: BudgetItem) => void;
  /** Callback when an item is removed */
  onItemRemoved?: (itemId: string) => void;
  /** Callback when all items should be cleared */
  onClearAll?: () => void;
  /** Callback when an item is updated (quantity, note, name, price) */
  onItemUpdated?: (item: BudgetItem) => void;
  /** The current list of budget items (controlled by parent) */
  items: BudgetItem[];
}

/**
 * BudgetPlanner Component
 * 
 * Enhanced budget planning tool that integrates with menu browsing:
 * - Accepts items from MenuViewer component
 * - Provides manual item entry interface
 * - Shows restaurant context for better organization
 * - Maintains running total with currency formatting
 */
const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ 
  onItemAdded,
  onItemRemoved,
  onClearAll,
  onItemUpdated,
  items
}) => {
  // Controlled inputs for the item being created
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<string>('');

  // Derived: numeric version of the current input price for live preview
  const parsedPrice = useMemo(() => {
    const n = Number(itemPrice);
    return Number.isFinite(n) ? n : 0;
  }, [itemPrice]);

  // Derived: sum of all item prices with quantity support
  const total = useMemo(() => 
    items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0), 
    [items]
  );

  /**
   * Generate robust ids that work in browsers and hybrid runtimes.
   */
  function generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as Crypto).randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  /**
   * Add the current item to the list with guard clauses for empty/invalid input.
   */
  function addItem(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(itemPrice);
    if (!itemName.trim() || !Number.isFinite(price)) return;
    const newItem: BudgetItem = {
      id: generateId(),
      name: itemName.trim(),
      price,
      addedAt: new Date(),
      quantity: 1,
    };
    onItemAdded?.(newItem);
    setItemName('');
    setItemPrice('');
  }

  /**
   * Remove an item by id.
   */
  function removeItem(id: string) {
    onItemRemoved?.(id);
  }

  /** Update helper: emit updated item via callback if provided */
  function updateItem(updated: BudgetItem) {
    onItemUpdated?.(updated);
  }

  return (
    <section aria-labelledby="budget-planner-heading" className="card" style={{ padding: '1rem' }}>
      <h2 id="budget-planner-heading" className="accent-text">Budget Planner</h2>

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
            borderBottom: '1px solid var(--border)' 
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500', color: 'var(--primary)' }}>{item.name}</div>
              {item.restaurantName && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--muted)', 
                  fontStyle: 'italic',
                  marginTop: '0.25rem'
                }}>
                  from {item.restaurantName}
                </div>
              )}
              {/* Quantity and note controls */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Qty:
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={item.quantity ?? 1}
                    onChange={(e) => {
                      const qty = Math.max(1, Number(e.target.value) || 1);
                      updateItem({ ...item, quantity: qty });
                    }}
                    aria-label={`Quantity for ${item.name}`}
                    style={{ marginLeft: '0.5rem', width: '4rem', padding: '0.25rem' }}
                  />
                </label>
                <label style={{ fontSize: '0.85rem', color: 'var(--muted)', flex: 1, minWidth: '200px' }}>
                  Note:
                  <input
                    type="text"
                    value={item.note ?? ''}
                    onChange={(e) => updateItem({ ...item, note: e.target.value })}
                    placeholder="Add a note…"
                    aria-label={`Note for ${item.name}`}
                    style={{ marginLeft: '0.5rem', width: '100%', padding: '0.25rem' }}
                  />
                </label>
              </div>
            </div>
            <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <strong className="accent-text">
                {formatCurrency(item.price * (item.quantity ?? 1))}
              </strong>
              <button 
                onClick={() => removeItem(item.id)} 
                aria-label={`Remove ${item.name}`}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary-contrast)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text)';
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
         <strong className="accent-text">Total: {formatCurrency(total)}</strong>
         {items.length > 0 && (
           <button
             onClick={onClearAll}
             style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: 'var(--text)',
               cursor: 'pointer',
               fontSize: '0.9rem',
               transition: 'all 0.2s ease'
             }}
             onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary-contrast)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text)';
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


