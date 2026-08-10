import { describe, it, expect } from 'vitest';
import { calculateGoalCompletionMonths } from './insight.schema';

describe('Financial Insights Formulas', () => {
  it('calculates completion months correctly', () => {
    expect(calculateGoalCompletionMonths(BigInt(17500000), BigInt(3500000))).toBe(5);
  });
});
