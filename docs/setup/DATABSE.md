Database: Schema & Migrations

This project uses Sequelize migrations located in `ecommerce-backend/src/migrations`.

Available migrations (applied in order):

- 001-create-users-table.js
- 002-create-categories-table.js
- 003-create-subcategories-table.js
- 004-create-products-table.js
- 005-create-carts-table.js
- 006-create-cart-items-table.js
- 007-create-orders-table.js
- 008-create-order-items-table.js
- 009-create-filters-table.js
- 010-create-filter-values-table.js
- 011-create-product-filters-table.js
- 012-add-category-hierarchy-and-filter-optimizations.js

Running migrations

Use your npm scripts or Sequelize CLI (if available) to run migrations. Example:

```bash
cd ecommerce-backend
npm run db:migrate
```

Resetting the DB (dangerous: deletes data)

```bash
npm run db:reset
```

Notes

- Review migration files before applying in production.
- Keep backups of production databases before running destructive operations.
