Authentication

Base path: `/api/v1/auth`

Overview

- Auth uses JWT Bearer tokens. Obtain a token via `POST /api/v1/auth/login`.
- Use header `Authorization: Bearer <token>` for protected endpoints.

Endpoints

1) Register
- `POST /api/v1/auth/register`
- Body: `{ name, email, password }`
- Success: `201 Created` with `data.user` and optional `data.token`.

Example request

```json
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

2) Login
- `POST /api/v1/auth/login`
- Body: `{ email, password }`
- Success: `200 OK` with `data.token` and `data.user`.

Example response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "email": "john@example.com" },
    "token": "eyJ..."
  }
}
```

3) Current user
- `GET /api/v1/auth/me`
- Auth required. Returns the authenticated user's profile.

Errors & Notes
- Validation failures return `422 Unprocessable Entity` with `errors` object.
- Missing/invalid token returns `401 Unauthorized`.
- Ensure `JWT_SECRET` is strong and stored securely in `.env`.
Auth: Signup / Login

Endpoints

- POST /api/v1/auth/register
  - Description: Create a new user account.
  - Request body:
    - `name` (string) required
    - `email` (string) required
    - `password` (string) required (strong password recommended)
  - Response: `201 Created` with `data.user` and `data.token` on success.

- POST /api/v1/auth/login
  - Description: Authenticate user and return JWT token.
  - Request body: `email`, `password`
  - Response: `200 OK` with `data.token` and `data.user`.

- GET /api/v1/auth/me
  - Description: Returns current authenticated user.
  - Auth: Bearer token required

JWT Usage

- Obtain token from `/auth/login` and include header:

```
Authorization: Bearer <token>
```

Security Notes

- Use a strong `JWT_SECRET` (>=32 characters) in your `.env`.
- Tokens should have reasonable expiry; implement refresh tokens if needed.
