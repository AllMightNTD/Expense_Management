# Phase 0: Monorepo & Infrastructure Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the production-ready Turborepo monorepo workspace containing `apps/web` (Next.js 14), `apps/api` (NestJS 10), `packages/shared` (Zod & Money math), Docker Compose infrastructure (PostgreSQL 16 & Redis 7), and verified baseline build/test suites.

**Architecture:** Monorepo using Turborepo and NPM workspaces. `packages/shared` exports shared types, money formatting, and Zod schemas consumed by NestJS DTOs and Next.js React Query hooks. PostgreSQL and Redis run via Docker Compose with isolated container names.

**Tech Stack:** Turborepo, Next.js 14 App Router, NestJS 10, Prisma ORM, PostgreSQL 16, Redis 7, Tailwind CSS, TypeScript, Zod, Vitest / Jest.

## Global Constraints
- Worktree location: `../Expense_Management_worktrees/project-setup` on branch `chore/project-setup`.
- All monetary amounts must be calculated and stored as 64-bit integer minor units (`BigInt` / `int8`).
- Default Timezone: `Asia/Ho_Chi_Minh`, Default Currency: `VND`.
- Environment files: `.env.example` must be committed; `.env*` (except `.env.example`) must be ignored.
- Docker containers must be isolated per worktree (e.g. `personal-finance-dev-db`).

---

### Task 1: Root Monorepo & Turborepo Configuration

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `tsconfig.json`

**Interfaces:**
- Consumes: None (initial setup)
- Produces: Monorepo package script runners (`npm run build`, `npm run dev`, `npm run test`, `npm run lint`)

- [ ] **Step 1: Write root package.json**

```json
{
  "name": "expense-management-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean"
  },
  "devDependencies": {
    "turbo": "^1.13.0",
    "typescript": "^5.4.0",
    "prettier": "^3.2.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

- [ ] **Step 2: Write turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!-next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- [ ] **Step 3: Write .gitignore**

```text
# Node dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
.next/
out/
build/
coverage/

# Environment files
.env
.env*.local
!.env.example

# Worktrees directory (CRITICAL FOR WORKTREE ISOLATION)
.worktrees/
worktrees/
../Expense_Management_worktrees/

# IDE & OS
.DS_Store
.idea/
.vscode/
*.log
```

- [ ] **Step 4: Write .env.example**

```text
# General
NODE_ENV=development
PORT=3002
WEB_PORT=3000

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_management_dev?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=super_secret_refresh_key_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

- [ ] **Step 5: Write root tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 6: Verify root package JSON validity**

Run: `node -e "require('./package.json')"`
Expected: No error output.

- [ ] **Step 7: Commit**

```bash
git add package.json turbo.json .gitignore .env.example tsconfig.json
git commit -m "chore(repo): initialize turborepo monorepo root config"
```

---

### Task 2: Shared Package (`packages/shared`)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/money.ts`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/money.spec.ts`

**Interfaces:**
- Consumes: Zod library
- Produces: `formatVND(amountBigInt)`, `parseVNDToMinorUnits(inputString)`, `calculateDailySafeSpend(safeToSpend, daysRemaining)`

- [ ] **Step 1: Write failing test for money utilities in `packages/shared/src/money.spec.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { formatVND, parseVNDToMinorUnits, calculateDailySafeSpend } from './money';

describe('Money Utilities (VND Minor Units)', () => {
  it('formats bigint minor units into VND string format', () => {
    expect(formatVND(BigInt(150000))).toBe('150.000 ₫');
    expect(formatVND(BigInt(2500000))).toBe('2.500.000 ₫');
  });

  it('parses formatted numeric string into bigint minor units', () => {
    expect(parseVNDToMinorUnits('150.000')).toBe(BigInt(150000));
    expect(parseVNDToMinorUnits('2500000')).toBe(BigInt(2500000));
  });

  it('calculates daily safe spend correctly', () => {
    // 5,000,000 VND safe to spend remaining over 15 days = 333,333 VND/day
    const daily = calculateDailySafeSpend(BigInt(5000000), 15);
    expect(daily).toBe(BigInt(333333));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/shared/src/money.spec.ts`
Expected: FAIL with module/function missing error.

- [ ] **Step 3: Implement `packages/shared/src/money.ts`**

