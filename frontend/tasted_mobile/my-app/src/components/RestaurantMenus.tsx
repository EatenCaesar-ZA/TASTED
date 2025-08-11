/**
 * RestaurantMenus.tsx — Downloadable menus list for a restaurant
 *
 * Responsibilities:
 * - Render a list of menu files with secure target/rel attributes
 * - Provide accessible labels including optional page numbers
 */
import React from 'react';

// Define the shape of a single menu object
interface Menu {
  id: number;
  title: string;
  file_url: string;
  page_number?: number;
}

// Props passed into this component: an array of Menu objects
interface Props {
  menus: Menu[];
}

// Functional component to display downloadable menus for a restaurant
const RestaurantMenus: React.FC<Props> = ({ menus }) => {
  // If no menus are available, show a fallback message
  if (!menus || menus.length === 0) {
    return <p>No menus available for this restaurant.</p>;
  }

  return (
    // Semantic section with accessible heading for screen readers
    <section aria-labelledby="menu-heading">
      <h2 id="menu-heading">Available Menus</h2>

      {/* Unordered list of menu items */}
      <ul>
        {menus.map((menu) => (
          <li key={menu.id}>
            {/* 
              Anchor tag links to the uploaded file.
              - target="_blank": opens in new tab
              - rel="noopener noreferrer": security best practice
              - download: prompts file download instead of opening
              - aria-label: improves accessibility for screen readers
            */}
            <a
              href={menu.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              aria-label={`Download ${menu.title}${menu.page_number ? ` - Page ${menu.page_number}` : ''}`}
            >
              {menu.title}
              {menu.page_number && ` (Page ${menu.page_number})`}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RestaurantMenus;