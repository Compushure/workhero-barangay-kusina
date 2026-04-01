'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { ServerActionResponse } from '@/types';
import type { TaskStatusItem } from '@/components/employee/task-status/types';
import { insertNotification } from '@/lib/notifications';

export interface EmployeeTasksData {
  currentTasks: TaskStatusItem[];
  onReviewTasks: TaskStatusItem[];
  verifiedTasks: TaskStatusItem[];
  deniedTasks: TaskStatusItem[];
}

interface TaskInfoRow {
  kpitask_id: string;
  status: string | null;
  points_claimed_at: string | null;
  kpitask_completed_at: string | null;
  category_name: string | null;
  category_description: string | null;
  category_points: number | null;
  category_xp: number | null;
  k_deadline_date: string | null;
  kpitask_created_at: string | null;
  remark: string | null;
  completed_orders: number | null;
  pending_orders: number | null;
  max_orders: number | null;
}

interface NotificationMetadataRow {
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

interface CookNotificationSnapshot {
  dishName: string | null;
  dishImageUrl: string | null;
  orderCount: number | null;
}

// function formatDueDate(iso: string | null): string {
//   if (!iso) return '—';
//   try {
//     const d = new Date(iso);
//     return d.toLocaleDateString('en-US', {
//       month: '2-digit',
//       day: '2-digit',
//       year: '2-digit',
//     });
//   } catch {
//     return '—';
//   }
// }

function rowToTaskStatusItem(row: TaskInfoRow): TaskStatusItem {
  const points = row.category_points ?? 0;
  const xp = Number(row.category_xp ?? 0);
  const pendingOrders = row.pending_orders ?? 0;
  const completedOrders = row.completed_orders ?? 0;
  const maxOrders = row.max_orders ?? 1;
  const name = row.category_name ?? 'Task';
  const description = row.category_description?.trim() ? row.category_description : name;
  const claimedOrders = (row.completed_orders ?? 0) - (row.pending_orders ?? 0);

  return {
    id: row.kpitask_id,
    name,
    description,
    pendingOrders,
    completedOrders,
    maxOrders,
    claimedOrders: claimedOrders,
    points,
    xp,
    dueDate: row.k_deadline_date ?? 'No date',
    approvedAt: row.kpitask_created_at,
    // dueDate: formatDueDate(row.k_deadline_date),
    ...(row.remark?.trim() ? { remark: row.remark.trim() } : {}),
    claimedAt: row.points_claimed_at ?? undefined,
    completedAt: row.kpitask_completed_at ?? undefined,
    status: row.status ?? undefined,
  };
}

export async function fetchEmployeeTasks(): Promise<ServerActionResponse<EmployeeTasksData>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated', data: undefined };
  }

  const { data: rows, error } = await supabase
    .from('task_info_view')
    .select(
      'kpitask_id, status, points_claimed_at, kpitask_completed_at, category_name, category_description, category_points, category_xp, k_deadline_date, kpitask_created_at, remark, completed_orders, pending_orders, max_orders'
    )
    .eq('assigned_to', user.id);

  if (error) {
    return { error: 'Failed to fetch tasks: ' + error.message, data: undefined };
  }

  const list = (rows ?? []) as TaskInfoRow[];
  const currentTasks: TaskStatusItem[] = [];
  const onReviewTasks: TaskStatusItem[] = [];
  const verifiedTasks: TaskStatusItem[] = [];
  const deniedTasks: TaskStatusItem[] = [];

  const taskItems = list.map((row) => rowToTaskStatusItem(row));
  const claimReadyTaskIds = new Set(
    taskItems
      .filter(
        (task) =>
          task.status === 'approved' &&
          task.completedOrders === task.maxOrders &&
          Boolean(task.claimedAt) &&
          !task.completedAt
      )
      .map((task) => task.id)
  );

  if (claimReadyTaskIds.size > 0) {
    const { data: notificationRows, error: notificationError } = await supabase
      .from('Notification')
      .select('metadata, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(300);

    if (!notificationError) {
      const latestCookSnapshotByTaskId = new Map<string, CookNotificationSnapshot>();

      for (const row of (notificationRows ?? []) as NotificationMetadataRow[]) {
        const metadata = row.metadata;
        if (!metadata) continue;

        const taskId = typeof metadata.taskId === 'string' ? metadata.taskId : null;
        if (!taskId || !claimReadyTaskIds.has(taskId) || latestCookSnapshotByTaskId.has(taskId)) {
          continue;
        }

        if (metadata.cookReady !== true) {
          continue;
        }

        const cookDish =
          metadata.cookDish && typeof metadata.cookDish === 'object'
            ? (metadata.cookDish as Record<string, unknown>)
            : null;

        const dishName = cookDish && typeof cookDish.name === 'string' ? cookDish.name : null;
        const dishImageUrl =
          cookDish && typeof cookDish.imageUrl === 'string' ? cookDish.imageUrl : null;
        const orderCountValue = Number(metadata.cookOrderCount ?? Number.NaN);

        latestCookSnapshotByTaskId.set(taskId, {
          dishName,
          dishImageUrl,
          orderCount: Number.isFinite(orderCountValue) ? Math.max(1, orderCountValue) : null,
        });
      }

      for (const task of taskItems) {
        const snapshot = latestCookSnapshotByTaskId.get(task.id);
        if (!snapshot) continue;

        task.cookDishName = snapshot.dishName;
        task.cookDishImageUrl = snapshot.dishImageUrl;
        task.cookOrderCount = snapshot.orderCount;
      }
    }
  }

  for (const item of taskItems) {
    const status = (item.status ?? '').toLowerCase();

    if (status === 'assigned') {
      currentTasks.push(item);
    } else if (status === 'in review') {
      onReviewTasks.push(item);
    } else if (status === 'approved') {
      verifiedTasks.push(item);
    } else if (status === 'rejected') {
      deniedTasks.push(item);
    }
  }

  return {
    error: null,
    data: {
      currentTasks,
      onReviewTasks,
      verifiedTasks,
      deniedTasks,
    },
  };
}