```typescript
export function formatVND(amount: bigint): string {
  const num = Number(amount);
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
  return formatted;
}

export function parseVNDToMinorUnits(input: string): bigint {
  const cleaned = input.replace(/[^\d]/g, '');
  if (!cleaned) return BigInt(0);
  return BigInt(cleaned);
}

export function calculateDailySafeSpend(safeToSpendRemaining: bigint, daysRemaining: number): bigint {
  if (daysRemaining <= 0) return BigInt(0);
  return safeToSpendRemaining / BigInt(daysRemaining);
}
```

- [ ] **Step 4: Create package exports in `packages/shared/src/index.ts`**

```typescript
export * from './money';
export * from './types';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run packages/shared/src/money.spec.ts`
Expected: PASS (3 tests passed)

- [ ] **Step 6: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add shared package with VND money utilities and Vitest suite"
```

---

### Task 3: Docker Compose Infrastructure (`docker/docker-compose.yml`)

**Files:**
- Create: `docker/docker-compose.yml`

**Interfaces:**
- Consumes: Docker daemon
- Produces: Running PostgreSQL 16 on port 5432 & Redis 7 on port 6379

- [ ] **Step 1: Write `docker/docker-compose.yml`**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: personal-finance-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: expense_management_dev
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: personal-finance-redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redisdata:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  redisdata:
```

- [ ] **Step 2: Verify docker compose configuration syntax**

Run: `docker compose -f docker/docker-compose.yml config`
Expected: Valid YAML output without schema errors.

- [ ] **Step 3: Commit**

```bash
git add docker/docker-compose.yml
git commit -m "chore(infra): add docker-compose configuration for PostgreSQL 16 and Redis 7"
```

---

### Task 4: NestJS Backend Base App (`apps/api`) & Prisma ORM

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: `@prisma/client`, PostgreSQL DATABASE_URL
- Produces: NestJS REST API listening on port 3002

- [ ] **Step 1: Create `apps/api/package.json`**

```json
{
  "name": "@expense/api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@prisma/client": "^5.11.0",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.2.1",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "prisma": "^5.11.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create `apps/api/prisma/schema.prisma`**

Copy complete Prisma schema from Technical Design Spec Section 3 (including User, Account, Category, Transaction, Budget, SavingGoal, SavingPlan, SavingContribution, RecurringTransaction, Subscription).

- [ ] **Step 3: Create `apps/api/src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Backend API running on http://localhost:${port}/api/v1`);
}
bootstrap();
```

- [ ] **Step 4: Verify NestJS build**

Run: `npx nest build --path apps/api/tsconfig.json` (or inside app directory)
Expected: Build succeeds cleanly.

- [ ] **Step 5: Commit**

```bash
git add apps/api
git commit -m "feat(api): initialize NestJS application base and Prisma schema"
```

---

### Task 5: Next.js Frontend Base App (`apps/web`)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`

**Interfaces:**
- Consumes: Tailwind CSS, React 18, Next.js App Router
- Produces: Web application server listening on port 3000

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "@expense/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.28.0",
    "lucide-react": "^0.358.0",
    "next": "^14.1.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.12.3",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Write basic landing home view in `apps/web/app/page.tsx`**

```tsx
import React from 'react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-emerald-400">
          Personal Finance & Savings Management
        </h1>
        <p className="text-lg text-slate-400">
          Track money &rarr; Understand money &rarr; Plan money &rarr; Save money &rarr; Reach financial goals.
        </p>
        <div className="pt-4">
          <span className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full text-sm font-medium">
            System Online • VND (₫) Native • Asia/Ho_Chi_Minh
          </span>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web
git commit -m "feat(web): initialize Next.js 14 App Router workspace with Tailwind CSS"
```

---

### Task 6: Baseline Verification

**Interfaces:**
- Consumes: Entire monorepo setup
- Produces: Clean build and unit test passage across all packages

- [ ] **Step 1: Run turbo build across monorepo**

Run: `npm run build`
Expected: `turbo build` completed successfully without errors.

- [ ] **Step 2: Run turbo test across monorepo**

Run: `npm run test`
Expected: All unit tests pass.

- [ ] **Step 3: Final Phase 0 Commit**

```bash
git add .
git commit -m "chore(repo): complete Phase 0 monorepo setup and baseline verification"
```
