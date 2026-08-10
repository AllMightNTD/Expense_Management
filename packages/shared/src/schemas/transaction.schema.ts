import { z } from 'zod';
import { TransactionTypeSchema } from './category.schema';

export const TransactionSchema = z.object({
  accountId: z.string().uuid('ID tài khoản không hợp lệ'),
  categoryId: z.string().uuid().optional(),
  type: TransactionTypeSchema,
  amount: z.union([z.number(), z.bigint(), z.string()]).transform((val) => BigInt(val)),
  currency: z.string().default('VND'),
  transactionDate: z.string().default(() => new Date().toISOString()),
  note: z.string().optional(),
  transferToAccountId: z.string().uuid().optional(),
  originalTransactionId: z.string().uuid().optional(),
});

export const TransactionFilterSchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  type: TransactionTypeSchema.optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

export type CreateTransactionInput = z.infer<typeof TransactionSchema>;
export type TransactionFilterInput = z.infer<typeof TransactionFilterSchema>;
