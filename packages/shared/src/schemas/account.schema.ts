import { z } from 'zod';

export const AccountTypeSchema = z.enum(['BANK', 'CASH', 'EWALLET', 'CREDIT_CARD', 'SAVINGS', 'OTHER']);

export const AccountSchema = z.object({
  name: z.string().min(1, 'Tên tài khoản là bắt buộc'),
  type: AccountTypeSchema,
  currency: z.string().default('VND'),
  initialBalance: z.union([z.number(), z.bigint(), z.string()]).transform((val) => BigInt(val)),
});

export const UpdateAccountSchema = AccountSchema.partial();

export type CreateAccountInput = z.infer<typeof AccountSchema>;
