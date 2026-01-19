/**
 * Zod Schemas - Reward/Mercado Items
 * ===================================
 * Validation schemas for mercado item management.
 */

import { z } from 'zod';

/**
 * Schema for adding a new reward/mercado item
 */
export const addRewardSchema = z.object({
    name: z.string().min(2, 'Item name must be at least 2 characters').max(255),
    pointsCost: z.number().int().positive('Points cost must be a positive number'),
    quantity: z.number().int().positive('Quantity must be a positive number').optional(),
    category: z.string().optional(),
    isActive: z.boolean().default(true),
});

/**
 * Schema for editing an existing reward/mercado item
 */
export const editRewardSchema = z.object({
    name: z.string().min(2, 'Item name must be at least 2 characters').max(255).optional(),
    pointsCost: z.number().int().positive('Points cost must be a positive number').optional(),
    quantity: z.number().int().positive('Quantity must be a positive number').optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
});
