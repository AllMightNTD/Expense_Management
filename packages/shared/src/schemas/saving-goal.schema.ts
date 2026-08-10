import { z } from 'zod';

export const GoalPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const GoalStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']);

export const CreateSavingGoalSchema = z.object({
  name: z.string().min(2, 'Tên mục tiêu phải ít nhất 2 ký tự'),
  targetAmount: z.union([z.number(), z.bigint(), z.string()]).transform((val) => BigInt(val)),
  initialAmount: z.union([z.number(), z.bigint(), z.string()]).transform((val) => BigInt(val)).default(0),
  targetDate: z.string().min(1, 'Ngày mục tiêu là bắt buộc'),
  priority: GoalPrioritySchema.default('MEDIUM'),
});

export const RecordContributionSchema = z.object({
  amount: z.union([z.number(), z.bigint(), z.string()]).transform((val) => BigInt(val)),
  transactionId: z.string().uuid().optional(),
  note: z.string().optional(),
});

export type CreateSavingGoalInput = z.infer<typeof CreateSavingGoalSchema>;
export type RecordContributionInput = z.infer<typeof RecordContributionSchema>;

export function calculateGoalProgress(current: bigint, target: bigint): number {
  if (target <= BigInt(0)) return 0;
  const percentage = Math.round((Number(current) / Number(target)) * 100);
  return Math.min(percentage, 100);
}
