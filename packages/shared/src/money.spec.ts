import { describe, it, expect } from 'vitest';
import { formatVND, parseVNDToMinorUnits, calculateDailySafeSpend } from './money';

describe('Money Utilities (VND Minor Units)', () => {
  it('formats bigint minor units into VND string format', () => {
    const formatted1 = formatVND(BigInt(150000));
    expect(formatted1).toContain('150.000');
    
    const formatted2 = formatVND(BigInt(2500000));
    expect(formatted2).toContain('2.500.000');
  });

  it('parses formatted numeric string into bigint minor units', () => {
    expect(parseVNDToMinorUnits('150.000')).toBe(BigInt(150000));
    expect(parseVNDToMinorUnits('2500000')).toBe(BigInt(2500000));
  });

  it('calculates daily safe spend correctly', () => {
    const daily = calculateDailySafeSpend(BigInt(5000000), 15);
    expect(daily).toBe(BigInt(333333));
  });
});
