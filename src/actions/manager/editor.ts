'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/types';
import { TaskCategory } from '@/types/manager/task-editor';
import { AddTaskInput, addTaskSchema, EditTaskInput, editTaskSchema } from '@/zod/schemas/task';

/**
 * Fetch paginated task categories
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @param sortBy - Sort order option
 * @param searchTerm - Optional search term for filtering tasks by name only
 */
export async function fetchTaskCategoriesPaginated(
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'type-name',
  searchTerm: string = '',
  repeatabilityFilter: 'all' | 'repeatable' | 'non-repeatable' = 'all'
): Promise<
  ServerActionResponse<{
    data: TaskCategory[];
    count: number;
    totalPages: number;
  }>
> {
  const supabase = await createClient();

  // Calculate range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Determine sort order for database query
  let orderByColumn = 'type';
  let ascending = false;

  switch (sortBy) {
    case 'name-asc':
      orderByColumn = 'name';
      ascending = true;
      break;
    case 'name-desc':
      orderByColumn = 'name';
      ascending = false;
      break;
    case 'type-name':
      // Sort by type first, then by name
      orderByColumn = 'type';
      ascending = true;
      break;
    case 'recently-created':
      orderByColumn = 'created_at';
      ascending = false;
      break;
    case 'oldest-created':
      orderByColumn = 'created_at';
      ascending = true;
      break;
    case 'points-asc':
      orderByColumn = 'points';
      ascending = true;
      break;
    case 'points-desc':
      orderByColumn = 'points';
      ascending = false;
      break;
    case 'xp-asc':
      orderByColumn = 'xp';
      ascending = true;
      break;
    case 'xp-desc':
      orderByColumn = 'xp';
      ascending = false;
      break;
    default:
      orderByColumn = 'name';
      ascending = true;
  }

  // Start with base query
  let query = supabase
    .from('KPICategory')
    .select('*');

  // Apply search filter if provided
  if (searchTerm && searchTerm.trim()) {
    const trimmedSearch = searchTerm.trim();
    query = query.ilike('name', `%${trimmedSearch}%`);
  }

  // Apply repeatable/non-repeatable filter category
  if (repeatabilityFilter === 'repeatable') {
    query = query.eq('is_repeatable', true);
  } else if (repeatabilityFilter === 'non-repeatable') {
    query = query.eq('is_repeatable', false);
  }

  // Get total count first - need to create separate query for count
  let countQuery = supabase.from('KPICategory').select('*', { count: 'exact', head: true });
  
  // Apply search filter to count query if provided
  if (searchTerm && searchTerm.trim()) {
    const trimmedSearch = searchTerm.trim();
    countQuery = countQuery.ilike('name', `%${trimmedSearch}%`);
  }
  
  // Apply repeatable/non-repeatable filter category to count query
  if (repeatabilityFilter === 'repeatable') {
    countQuery = countQuery.eq('is_repeatable', true);
  } else if (repeatabilityFilter === 'non-repeatable') {
    countQuery = countQuery.eq('is_repeatable', false);
  }
  
  const { count: totalCount, error: countError } = await countQuery;
  
  if (countError) {
    console.error('Count Error:', countError);
    return { error: 'Failed to count task categories: ' + countError.message, data: undefined };
  }

  // Apply sorting and pagination
  let orderedQuery = query.order(orderByColumn, { ascending });
  
  // For type-name sorting, we need to sort by type first, then by name
  if (sortBy === 'type-name') {
    orderedQuery = orderedQuery.order('name', { ascending: true });
  }
  
  const { data, error } = await orderedQuery.range(start, end);

  if (error) {
    console.error('Data Error:', error);
    return { error: `Failed to fetch task categories: ${error.message}` };
  }

  // Transform database response to match TaskCategory type
  const taskCategories: TaskCategory[] = (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    description: item.description,
    isRepeatable: item.is_repeatable,
    points: item.points,
    xp: item.xp,
    createdAt: item.created_at,
  }));

  const totalPages = Math.ceil((totalCount || 0) / pageSize);

  return {
    error: null,
    data: {
      data: taskCategories,
      count: totalCount || 0,
      totalPages,
    },
  };
}

