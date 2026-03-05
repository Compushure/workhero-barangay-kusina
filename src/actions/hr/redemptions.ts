'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  ServerActionResponse,
  RedemptionRequest,
} from '@/types';

function getRewardImageUrl(supabase: any, rewardId: string): string {
  return supabase.storage.from('reward').getPublicUrl(`${rewardId}/profile.png`).data.publicUrl;
}

/**
 * Helper function to auto-decline pending requests when stock is insufficient
 * @param rewardId - The reward ID to check pending requests for
 * @param availableQuantity - Current available quantity
 * @param adminId - Admin ID for approval/rejection tracking
 */
async function autoDeclinePendingRequestsForReward(
  rewardId: string,
  availableQuantity: number,
  adminId: string
): Promise<void> {
  try {
    // Get all pending requests for this reward
    const { data: pendingRequests, error: fetchError } = await supabaseAdmin
      .from('RewardRequest')
      .select(
        `
        id,
        user_id,
        quantity,
        Reward:reward_id (
          points_cost
        ),
        User:user_id (
          points
        )
      `
      )
      .eq('reward_id', rewardId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });

    if (fetchError || !pendingRequests || pendingRequests.length === 0) {
      return;
    }

    // Process each pending request
    for (const req of pendingRequests) {
      const requestQuantity = req.quantity || 1;
      const reward = Array.isArray(req.Reward) ? req.Reward[0] : req.Reward;
      const user = Array.isArray(req.User) ? req.User[0] : req.User;
      const pointsCostPerItem = reward?.points_cost || 0;
      const totalPointsCost = pointsCostPerItem * requestQuantity;

      let shouldDecline = false;
      let declineRemark = '';

      // Check if out of stock
      if (availableQuantity <= 0) {
        shouldDecline = true;
        declineRemark = 'Out of stock';
      }
      // Check if not enough items
      else if (requestQuantity > availableQuantity) {
        shouldDecline = true;
        declineRemark = 'Not enough items to redeem';
      }

      if (shouldDecline) {
        // Update request status to rejected
        await supabaseAdmin
          .from('RewardRequest')
          .update({
            status: 'rejected',
            approved_by: adminId,
            remarks: declineRemark,
          })
          .eq('id', req.id);

        // Return points to user
        if (user) {
          await supabaseAdmin
            .from('User')
            .update({
              points: (user.points || 0) + totalPointsCost,
            })
            .eq('id', req.user_id);
        }

        console.log(`Auto-declined request ${req.id}: ${declineRemark}`);
      }
    }
  } catch (error) {
    console.error('Error auto-declining pending requests:', error);
    // Don't throw - this is a background cleanup task
  }
}



/**
 * Get all redemption requests with joined User and Reward data
 * HR only - views all redemption requests in the system
 * @param status - Optional filter by status ('pending' | 'approved' | 'rejected')
 * @returns ServerActionResponse with array of redemption requests
 */
export async function getRedemptionRequestsAction(
  status?: string
): Promise<ServerActionResponse<RedemptionRequest[]>> {
  try {
    const supabase = await createClient();

    // Build query with joins
    let query = supabase
      .from('RewardRequest')
      .select(
        `
        id,
        user_id,
        reward_id,
        quantity,
        status,
        approved_by,
        remarks,
        requested_at,
        User!RewardRequest_user_id_fkey (
          name,
          points
        ),
        Reward!RewardRequest_reward_id_fkey (
          name,
          points_cost
        )
      `
      )
      .order('requested_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching redemption requests:', error);
      return { error: `Failed to fetch redemption requests: ${error.message}` };
    }

    // Transform database response to match RedemptionRequest type
    const requests: RedemptionRequest[] = (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userName: item.User?.name || 'Unknown User',
      userPoints: item.User?.points || 0,
      rewardId: item.reward_id,
      rewardName: item.Reward?.name || 'Unknown Reward',
      rewardImageUrl: getRewardImageUrl(supabase, item.reward_id),
      pointsCost: item.Reward?.points_cost || 0,
      quantity: item.quantity || 1,
      status: item.status,
      approvedBy: item.approved_by,
      remarks: item.remarks || undefined,
      requestedAt: item.requested_at,
    }));

    return { error: null, data: requests };
  } catch (error) {
    console.error('Error in getRedemptionRequestsAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while fetching redemption requests' };
  }
}

