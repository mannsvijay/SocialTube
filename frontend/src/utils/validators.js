import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password:   z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  fullName:        z.string().min(2, 'Full name is required'),
  username:        z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
  email:           z.string().email('Invalid email address'),
  password:        z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path:    ['confirmPassword'],
})