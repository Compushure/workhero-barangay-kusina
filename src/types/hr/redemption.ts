/**
 * HR Redemption Types
 * ===================
 * Types related to reward redemption requests
 */

/**
 * Redemption request interface
 * Represents an employee's request to redeem rewards
 * Aligned with database schema and includes joined User/Reward data
 */
export interface RedemptionRequest {
  id: string;
  userId: string;
  userName: string;
  userPoints?: number;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  remarks?: string;
  requestedAt: string;
  requestedItem?: string; // The reward item name/description requested by the user
}

/**
 * Input type for creating a redemption request
 */
export interface CreateRedemptionRequestInput {
  rewardId: string;
  quantity: number;
}

/**
 * Parameters for redemption request queries
 */
export interface RedemptionRequestParams {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  page?: number;
  pageSize?: number;
}
