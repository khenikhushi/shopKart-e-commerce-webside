# ecommerce-backend

Backend for the ecommerce project (Express + Sequelize).

See the consolidated project docs: `../docs/README.md` and `../docs/archive/API_PROFESSIONAL_GUIDE.md` for API reference, installation, and security notes.

Quick start
```bash
cd ecommerce-backend
npm install
cp .env.example .env
npm run dev
```
# E-Commerce API

Production-grade REST API built with Node.js, Express, Sequelize, and MySQL.

## Tech Stack
- Node.js + Express.js
- MySQL + Sequelize ORM
- JWT Authentication
- UUID primary keys
- Slug-based URLs
- Scribe API documentation

## Roles
| Role   | Capabilities |
|--------|-------------|
| Admin  | Full platform access, user management, all orders |
| Seller | Manage own products, view own orders |
| User   | Browse products, manage cart, place orders |

## Quick Start

### 1. Clone and install
\`\`\`bash
git clone <repo-url>
cd ecommerce-api
npm install
\`\`\`

### 2. Configure environment
\`\`\`bash
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
\`\`\`

### 3. Database Setup
\`\`\`bash
# Run migrations to create tables
npm run db:migrate

# Seed initial data (admin user, categories, subcategories)
npm run db:seed

# Or reset database completely
npm run db:reset
\`\`\`

### 4. Seed default admin
The seeding process creates an admin user:
- **Email:** admin@ecommerce.com
- **Password:** Admin@1234

You can also seed just the admin user:
\`\`\`bash
npm run seed:admin
\`\`\`

### 5. Start development server
\`\`\`bash
npm run dev
\`\`\`

## Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Run all pending migrations |
| `npm run db:migrate:undo` | Undo last migration |
| `npm run db:migrate:undo:all` | Undo all migrations |
| `npm run db:seed` | Run all seeders |
| `npm run db:seed:undo` | Undo all seeders |
| `npm run db:reset` | Reset database (undo all + migrate + seed) |
| `npm run seed:admin` | Seed only admin user |

### 6. Generate API docs
\`\`\`bash
npm run docs
\`\`\`

## API Documentation
Visit http://localhost:5000/docs after generating docs.

## Base URL
\`\`\`
http://localhost:5000/api/v1
\`\`\`

## Authentication
All protected routes require:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Environment Variables
| Variable           | Description              |
|--------------------|--------------------------|
| PORT               | Server port (default 5000) |
| DB_HOST            | MySQL host               |
| DB_PORT            | MySQL port               |
| DB_NAME            | Database name            |
| DB_USER            | Database user            |
| DB_PASSWORD        | Database password        |
| JWT_SECRET         | JWT signing secret       |
| JWT_EXPIRES_IN     | Token expiry (e.g. 7d)   |
| BCRYPT_SALT_ROUNDS | Password hash rounds     |

## Project Structure
\`\`\`
src/
├── config/        # DB connection, env, constants
├── models/        # Sequelize models + associations
├── controllers/   # Request handlers
├── services/      # Business logic
├── routes/        # Express routers
├── middlewares/   # Auth, role, validation, errors
├── validators/    # express-validator rules
├── utils/         # Helpers (slug, jwt, logger...)
└── seeders/       # Database seeders
\`\`\`