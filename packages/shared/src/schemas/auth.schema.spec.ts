import { describe, it, expect } from 'vitest';
import { RegisterSchema, LoginSchema } from './auth.schema';

describe('Auth Zod Validation Schemas', () => {
  it('validates correct registration payload', () => {
    const result = RegisterSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Nguyen Van A',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email and short password', () => {
    const result = RegisterSchema.safeParse({
      email: 'not-an-email',
      password: '123',
      displayName: 'A',
    });
    expect(result.success).toBe(false);
  });

  it('validates login payload', () => {
    const result = LoginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });
});
