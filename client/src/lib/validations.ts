import { z } from 'zod';

// ============================================
// Auth Validation Schemas
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  tenant_name: z
    .string()
    .min(1, 'Company/Organization name is required')
    .min(2, 'Company name must be at least 2 characters'),
});

// ============================================
// Contact Validation Schemas
// ============================================

export const contactSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  company_name: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
  source: z.enum(['website', 'referral', 'ads', 'cold_call', 'event']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ============================================
// Tenant Validation Schemas
// ============================================

export const updateTenantSchema = z.object({
  name: z
    .string()
    .min(1, 'Tenant name is required')
    .min(2, 'Tenant name must be at least 2 characters'),
  status: z.enum(['active', 'suspended', 'inactive']),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'member']),
});

// ============================================
// Type exports for form data
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type UpdateTenantFormData = z.infer<typeof updateTenantSchema>;
export type UpdateUserRoleFormData = z.infer<typeof updateUserRoleSchema>;
