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
 * @param searchTerm - Optional search term for filtering tasks by name, description, or type
 */
export async function fetchTaskCategoriesPaginated(
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'type-name',
  searchTerm: string = ''
): Promise<
  ServerActionResponse<{
    data: TaskCategory[];
    count: number;
    totalPages: number;
  }>
> {
  console.log('Server Action Called:', { page, pageSize, sortBy, searchTerm });
  
  const supabase = await createClient();

  // Calculate range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Determine sort order for database query
  let orderByColumn = 'type';
  let ascending = false;

  switch (sortBy) {
    case 'type-name':
      // Sort by type first, then by name
      orderByColumn = 'type';
      ascending = true;
      break;
    case 'recently-created':
      orderByColumn = 'created_at';
      ascending = false;
      break;
    case 'points-desc':
      orderByColumn = 'points';
      ascending = false;
      break;
    case 'xp-desc':
      orderByColumn = 'xp';
      ascending = false;
      break;
    case 'repeatable-only':
      // Filter for repeatable only, then sort by name
      orderByColumn = 'name';
      ascending = true;
      break;
    case 'non-repeatable-only':
      // Filter for non-repeatable only, then sort by name
      orderByColumn = 'name';
      ascending = true;
      break;
    default:
      orderByColumn = 'type';
      ascending = true;
  }

  // Start with base query
  let query = supabase
    .from('KPICategory')
    .select('*');

  // Apply search filter if provided
  if (searchTerm && searchTerm.trim()) {
    const trimmedSearch = searchTerm.trim();
    query = query.or(
      `name.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%,type.ilike.%${trimmedSearch}%`
    );
  }

  // Apply repeatable/non-repeatable filters
  if (sortBy === 'repeatable-only') {
    query = query.eq('is_repeatable', true);
  } else if (sortBy === 'non-repeatable-only') {
    query = query.eq('is_repeatable', false);
  }

  // Get total count first - need to create separate query for count
  let countQuery = supabase.from('KPICategory').select('*', { count: 'exact', head: true });
  
  // Apply search filter to count query if provided
  if (searchTerm && searchTerm.trim()) {
    const trimmedSearch = searchTerm.trim();
    countQuery = countQuery.or(
      `name.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%,type.ilike.%${trimmedSearch}%`
    );
  }
  
  // Apply repeatable/non-repeatable filters to count query
  if (sortBy === 'repeatable-only') {
    countQuery = countQuery.eq('is_repeatable', true);
  } else if (sortBy === 'non-repeatable-only') {
    countQuery = countQuery.eq('is_repeatable', false);
  }
  
  const { count: totalCount, error: countError } = await countQuery;
  
  console.log('Count Query Result:', { totalCount, countError });
  
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

  console.log('Data Query Result:', { data, error });

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

  const response = {
    error: null,
    data: {
      data: taskCategories,
      count: totalCount || 0,
      totalPages,
    },
  };
  
  console.log('Server Action Response:', response);
  return response;
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