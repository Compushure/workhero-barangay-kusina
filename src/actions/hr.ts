'use server';

import { createClient } from '@/lib/supabase/server';
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
        requested_at,
        User!RewardRequest_user_id_fkey (
          name
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
      rewardId: item.reward_id,
      rewardName: item.Reward?.name || 'Unknown Reward',
      pointsCost: item.Reward?.points_cost || 0,
      quantity: item.quantity || 1,
      status: item.status,
      approvedBy: item.approved_by,
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
        requested_at,
        User!RewardRequest_user_id_fkey (
          name
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
      rewardId: item.reward_id,
      rewardName: item.Reward?.name || 'Unknown Reward',
      pointsCost: item.Reward?.points_cost || 0,
      quantity: item.quantity || 1,
      status: item.status,
      approvedBy: item.approved_by,
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

    // Fetch the redemption request with user and reward details
    const { data: request, error: fetchError } = await supabase
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
    const userPoints = user?.points || 0;

    // Check if user has sufficient points
    if (userPoints < totalPointsCost) {
      return {
        error: `User has insufficient points for this redemption. Needs ${totalPointsCost} but has ${userPoints}`,
      };
    }

    // Update request status to approved
    const { error: updateRequestError } = await supabase
      .from('RewardRequest')
      .update({
        status: 'approved',
        approved_by: admin.id,
      })
      .eq('id', requestId);

    if (updateRequestError) {
      console.error('Error updating redemption request:', updateRequestError);
      return { error: `Failed to approve request: ${updateRequestError.message}` };
    }

    // Deduct points from user
    const { error: deductPointsError } = await supabase
      .from('User')
      .update({
        points: userPoints - totalPointsCost,
      })
      .eq('id', request.user_id);

    if (deductPointsError) {
      console.error('Error deducting points:', deductPointsError);
      // Try to revert the approval
      await supabase
        .from('RewardRequest')
        .update({ status: 'pending', approved_by: null })
        .eq('id', requestId);
      return { error: 'Failed to deduct points. Request approval reverted.' };
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

    // Check if request exists and is pending
    const { data: request, error: fetchError } = await supabase
      .from('RewardRequest')
      .select('id, status')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return { error: 'Redemption request not found' };
    }

    if (request.status !== 'pending') {
      return { error: 'This request has already been processed' };
    }

    // Update request status to rejected
    const { error: updateError } = await supabase
      .from('RewardRequest')
      .update({
        status: 'rejected',
        approved_by: admin.id,
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error declining redemption request:', updateError);
      return { error: `Failed to decline request: ${updateError.message}` };
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

    // Fetch user's current points
    const { data: userData, error: userDataError } = await supabase
      .from('User')
      .select('points')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      return { error: 'Failed to fetch user data' };
    }

    const userPoints = userData.points || 0;
    const totalCost = reward.points_cost * quantity;

    if (userPoints < totalCost) {
      return { error: `Insufficient points. You need ${totalCost} points but have ${userPoints}` };
    }

    // Insert redemption request
    const { error: insertError } = await supabase.from('RewardRequest').insert({
      user_id: user.id,
      reward_id: rewardId,
      quantity: quantity,
      status: 'pending',
      requested_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error creating redemption request:', insertError);
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

    // Transform database response to match Reward type
    const rewards: Reward[] = (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      pointsCost: item.points_cost,
      quantity: item.quantity,
      redeemingLimit: item.redeeming_limit,
      category: item.category,
      isActive: item.is_active,
      createdAt: item.created_at,
      createdBy: item.created_by,
      imageUrl: getRewardImageUrl(supabase, item.id),
    }));

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
  const supabase = await createClient();
  const { data: uploadResult, error } = await supabase.storage
    .from('reward')
    .upload(`${rewardId}/profile.png`, file, {
      cacheControl: '0',
      upsert: true,
      contentType: (file as any)?.type || 'image/png',
    });

  if (error) {
    return { error: 'Failed to upload Reward picture: ' + error.message };
  }

  const publicUrl = getRewardImageUrl(supabase, rewardId);

  return {
    error: null,
    data: { path: uploadResult?.path ?? null, publicUrl },
  };
}
