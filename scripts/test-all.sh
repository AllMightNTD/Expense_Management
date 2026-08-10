#!/usr/bin/env bash
set -e

echo "===================================================="
echo "🧪 Running Expense Management Automated Test Suite"
echo "===================================================="

echo ""
echo "▶️ [1/4] Running Vitest Unit Tests (@expense/shared)..."
npx -y pnpm@10.5.2 --filter @expense/shared test

echo ""
echo "▶️ [2/4] Building Shared Domain Module (@expense/shared)..."
npx -y pnpm@10.5.2 --filter @expense/shared build

echo ""
echo "▶️ [3/4] Verifying NestJS Backend API Build (@expense/api)..."
npx -y pnpm@10.5.2 --filter @expense/api build

echo ""
echo "▶️ [4/4] Verifying Next.js Frontend Static Prerender (@expense/web)..."
npx -y pnpm@10.5.2 --filter @expense/web build

echo ""
echo "===================================================="
echo "🎉 ALL AUTOMATED TESTS & BUILDS PASSED SUCCESSFULLY!"
echo "===================================================="
