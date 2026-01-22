/**
 * HR Redemption Types
 * ===================
 * Types related to reward redemption requests
 */

/**
 * Redemption request interface
 * Represents an employee's request to redeem rewards
 */
export interface RedemptionRequest {
  id: string;
  requestDate: string;
  requestTime: string;
  employee: string;
  requestedItems: string;
  cost: number;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Parameters for redemption request queries
 */
export interface RedemptionRequestParams {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  page?: number;
  pageSize?: number;
}
