
# Project documentation

Centralized docs for this repository live in the `docs/` folder. Developer-facing READMEs for the backend and frontend remain inside their respective folders.

Quick links
- Docs index: `docs/README.md`
- API reference: `docs/archive/API_PROFESSIONAL_GUIDE.md`
- Backend README: `ecommerce-backend/README.md`
- Frontend README: `ecommerce-frontend/README.md`

Quick start

Backend
```bash
cd ecommerce-backend
npm install
cp .env.example .env    # update secrets and DB config
npm run db:reset
npm run dev
```

Frontend
```bash
cd ecommerce-frontend
npm install
npm run dev
```

If you want me to reorganize documentation further (split the API guide per resource, produce a single PDF, or delete archived reports), tell me which option you prefer.
