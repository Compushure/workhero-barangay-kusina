/**
 * Zod Schemas - Badge Editor
 * ==========================
 * Validation schemas for badge management.
 */

import { z } from 'zod';

export const badgeRequirementTypeSchema = z.enum(['task', 'attribute', 'attendance']);
export const badgeOperatorSchema = z.enum(['=', '>', '<', '>=', '<=', '!=']);
export const badgeIntervalSchema = z.enum(['none', 'daily', 'monthly', 'anually']);
export const badgeLogicTypeSchema = z.enum(['and', 'or']);

export const badgeConditionSchema = z.object({
  id: z.string().optional(),
  requirement_type: badgeRequirementTypeSchema,
  requirement_operator: badgeOperatorSchema,
  requirement_attrb_id: z.string().min(1, 'Requirement attribute is required').nullable(),
  requirement_attrb_value: z.number().int().min(0, 'Count value must be 0 or higher'),
  logic_type: badgeLogicTypeSchema.default('and'),
});

export const addBadgeSchema = z.object({
  name: z.string().min(2, 'Badge name must be at least 2 characters').max(255).trim(),
  description: z.string().max(255).trim().optional().nullable(),
  points: z.number().int().positive('Points must be a positive number').max(10000),
  award_at_interval: badgeIntervalSchema,
  img_link: z.string().trim().optional().nullable(),
  conditions: z.array(badgeConditionSchema),
});

export const editBadgeSchema = addBadgeSchema;

export type AddBadgeInput = z.infer<typeof addBadgeSchema>;
export type EditBadgeInput = z.infer<typeof editBadgeSchema>;
