import { describe, it, expect } from 'vitest';
import { calculateDailySafeSpend } from './index';

describe('Dashboard Metric Calculations', () => {
  it('calculates daily safe spend correctly for mid-month date', () => {
    const daily = calculateDailySafeSpend(BigInt(6000000), 20);
    expect(daily).toBe(BigInt(300000));
  });
});
