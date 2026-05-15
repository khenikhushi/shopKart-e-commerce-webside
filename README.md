
# Project documentation

Centralized docs for this repository live in the `docs/` folder. Developer-facing READMEs for the backend and frontend remain inside their respective folders.

Quick links
- Docs index: `docs/README.md`
- API reference: `docs/archive/API_PROFESSIONAL_GUIDE.md`
- Backend README: `shopkart-e-commerce-webside-backend/README.md`
- Frontend README: `shopkart-e-commerce-webside-frontend/README.md`

Quick start

⚙️ Installation

Clone the Repository
Open your terminal and run:
```bash
git clone [https://github.com/khenikhushi/shopKart---e-commerce-webside.git](https://github.com/khenikhushi/shopKart---e-commerce-webside.git)
cd shopKart---e-commerce-webside
```

Backend
```bash
cd shopkart-e-commerce-webside-backend
npm install
cp .env.example .env    # update secrets and DB config
npm run db:reset
npm run dev
```

Frontend
```bash
cd shopkart-e-commerce-webside-frontend
npm install
npm run dev
```

Start both Frontend and Backend
```bash
cd shopkart-e-commerce-webside
npm install
npm run dev
```