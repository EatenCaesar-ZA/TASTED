# Tasted API — Backend Overview

## 📦 Purpose
This Django REST backend powers the Tasted restaurant app. It manages restaurants, cuisines, locations, and menus — including manual file uploads for menus.

---

## 🧱 Models

### Restaurant
- `name`, `description`, `image_url`
- Many-to-many with `Cuisine` and `Location`
- Linked to `Menu` via `menus` related name

### Cuisine / Location
- Simple `name` fields
- Used for filtering and categorization

### Menu
- Linked to a `Restaurant`
- Uploadable `file` (PDF/image)
- Optional `page_number`
- Serialized with `file_url` for frontend access

---

## 🔧 Serializers

- `RestaurantSerializer`: Nested `cuisines`, `locations`, `menus`; supports ID-based assignment
- `MenuSerializer`: Returns full `file_url` for uploaded files

---

## 🔌 ViewSets

- `RestaurantViewSet`: Supports filtering by cuisine, location, menu title/page
- `MenuViewSet`: Supports CRUD and filtering by restaurant, title, page

---

## 🛠 Admin Setup

- All models registered
- `MenuAdmin` supports file uploads and search

---

## 🌐 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/v1/restaurants/` | List, filter, and manage restaurants |
| `/api/v1/menus/`       | Upload and manage menu files |
| `/admin/`              | Admin panel for manual data entry |
| `/media/menus/...`     | Uploaded menu file access |

---

## 🧪 Testing Tips

- Add restaurants via Admin
- Upload menus via Admin → check `/api/v1/restaurants/`
- Use query params like `?menu_title=Lunch` to filter

---

## 🧩 Frontend Integration

- Use `restaurant.menus.map()` to render menu links
- Use `file_url` to display or download menu files
- Supports React + TypeScript with clean API responses

---

## 🚀 Future Modules

- Reviews
- User accounts
- Ratings and comments