import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
  displayName: z.string().min(2, 'Tên hiển thị phải ít nhất 2 ký tự'),
  defaultCurrency: z.string().default('VND'),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2, 'Tên hiển thị phải ít nhất 2 ký tự').optional(),
  avatar: z.string().url().optional(),
  defaultCurrency: z.string().optional(),
  timezone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
