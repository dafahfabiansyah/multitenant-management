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

export const addUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string().optional(),
  full_name: z.string().optional(),
  role: z.enum(['admin', 'manager', 'member']),
});

// ============================================
// Pipeline & Deal Validation Schemas
// ============================================

export const dealSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long'),
  value: z
    .number({ invalid_type_error: 'Value must be a number' })
    .min(0, 'Value must be positive'),
  currency: z.string(),
  stage_id: z
    .number({ invalid_type_error: 'Stage is required' })
    .min(1, 'Stage is required'),
  contact_id: z.number().optional(),
  expected_close_date: z.string().optional(),
  probability: z
    .number()
    .min(0, 'Probability must be between 0 and 100')
    .max(100, 'Probability must be between 0 and 100')
    .optional(),
  description: z.string().optional(),
});

export const pipelineStageSchema = z.object({
  name: z
    .string()
    .min(1, 'Stage name is required')
    .max(100, 'Stage name too long'),
  probability: z
    .number({ invalid_type_error: 'Probability must be a number' })
    .min(0, 'Probability must be between 0 and 100')
    .max(100, 'Probability must be between 0 and 100'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)'),
  is_closed_won: z.boolean().optional(),
  is_closed_lost: z.boolean().optional(),
});

// ============================================
// Type exports for form data
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type UpdateTenantFormData = z.infer<typeof updateTenantSchema>;
export type UpdateUserRoleFormData = z.infer<typeof updateUserRoleSchema>;
export type AddUserFormData = z.infer<typeof addUserSchema>;
export type DealFormData = z.infer<typeof dealSchema>;
export type PipelineStageFormData = z.infer<typeof pipelineStageSchema>;
