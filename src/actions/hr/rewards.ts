'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  ServerActionResponse,
  AddRewardInput,
  EditRewardInput,
  Reward,
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
// HR Reward Management Actions
// ============================================

/**
 * Get all reward/mercado items
 * Used by HR to manage rewards inventory
 * @returns ServerActionResponse with array of rewards
 */
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

/**
 * Add a new reward/mercado item
 * HR only - creates a new reward in the system
 * @param input - The reward data to add
 * @returns ServerActionResponse with the created reward
 */
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

/**
 * Edit an existing reward/mercado item
 * HR only - updates reward details
 * @param id - The reward ID to edit
 * @param input - The updated reward data
 * @returns ServerActionResponse with the updated reward
 */
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

/**
 * Delete a reward/mercado item
 * HR only - permanently removes a reward and its image
 * @param id - The reward ID to delete
 * @returns ServerActionResponse indicating success or failure
 */
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
 * Hide/unhide a reward/mercado item
 * HR only - toggles visibility of a reward to employees
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

/**
 * Upload reward picture
 * HR only - uploads or updates an image for a reward
 * @param rewardId - The reward ID to upload image for
 * @param file - The image file to upload
 * @returns ServerActionResponse with the path and public URL
 */
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
 * Auto-hide out-of-stock rewards
 * HR utility - automatically marks items with quantity <= 0 as inactive
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