export interface ClaimTaskResult {
  pointsAdded: number;
  xpAdded: number;
  cookOutcome: CookOutcome;
}

export interface CookDishResult {
  id: string;
  name: string;
  imageUrl: string | null;
  requiredLevel: number;
  rngMatched: boolean;
}

export interface CookOutcome {
  canPrepareFood: boolean;
  orderCount: number;
  maxOrders: number;
  dish: CookDishResult | null;
}

interface DishRow {
  id: string;
  name: string | null;
  img_link: string | null;
  rng: number | null;
  start_appear_level: number | null;
}

export interface SubmitVerificationResult {
  success: boolean;
  pendingOrdersSubmitted: number;
}

export async function serveCookedTaskDish(
  kpitaskId: string
): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated', data: undefined };
  }

  const { data: task, error: taskError } = await supabase
    .from('task_info_view')
    .select('assigned_to, status, points_claimed_at, completed_orders, max_orders, kpitask_completed_at')
    .eq('kpitask_id', kpitaskId)
    .single();

  if (taskError || !task) {
    return { error: 'Task not found', data: undefined };
  }

  const assignedTo = (task as { assigned_to: string | null }).assigned_to;
  const status = ((task as { status: string | null }).status ?? '').toLowerCase();
  const pointsClaimedAt = (task as { points_claimed_at: string | null }).points_claimed_at;
  const completedOrders = (task as { completed_orders: number | null }).completed_orders ?? 0;
  const maxOrders = (task as { max_orders: number | null }).max_orders ?? 1;
  const completedAt = (task as { kpitask_completed_at: string | null }).kpitask_completed_at;

  if (assignedTo !== user.id) {
    return { error: 'You can only serve dishes for your own task', data: undefined };
  }

  if (status !== 'approved') {
    return { error: 'Only approved tasks can be served', data: undefined };
  }

  if (!pointsClaimedAt) {
    return { error: 'Claim task rewards first before serving food', data: undefined };
  }

  if (completedOrders < maxOrders) {
    return { error: 'Only fully completed tasks can be served', data: undefined };
  }

  if (completedAt) {
    return { error: null, data: true };
  }

  const { error: updateError } = await supabaseAdmin
    .from('KPITask')
    .update({
      completed_at: new Date().toISOString(),
    })
    .eq('id', kpitaskId)
    .eq('assigned_to', user.id);

  if (updateError) {
    return { error: 'Failed to mark task as served: ' + updateError.message, data: undefined };
  }

  return { error: null, data: true };
}

