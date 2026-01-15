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

export async function fetchApprovedTasks(): Promise<ServerActionResponse<VerificationRequest[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('status', 'approved');

  if (error) {
    return { error: 'Failed to fetch approved tasks: ' + error.message, data: undefined };
  }

  return { error: null, data: data as VerificationRequest[] };
}

export async function fetchDeniedTasks(): Promise<ServerActionResponse<VerificationRequest[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('status', 'rejected');

  if (error) {
    return { error: 'Failed to fetch rejected tasks: ' + error.message, data: undefined };
  }

  return { error: null, data: data as VerificationRequest[] };
}

export async function approveTaskAction(id: string) {
  const supabase = await createClient();

  // First update the task
  const { error: updateError } = await supabase
    .from('KPITask')
    .update({ status: 'approved' })
    .eq('id', id);

  if (updateError) {
    return { error: 'Failed to approve task: ' + updateError.message, data: undefined };
  }


}

export async function rejectTaskAction(id: string) {
  const supabase = await createClient();

  // First update the task
  const {data,  error: updateError } = await supabase
    .from('KPITask')
    .update({ status: 'rejected' })
    .eq('id', id.trim())
    .select()

    console.log("id: ",id)
  if (updateError) {
    return { error: 'Failed to reject task: ' + updateError.message, data: undefined };
  }

}