export async function fetchTaskCategoryMetadata(): Promise<
  ServerActionResponse<{ names: string[]; types: string[] }>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('KPICategory')
    .select('name,type');

  if (error) {
    return { error: `Failed to fetch task category metadata: ${error.message}` };
  }

  const names = (data ?? []).map((item) => item.name).filter(Boolean);
  const types = [...new Set((data ?? []).map((item) => item.type).filter(Boolean))].sort();

  return {
    error: null,
    data: {
      names,
      types,
    },
  };
}

export async function addTaskCategory(input: AddTaskInput): Promise<ServerActionResponse<TaskCategory>> {
  try {
    // Validate input
    const validatedData = addTaskSchema.parse(input);

    const supabase = await createClient();

    if (validatedData.points <= 0) {
      return { error: 'Points must be greater than 0' };
    }
    if (validatedData.xp <= 0) {
      return { error: 'XP must be greater than 0' };
    }
    
    // Reasonable upper limits
    if (validatedData.points > 10000) {
      return { error: 'Points cannot exceed 10,000' };
    }
    if (validatedData.xp > 5000) {
      return { error: 'XP cannot exceed 5,000' };
    }

    // Check if task category name already exists
    const { data: existingCategory } = await supabase
      .from('KPICategory')
      .select('id')
      .eq('name', validatedData.name)
      .single();
    
    if (existingCategory) {
      return { error: 'Task category with this name already exists' };
    }

    // Insert task category into database
    const { data, error } = await supabase
      .from('KPICategory')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        points: validatedData.points,
        xp: validatedData.xp,
        is_repeatable: validatedData.isRepeatable,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding task category:', error);
      return { error: `Failed to add task category: ${error.message}` };
    }

    // Transform database response to match TaskCategory type
    const taskCategory: TaskCategory = {
      id: data.id,
      name: data.name,
      type: data.type,
      description: data.description,
      isRepeatable: data.is_repeatable,
      points: data.points,
      xp: data.xp,
      createdAt: data.created_at,
    };

    return { error: null, data: taskCategory };
  } catch (error) {
    console.error('Error in addTaskCategoryAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while adding the task category' };
  }
}

export async function editTaskCategory(id: string, input: EditTaskInput): Promise<ServerActionResponse<TaskCategory>> {
  try {
    // Validate input
    const validatedData = editTaskSchema.parse(input);

    // Get Supabase client
    const supabase = await createClient();

    if (validatedData.points !== undefined && validatedData.points <= 0) {
      return { error: 'Points must be greater than 0' };
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.isRepeatable !== undefined) updateData.is_repeatable = validatedData.isRepeatable;
    if (validatedData.points !== undefined) updateData.points = validatedData.points;
    if (validatedData.xp !== undefined) updateData.xp = validatedData.xp;

    // Update task category in database
    const { data, error } = await supabase
      .from('KPICategory')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task category:', error);
      return { error: `Failed to update task category: ${error.message}` };
    }

    // Transform database response to match TaskCategory type
    const taskCategory: TaskCategory = {
      id: data.id,
      name: data.name,
      type: data.type,
      description: data.description,
      isRepeatable: data.is_repeatable,
      points: data.points,
      xp: data.xp,
      createdAt: data.created_at,
    };
    return { error: null, data: taskCategory };
  } catch (error) {
    console.error('Error in editTaskCategoryAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while updating the task category' };
  }
}


export async function deleteTaskCategory(id: string): Promise<ServerActionResponse<void>> {
  try {
    // Get Supabase client
    const supabase = await createClient();

    // Delete reward from database
    const { error } = await supabase.from('KPICategory').delete().eq('id', id);

    if (error) {
      console.error('Error deleting task category:', error);
      return { error: `Failed to task category: ${error.message}` };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteRewardAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while deleting the task category' };
  }
}