export async function submitTaskVerification(
  kpitaskId: string,
  pendingOrders: number
): Promise<ServerActionResponse<SubmitVerificationResult>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated', data: undefined };
  }

  // Validate input
  if (pendingOrders <= 0) {
    return { error: 'Pending orders must be greater than 0', data: undefined };
  }

  // Fetch task details with current progress
  const { data: task, error: taskError } = await supabase
    .from('task_info_view')
    .select(
      'assigned_to, status, completed_orders, pending_orders, max_orders, points_claimed_at, category_name'
    )
    .eq('kpitask_id', kpitaskId)
    .single();

  if (taskError || !task) {
    return { error: 'Task not found', data: undefined };
  }

  const assignedTo = (task as { assigned_to: string | null }).assigned_to;
  const status = ((task as { status: string | null }).status ?? '').toLowerCase();
  const completedOrders = (task as { completed_orders: number | null }).completed_orders ?? 0;
  const maxOrders = (task as { max_orders: number | null }).max_orders ?? 1;
  const pointsClaimedAt = (task as { points_claimed_at: string | null }).points_claimed_at;
  const taskName = (task as { category_name: string | null }).category_name ?? 'Task';

  // Validation checks
  if (assignedTo !== user.id) {
    return { error: 'You can only submit verification for tasks assigned to you', data: undefined };
  }

  if (status !== 'assigned') {
    return { error: 'Only assigned tasks can be submitted for verification', data: undefined };
  }

  // Calculate remaining orders that can be submitted
  const remainingOrders = maxOrders - completedOrders;

  if (pendingOrders > remainingOrders) {
    return {
      error: `Cannot submit ${pendingOrders} orders. Only ${remainingOrders} orders remaining (max: ${maxOrders}, completed: ${completedOrders})`,
      data: undefined,
    };
  }

  // Update task status to 'in review' and set pending orders
  const { error: updateError } = await supabase
    .from('KPITask')
    .update({
      status: 'in review',
      pending_orders: pendingOrders,
      verification_requested_at: new Date().toISOString(),
    })
    .eq('id', kpitaskId)
    .eq('assigned_to', user.id);

  if (updateError) {
    return {
      error: 'Failed to submit task for verification: ' + updateError.message,
      data: undefined,
    };
  }

  const remainingAfterSubmission = Math.max(0, maxOrders - completedOrders - pendingOrders);

  await insertNotification({
    userId: user.id,
    type: 'task',
    message: `You have submitted ${pendingOrders} order${pendingOrders !== 1 ? 's' : ''} for "${taskName}" for review! ${remainingAfterSubmission > 0 ? ` You have ${remainingAfterSubmission} order${remainingAfterSubmission !== 1 ? 's' : ''} remaining in this task.` : `You have submitted the last remaining order ${remainingAfterSubmission !== 1 ? 's' : ''} for this task`}`,
    metadata: {
      taskId: kpitaskId,
      taskName,
      status: 'in review',
      pendingOrdersSubmitted: pendingOrders,
      remainingOrders: remainingAfterSubmission,
      maxOrders,
      pointsClaimedAt,
    },
  });

  return {
    error: null,
    data: {
      success: true,
      pendingOrdersSubmitted: pendingOrders,
    },
  };
}

export async function redoTask(kpitaskId: string): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated', data: undefined };
  }

  // Fetch task details to verify ownership and status
  const { data: task, error: taskError } = await supabase
    .from('task_info_view')
    .select('assigned_to, status')
    .eq('kpitask_id', kpitaskId)
    .single();

  if (taskError || !task) {
    return { error: 'Task not found', data: undefined };
  }

  const assignedTo = (task as { assigned_to: string | null }).assigned_to;
  const status = ((task as { status: string | null }).status ?? '').toLowerCase();

  // Validation checks
  if (assignedTo !== user.id) {
    return { error: 'You can only redo tasks assigned to you', data: undefined };
  }

  if (status !== 'rejected') {
    return { error: 'Only rejected tasks can be redone', data: undefined };
  }

  // Update task status back to 'assigned'
  const { error: updateError } = await supabase
    .from('KPITask')
    .update({
      status: 'assigned',
      pending_orders: null,
    })
    .eq('id', kpitaskId)
    .eq('assigned_to', user.id);

  if (updateError) {
    return { error: 'Failed to redo task: ' + updateError.message, data: undefined };
  }

  // Fetch task name for notification
  const { data: taskName } = await supabase
    .from('task_info_view')
    .select('category_name')
    .eq('kpitask_id', kpitaskId)
    .single();

  const taskDisplayName = (taskName as { category_name: string | null }).category_name ?? 'Task';

  await insertNotification({
    userId: user.id,
    type: 'task',
    message: `You have sent "${taskDisplayName}" back to the kitchen. You can now submit it again for review.`,
    metadata: {
      taskId: kpitaskId,
      taskName: taskDisplayName,
      status: 'assigned',
      action: 'redo',
    },
  });

  return {
    error: null,
    data: true,
  };
}

