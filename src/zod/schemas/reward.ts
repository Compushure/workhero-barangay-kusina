/**
 * Zod Schemas - Reward/Mercado Items
 * ===================================
 * Validation schemas for mercado item management.
 */

import { z } from 'zod';

const rewardAvailabilitySchema = z
    .union([
        z.enum(['weekly', 'monthly', 'yearly']),
    ])
    .optional()
    .nullable();

/**
 * Schema for adding a new reward/mercado item
 */
export const addRewardSchema = z.object({
    name: z.string().min(2, 'Item name must be at least 2 characters').max(255),
    pointsCost: z.number().int().positive('Points cost must be a positive number'),
    quantity: z.number().int().positive('Quantity must be a positive number').optional(),
    redeemingLimit: z.number().int().min(0, 'Redeeming limit cannot be negative').optional(),
    category: z.string().optional(),
    isActive: z.boolean().default(true),
    availableDate: z.date().optional().nullable(),
    availableMonth: rewardAvailabilitySchema,
}).refine((data) => {
    // Validate that redeeming limit doesn't exceed quantity
    if (data.redeemingLimit !== undefined && data.quantity !== undefined) {
        return data.redeemingLimit <= data.quantity;
    }
    return true;
}, {
    message: 'Redeeming limit cannot be greater than quantity',
    path: ['redeemingLimit'],
});

/**
 * Schema for editing an existing reward/mercado item
 */
export const editRewardSchema = z.object({
    name: z.string().min(2, 'Item name must be at least 2 characters').max(255).optional(),
    pointsCost: z.number().int().positive('Points cost must be a positive number').optional(),
    quantity: z.number().int().positive('Quantity must be a positive number').optional(),
    redeemingLimit: z.number().int().min(0, 'Redeeming limit cannot be negative').optional(),
    category: z.string().optional(),
    isActive: z.boolean().optional(),
    availableDate: z.date().optional().nullable(),
    availableMonth: rewardAvailabilitySchema,
}).refine((data) => {
    // Validate that redeeming limit doesn't exceed quantity
    if (data.redeemingLimit !== undefined && data.quantity !== undefined) {
        return data.redeemingLimit <= data.quantity;
    }
    return true;
}, {
    message: 'Redeeming limit cannot be greater than quantity',
    path: ['redeemingLimit'],
});
