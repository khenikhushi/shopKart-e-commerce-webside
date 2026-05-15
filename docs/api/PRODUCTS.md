Products API

Base path: `/api/v1/products`

Overview

- Catalog endpoints support pagination (`page`, `limit`), filtering, and search.
- Responses follow the standard JSON envelope: `success, message, data, errors, meta`.

Endpoints

1) List products
- `GET /api/v1/products`
- Query params: `page` (default 1), `limit` (default 20), `category`, `q` (search), `filters`
- Success: `200 OK` with `data` array and `meta` pagination object.

2) Product detail
- `GET /api/v1/products/:slug` (or `:id` depending on implementation)
- Success: `200 OK` with `data` object.

Pagination example (`meta`)

```json
"meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
```

3) Create / Update / Delete (admin)
- Admin-only endpoints use role middleware; returns `403` for insufficient permissions.

Filtering & Facets
- Filters and product attributes are modeled via `filters` and `filterValues` tables.
- Use query params to apply filters and combine them (e.g., `?color=red&size=M`).

Notes
- Ensure the frontend adapts to the `meta` pagination fields.
- Use `slug` for stable public URLs when available.
Products: Catalog & Search

Endpoints

- GET /api/v1/products
  - Description: List products. Supports pagination and filters.
  - Query params:
    - `page` (number) default 1
    - `limit` (number) default 20
    - filter params (category, price range, search, etc.) depending on implementation
  - Response:
    - `200 OK` with `data` (array of products) and `meta` pagination object.

- GET /api/v1/products/:slug
  - Description: Get product details by slug.
  - Response: `200 OK` with `data.product`.

Pagination

Responses use a `meta` object for pagination:

```
"meta": {
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5
}
```

Search & Filters

- Use query parameters to filter results (e.g., `?q=shirt&category=men&minPrice=10&maxPrice=100`).

Performance

- APIs should implement eager-loading for associations and safe pagination to avoid N+1 queries. See `docs/archive/CODE_QUALITY_GUIDE.md` for patterns.
