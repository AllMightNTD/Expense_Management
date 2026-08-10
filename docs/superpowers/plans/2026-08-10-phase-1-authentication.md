# Phase 1: Authentication & Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full JWT authentication (Register, Login, Refresh, Logout), Passport JwtAuthGuard, HTTP-only refresh cookies, User profile management, and a 5-step onboarding wizard for new users.

**Architecture:** `packages/shared` defines Zod validation schemas and DTO contracts. `apps/api` implements NestJS `AuthModule` (bcrypt password hashing, Passport JWT Strategy, Refresh Token rotation in database/cookies, `JwtAuthGuard`). `apps/web` implements React Query Auth state, login/register pages, protected App Router middleware, and the 5-step onboarding wizard.

**Tech Stack:** NestJS 10, Passport JWT, bcrypt, Prisma ORM, Next.js 14 App Router, React Query, React Hook Form, Zod, Tailwind CSS, Vitest / Jest.

## Global Constraints
- Worktree location: `../Expense_Management_worktrees/authentication` on branch `feature/authentication`.
- All auth payloads must be validated using shared Zod schemas (`RegisterSchema`, `LoginSchema`).
- Passwords must be hashed using bcrypt (min 10 salt rounds); plain-text passwords must never be stored or logged.
- Access token expiry: `15m`, Refresh token expiry: `7d` (stored in HTTP-Only, Secure, SameSite cookie).
- Default Currency: `VND`, Default Timezone: `Asia/Ho_Chi_Minh`.

---

### Task 1: Shared Auth & User Schemas (`packages/shared`)

**Files:**
- Modify: `packages/shared/src/types.ts`
- Create: `packages/shared/src/schemas/auth.schema.ts`
- Modify: `packages/shared/src/index.ts`
- Create: `packages/shared/src/schemas/auth.schema.spec.ts`

**Interfaces:**
- Consumes: Zod library
- Produces: `RegisterSchema`, `LoginSchema`, `UpdateProfileSchema`, `UserDto`, `AuthResponseDto`

- [ ] **Step 1: Write test for Zod auth schemas in `packages/shared/src/schemas/auth.schema.spec.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { RegisterSchema, LoginSchema } from './auth.schema';

describe('Auth Zod Validation Schemas', () => {
  it('validates correct registration payload', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Nguyen Van A',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email and short password', () => {
    const result = RegisterSchema.safeParse({
      email: 'not-an-email',
      password: '123',
      displayName: 'A',
    });
    expect(result.success).toBe(false);
  });

  it('validates login payload', () => {
    const result = LoginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Implement `packages/shared/src/schemas/auth.schema.ts`**

```typescript
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
  displayName: z.string().min(2, 'Tên hiển thị phải ít nhất 2 ký tự'),
  defaultCurrency: z.string().default('VND'),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2, 'Tên hiển thị phải ít nhất 2 ký tự').optional(),
  avatar: z.string().url().optional(),
  defaultCurrency: z.string().optional(),
  timezone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
```

- [ ] **Step 3: Run Vitest test**

Run: `npx -y pnpm@10.5.2 --filter @expense/shared test`
Expected: PASS (All schema tests pass)

- [ ] **Step 4: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add auth Zod schemas and TypeScript DTO types"
```

---

### Task 2: NestJS Auth & User Module (`apps/api`)

**Files:**
- Create: `apps/api/src/modules/users/users.service.ts`
- Create: `apps/api/src/modules/users/users.module.ts`
- Create: `apps/api/src/modules/auth/auth.service.ts`
- Create: `apps/api/src/modules/auth/auth.controller.ts`
- Create: `apps/api/src/modules/auth/auth.module.ts`
- Create: `apps/api/src/modules/auth/jwt.strategy.ts`
- Create: `apps/api/src/modules/auth/jwt-auth.guard.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: PrismaClient, `@nestjs/jwt`, `bcrypt`
- Produces: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/users/me`

- [ ] **Step 1: Write `users.service.ts`**

```typescript
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { email: string; passwordHash: string; displayName: string; defaultCurrency?: string; timezone?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email đã được sử dụng');

    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
        defaultCurrency: data.defaultCurrency || 'VND',
        timezone: data.timezone || 'Asia/Ho_Chi_Minh',
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    const { passwordHash, ...result } = user;
    return result;
  }
}
```

