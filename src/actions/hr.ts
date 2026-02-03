'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  ServerActionResponse,
  AddRewardInput,
  EditRewardInput,
  Reward,
  RedemptionRequest,
} from '@/types';
import { addRewardSchema, editRewardSchema } from '@/zod/schemas';

// Helper function to get public URL with cache busting
function getRewardImageUrl(supabase: any, rewardId: string): string {
  const baseUrl = supabase.storage.from('reward').getPublicUrl(`${rewardId}/profile.png`)
    .data.publicUrl;
  // Add cache-busting query parameter to force fresh image on every fetch
  return `${baseUrl}?t=${Date.now()}`;
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
          points,
          deducted_points
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
              deducted_points: (user.deducted_points || 0) - totalPointsCost,
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

// ============================================
// Redemption Request Actions
// ============================================

/**
 * Get all redemption requests with joined User and Reward data
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
 * Get current user's redemption requests
 * @param status - Optional filter by status ('pending' | 'approved' | 'rejected')
 * @returns ServerActionResponse with array of user's redemption requests
 */
export async function getMyRedemptionRequestsAction(
  status?: string
): Promise<ServerActionResponse<RedemptionRequest[]>> {
  try {
    const supabase = await createClient();

    // Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Unauthorized: User not authenticated' };
    }

    // Build query with joins, filtered by current user
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
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user redemption requests:', error);
      return { error: `Failed to fetch your redemption requests: ${error.message}` };
    }

    // Transform database response to match RedemptionRequest type
    const requests: RedemptionRequest[] = (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userName: item.User?.name || 'Unknown User',
      userPoints: item.User?.points || 0,
      rewardId: item.reward_id,
      rewardName: item.Reward?.name || 'Unknown Reward',
      pointsCost: item.Reward?.points_cost || 0,
      quantity: item.quantity || 1,
      status: item.status,
      approvedBy: item.approved_by,
      requestedItem: item.Reward?.name || undefined,
      remarks: item.remarks || undefined,
      requestedAt: item.requested_at,
    }));

    return { error: null, data: requests };
  } catch (error) {
    console.error('Error in getMyRedemptionRequestsAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while fetching your redemption requests' };
  }
}

/**
 * Accept a redemption request
 * Updates status to 'approved' and deducts points from user
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
          points,
          deducted_points
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
    const currentDeductedPoints = user?.deducted_points || 0;

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

        // Return points to user
        await supabaseAdmin
          .from('User')
          .update({
            points: (user?.points || 0) + totalPointsCost,
            deducted_points: currentDeductedPoints - totalPointsCost,
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
            deducted_points: currentDeductedPoints - totalPointsCost,
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

    // Clear deducted points (admin client: User table not writable by authenticated)
    const { error: clearDeductedPointsError } = await supabaseAdmin
      .from('User')
      .update({
        deducted_points: currentDeductedPoints - totalPointsCost,
      })
      .eq('id', request.user_id);

    if (clearDeductedPointsError) {
      console.error('Error clearing deducted points:', clearDeductedPointsError);
      // Try to revert the approval
      await supabaseAdmin
        .from('RewardRequest')
        .update({ status: 'pending', approved_by: null })
        .eq('id', requestId);
      return { error: 'Failed to clear deducted points. Request approval reverted.' };
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
 * Updates status to 'rejected' without deducting points
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
          points,
          deducted_points
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
    const currentDeductedPoints = user?.deducted_points || 0;

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
        deducted_points: currentDeductedPoints - totalPointsCost,
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
 * Create a new redemption request
 * Validates reward availability and user points before creating
 * @param rewardId - The ID of the reward to redeem
 * @param quantity - The quantity of items to redeem
 * @returns ServerActionResponse indicating success or failure
 */
