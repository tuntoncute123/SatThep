import { z } from 'zod';
export const phone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s().-]{7,19}$/, 'Số điện thoại không hợp lệ.');
export const short = z.string().trim().min(1).max(150);
export const optionalText = z.string().trim().max(500).default('');
export const quoteSchema = z.object({
  name: short,
  phone,
  email: z.union([z.email(), z.literal('')]).default(''),
  company: optionalText,
  product: optionalText,
  quantity: optionalText,
  message: z.string().trim().max(3000).default(''),
});
export const productSchema = z.object({
  name: short,
  sku: z.string().trim().min(2).max(40),
  category: z.enum(['Thép xây dựng', 'Thép hình', 'Thép hộp & ống', 'Thép tấm']),
  brand: short,
  price: z.coerce.number().finite().min(0).max(1e10),
  stock: z.coerce.number().finite().min(0).max(1e9),
  unit: z.enum(['kg', 'tấn', 'cây', 'tấm']),
  spec: short,
  description: z.string().trim().min(1).max(3000),
  active: z.coerce.number().int().min(0).max(1),
});
export const customerSchema = z.object({
  name: short,
  phone,
  email: z.union([z.email(), z.literal('')]).default(''),
  address: optionalText,
  company: optionalText,
});
