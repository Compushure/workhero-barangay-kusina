'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/types';
import { TaskCategory } from '@/types/manager/task-editor';
import { AddTaskInput, addTaskSchema, EditTaskInput, editTaskSchema } from '@/zod/schemas/task';

// Action to get all task categories
export async function fetchTaskCategories(): Promise<ServerActionResponse<TaskCategory[]>> {
  try {
    // Get Supabase client
    const supabase = await createClient();

    // Fetch all task categories
    const { data, error } = await supabase
      .from('KPICategory')
      .select('*')
      .order('type', { ascending: false })
      .order('name', { ascending: false });

    if (error) {
      console.error('Error fetching task categories:', error);
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
    }));

    return { error: null, data: taskCategories };
  } catch (error) {
    console.error('Error in getTaskCategoriesAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while fetching task categories' };
  }
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
