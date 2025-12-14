/**
 * Zod Schemas - Auth
 * ===================
 * Validation schemas for authentication forms and inputs.
 */

import { z } from 'zod';

/**
 * Schema for login form
 */
export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
