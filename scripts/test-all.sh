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
