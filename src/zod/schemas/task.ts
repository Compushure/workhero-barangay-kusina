/**
 * Zod Schemas - Task in manager view
 * ===================================
 * Validation schemas for task category management.
 */

import { z } from 'zod';

/**
 * Schema for adding a new task category
 */
export const addTaskSchema = z.object({
    name: z.string().min(2, 'Task name must be at least 2 characters').max(255, 'Task name cannot exceed 255 characters').trim(),
    type: z.string().min(2, 'Task type must be at least 2 characters').max(255, 'Task type cannot exceed 255 characters').trim(),
    description: z.string().min(2, 'Task description must be at least 2 characters').max(255, 'Task description cannot exceed 255 characters').trim(),
    points: z.number().int().positive('Fiesta Points must be a positive number'),
    xp: z.number().int().positive('XP must be a positive number'),
    isRepeatable: z.boolean().default(true),
});

/**
 * Schema for editing a new task category
 */
export const editTaskSchema = addTaskSchema.partial();

export type AddTaskInput = z.infer<typeof addTaskSchema>;
export type EditTaskInput = z.infer<typeof editTaskSchema>;