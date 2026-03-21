'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  ServerActionResponse,
  Reward,
  RedemptionRequest,
} from '@/types';
import { insertNotification } from '@/lib/notifications';

function getRewardImageUrl(supabase: any, rewardId: string): string {
  const baseUrl = supabase.storage.from('reward').getPublicUrl(`${rewardId}/profile.png`)
    .data.publicUrl;
  return `${baseUrl}?t=${Date.now()}`;
}
export async function getRewardsAction(): Promise<ServerActionResponse<Reward[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('Reward')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rewards:', error);
      return { error: `Failed to fetch items: ${error.message}` };
    }

    const { data: redemptionData } = await supabase
      .from('RewardRequest')
      .select('reward_id, quantity')
      .eq('status', 'approved');

    const redeemedCounts = new Map<string, number>();
    if (redemptionData) {
      redemptionData.forEach((req: any) => {
        const current = redeemedCounts.get(req.reward_id) || 0;
        redeemedCounts.set(req.reward_id, current + (req.quantity || 1));
      });
    }

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

export async function getMyRedemptionRequestsAction(
  status?: string
): Promise<ServerActionResponse<RedemptionRequest[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Unauthorized: User not authenticated' };
    }

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

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user redemption requests:', error);
      return { error: `Failed to fetch your redemption requests: ${error.message}` };
    }

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

export async function createRedemptionRequestAction(
  rewardId: string,
  quantity: number = 1
): Promise<ServerActionResponse<void>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Unauthorized: User not authenticated' };
    }

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

    if (reward.redeeming_limit && quantity > reward.redeeming_limit) {
      return { error: `You can only redeem up to ${reward.redeeming_limit} of this item` };
    }

    if (quantity < 1) {
      return { error: 'Quantity must be at least 1' };
    }

    const { data: userData, error: userDataError } = await supabaseAdmin
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

    //logic for order item points: deduct total cost on request
    const { error: updatePointsError } = await supabaseAdmin
      .from('User')
      .update({
        points: userPoints - totalCost,
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
      await supabaseAdmin
        .from('User')
        .update({
          points: userPoints,
        })
        .eq('id', user.id);
      return { error: `Failed to create redemption request: ${insertError.message}` };
    }

    await insertNotification({
      userId: user.id,
      type: 'reward',
      message: `You have submitted a request for ${quantity} x ${reward.name}. Your request is now pending approval.`,
      metadata: {
        rewardId,
        rewardName: reward.name,
        quantity,
        status: 'pending',
      },
    });

    return { error: null };
  } catch (error) {
    console.error('Error in createRedemptionRequestAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while creating the request' };
  }
}

export async function cancelMyRedemptionRequestAction(
  requestId: string
): Promise<ServerActionResponse<void>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Unauthorized: User not authenticated' };
    }

    const { data: request, error: requestError } = await supabase
      .from('RewardRequest')
      .select(
        `
        id,
        user_id,
        reward_id,
        status,
        quantity,
        Reward!RewardRequest_reward_id_fkey (
          points_cost,
          name
        )
      `
      )
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single();

    if (requestError || !request) {
      return { error: 'Pending request not found' };
    }

    if (request.status !== 'pending') {
      return { error: 'Only pending requests can be cancelled' };
    }

    const quantity = request.quantity || 1;
    const rewardData = Array.isArray(request.Reward) ? request.Reward[0] : request.Reward;
    const rewardName = rewardData?.name || 'reward';
    const pointsCost = rewardData?.points_cost || 0;
    const pointsToRestore = pointsCost * quantity;

    const { data: userData, error: userDataError } = await supabaseAdmin
      .from('User')
      .select('points')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      return { error: 'Failed to fetch user data' };
    }

    const { error: cancelRequestError } = await supabase
      .from('RewardRequest')
      .update({
        status: 'rejected',
        remarks: 'Cancelled by employee',
      })
      .eq('id', requestId)
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (cancelRequestError) {
      return { error: `Failed to cancel request: ${cancelRequestError.message}` };
    }

    const currentPoints = userData.points || 0;

    //logic for cancel item points: refund full item cost
    const { error: restorePointsError } = await supabaseAdmin
      .from('User')
      .update({
        points: currentPoints + pointsToRestore,
      })
      .eq('id', user.id);

    if (restorePointsError) {
      await supabase
        .from('RewardRequest')
        .update({ status: 'pending', remarks: null })
        .eq('id', requestId)
        .eq('user_id', user.id);

      return { error: `Failed to restore points. Cancellation reverted.` };
    }

    await insertNotification({
      userId: user.id,
      type: 'reward',
      message: `You cancelled your request for ${quantity} x ${rewardName}. ${pointsToRestore} points have been restored to your account.`,
      metadata: {
        requestId,
        rewardId: request.reward_id,
        rewardName,
        quantity,
        pointsRestored: pointsToRestore,
        status: 'cancelled',
      },
    });

    return { error: null };
  } catch (error) {
    console.error('Error in cancelMyRedemptionRequestAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while cancelling the request' };
  }
}