/**
 * Accept a redemption request
 * HR only - approves redemption, deducts reward quantity, and finalizes point deduction
 * @param requestId - The ID of the redemption request
 * @param remarks - Optional remarks for the approval
 * @returns ServerActionResponse indicating success or failure
 */
export async function acceptRedemptionRequestAction(
  requestId: string,
  remarks?: string
): Promise<ServerActionResponse<void>> {
  try {
    const supabase = await createClient();

    // Get current user (admin)
    const {
      data: { user: admin },
      error: adminError,
    } = await supabase.auth.getUser();

    if (adminError || !admin) {
      return { error: 'Unauthorized: Admin not authenticated' };
    }

    // Fetch the redemption request with user and reward details 
    const { data: request, error: fetchError } = await supabaseAdmin
      .from('RewardRequest')
      .select(
        `
        id,
        user_id,
        reward_id,
        quantity,
        status,
        Reward:reward_id (
          points_cost
        ),
        User:user_id (
          points
        )
      `
      )
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return { error: 'Redemption request not found' };
    }

    if (request.status !== 'pending') {
      return { error: 'This request has already been processed' };
    }

    const quantity = request.quantity || 1;
    const reward = Array.isArray(request.Reward) ? request.Reward[0] : request.Reward;
    const user = Array.isArray(request.User) ? request.User[0] : request.User;
    const pointsCostPerItem = reward?.points_cost || 0;
    const totalPointsCost = pointsCostPerItem * quantity;

    // Check current reward quantity before approval
    const { data: currentReward, error: rewardCheckError } = await supabaseAdmin
      .from('Reward')
      .select('quantity')
      .eq('id', request.reward_id)
      .single();

    if (rewardCheckError) {
      console.error('Error fetching reward quantity:', rewardCheckError);
      return { error: 'Failed to verify item availability' };
    }

    // Validate if enough stock is available
    if (currentReward && currentReward.quantity !== null && currentReward.quantity !== undefined) {
      if (currentReward.quantity <= 0) {
        // Auto-decline if out of stock
        await supabase
          .from('RewardRequest')
          .update({
            status: 'rejected',
            approved_by: admin.id,
            remarks: 'Out of stock',
          })
          .eq('id', requestId);

        // Return points to user if declined
        await supabaseAdmin
          .from('User')
          .update({
            points: (user?.points || 0) + totalPointsCost,
          })
          .eq('id', request.user_id);

        return { error: 'Item is out of stock. Request has been automatically declined.' };
      }

      if (currentReward.quantity < quantity) {
        // Auto-decline if not enough items
        await supabase
          .from('RewardRequest')
          .update({
            status: 'rejected',
            approved_by: admin.id,
            remarks: 'Not enough items to redeem',
          })
          .eq('id', requestId);

        // Return points to user
        await supabaseAdmin
          .from('User')
          .update({
            points: (user?.points || 0) + totalPointsCost,
          })
          .eq('id', request.user_id);

        return { error: `Only ${currentReward.quantity} item(s) available. Request has been automatically declined.` };
      }
    }

    // Update request status to approved with optional remarks
    const { error: updateRequestError } = await supabase
      .from('RewardRequest')
      .update({
        status: 'approved',
        approved_by: admin.id,
        remarks: remarks || null,
      })
      .eq('id', requestId);

    if (updateRequestError) {
      console.error('Error updating redemption request:', updateRequestError);
      return { error: `Failed to approve request: ${updateRequestError.message}` };
    }

    // Decrease reward quantity if it has a quantity limit
    const { data: rewardAfterApproval, error: rewardFetchError } = await supabaseAdmin
      .from('Reward')
      .select('quantity')
      .eq('id', request.reward_id)
      .single();

    if (rewardFetchError) {
      console.error('Error fetching current reward quantity:', rewardFetchError);
    } else if (rewardAfterApproval && rewardAfterApproval.quantity !== null && rewardAfterApproval.quantity !== undefined) {
      const newQuantity = rewardAfterApproval.quantity - quantity;

      // Update reward quantity and auto-hide if out of stock
      const updateData: any = { quantity: Math.max(0, newQuantity) };

      // If quantity reaches 0 or below, automatically hide the item
      if (newQuantity <= 0) {
        updateData.is_active = false;
      }

      const { error: updateQuantityError } = await supabaseAdmin
        .from('Reward')
        .update(updateData)
        .eq('id', request.reward_id);

      if (updateQuantityError) {
        console.error('Error updating reward quantity:', updateQuantityError);
        // Don't fail the request approval if quantity update fails
      }

      // Auto-decline other pending requests if stock is insufficient
      await autoDeclinePendingRequestsForReward(request.reward_id, newQuantity, admin.id);
    }

    return { error: null };
  } catch (error) {
    console.error('Error in acceptRedemptionRequestAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while accepting the request' };
  }
}

