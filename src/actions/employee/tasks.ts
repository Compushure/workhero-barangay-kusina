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
  category_name: string | null;
  category_description: string | null;
  category_points: number | null;
  category_xp: number | null;
  k_deadline_date: string | null;
  remark: string | null;
  completed_orders: number | null;
  pending_orders: number | null;
  max_orders: number | null;
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
    // dueDate: formatDueDate(row.k_deadline_date),
    ...(row.remark?.trim() ? { remark: row.remark.trim() } : {}),
    claimedAt: row.points_claimed_at ?? undefined,
    status: row.status ?? undefined,
  };
}

export async function fetchEmployeeTasks(): Promise<
  ServerActionResponse<EmployeeTasksData>
> {
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
      'kpitask_id, status, points_claimed_at, category_name, category_description, category_points, category_xp, k_deadline_date, remark, completed_orders, pending_orders, max_orders'
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

  for (const row of list) {
    const item = rowToTaskStatusItem(row);
    const status = (row.status ?? '').toLowerCase();

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
}

export interface SubmitVerificationResult {
  success: boolean;
  pendingOrdersSubmitted: number;
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
      data: undefined 
    };
  }

  // Update task status to 'in review' and set pending orders
  const { error: updateError } = await supabase
    .from('KPITask')
    .update({ 
      status: 'in review',
      pending_orders: pendingOrders 
    })
    .eq('id', kpitaskId)
    .eq('assigned_to', user.id);

  if (updateError) {
    return { error: 'Failed to submit task for verification: ' + updateError.message, data: undefined };
  }

  const remainingAfterSubmission = Math.max(0, maxOrders - completedOrders - pendingOrders);

  await insertNotification({
    userId: user.id,
    type: 'task',
    message: `You have submitted ${pendingOrders} order${pendingOrders !== 1 ? 's' : ''} for "${taskName}" for review!${remainingAfterSubmission > 0 ? ` You have ${remainingAfterSubmission} order${remainingAfterSubmission !== 1 ? 's' : ''} remaining in this task.` : ' This task is now complete!'}`,
    metadata: {
      taskId: kpitaskId,
      taskName,
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

export async function redoTask(
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
      pending_orders: null 
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

  const { error: pointsError } = await supabase.rpc('increment_points_for_user', {
    target_user_id: user.id,
    amount: categoryPoints * pendingOrders,
  });

  if (pointsError) {
    return { error: 'Failed to add points: ' + pointsError.message, data: undefined };
  }

  const { data: userRow, error: userFetchError } = await supabase
    .from('User')
    .select('xp, level')
    .eq('id', user.id)
    .single();

  if (userFetchError || userRow == null) {
    return { error: 'Failed to fetch user for XP update', data: undefined };
  }

  const currentLevel = (userRow as { level: number | null }).level ?? 0;
  const currentXp = (userRow as { xp: number | null }).xp ?? 0;
  const totalXp = currentLevel * 100 + currentXp;
  const newTotalXp = totalXp + (categoryXp * pendingOrders);
  const newLevel = Math.floor(newTotalXp / 100);
  const newXp = newTotalXp % 100;

  const { error: xpUpdateError } = await supabaseAdmin
    .from('User')
    .update({ level: newLevel, xp: newXp })
    .eq('id', user.id);

  if (xpUpdateError) {
    return { error: 'Failed to add XP: ' + xpUpdateError.message, data: undefined };
  }

  const { error: claimUpdateError } = await supabaseAdmin
    .from('KPITask')
    .update({ 
      points_claimed_at: new Date().toISOString(),
      // Update status back to assigned if there are remaining orders after this claim
      status: (completedOrders) < maxOrders ? 'assigned' : 'approved',
      pending_orders: 0,
    })
    .eq('id', kpitaskId);

  if (claimUpdateError) {
    return { error: 'Failed to mark task as claimed', data: undefined };
  }

  // Build notification message
  const pointsEarned = categoryPoints * pendingOrders;
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
      pointsEarned,
      xpEarned: categoryXp * pendingOrders,
      leveledUp: newLevel > currentLevel,
      newLevel,
      previousLevel: currentLevel,
    },
  });

  return {
    error: null,
    data: { pointsAdded: categoryPoints * pendingOrders, xpAdded: categoryXp * pendingOrders },
  };
}
