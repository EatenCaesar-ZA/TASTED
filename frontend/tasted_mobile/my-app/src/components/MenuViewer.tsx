/**
 * MenuViewer.tsx — Inline menu display with budget integration
 *
 * Responsibilities:
 * - Display menu content (PDF/image) inline within the app
 * - Provide "Add to Budget" functionality for menu items
 * - Handle different menu file types (PDF, images)
 * - Offer fallback to external viewing for complex menus
 * - Maintain accessibility and responsive design
 *
 * Integration Points:
 * - Receives menu data from RestaurantList/RestaurantDetail
 * - Calls onAddToBudget callback to integrate with BudgetPlanner
 * - Uses CollapsibleSection for expand/collapse behavior
 */

import React, { useState, useEffect } from 'react';

// Menu data structure matching the backend API
interface Menu {
  id: number;
  title: string;
  file_url: string;
  page_number?: number;
  restaurant?: {
    name: string;
  };
}

// Props for the MenuViewer component
interface MenuViewerProps {
  /** The menu object to display */
  menu: Menu | null;
  /** Callback when user wants to add an item to budget */
  onAddToBudget: (itemName: string, price: number, restaurantName?: string) => void;
  /** Whether the viewer is currently visible/expanded */
  isVisible: boolean;
  /** Optional restaurant name for context */
  restaurantName?: string;
}

/**
 * MenuViewer Component
 * 
 * Displays menu content inline with budget integration features:
 * - Shows menu file (PDF/image) in an iframe or image element
 * - Provides "Add to Budget" interface for manual item entry
 * - Handles different file types appropriately
 * - Offers external viewing option for complex menus
 */
const MenuViewer: React.FC<MenuViewerProps> = ({
  menu,
  onAddToBudget,
  isVisible,
  restaurantName
}) => {
  // State for manual item entry
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Determine file type from URL
  const getFileType = (url: string): 'pdf' | 'image' | 'unknown' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    return 'unknown';
  };

  // Handle adding item to budget
  const handleAddToBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(itemPrice);
    if (!itemName.trim() || !Number.isFinite(price) || price <= 0) return;
    
    onAddToBudget(itemName.trim(), price, restaurantName);
    setItemName('');
    setItemPrice('');
    setIsAddingItem(false);
  };

  // Handle external menu viewing
  const handleViewExternal = () => {
    if (menu?.file_url) {
      window.open(menu.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Reset form when menu changes
  useEffect(() => {
    setItemName('');
    setItemPrice('');
    setIsAddingItem(false);
  }, [menu?.id]);

  // Don't render if no menu or not visible
  if (!menu || !isVisible) {
    return null;
  }

  const fileType = getFileType(menu.file_url);
  const displayName = restaurantName || menu.restaurant?.name || 'Restaurant';

  return (
    <div className="menu-viewer" style={{
      backgroundColor: '#fafafa',
      borderRadius: '8px',
      padding: '1rem',
      border: '1px solid #e0e0e0'
    }}>
      {/* Menu Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#333' }}>{menu.title}</h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
            {displayName}
            {menu.page_number && ` • Page ${menu.page_number}`}
          </p>
        </div>
        
        {/* External View Button */}
          <button
          onClick={handleViewExternal}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid var(--primary)',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: 'var(--primary)',
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
            e.currentTarget.style.color = 'var(--primary)';
          }}
        >
          View Full Menu
        </button>
      </div>

      {/* Menu Content Display */}
      <div style={{ marginBottom: '1.5rem' }}>
        {fileType === 'pdf' && (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '1rem',
            backgroundColor: '#fff',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
              PDF Menu - Click "View Full Menu" to open in new tab
            </p>
            <iframe
              src={menu.file_url}
              style={{
                width: '100%',
                height: '60vh',
                maxHeight: '520px',
                border: 'none',
                borderRadius: '4px'
              }}
              title={`${menu.title} - ${displayName}`}
            />
          </div>
        )}

        {fileType === 'image' && (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '1rem',
            backgroundColor: '#fff',
            textAlign: 'center'
          }}>
            <img
              src={menu.file_url}
              alt={`${menu.title} - ${displayName}`}
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        )}

        {fileType === 'unknown' && (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '1rem',
            backgroundColor: '#fff',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: '#666' }}>
              Menu file format not supported for inline viewing.
              <br />
              <button
                onClick={handleViewExternal}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  border: '1px solid #007bff',
                  borderRadius: '4px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Open Menu File
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Budget Integration Section */}
      <div style={{
        borderTop: '1px solid #e0e0e0',
        paddingTop: '1rem'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>
          Add Items to Budget
        </h4>
        
        {!isAddingItem ? (
          <button
            onClick={() => setIsAddingItem(true)}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--primary)',
              borderRadius: '4px',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-contrast)',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            + Add Menu Item to Budget
          </button>
        ) : (
          <form onSubmit={handleAddToBudget} style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label htmlFor="item-name" style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.9rem',
                color: '#555'
              }}>
                Item Name
              </label>
              <input
                id="item-name"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Margherita Pizza"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ minWidth: '120px' }}>
              <label htmlFor="item-price" style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.9rem',
                color: '#555'
              }}>
                Price (R)
              </label>
              <input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0.00"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                type="submit"
                style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--primary)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-contrast)',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Add
              </button>
                <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                style={{
                  padding: '0.5rem 1rem',
                    border: '1px solid var(--border)',
                  borderRadius: '4px',
                    backgroundColor: 'transparent',
                    color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        
        <p style={{
          margin: '0.75rem 0 0 0',
          fontSize: '0.85rem',
          color: '#666',
          fontStyle: 'italic'
        }}>
          💡 Tip: Look at the menu above and add items you're interested in to track your budget!
        </p>
      </div>
    </div>
  );
};

export default MenuViewer;

