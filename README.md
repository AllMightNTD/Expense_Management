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