/**
 * Decline a redemption request
 * HR only - rejects redemption and returns points to user
 * @param requestId - The ID of the redemption request
 * @param remarks - Optional remarks for the decline
 * @returns ServerActionResponse indicating success or failure
 */
export async function declineRedemptionRequestAction(
  requestId: string,
  remarks?: string
): Promise<ServerActionResponse<void>> {
  try {
    const supabase = await createClient();

    // Get current user (admin)
    const {
      data: { user: admin },
      error: adminError,
    } = await supabase.auth.getUser();

    if (adminError || !admin) {
      return { error: 'Unauthorized: Admin not authenticated' };
    }

    // Fetch the redemption request with user and reward details (admin client: User join not readable by authenticated)
    const { data: request, error: fetchError } = await supabaseAdmin
      .from('RewardRequest')
      .select(
        `
        id,
        user_id,
        reward_id,
        quantity,
        status,
        Reward:reward_id (
          points_cost
        ),
        User:user_id (
          points
        )
      `
      )
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return { error: 'Redemption request not found' };
    }

    if (request.status !== 'pending') {
      return { error: 'This request has already been processed' };
    }

    const quantity = request.quantity || 1;
    const reward = Array.isArray(request.Reward) ? request.Reward[0] : request.Reward;
    const user = Array.isArray(request.User) ? request.User[0] : request.User;
    const pointsCostPerItem = reward?.points_cost || 0;
    const totalPointsCost = pointsCostPerItem * quantity;
    const currentPoints = user?.points || 0;

    // Update request status to rejected with optional remarks
    const { error: updateError } = await supabase
      .from('RewardRequest')
      .update({
        status: 'rejected',
        approved_by: admin.id,
        remarks: remarks || null,
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error declining redemption request:', updateError);
      return { error: `Failed to decline request: ${updateError.message}` };
    }

    // Return points to user (admin client: User table not writable by authenticated)
    const { error: returnPointsError } = await supabaseAdmin
      .from('User')
      .update({
        points: currentPoints + totalPointsCost,
      })
      .eq('id', request.user_id);

    if (returnPointsError) {
      console.error('Error returning points:', returnPointsError);
      // Try to revert the rejection
      await supabaseAdmin
        .from('RewardRequest')
        .update({ status: 'pending', approved_by: null })
        .eq('id', requestId);
      return { error: 'Failed to return points. Request rejection reverted.' };
    }

    // Restore reward stock for declined requests when quantity is tracked
    const { data: rewardData, error: rewardFetchError } = await supabaseAdmin
      .from('Reward')
      .select('quantity, is_active')
      .eq('id', request.reward_id)
      .single();

    if (rewardFetchError) {
      console.error('Error fetching reward for stock restore:', rewardFetchError);
      await supabaseAdmin
        .from('RewardRequest')
        .update({ status: 'pending', approved_by: null })
        .eq('id', requestId);
      await supabaseAdmin
        .from('User')
        .update({
          points: currentPoints,
        })
        .eq('id', request.user_id);
      return { error: 'Failed to restore stock. Request rejection reverted.' };
    }

    if (rewardData && rewardData.quantity !== null && rewardData.quantity !== undefined) {
      const restoredQuantity = rewardData.quantity + quantity;
      const stockUpdate: { quantity: number; is_active?: boolean } = {
        quantity: restoredQuantity,
      };

      if (!rewardData.is_active && restoredQuantity > 0) {
        stockUpdate.is_active = true;
      }

      const { error: restoreStockError } = await supabaseAdmin
        .from('Reward')
        .update(stockUpdate)
        .eq('id', request.reward_id);

      if (restoreStockError) {
        console.error('Error restoring reward stock:', restoreStockError);
        await supabaseAdmin
          .from('RewardRequest')
          .update({ status: 'pending', approved_by: null })
          .eq('id', requestId);
        await supabaseAdmin
          .from('User')
          .update({
            points: currentPoints,
          })
          .eq('id', request.user_id);
        return { error: 'Failed to restore stock. Request rejection reverted.' };
      }
    }

    return { error: null };
  } catch (error) {
    console.error('Error in declineRedemptionRequestAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while declining the request' };
  }
}

