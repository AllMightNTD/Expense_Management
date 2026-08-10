# README & Project Automation / Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a production-ready, comprehensive `README.md`, an automated zero-touch project launch script (`scripts/start.sh`), and an automated end-to-end testing script (`scripts/test-all.sh`) verifying all Vitest unit tests and monorepo production builds.

**Architecture:** Project root contains `README.md`. Executable bash scripts reside in `./scripts/` (`scripts/start.sh` and `scripts/test-all.sh`). Monorepo root `package.json` exposes NPM scripts (`pnpm dev:all`, `pnpm test:all`) delegating to shell scripts and Turborepo.

**Tech Stack:** Bash, Markdown, Node.js, pnpm, Docker Compose, Vitest, Turborepo, NestJS, Next.js.

## Global Constraints
- Scripts must be executable (`chmod +x scripts/*.sh`).
- Default Node package manager command must use `npx -y pnpm@10.5.2` for workspace execution safety.
- `README.md` must be written in Vietnamese as requested by user prompt, formatted cleanly with Markdown headers, alerts, and code blocks.

---

### Task 1: Comprehensive `README.md` Documentation

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: Complete project specification & codebase structure
- Produces: Production-ready developer documentation in `README.md`

- [ ] **Step 1: Write `README.md` in root directory**

```markdown
# 💰 Personal Finance & Savings Management Web Application

> **Triết lý sản phẩm:** *Track money → Understand money → Plan money → Save money → Reach financial goals.*

Ứng dụng quản lý tài chính cá nhân toàn diện, kết hợp giữa Dashboard phân tích tài chính, Quản lý chi tiêu, Hạn mức ngân sách, Kế hoạch tích lũy và Trợ lý phân tích thông minh.

---

## 📌 Tính năng cốt lõi (Phát triển theo 6 Giai đoạn)

1. **Giai đoạn 0 & 1: Xác thực & Onboarding 5 bước**
   - Đăng ký, đăng nhập với mã hóa Bcrypt và JWT (HTTP-only Refresh Cookie).
   - Quy trình Onboarding thiết lập loại tài sản, tiền tệ mặc định (`VND`) và mục tiêu tích lũy.

2. **Giai đoạn 2: Quản lý Tài khoản & Giao dịch Core (ACID)**
   - Quản lý đa tài khoản (Ngân hàng, Tiền mặt, Ví điện tử, Tiết kiệm).
   - Tự động Seed cấu trúc danh mục 7 nhóm chính.
   - Xử lý giao dịch nguyên tố (`prisma.$transaction`): Chi tiêu, Thu nhập, Chuyển khoản (không ảnh hưởng Net Worth), Hoàn tiền.

3. **Giai đoạn 3: Dashboard & Bảng điều khiển Tài chính**
   - Chỉ số KPI thời gian thực: Tổng tài sản ròng, Thu nhập, Chi tiêu, Tiết kiệm ròng, Safe-To-Spend, Hạn mức chi tiêu ngày.
   - Biểu đồ dòng tiền 6 tháng Recharts & Feed 5 giao dịch mới nhất.

4. **Giai đoạn 4: Hạn mức Ngân sách (Budget Manager)**
   - Thiết lập hạn mức ngân sách theo danh mục (Hàng tháng / Hàng tuần).
   - Cảnh báo động 4 cấp độ: `NORMAL (<70%)`, `WARNING (70-89%)`, `CRITICAL (≥90%)`, `EXCEEDED (>100%)`.

5. **Giai đoạn 5: Mục tiêu Tiết kiệm & Tích lũy (Savings Hub)**
   - Thiết lập mục tiêu mua sắm/dự phòng (MacBook, Du lịch, Quỹ khẩn cấp).
   - Ghi nhận đợt đóng góp tích lũy và tự động cập nhật trạng thái `COMPLETED`.

6. **Giai đoạn 6: Phân tích Thông minh (Financial Insights & AI Analytics)**
   - Thước đo Điểm số Sức khỏe Tài chính (0-100 score).
   - Đề xuất cắt giảm chi tiêu 20% nhóm không thiết yếu.
   - Dự báo ngày hoàn thành mục tiêu dựa trên dòng tiền thực tế.

---

## 🛠️ Công nghệ & Kiến trúc Hệ thống

- **Monorepo Architecture:** Turborepo + `pnpm` workspace (`apps/web`, `apps/api`, `packages/shared`).
- **Backend API:** NestJS 10, Passport JWT, Prisma ORM 5.22, PostgreSQL 16 (`BigInt` minor units VND), Redis 7.
- **Frontend App:** Next.js 14 App Router, Vanilla CSS / Tailwind CSS, Recharts 2.12.
- **Shared Module:** `@expense/shared` chứa Zod Validation Schemas và công thức tính toán tài chính.

---

## 🚀 Hướng dẫn Khởi chạy Dự án (Quick Start)

### 1. Yêu cầu hệ thống (Prerequisites)
- **Node.js**: v20.x trở lên.
- **pnpm**: Sử dụng via `npx -y pnpm@10.5.2`.
- **Docker & Docker Compose**: Để khởi chạy PostgreSQL 16 & Redis 7.

### 2. Cấu hình biến môi trường (`.env`)
Sao chép `.env.example` thành `.env`:
```bash
cp .env.example .env
```

Cấu hình mẫu `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_db?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="super-secret-jwt-refresh-key"
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Tự động khởi động dự án với 1 lệnh duy nhất
Dự án đã tích hợp script tự động hóa khởi chạy Docker, Prisma Client và server:

```bash
# Cấp quyền thực thi script (lần đầu)
chmod +x scripts/start.sh

# Chạy script tự động khởi động
./scripts/start.sh
```

Hoặc qua pnpm script:
```bash
npx -y pnpm@10.5.2 dev:all
```

Sau khi khởi chạy thành công:
- 🌐 **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
- ⚡ **Backend NestJS API**: [http://localhost:3001](http://localhost:3001)

---

## 🧪 Bộ Kiểm thử Tự động (Automated Testing)

Dự án đi kèm bộ kiểm thử tự động toàn diện kiểm tra Unit Tests (`@expense/shared`), Type Safety API (`@expense/api`), và Static Prerender (`@expense/web`).

Chạy toàn bộ test tự động:
```bash
# Cấp quyền thực thi script
chmod +x scripts/test-all.sh

# Chạy bộ test tự động
./scripts/test-all.sh
```

Hoặc qua pnpm command:
```bash
npx -y pnpm@10.5.2 test:all
```

---

## 🌳 Quy trình Phát triển với Git Worktree (Section 62 Standard)

Dự án áp dụng mô hình **Git Worktree** cô lập tính năng theo khuyến nghị:
- Tạo worktree mới cho từng phase/feature:
  ```bash
  git worktree add ../Expense_Management_worktrees/<feature-name> -b feature/<feature-name>
  ```
- Di chuyển tới directory worktree và phát triển độc lập không ảnh hưởng nhánh `main`.
```
```

- [ ] **Step 2: Commit `README.md`**

```bash
git add README.md
git commit -m "docs: add comprehensive Vietnamese README.md documentation"
```

---

### Task 2: Launch Automation Script (`scripts/start.sh` & `package.json`)

**Files:**
- Create: `scripts/start.sh`
- Modify: `package.json`

**Interfaces:**
- Consumes: Docker Compose configuration, Prisma CLI, Turborepo
- Produces: Executable `./scripts/start.sh` and NPM scripts `dev:all`, `start:all`

- [ ] **Step 1: Implement `scripts/start.sh`**

```bash
#!/usr/bin/env bash
set -e

echo "🚀 [1/4] Starting PostgreSQL 16 & Redis 7 containers..."
docker compose -f docker/docker-compose.yml up -d

echo "⌛ [2/4] Waiting for PostgreSQL database connection..."
until docker exec expense_postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo "✅ Database PostgreSQL ready!"

echo "📦 [3/4] Generating Prisma Client..."
npx -y pnpm@10.5.2 --filter @expense/api exec prisma generate

echo "🔥 [4/4] Starting NestJS API & Next.js Web App in dev mode..."
npx -y pnpm@10.5.2 dev
```

- [ ] **Step 2: Make `scripts/start.sh` executable**

```bash
chmod +x scripts/start.sh
```

- [ ] **Step 3: Update `package.json` to include automation scripts**

Add `"dev:all": "./scripts/start.sh"` and `"test:all": "./scripts/test-all.sh"` to root `package.json`.

- [ ] **Step 4: Commit launch script**

```bash
git add scripts/start.sh package.json
git commit -m "feat(automation): add zero-touch launch script scripts/start.sh"
```

---

### Task 3: Automated Testing Script (`scripts/test-all.sh`)

**Files:**
- Create: `scripts/test-all.sh`

**Interfaces:**
- Consumes: Vitest test suite, NestJS CLI, Next.js CLI
- Produces: Executable `./scripts/test-all.sh` performing full monorepo automated verification

- [ ] **Step 1: Implement `scripts/test-all.sh`**

```bash
#!/usr/bin/env bash
set -e

echo "===================================================="
echo "🧪 Running Expense Management Automated Test Suite"
echo "===================================================="

echo ""
echo "▶️ [1/3] Running Vitest Unit Tests (@expense/shared)..."
npx -y pnpm@10.5.2 --filter @expense/shared test

echo ""
echo "▶️ [2/3] Verifying NestJS Backend API Build (@expense/api)..."
npx -y pnpm@10.5.2 --filter @expense/api build

echo ""
echo "▶️ [3/3] Verifying Next.js Frontend Static Prerender (@expense/web)..."
npx -y pnpm@10.5.2 --filter @expense/web build

echo ""
echo "===================================================="
echo "🎉 ALL AUTOMATED TESTS & BUILDS PASSED SUCCESSFULLY!"
echo "===================================================="
```

- [ ] **Step 2: Make `scripts/test-all.sh` executable**

```bash
chmod +x scripts/test-all.sh
```

- [ ] **Step 3: Commit test script**

```bash
git add scripts/test-all.sh
git commit -m "feat(testing): add automated test suite script scripts/test-all.sh"
```

---

### Task 4: Verification & Execution

**Interfaces:**
- Consumes: `./scripts/test-all.sh`
- Produces: Verified end-to-end execution of unit test suites and production builds

- [ ] **Step 1: Execute `./scripts/test-all.sh`**

Run: `./scripts/test-all.sh`
Expected: ALL AUTOMATED TESTS & BUILDS PASSED SUCCESSFULLY!

- [ ] **Step 2: Commit final documentation & automation completion**

```bash
git add .
git commit -m "chore: complete README, launch automation, and automated testing suite setup"
```