export async function createRedemptionRequestAction(
  rewardId: string,
  quantity: number = 1
): Promise<ServerActionResponse<void>> {
  try {
    const supabase = await createClient();

    // Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Unauthorized: User not authenticated' };
    }

    // Fetch reward to validate it exists and is active
    const { data: reward, error: rewardError } = await supabase
      .from('Reward')
      .select('id, name, points_cost, is_active, redeeming_limit')
      .eq('id', rewardId)
      .single();

    if (rewardError || !reward) {
      return { error: 'Reward not found' };
    }

    if (!reward.is_active) {
      return { error: 'This reward is no longer available' };
    }

    // Validate quantity against redeeming limit
    if (reward.redeeming_limit && quantity > reward.redeeming_limit) {
      return { error: `You can only redeem up to ${reward.redeeming_limit} of this item` };
    }

    if (quantity < 1) {
      return { error: 'Quantity must be at least 1' };
    }

    // Fetch user's current points and deducted_points (admin client: User table not readable by authenticated)
    const { data: userData, error: userDataError } = await supabaseAdmin
      .from('User')
      .select('points, deducted_points')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      return { error: 'Failed to fetch user data' };
    }

    const userPoints = userData.points || 0;
    const currentDeductedPoints = userData.deducted_points || 0;
    const totalCost = reward.points_cost * quantity;

    if (userPoints < totalCost) {
      return { error: `Insufficient points. You need ${totalCost} points but have ${userPoints}` };
    }

    // Deduct points immediately and add to deducted_points (admin client: User table not writable by authenticated)
    const { error: updatePointsError } = await supabaseAdmin
      .from('User')
      .update({
        points: userPoints - totalCost,
        deducted_points: currentDeductedPoints + totalCost,
      })
      .eq('id', user.id);

    if (updatePointsError) {
      console.error('Error deducting points:', updatePointsError);
      return { error: `Failed to deduct points: ${updatePointsError.message}` };
    }

    const { error: insertError } = await supabase.from('RewardRequest').insert({
      user_id: user.id,
      reward_id: rewardId,
      quantity: quantity,
      status: 'pending',
      requested_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error creating redemption request:', insertError);
      // Rollback points deduction
      await supabaseAdmin
        .from('User')
        .update({
          points: userPoints,
          deducted_points: currentDeductedPoints,
        })
        .eq('id', user.id);
      return { error: `Failed to create redemption request: ${insertError.message}` };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in createRedemptionRequestAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while creating the request' };
  }
}

// Action to get all reward/mercado items
export async function getRewardsAction(): Promise<ServerActionResponse<Reward[]>> {
  try {
    // Get Supabase client
    const supabase = await createClient();

    // Fetch all rewards
    const { data, error } = await supabase
      .from('Reward')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rewards:', error);
      return { error: `Failed to fetch items: ${error.message}` };
    }

    // Fetch approved redemption counts for each reward
    const { data: redemptionData } = await supabase
      .from('RewardRequest')
      .select('reward_id, quantity')
      .eq('status', 'approved');

    // Calculate total redeemed quantity per reward
    const redeemedCounts = new Map<string, number>();
    if (redemptionData) {
      redemptionData.forEach((req: any) => {
        const current = redeemedCounts.get(req.reward_id) || 0;
        redeemedCounts.set(req.reward_id, current + (req.quantity || 1));
      });
    }

    // Transform database response to match Reward type
    const rewards: Reward[] = (data || []).map((item) => {
      const redeemedCount = redeemedCounts.get(item.id) || 0;
      const hasQuantityLimit = item.quantity !== null && item.quantity !== undefined;

      return {
        id: item.id,
        name: item.name,
        pointsCost: item.points_cost,
        quantity: item.quantity,
        redeemingLimit: item.redeeming_limit,
        category: item.category,
        isActive: item.is_active,
        availableDate: item.available_date,
        createdAt: item.created_at,
        createdBy: item.created_by,
        imageUrl: getRewardImageUrl(supabase, item.id),
        // Add computed properties for stock tracking
        redeemedCount,
        isOutOfStock: hasQuantityLimit && item.quantity <= 0,
      };
    });

    return { error: null, data: rewards };
  } catch (error) {
    console.error('Error in getRewardsAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while fetching items' };
  }
}