export async function claimTaskPointsAndXP(
  kpitaskId: string
): Promise<ServerActionResponse<ClaimTaskResult>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated', data: undefined };
  }

  const { data: task, error: taskError } = await supabase
    .from('task_info_view')
    .select('assigned_to, status, points_claimed_at, category_points, category_xp, completed_orders, pending_orders, max_orders, category_name')
    .eq('kpitask_id', kpitaskId)
    .single();

  if (taskError || !task) {
    return { error: 'Task not found', data: undefined };
  }

  const assignedTo = (task as { assigned_to: string | null }).assigned_to;
  const status = ((task as { status: string | null }).status ?? '').toLowerCase();
  const pointsClaimedAt = (task as { points_claimed_at: string | null }).points_claimed_at;
  const categoryPoints = (task as { category_points: number | null }).category_points ?? 0;
  const categoryXp = Number((task as { category_xp: number | null }).category_xp ?? 0);
  const completedOrders = (task as { completed_orders: number | null }).completed_orders ?? 0;
  const maxOrders = (task as { max_orders: number | null }).max_orders ?? 1;
  const pendingOrders = (task as { pending_orders: number | null }).pending_orders ?? 0;
  const categoryName = (task as { category_name: string | null }).category_name ?? 'Task';
  const isLastOrderClaim = pendingOrders > 0 && completedOrders >= maxOrders;

  if (assignedTo !== user.id) {
    return { error: 'You can only claim rewards for tasks assigned to you', data: undefined };
  }
  if (status !== 'approved') {
    return { error: 'Only approved tasks can be claimed', data: undefined };
  }

  // Check if there are unclaimed completed orders
  if (pendingOrders === 0 && completedOrders === maxOrders) {
    return { error: 'No completed orders available to claim', data: undefined };
  }

  const pointsToAdd = categoryPoints * pendingOrders;

  const { data: currentPointsData, error: currentPointsError } = await supabaseAdmin
    .from('User')
    .select('points, total_points_earned')
    .eq('id', user.id)
    .single();

  if (currentPointsError || !currentPointsData) {
    return { error: 'Failed to fetch user points: ' + (currentPointsError?.message ?? 'No data'), data: undefined };
  }

  const nextPoints = Number(currentPointsData.points ?? 0) + pointsToAdd;
  const nextTotalPointsEarned = Number(currentPointsData.total_points_earned ?? 0) + pointsToAdd;

  const { error: pointsUpdateError } = await supabaseAdmin
    .from('User')
    .update({
      points: nextPoints,
      total_points_earned: nextTotalPointsEarned,
    })
    .eq('id', user.id);

  if (pointsUpdateError) {
    return { error: 'Failed to add points: ' + pointsUpdateError.message, data: undefined };
  }

  const { data: userRow, error: userFetchError } = await supabase
    .from('User')
    .select('xp, level, total_xp')
    .eq('id', user.id)
    .single();

  if (userFetchError || userRow == null) {
    return { error: 'Failed to fetch user for XP update', data: undefined };
  }

  const currentLevel = (userRow as { level: number | null }).level ?? 0;
  const currentXp = (userRow as { xp: number | null }).xp ?? 0;
  const currentTotalXp = (userRow as { total_xp: number | null }).total_xp;
  const xpToAdd = categoryXp * pendingOrders;

  const { data: levelRows, error: levelRowsError } = await supabase
    .from('Level')
    .select('level, xp')
    .order('level', { ascending: true });

  if (levelRowsError) {
    return { error: 'Failed to fetch level thresholds: ' + levelRowsError.message, data: undefined };
  }

  const levelThresholds = new Map<number, number>();
  for (const row of levelRows ?? []) {
    levelThresholds.set(row.level, row.xp ?? 100);
  }

  const getLevelThreshold = (level: number): number => {
    if (level <= 1) {
      return Math.max(0, levelThresholds.get(1) ?? 0);
    }

    return Math.max(0, levelThresholds.get(level) ?? level * 100);
  };

  // Level 1 commonly stores 0 in DB; use level 2 requirement for progression from level 1.
  const getRequiredXpForLevel = (level: number): number => {
    if (level <= 1) {
      return Math.max(1, getLevelThreshold(2));
    }

    return Math.max(1, getLevelThreshold(level));
  };

  let newLevel = Math.min(Math.max(currentLevel, 1), 10);
  let newXp = Math.max(0, currentXp) + xpToAdd;

  // Once a user is at level 10, keep accumulating XP but do not level past the cap.
  if (newLevel < 10) {
    while (newLevel < 10) {
      const requiredXp = getRequiredXpForLevel(newLevel);

      if (newXp < requiredXp) {
        break;
      }

      newXp -= requiredXp;
      newLevel += 1;
    }
  }

  const computeTotalXP = (level: number, xp: number): number => {
    let sum = 0;
    for (let lvl = 1; lvl < level; lvl += 1) {
      sum += getRequiredXpForLevel(lvl);
    }
    return sum + Math.max(0, xp);
  };

  const fallbackTotalXp = computeTotalXP(Math.min(Math.max(currentLevel, 1), 10), Math.max(0, currentXp));
  const totalXpAfterUpdate = Math.max(0, (currentTotalXp ?? fallbackTotalXp) + xpToAdd);

  const { error: xpUpdateError } = await supabaseAdmin
    .from('User')
    .update({ level: newLevel, xp: newXp, total_xp: totalXpAfterUpdate })
    .eq('id', user.id);

  if (xpUpdateError) {
    return { error: 'Failed to add XP: ' + xpUpdateError.message, data: undefined };
  }

  const { error: claimUpdateError } = await supabaseAdmin
    .from('KPITask')
    .update({
      points_claimed_at: new Date().toISOString(),
      // Update status back to assigned if there are remaining orders after this claim
      status: completedOrders < maxOrders ? 'assigned' : 'approved',
      pending_orders: 0,
    })
    .eq('id', kpitaskId);

  if (claimUpdateError) {
    return { error: 'Failed to mark task as claimed', data: undefined };
  }

  let cookOutcome: CookOutcome = {
    canPrepareFood: false,
    orderCount: maxOrders,
    maxOrders,
    dish: null,
  };

  if (isLastOrderClaim) {
    const { data: dishRows, error: dishError } = await supabase
      .from('Dishes')
      .select('id, name, img_link, rng, start_appear_level')
      .lte('start_appear_level', newLevel);

    if (!dishError) {
      const eligibleDishes = (dishRows ?? []) as DishRow[];

      if (eligibleDishes.length > 0) {
        const randomDish = eligibleDishes[Math.floor(Math.random() * eligibleDishes.length)];
        const dishRng = Number(randomDish.rng ?? 1);
        const rngMatched = Math.random() <= dishRng;

        cookOutcome = {
          canPrepareFood: true,
          orderCount: maxOrders,
          maxOrders,
          dish: {
            id: randomDish.id,
            name: randomDish.name ?? 'Dish',
            imageUrl: randomDish.img_link,
            requiredLevel: randomDish.start_appear_level ?? 1,
            rngMatched,
          },
        };
      } else {
        cookOutcome = {
          canPrepareFood: true,
          orderCount: maxOrders,
          maxOrders,
          dish: null,
        };
      }
    }
  }

  // Build notification message
  const pointsEarned = pointsToAdd;
  let notificationMessage = `You have claimed ${pointsEarned} points for completing the task "${categoryName}."`;
  
  // Check if user leveled up
  if (newLevel > currentLevel) {
    notificationMessage += ` It looks like you've leveled up! You are now level ${newLevel}!`;
  }

  // Insert notification
  await insertNotification({
    userId: user.id,
    type: 'user',
    message: notificationMessage,
    metadata: {
      taskId: kpitaskId,
      taskName: categoryName,
      status: completedOrders < maxOrders ? 'assigned' : 'completed',
      pointsEarned,
      xpEarned: categoryXp * pendingOrders,
      leveledUp: newLevel > currentLevel,
      newLevel,
      previousLevel: currentLevel,
      cookReady: cookOutcome.canPrepareFood,
      cookDish: cookOutcome.dish,
      cookOrderCount: cookOutcome.orderCount,
    },
  });

  return {
    error: null,
    data: { pointsAdded: pointsToAdd, xpAdded: categoryXp * pendingOrders, cookOutcome },
  };
}
