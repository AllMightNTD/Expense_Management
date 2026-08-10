# Security & Authentication Specification

> **Project:** Personal Finance & Savings Management Platform  

---

## 1. Authentication & Session Architecture
- **Access Tokens**: Short-lived JWTs (15 min TTL) signed with `JWT_SECRET`.
- **Refresh Tokens**: Long-lived HTTP-only, `SameSite=Strict` cookies (7 day TTL) referencing active records in the `sessions` table.
- **Session Ledger (`sessions`)**: Stores `refreshTokenHash` (bcrypt), `deviceName`, `ipAddress`, `userAgent`, `expiresAt`, `revokedAt`.

---

## 2. API Security & Ownership Guards (Anti-IDOR)
- **User Ownership Verification**: NestJS `UserOwnershipGuard` enforces `resource.userId === authenticatedUser.id` on every query. Clients cannot pass arbitrary `userId` parameters in request bodies.
- **API Idempotency Guard**: Financial mutations (`POST /transactions`, `POST /transfers`, `POST /savings-contributions`) intercept requests with `Idempotency-Key` headers stored in `idempotency_keys` table. Duplicate headers return cached responses without re-executing transactions.
- **Monetary Validation**: All request inputs enforce positive amounts (`amount > 0`) using Zod schemas in `@expense/shared`.
- **Rate Limiting**: NestJS `@nestjs/throttler` limits public auth routes to 10 requests per minute per IP.