/**
 * Auto-decline all pending redemption requests with insufficient stock
 * HR utility - checks all pending requests and auto-declines those that can't be fulfilled
 * Useful for cleanup or can be run periodically
 * @returns ServerActionResponse with count of requests declined
 */
export async function autoDeclineInsufficientStockRequestsAction(): Promise<ServerActionResponse<{ declinedCount: number }>> {
  try {
    const supabase = await createClient();

    // Get current user (admin) for tracking who declined
    const {
      data: { user: admin },
      error: adminError,
    } = await supabase.auth.getUser();

    if (adminError || !admin) {
      return { error: 'Unauthorized: Admin not authenticated' };
    }

    // Get all pending requests with their reward quantities
    const { data: pendingRequests, error: fetchError } = await supabaseAdmin
      .from('RewardRequest')
      .select(
        `
        id,
        user_id,
        reward_id,
        quantity,
        Reward:reward_id (
          quantity,
          points_cost
        ),
        User:user_id (
          points
        )
      `
      )
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching pending requests:', fetchError);
      return { error: `Failed to fetch requests: ${fetchError.message}` };
    }

    if (!pendingRequests || pendingRequests.length === 0) {
      return { error: null, data: { declinedCount: 0 } };
    }

    let declinedCount = 0;

    // Group requests by reward to track running totals
    const rewardQuantities = new Map<string, number>();

    for (const req of pendingRequests) {
      const requestQuantity = req.quantity || 1;
      const reward = Array.isArray(req.Reward) ? req.Reward[0] : req.Reward;
      const user = Array.isArray(req.User) ? req.User[0] : req.User;

      // Skip if reward has no quantity limit
      if (!reward || reward.quantity === null || reward.quantity === undefined) {
        continue;
      }

      // Get current available quantity for this reward
      let availableQuantity = rewardQuantities.get(req.reward_id);
      if (availableQuantity === undefined) {
        availableQuantity = reward.quantity!;
        if (availableQuantity !== undefined) {
          rewardQuantities.set(req.reward_id, availableQuantity);
        }
      }

      const pointsCostPerItem = reward.points_cost || 0;
      const totalPointsCost = pointsCostPerItem * requestQuantity;

      let shouldDecline = false;
      let declineRemark = '';

      // Check if out of stock
      if (availableQuantity !== undefined && availableQuantity <= 0) {
        shouldDecline = true;
        declineRemark = 'Out of stock';
      }
      // Check if not enough items
      else if (availableQuantity !== undefined && requestQuantity > availableQuantity) {
        shouldDecline = true;
        declineRemark = 'Not enough items to redeem';
      }

      if (shouldDecline) {
        // Update request status to rejected
        const { error: updateError } = await supabaseAdmin
          .from('RewardRequest')
          .update({
            status: 'rejected',
            approved_by: admin.id,
            remarks: declineRemark,
          })
          .eq('id', req.id);

        if (updateError) {
          console.error(`Error declining request ${req.id}:`, updateError);
          continue;
        }

        // Return points to user
        if (user) {
          await supabaseAdmin
            .from('User')
            .update({
              points: (user.points || 0) + totalPointsCost,
            })
            .eq('id', req.user_id);
        }

        declinedCount++;
        console.log(`Auto-declined request ${req.id}: ${declineRemark}`);
      }
    }

    return { error: null, data: { declinedCount } };
  } catch (error) {
    console.error('Error in autoDeclineInsufficientStockRequestsAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while checking requests' };
  }
}
