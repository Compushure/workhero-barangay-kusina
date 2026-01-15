'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  ServerActionResponse,
  User,
  AddUserInput,
  EditUserInput,
  UserQueryParams,
} from '@/types';
import type { VerificationRequest } from '@/types/manager-verification-req';

export async function fetchTasksToReview(): Promise<ServerActionResponse<VerificationRequest[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('status', 'in review');

  if (error) {
    return { error: 'Failed to fetch tasks in review: ' + error.message, data: undefined };
  }

  return { error: null, data: data as VerificationRequest[] };
}

export async function approveTaskAction(
  id: string
): Promise<ServerActionResponse<VerificationRequest>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_info_view')
    .update({ status: 'approved' })
    .eq('kpitask_id', id)
    .select()
    .single();

  if (error) {
    return { error: 'Failed to approve task: ' + error.message, data: undefined };
  }

  return { error: null, data: data as VerificationRequest };
}

export async function rejectTaskAction(
  id: string
): Promise<ServerActionResponse<VerificationRequest>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_info_view')
    .update({ status: 'rejected' })
    .eq('kpitask_id', id)
    .select()
    .single();

  if (error) {
    return { error: 'Failed to reject task: ' + error.message, data: undefined };
  }

  return { error: null, data: data as VerificationRequest };
}
