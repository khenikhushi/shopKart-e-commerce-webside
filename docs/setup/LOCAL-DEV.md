Local Development

Follow these steps to run the project locally.

Backend

1. Install dependencies

```bash
cd ecommerce-backend
npm install
```

2. Configure environment

```bash
cp .env.example .env
# Edit .env: set JWT_SECRET (>=32 chars), DB credentials, CORS_ORIGINS
```

3. Reset database & start

```bash
npm run db:reset
npm run dev
```

Frontend

```bash
cd ecommerce-frontend
npm install
npm run dev
```

Testing endpoints

- Swagger UI: `http://localhost:5000/docs`
- OpenAPI JSON: `http://localhost:5000/api-docs.json`

Common issues

- If you see CORS errors, ensure `CORS_ORIGINS` includes your frontend origin.
- If a module is missing, run `npm install` in the relevant folder.
