import { z } from 'zod';

export const BudgetPeriodSchema = z.enum(['WEEKLY', 'MONTHLY', 'CUSTOM']);

export const CreateBudgetSchema = z.object({
  categoryId: z.string().uuid('ID danh mục không hợp lệ'),
  amount: z.union([z.number(), z.bigint(), z.string()]).transform((val) => BigInt(val)),
  period: BudgetPeriodSchema.default('MONTHLY'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;
export type BudgetStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';

export function calculateBudgetStatus(spent: bigint, total: bigint): BudgetStatus {
  if (total <= BigInt(0)) return 'NORMAL';
  const percentage = (Number(spent) / Number(total)) * 100;
  if (percentage > 100) return 'EXCEEDED';
  if (percentage >= 90) return 'CRITICAL';
  if (percentage >= 70) return 'WARNING';
  return 'NORMAL';
}