// Action to add a new reward/mercado item
export async function addRewardAction(
  input: AddRewardInput
): Promise<ServerActionResponse<Reward>> {
  try {
    // Validate input
    const validatedData = addRewardSchema.parse(input);

    const supabase = await createClient();

    // Additional backend validation for redeeming_limit
    if (validatedData.redeemingLimit !== undefined) {
      if (validatedData.redeemingLimit < 0) {
        return { error: 'Redeeming limit cannot be negative' };
      }
      if (
        validatedData.quantity !== undefined &&
        validatedData.redeemingLimit > validatedData.quantity
      ) {
        return { error: 'Redeeming limit cannot be greater than quantity' };
      }
    }

    // Insert reward into database
    const { data, error } = await supabase
      .from('Reward')
      .insert({
        name: validatedData.name,
        points_cost: validatedData.pointsCost,
        quantity: validatedData.quantity,
        redeeming_limit: validatedData.redeemingLimit,
        category: validatedData.category,
        is_active: validatedData.isActive,
        available_date: validatedData.availableDate ? validatedData.availableDate.toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding reward:', error);
      return { error: `Failed to add item: ${error.message}` };
    }

    // Transform database response to match Reward type
    const reward: Reward = {
      id: data.id,
      name: data.name,
      pointsCost: data.points_cost,
      quantity: data.quantity,
      redeemingLimit: data.redeeming_limit,
      category: data.category,
      isActive: data.is_active,
      availableDate: data.available_date,
      createdAt: data.created_at,
      createdBy: data.created_by,
      imageUrl: getRewardImageUrl(supabase, data.id),
    };

    return { error: null, data: reward };
  } catch (error) {
    console.error('Error in addRewardAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while adding the item' };
  }
}

export async function editRewardAction(
  id: string,
  input: EditRewardInput
): Promise<ServerActionResponse<Reward>> {
  try {
    // Validate input
    const validatedData = editRewardSchema.parse(input);

    // Get Supabase client
    const supabase = await createClient();

    // Additional backend validation for redeeming_limit
    if (validatedData.redeemingLimit !== undefined) {
      if (validatedData.redeemingLimit < 0) {
        return { error: 'Redeeming limit cannot be negative' };
      }

      // If quantity is also being updated, validate against it
      if (validatedData.quantity !== undefined) {
        if (validatedData.redeemingLimit > validatedData.quantity) {
          return { error: 'Redeeming limit cannot be greater than quantity' };
        }
      } else {
        // If quantity is not being updated, fetch current quantity and validate
        const { data: currentReward, error: fetchError } = await supabase
          .from('Reward')
          .select('quantity, redeeming_limit')
          .eq('id', id)
          .single();

        if (fetchError) {
          return { error: 'Failed to validate redeeming limit exceeding current quantity' };
        }

        if (
          currentReward?.quantity !== undefined &&
          validatedData.redeemingLimit > currentReward.quantity
        ) {
          return { error: 'Redeeming limit cannot be greater than current quantity' };
        }
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.pointsCost !== undefined) updateData.points_cost = validatedData.pointsCost;
    if (validatedData.quantity !== undefined) updateData.quantity = validatedData.quantity;
    if (validatedData.redeemingLimit !== undefined)
      updateData.redeeming_limit = validatedData.redeemingLimit;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive;
    if (validatedData.availableDate !== undefined)
      updateData.available_date = validatedData.availableDate ? validatedData.availableDate.toISOString() : null;

    // Update reward in database
    const { data, error } = await supabase
      .from('Reward')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reward:', error);
      return { error: `Failed to update item: ${error.message}` };
    }

    // Transform database response to match Reward type
    const reward: Reward = {
      id: data.id,
      name: data.name,
      pointsCost: data.points_cost,
      quantity: data.quantity,
      redeemingLimit: data.redeeming_limit,
      category: data.category,
      isActive: data.is_active,
      availableDate: data.available_date,
      createdAt: data.created_at,
      createdBy: data.created_by,
      imageUrl: getRewardImageUrl(supabase, data.id),
    };

    return { error: null, data: reward };
  } catch (error) {
    console.error('Error in editRewardAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while updating the item' };
  }
}

export async function deleteRewardAction(id: string): Promise<ServerActionResponse<void>> {
  try {
    // Get Supabase client
    const supabase = await createClient();

    // Delete reward from database
    const { error } = await supabase.from('Reward').delete().eq('id', id);

    if (error) {
      console.error('Error deleting reward:', error);
      return { error: `Failed to delete item: ${error.message}` };
    }

    const { data, error: profileError } = await supabase.storage
      .from('reward')
      .remove([`${id}/profile.png`]);

    if (profileError) {
      return { error: 'Failed to delete profile picture: ' + profileError.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteRewardAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while deleting the item' };
  }
}

/**
 * Server action to hide/unhide a reward/mercado item
 * @param id - The ID of the reward to hide/unhide
 * @param isActive - Whether the item should be active (visible) or hidden
 * @returns ServerActionResponse indicating success or failure
 */
export async function hideRewardAction(
  id: string,
  isActive: boolean = false
): Promise<ServerActionResponse<void>> {
  try {
    // Get Supabase client
    const supabase = await createClient();

    // Update reward is_active status
    const { error } = await supabase.from('Reward').update({ is_active: isActive }).eq('id', id);

    if (error) {
      console.error('Error hiding/unhiding reward:', error);
      return { error: `Failed to ${isActive ? 'unhide' : 'hide'} item: ${error.message}` };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in hideRewardAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return {
      error: `An unexpected error occurred while ${isActive ? 'unhiding' : 'hiding'} the item`,
    };
  }
}

export async function uploadRewardPicture(
  rewardId: string,
  file: File
): Promise<ServerActionResponse<{ path: string | null; publicUrl: string }>> {
  try {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { error: 'Image size must be less than 5MB' };
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    const supabase = await createClient();
    const { data: uploadResult, error } = await supabase.storage
      .from('reward')
      .upload(`${rewardId}/profile.png`, file, {
        cacheControl: '0',
        upsert: true,
        contentType: file.type || 'image/png',
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { error: 'Failed to upload reward picture: ' + error.message };
    }

    const publicUrl = getRewardImageUrl(supabase, rewardId);

    return {
      error: null,
      data: { path: uploadResult?.path ?? null, publicUrl },
    };
  } catch (error) {
    console.error('Upload reward picture error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while uploading the image' };
  }
}

/**
 * Utility function to check and auto-hide out-of-stock rewards
 * This runs through all rewards and marks items with quantity <= 0 as inactive
 * Can be called manually or set up as a scheduled task
 * @returns ServerActionResponse with count of items hidden
 */
export async function autoHideOutOfStockRewardsAction(): Promise<ServerActionResponse<{ hiddenCount: number }>> {
  try {
    const supabase = await createClient();

    // Get all rewards with quantity tracking (quantity is not null)
    const { data: rewards, error: fetchError } = await supabase
      .from('Reward')
      .select('id, quantity, is_active')
      .not('quantity', 'is', null)
      .lte('quantity', 0)
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching out-of-stock rewards:', fetchError);
      return { error: `Failed to check stock: ${fetchError.message}` };
    }

    if (!rewards || rewards.length === 0) {
      return { error: null, data: { hiddenCount: 0 } };
    }

    // Update all out-of-stock items to inactive
    const rewardIds = rewards.map(r => r.id);
    const { error: updateError } = await supabase
      .from('Reward')
      .update({ is_active: false })
      .in('id', rewardIds);

    if (updateError) {
      console.error('Error hiding out-of-stock rewards:', updateError);
      return { error: `Failed to hide items: ${updateError.message}` };
    }

    return { error: null, data: { hiddenCount: rewards.length } };
  } catch (error) {
    console.error('Error in autoHideOutOfStockRewardsAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while checking stock' };
  }
}

/**
 * Utility function to check all pending redemption requests and auto-decline those with insufficient stock
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
          points,
          deducted_points
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
              deducted_points: (user.deducted_points || 0) - totalPointsCost,
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
