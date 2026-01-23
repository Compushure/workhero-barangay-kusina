/**
 * HR Reward Types
 * ===============
 * Types related to rewards and mercado items
 */

import { z } from 'zod';

/**
 * Reward interface representing a mercado item in the system
 */
export interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  quantity?: number;
  category?: string;
  isActive: boolean;
  createdAt?: string | Date;
  createdBy?: string;
}

/**
 * Mercado item type (alias for Reward)
 */
export type MercadoItem = Reward;

/**
 * Type for adding a reward/mercado item
 * Inferred from addRewardSchema in @/zod/schemas
 */
export type AddRewardInput = z.infer<typeof import('@/zod/schemas').addRewardSchema>;

/**
 * Type for editing a reward/mercado item
 * Inferred from editRewardSchema in @/zod/schemas
 */
export type EditRewardInput = z.infer<typeof import('@/zod/schemas').editRewardSchema>;
