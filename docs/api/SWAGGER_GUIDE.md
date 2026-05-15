# Swagger API Documentation Guide

This project uses **Swagger (OpenAPI 3.0)** to provide a real-time, interactive interface for testing API endpoints.

## 🛠️ Setup & Configuration
The documentation is generated using `swagger-jsdoc` and served via `swagger-ui-express`.

- **Configuration File**: `src/config/swagger.js`
- **Entry Point**: Integrated in `src/app.js`
- **Dependencies**: `npm install swagger-jsdoc swagger-ui-express`

## 🚀 How to Use
1. Start the backend server (`npm run dev`).
2. Open your browser to: `http://localhost:5000/docs`
3. For protected endpoints:
   - Perform a Login to get a JWT token.
   - Click the **"Authorize"** button in Swagger UI.
   - Enter your token as: `Bearer <your_token_here>`.

## 📂 OpenAPI Specification
If you need the raw JSON for Postman or other tools, the spec is available at:
`http://localhost:5000/api-docs.json`

## 📝 Maintenance
To document new routes, add JSDoc comments to your route files. The configuration in `src/config/swagger.js` is set to scan all files in the `src/routes/` directory automatically.

---
*Note: This guide replaces the individual setup, usage, and spec files.*