# 🍽️ Integrated Menu Viewing & Budget Planning Features

## 📋 Overview

The Tasted app now features an integrated menu viewing system that allows users to browse menus inline and add items directly to their budget planner, creating a seamless dining planning experience.

## 🎯 Key Features

### 1. **Collapsible Menu Viewer**
- **Location**: Integrated into the main restaurant list page
- **Functionality**: 
  - Displays menu content (PDF/images) inline within the app
  - Smooth expand/collapse animations with accessibility features
  - Supports multiple file types (PDF, images, fallback for others)
  - Provides "View Full Menu" option for external viewing

### 2. **Budget Integration**
- **Seamless Workflow**: Add menu items to budget while viewing menus
- **Restaurant Context**: Items show which restaurant they're from
- **Real-time Updates**: Budget updates immediately when items are added
- **Collapsible Interface**: Budget planner can be expanded/collapsed as needed

### 3. **Enhanced Restaurant Cards**
- **Menu Buttons**: Direct access to view menus from restaurant cards
- **Visual Indicators**: Clear menu availability and page information
- **Responsive Design**: Works on both desktop and mobile devices

## 🏗️ Architecture

### Components Structure

```
RestaurantList (Main Container)
├── CollapsibleSection (Menu Viewer)
│   └── MenuViewer
│       ├── Menu Display (PDF/Image)
│       └── Budget Integration Form
├── CollapsibleSection (Budget Planner)
│   └── BudgetPlanner
│       ├── Item List with Restaurant Context
│       └── Manual Entry Form
└── Restaurant Cards
    └── Menu Buttons
```

### Key Components

#### **CollapsibleSection.tsx**
- **Purpose**: Reusable expandable/collapsible container
- **Features**: 
  - Smooth CSS transitions
  - Accessibility support (ARIA attributes, keyboard navigation)
  - Controlled and uncontrolled state modes
  - Customizable styling and icons

#### **MenuViewer.tsx**
- **Purpose**: Display menu content with budget integration
- **Features**:
  - File type detection and appropriate rendering
  - PDF iframe embedding
  - Image display with responsive sizing
  - Manual item entry for budget planning
  - External viewing fallback

#### **BudgetPlanner.tsx** (Enhanced)
- **Purpose**: Budget management with restaurant context
- **Features**:
  - Restaurant attribution for items
  - Timestamp tracking
  - Enhanced visual design
  - Integration with menu viewer

## 🔧 Technical Implementation

### State Management
```typescript
// Menu Viewer State
const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
const [isMenuViewerExpanded, setIsMenuViewerExpanded] = useState(false);
const [selectedRestaurantName, setSelectedRestaurantName] = useState<string>('');

// Budget Integration State
const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
const [isBudgetExpanded, setIsBudgetExpanded] = useState(false);
```

### Data Flow
1. **User clicks menu button** → `handleMenuSelect()` → Menu viewer expands
2. **User adds item to budget** → `handleAddToBudget()` → Budget updates and expands
3. **Budget items** include restaurant context and timestamps

### File Type Support
- **PDF**: Embedded iframe with fallback to external viewing
- **Images**: Direct display with responsive sizing
- **Other formats**: Fallback to external viewing with clear messaging

## 🎨 User Experience Benefits

### Before (External Menu Opening)
1. Click menu → New tab opens → Lose context
2. Remember prices → Switch back → Add to budget manually
3. Fragmented workflow with multiple tabs

### After (Integrated Experience)
1. Click menu → Inline display → Stay in context
2. View menu and budget simultaneously → Add items directly
3. Seamless, focused workflow

## 🚀 Future Enhancements

### Phase 1 (Current)
- ✅ Basic inline menu viewing
- ✅ Budget integration
- ✅ Collapsible sections

### Phase 2 (Planned)
- [ ] Menu comparison mode
- [ ] Favorites and saved items
- [ ] Budget export/sharing
- [ ] Advanced filtering by budget

### Phase 3 (Advanced)
- [ ] AI-powered menu item suggestions
- [ ] Nutritional information integration
- [ ] Social features (share budgets with friends)
- [ ] Restaurant recommendations based on budget

## 🐛 Debugging Tips

### Common Issues
1. **Menu not displaying**: Check file URL accessibility and CORS settings
2. **Budget not updating**: Verify `onAddToBudget` callback is properly connected
3. **Collapsible not working**: Check controlled vs uncontrolled state management

### Development Tools
- Use browser dev tools to inspect iframe content
- Check network tab for file loading issues
- Monitor React DevTools for state changes

## 📱 Mobile Considerations

- **Touch-friendly**: All buttons sized for mobile interaction
- **Responsive design**: Layout adapts to screen size
- **Performance**: Lazy loading for menu content
- **Accessibility**: Screen reader support throughout

## 🔒 Security Notes

- **External links**: Use `rel="noopener noreferrer"` for security
- **File validation**: Server-side validation of uploaded menu files
- **CORS**: Proper CORS configuration for menu file access

---

*This integrated system transforms the dining planning experience from a fragmented multi-tab workflow into a cohesive, user-friendly application that keeps users engaged and focused on their dining decisions.*

