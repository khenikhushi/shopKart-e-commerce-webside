API Response Standardization Plan

Overview
Proposal to standardize API responses: add timestamps, use `meta` for pagination, and make `data` consistent across endpoints. Requires updating `src/utils/response.util.js`.

Impact
- Backend change: single utility file
- Frontend: clients may need small updates to consume `meta` instead of `pagination`

Recommendation
- Implement in `src/utils/response.util.js` and test endpoints
