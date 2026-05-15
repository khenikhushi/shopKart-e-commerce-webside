Orders API

Base path: `/api/v1/orders`

Overview

- The checkout flow creates an order from cart items and payment information.
- Protected endpoints: auth required.

Endpoints

1) Place order
- `POST /api/v1/orders`
- Body: order payload (cart items, shipping address, payment reference)
- Success: `201 Created` with created order in `data`.

2) List orders
- `GET /api/v1/orders` (auth required)
- Supports pagination; returns `data` array and `meta`.

3) Order detail
- `GET /api/v1/orders/:id` (auth required)

4) Cancel order
- `POST /api/v1/orders/:id/cancel` or `PATCH /api/v1/orders/:id` depending on implementation.

Transactional notes

- Order creation should be wrapped in a DB transaction to ensure cart and stock consistency.
- Validate payment gateway responses before marking orders as paid.
Orders: Checkout & Invoicing

Endpoints

- POST /api/v1/orders
  - Description: Place a new order (authenticated)
  - Request: cart items, payment info or payment token
  - Response: `201 Created` with order details

- GET /api/v1/orders
  - Description: List current user's orders (authenticated)
  - Response: `200 OK` with `data` and `meta` if paginated

- GET /api/v1/orders/:slug
  - Description: Order detail
  - Response: `200 OK` with `data.order`

- POST /api/v1/orders/:slug/cancel
  - Description: Cancel an order if allowed by business rules

Notes

- Ensure payment integrations are secure; do not store raw card details on the server.
- Use transactions when creating orders and order items to ensure atomicity.
