# Authentication Module Refactor

Overview
- The authentication logic has been refactored to follow a controller-service pattern for maintainability and clarity.
- Previously, routes/modules/auth.js contained validation, DB access, crypto, and auditing inline. These have been separated.

Structure
- src/controllers/auth.js
  - Contains request validation and HTTP handlers.
  - Delegates business logic to AuthService.
  - PUBLIC_INTERFACE methods:
    - registerValidation(), register(req,res)
    - loginValidation(), login(req,res)
- src/services/auth.js
  - Encapsulates registration and login workflows.
  - Handles DB calls, password hashing/verification, JWT signing, and audit logging via a safeAudit helper.
  - PUBLIC_INTERFACE methods:
    - register(req, { email, name, password })
    - login(req, { email, password })
- src/middleware/auth.js
  - Unchanged. Verifies JWT Bearer tokens and populates req.context.user for downstream permissions.

Routing
- src/routes/modules/auth.js now imports the controller and wires up endpoints:
  - POST /api/auth/register → authController.register
  - POST /api/auth/login → authController.login
- OpenAPI annotations remain on the route file for discoverability.

Environment Variables (documented; ensure .env is configured)
- JWT_SECRET: Secret used to sign JWTs.
- JWT_EXPIRES_IN: Optional expiry (e.g., "1h").
- PASSWORD_PEPPER: Optional static pepper concatenated before hashing.
- PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE: Database connectivity.
- COOKIE_SECRET: For CSRF cookie signing, used elsewhere.

Design Notes
- Controller handles input validation and HTTP concerns.
- Service encapsulates domain logic and IO (DB/crypto), exposing a stable API.
- Audit logging uses a non-throwing helper to avoid breaking critical flows on audit failures.
- Placeholder roles/permissions are embedded in the JWT until RBAC derivation from DB is implemented (see kavia-docs for roadmap).

Usage Examples
- Register:
  POST /api/auth/register
  { "email": "demo@example.com", "name": "Demo User", "password": "changeme123" }
- Login:
  POST /api/auth/login
  { "email": "demo@example.com", "password": "changeme123" }

Backwards Compatibility
- Routes and response shapes are unchanged for clients.
- Only internal code paths have been reorganized.

Testing
- Existing frontend login/register flow remains the same.
- Tokens continue to authorize access to protected endpoints via Bearer header.
