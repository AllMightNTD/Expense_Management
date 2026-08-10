import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['EXPENSE', 'INCOME', 'TRANSFER', 'REFUND']);

export const CategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  icon: z.string().default('tag'),
  color: z.string().default('#10b981'),
  type: TransactionTypeSchema,
  parentId: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof CategorySchema>;
