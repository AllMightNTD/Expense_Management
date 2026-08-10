import { describe, it, expect } from 'vitest';
import { AccountSchema, TransactionSchema } from '../index';

describe('Financial Entity Schemas', () => {
  it('validates account creation input', () => {
    const res = AccountSchema.safeParse({
      name: 'Vietcombank',
      type: 'BANK',
      initialBalance: 10000000,
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.initialBalance).toBe(BigInt(10000000));
    }
  });

  it('validates expense transaction payload', () => {
    const res = TransactionSchema.safeParse({
      accountId: '123e4567-e89b-12d3-a456-426614174000',
      categoryId: '123e4567-e89b-12d3-a456-426614174001',
      type: 'EXPENSE',
      amount: 150000,
      transactionDate: new Date().toISOString(),
      note: 'Cà phê sáng',
    });
    expect(res.success).toBe(true);
  });

  it('validates transfer transaction payload requiring transferToAccountId', () => {
    const res = TransactionSchema.safeParse({
      accountId: '123e4567-e89b-12d3-a456-426614174000',
      transferToAccountId: '123e4567-e89b-12d3-a456-426614174002',
      type: 'TRANSFER',
      amount: 3000000,
      transactionDate: new Date().toISOString(),
    });
    expect(res.success).toBe(true);
  });
});
