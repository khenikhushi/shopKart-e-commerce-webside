Architecture: Flow Charts

This file outlines high-level flows and where to place diagrams for:

- User signup and login
- Product browsing and filtering
- Cart to order checkout flow

Recommendation

- Create simple mermaid diagrams or PNG flowcharts and embed them here. Example (Mermaid):

```
graph TD
  A[User visits site] --> B[Search products]
  B --> C[View product detail]
  C --> D[Add to cart]
  D --> E[Checkout]
  E --> F[Create order]
```

Place visual assets in `docs/architecture/assets/` and reference them from this file.