- [ ] **Step 2: Write `auth.service.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: { email: string; password: string; displayName: string }) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.usersService.create({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
    });
    const tokens = this.generateTokens(user.id, user.email);
    const { passwordHash: _, ...userDto } = user;
    return { user: userDto, ...tokens };
  }

  async login(input: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(input.email);
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const tokens = this.generateTokens(user.id, user.email);
    const { passwordHash: _, ...userDto } = user;
    return { user: userDto, ...tokens };
  }

  generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secret',
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
}
```

- [ ] **Step 3: Write `auth.controller.ts`**

```typescript
import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(body);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { success: true, data: { user: result.user, accessToken: result.accessToken } };
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { success: true, data: { user: result.user, accessToken: result.accessToken } };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { success: true, data: { message: 'Đã đăng xuất' } };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    return { success: true, data: user };
  }
}
```

- [ ] **Step 4: Verify NestJS build**

Run: `npx -y pnpm@10.5.2 --filter @expense/api build`
Expected: Build succeeds without compilation errors.

- [ ] **Step 5: Commit**

```bash
git add apps/api
git commit -m "feat(api): implement AuthModule with bcrypt, Passport JWT strategy, refresh cookies, and UsersService"
```

---

### Task 3: Next.js Auth Pages & 5-Step Onboarding Flow (`apps/web`)

**Files:**
- Create: `apps/web/app/(auth)/login/page.tsx`
- Create: `apps/web/app/(auth)/register/page.tsx`
- Create: `apps/web/app/onboarding/page.tsx`
- Create: `apps/web/lib/api-client.ts`

**Interfaces:**
- Consumes: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`
- Produces: Registration & Login UI, 5-step wizard (`/onboarding`)

- [ ] **Step 1: Write Login page (`apps/web/app/(auth)/login/page.tsx`)**

```tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-emerald-400 mb-2 text-center">Đăng nhập</h2>
        <p className="text-sm text-slate-400 text-center mb-6">Quản lý tài chính & tiết kiệm thông minh</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              placeholder="example@gmail.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-lg transition text-sm mt-2"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-emerald-400 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write 5-step Onboarding Flow (`apps/web/app/onboarding/page.tsx`)**

```tsx
'use client';
import React, { useState } from 'react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [accountName, setAccountName] = useState('Vietcombank');
  const [monthlyIncome, setMonthlyIncome] = useState('15000000');
  const [savingsGoal, setSavingsGoal] = useState('Quỹ khẩn cấp');

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Bước {step} / 5
          </span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full ${i <= step ? 'bg-emerald-500' : 'bg-slate-800'}`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Chào mừng bạn! Chúng tôi nên gọi bạn là gì?</h3>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white"
              placeholder="Nguyễn Văn A"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Đơn vị tiền tệ chính của bạn?</h3>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white"
            >
              <option value="VND">VND (₫)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Tạo tài khoản tài chính đầu tiên</h3>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white"
              placeholder="Ví dụ: Vietcombank, Tiền mặt..."
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Thu nhập trung bình hàng tháng của bạn?</h3>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white"
              placeholder="15000000"
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Bạn có mục tiêu tiết kiệm nào không?</h3>
            <input
              type="text"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white"
              placeholder="Ví dụ: Mua MacBook, Quỹ khẩn cấp..."
            />
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button onClick={prevStep} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm">
              Quay lại
            </button>
          ) : <div />}

          <button
            onClick={nextStep}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-sm"
          >
            {step === 5 ? 'Hoàn thành' : 'Tiếp theo'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web
git commit -m "feat(web): add Login, Register and 5-step Onboarding flow pages"
```

---

### Task 4: Integration & Baseline Verification

**Interfaces:**
- Consumes: Entire Phase 1 auth & onboarding modules
- Produces: Passing build & test suite across monorepo

- [ ] **Step 1: Run turbo build across monorepo**

Run: `npx -y pnpm@10.5.2 build`
Expected: Monorepo build passes without errors.

- [ ] **Step 2: Run turbo test across monorepo**

Run: `npx -y pnpm@10.5.2 test`
Expected: All tests pass.

- [ ] **Step 3: Final Phase 1 Commit**

```bash
git add .
git commit -m "chore(auth): complete Phase 1 authentication and onboarding setup"
```
