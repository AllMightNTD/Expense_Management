import { describe, it, expect } from 'vitest';
import { calculateBudgetStatus } from './budget.schema';

describe('Budget Threshold Calculations', () => {
  it('returns NORMAL when spent is under 70%', () => {
    expect(calculateBudgetStatus(BigInt(1500000), BigInt(3000000))).toBe('NORMAL');
  });

  it('returns WARNING when spent is 70-89%', () => {
    expect(calculateBudgetStatus(BigInt(2400000), BigInt(3000000))).toBe('WARNING');
  });

  it('returns CRITICAL when spent is 90-100%', () => {
    expect(calculateBudgetStatus(BigInt(2850000), BigInt(3000000))).toBe('CRITICAL');
  });

  it('returns EXCEEDED when spent is over 100%', () => {
    expect(calculateBudgetStatus(BigInt(3500000), BigInt(3000000))).toBe('EXCEEDED');
  });
});
