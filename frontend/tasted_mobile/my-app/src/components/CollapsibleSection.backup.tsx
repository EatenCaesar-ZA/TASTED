/**
 * Backup of CollapsibleSection.tsx prior to theme styling edits
 */
import React, { useState, useRef } from 'react';

interface CollapsibleSectionProps {
  title: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
  showIcon?: boolean;
  children: React.ReactNode;
  subtitle?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isExpanded: controlledExpanded,
  onToggle,
  className = '',
  showIcon = true,
  children,
  subtitle
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`collapsible-section ${className}`} style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '1rem',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
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
          color: '#333',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
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
            <span>{title}</span>
          </div>
          {subtitle && (
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#666', 
              marginTop: '0.25rem',
              fontWeight: 'normal'
            }}>
              {subtitle}
            </div>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 'normal' }}>
          {isExpanded ? 'Collapse' : 'Expand'}
        </span>
      </button>

      <div
        id={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? '1000px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          borderTop: isExpanded ? '1px solid #e0e0e0' : 'none'
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




