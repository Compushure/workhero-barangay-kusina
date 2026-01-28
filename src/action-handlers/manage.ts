/**
 * User Management Action Handlers (Client-side)
 * ================================================
 * Client-side wrappers for user management server actions.
 * Handles UI feedback (toasts) and state management integration.
 * Uses safeAction wrapper for consistent error handling.
 */

import { safeAction } from '@/lib/utils/safe-action';
import {
  fetchUsersAction,
  fetchUsersPaginatedAction,
  addUserAction,
  editUserAction,
  deleteUserAction,
  uploadProfilePicture,
} from '@/actions/manage';
import { type User, type AddUserInput, type EditUserInput, type UserQueryParams, type PaginatedResponse } from '@/types';
import { toast } from 'sonner';

/**
 * Fetches all users with error handling and toast feedback
 * @param params - Filter and search parameters
 * @returns Array of users or empty array on error
 */
export async function handleFetchUsers(params: UserQueryParams): Promise<User[]> {
  const result = await safeAction(() => fetchUsersAction(params));

  if (!result.success) {
    toast.error('Failed to load users: ' + result.error);
    return [];
  }

  return result.data;
}

/**
 * Fetches paginated users with error handling and toast feedback
 * @param params - Filter, search, and pagination parameters
 * @returns Paginated response with users array, count, and total pages
 */
export async function handleFetchUsersPaginated(
  params: UserQueryParams
): Promise<PaginatedResponse<User>> {
  const result = await safeAction(() => fetchUsersPaginatedAction(params));

  if (!result.success) {
    toast.error('Failed to load users: ' + result.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  return result.data?.data ?? { data: [], count: 0, totalPages: 0 };
}

/**
 * Adds a new user with toast feedback
 * @param input - New user data
 * @returns Created user or null on error
 */
export async function handleUploadProfilePicture(username: string, userId: string, file: File) {
  const result = await safeAction(() => uploadProfilePicture(userId, file));

  if (!result.success) {
    toast.error(`Failed to update ${username}'s profile picture: ` + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success(`Successfully updated ${username}'s profile picture`);
  return result.data?.data ?? null;
}

export async function handleAddUser(input: AddUserInput): Promise<User | null> {
  const result = await safeAction(() => addUserAction(input));

  if (!result.success) {
    toast.error('Failed to add user: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success(`Successfully added ${input.name}`);
  return result.data?.data ?? null;
}

/**
 * Updates an existing user with toast feedback
 * @param userId - ID of user to update
 * @param input - Updated user data
 * @param userName - User's name for toast message
 * @returns Updated user or null on error
 */
export async function handleEditUser(
  userId: string,
  input: EditUserInput,
  userName: string
): Promise<User | null> {
  const result = await safeAction(() => editUserAction(userId, input));

  if (!result.success) {
    toast.error('Failed to update user: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success(`Successfully updated ${userName}`);
  return result.data?.data ?? null;
}

/**
 * Deletes a user with toast feedback
 * @param userId - ID of user to delete
 * @param userName - User's name for toast message
 * @returns Boolean indicating success
 */
export async function handleDeleteUser(userId: string, userName: string): Promise<boolean> {
  const result = await safeAction(() => deleteUserAction(userId));

  if (!result.success) {
    toast.error('Failed to delete user: ' + result.error);
    return false;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return false;
  }

  toast.success(`Successfully deleted ${userName}`);
  return true;
}
