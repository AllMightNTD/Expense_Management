# README & Project Automation / Testing Specification

> **Date:** 2026-08-10  
> **Topic:** Comprehensive README documentation, zero-touch project launch automation, and end-to-end automated testing suite.

---

## 1. System Overview & Architecture
The Personal Finance Management Web Application is built with a domain philosophy centered on financial tracking, understanding, planning, and goal achievement.

### Architecture Stack
- **Monorepo Engine:** Turborepo with `pnpm` workspaces (`apps/web`, `apps/api`, `packages/shared`).
- **Backend API:** NestJS 10, Passport JWT, bcrypt password hashing, HTTP-only refresh cookies, Prisma ORM 5.22, PostgreSQL 16.
- **Frontend Web App:** Next.js 14 App Router, Tailwind CSS, Recharts 2.12.
- **Shared Domain Layer:** `@expense/shared` with Zod schemas, minor unit money calculation helpers, and financial DTOs.
- **Database Engine:** PostgreSQL 16 storing all currency values in 64-bit minor units (`BigInt` / integer minor units VND) to avoid floating-point inaccuracies.
- **Cache & Session Layer:** Redis 7 container for token management and rate limiting.

---

## 2. Comprehensive `README.md` Structure

The root `README.md` will contain the following key sections:

1. **Header & Badges**: Monorepo layout, tech stack icons, status indicators.
2. **Product Philosophy & Core Capabilities**:
   - Money tracking (Accounts, Transactions, Transfers, Refunds).
   - Cash flow understanding (Financial Dashboard, KPIs, Recharts trends).
   - Budget Management (Spending thresholds `<70% NORMAL`, `70-89% WARNING`, `≥90% CRITICAL`, `>100% EXCEEDED`).
   - Savings Goal Planning (Goal progress, contributions, automatic completion trigger).
   - Financial Insights & AI Analytics (Health Score 0-100, 20% expense reduction advice, goal reach date projections).
3. **Prerequisites & System Requirements**:
   - Node.js `v20.x` or higher.
   - `pnpm` version `10.5.2` (invoked via `npx -y pnpm@10.5.2`).
   - Docker & Docker Compose.
4. **Environment Setup Guide (`.env`)**:
   - PostgreSQL connection string format (`postgresql://postgres:postgres@localhost:5432/expense_db?schema=public`).
   - JWT Secrets & Token Expiration parameters.
   - Server ports (`3000` for Next.js Web, `3001` for NestJS API).
5. **One-Command Quick Start Guide**:
   - Detailed usage of `./scripts/start.sh` or `pnpm dev:all`.
6. **Automated Testing & Verification Guide**:
   - Execution commands for Vitest unit test suite and monorepo production build checks.
7. **Git Worktree Workflow & Development Standard**:
   - Guidelines for creating feature worktrees under `../Expense_Management_worktrees/<feature-name>`.

---

## 3. Launch Automation Engine (`scripts/start.sh` & `package.json`)

### `scripts/start.sh` Design
A non-interactive executable bash script performing:
1. **Container Verification**: Verifies Docker daemon availability and starts PostgreSQL 16 & Redis 7 via `docker compose -f docker/docker-compose.yml up -d`.
2. **Database Health Check**: Waits for PostgreSQL on port 5432 to accept TCP connections.
3. **Prisma Generation & Migration**: Executes `prisma generate` and applies database schema migrations.
4. **Parallel Monorepo Boot**: Spawns NestJS API and Next.js Web App in parallel via Turborepo (`npx -y pnpm@10.5.2 dev`).

---

## 4. Automated Testing Suite (`scripts/test-all.sh` & Vitest)

### Test Categories
1. **Shared Package Unit Tests (`packages/shared`)**:
   - `money.spec.ts`: Minor unit VND formatting and BigInt arithmetic.
   - `auth.schema.spec.ts`: Zod authentication schema validation.
   - `finance.schema.spec.ts`: Accounts, Categories, and Transactions Zod validation.
   - `dashboard.spec.ts`: Daily safe spend formulas.
   - `budget.schema.spec.ts`: Threshold status calculator (`NORMAL`, `WARNING`, `CRITICAL`, `EXCEEDED`).
   - `saving-goal.schema.spec.ts`: Goal completion percentage calculation.
   - `insight.schema.spec.ts`: Goal reach date projection formulas.
2. **NestJS API Type Check & Build Compilation**:
   - Compiles NestJS backend modules into distribution bundles (`nest build`).
3. **Next.js Web Build Verification**:
   - Compiles Next.js frontend pages and verifies static HTML prerendering for all 13 App Router routes (`/`, `/login`, `/register`, `/onboarding`, `/accounts`, `/transactions`, `/dashboard`, `/budgets`, `/savings`, `/insights`).
4. **Automation Script (`scripts/test-all.sh`)**:
   - Runs unit tests and builds in sequence, outputting a green test summary.

---

## 5. Verification Plan
- Verify `./scripts/start.sh` executes without error and sets up the workspace.
- Verify `./scripts/test-all.sh` executes all 16 Vitest tests, builds NestJS API, and prerenders Next.js static pages cleanly.
- Verify `README.md` is formatted in GitHub-flavored Markdown with clear links.
