import { describe, it, expect } from 'vitest';
import { calculateGoalProgress } from './saving-goal.schema';

describe('Savings Goal Calculations', () => {
  it('calculates goal completion percentage correctly', () => {
    expect(calculateGoalProgress(BigInt(27500000), BigInt(45000000))).toBe(61);
    expect(calculateGoalProgress(BigInt(45000000), BigInt(45000000))).toBe(100);
    expect(calculateGoalProgress(BigInt(50000000), BigInt(45000000))).toBe(100);
  });
});
