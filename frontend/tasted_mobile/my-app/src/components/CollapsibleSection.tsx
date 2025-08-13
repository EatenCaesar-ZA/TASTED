/**
 * CollapsibleSection.tsx — Reusable expandable/collapsible container component
 *
 * Responsibilities:
 * - Provide smooth expand/collapse animations with CSS transitions
 * - Handle accessibility features (ARIA attributes, keyboard navigation)
 * - Support both controlled and uncontrolled state management
 * - Maintain consistent styling and behavior across the app
 *
 * Usage:
 * <CollapsibleSection 
 *   title="Menu Viewer" 
 *   isExpanded={isMenuExpanded} 
 *   onToggle={() => setIsMenuExpanded(!isMenuExpanded)}
 * >
 *   <MenuViewer menu={selectedMenu} onAddToBudget={handleAddToBudget} />
 * </CollapsibleSection>
 */

import React, { useState, useRef } from 'react';

// Props interface for the collapsible section
interface CollapsibleSectionProps {
  /** The title displayed in the header button */
  title: string;
  /** Whether the section is currently expanded */
  isExpanded?: boolean;
  /** Callback when the expand/collapse button is clicked */
  onToggle?: () => void;
  /** Optional CSS class for custom styling */
  className?: string;
  /** Whether to show an icon in the header (default: true) */
  showIcon?: boolean;
  /** Content to render inside the collapsible section */
  children: React.ReactNode;
  /** Optional subtitle or description */
  subtitle?: string;
}

/**
 * CollapsibleSection Component
 * 
 * Provides a smooth, accessible expand/collapse experience with:
 * - CSS transitions for smooth animations
 * - ARIA attributes for screen readers
 * - Keyboard navigation support
 * - Responsive design considerations
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isExpanded: controlledExpanded,
  onToggle,
  className = '',
  showIcon = true,
  children,
  subtitle
}) => {
  // Internal state for uncontrolled mode
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  // Reference to the content div for height calculations
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  
  // Handle toggle action
  const handleToggle = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };
  
  // Handle keyboard events for accessibility
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`collapsible-section card ${className}`} style={{
      border: '1px solid var(--border)',
      borderRadius: '8px',
      marginBottom: '1rem',
      overflow: 'hidden',
      backgroundColor: 'var(--panel)'
    }}>
      {/* Header button - clickable area for expand/collapse */}
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        style={{
          width: '100%',
          padding: '1rem',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: 'var(--text)',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Title and subtitle section */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {showIcon && (
              <span 
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  fontSize: '0.9rem',
                  color: '#666'
                }}
              >
                ▶
              </span>
            )}
            <span className="accent-text">{title}</span>
          </div>
          {subtitle && (
            <div style={{ 
              fontSize: '0.9rem', 
              color: 'var(--muted)', 
              marginTop: '0.25rem',
              fontWeight: 'normal'
            }}>
              {subtitle}
            </div>
          )}
        </div>
        
        {/* Status indicator */}
        <span style={{ 
          fontSize: '0.8rem', 
          color: 'var(--muted)',
          fontWeight: 'normal'
        }}>
          {isExpanded ? 'Collapse' : 'Expand'}
        </span>
      </button>

      {/* Collapsible content area */}
      <div
        id={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? '1000px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          borderTop: isExpanded ? '1px solid var(--border)' : 'none'
        }}
      >
        <div style={{ padding: '1rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
