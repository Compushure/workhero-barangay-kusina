'use client';

import { useState } from 'react';
import { Plus, Search, ArrowUpDown, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddEditTaskCategoryDialog from './dialogs/add-edit-task-category-dialog';
import TaskCategoryTable from './task-category-table';
import {
  useGetTaskCategoriesPaginated,
  type TaskCategorySortOption,
} from '@/hooks/tanstack/queries/managerEditorQueries';
import {
  useAddTaskCategory,
  useEditTaskCategory,
  useDeleteTaskCategory,
} from '@/hooks/tanstack/mutations/managerEditorMutations';
import { useDebounce } from '@/hooks/useDebounce';
import { Pagination } from '@/components/manager/task-verification/pagination';
import type { TaskCategory } from '@/types/manager/task-editor';
import type { AddTaskInput } from '@/zod/schemas/task';

const SORT_OPTIONS: { value: TaskCategorySortOption; label: string }[] = [
  { value: 'type-name', label: 'Type & Name' },
  { value: 'recently-created', label: 'Recently Created' },
  { value: 'points-desc', label: 'Points (High to Low)' },
  { value: 'xp-desc', label: 'XP (High to Low)' },
  { value: 'repeatable-only', label: 'Repeatable Only' },
  { value: 'non-repeatable-only', label: 'Non-Repeatable Only' },
];

export default function TaskEditorPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskCategory | null>(null);
  const [saveError, setSaveError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<TaskCategorySortOption>('type-name');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Debounce search term like current-assigned-tasks (900ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  // Fetch tasks with debounced search and sort
  const { data: paginatedData, isLoading, isError } = useGetTaskCategoriesPaginated(
    page,
    pageSize,
    sortOption,
    debouncedSearchTerm
  );

  const tasks = paginatedData?.tasks || [];
  const totalPages = paginatedData?.totalPages || 1;
  const totalCount = paginatedData?.count || 0;

  // Debug logging
  console.log('Pagination Debug:', {
    page,
    pageSize,
    sortOption,
    debouncedSearchTerm,
    paginatedData,
    tasks: tasks.length,
    totalPages,
    totalCount
  });

  // Fetch all tasks without filters for duplicate checking
  const { data: allTasksData } = useGetTaskCategoriesPaginated(1, 1000, sortOption, '');

  // Mutations
  const addMutation = useAddTaskCategory();
  const editMutation = useEditTaskCategory();
  const deleteMutation = useDeleteTaskCategory();

  // Extract existing names for duplicate checking from ALL tasks
  const existingNames = Array.isArray(allTasksData) 
    ? [] 
    : (allTasksData?.tasks?.map((task: TaskCategory) => task.name) || []);

  const handleOpenAddDialog = () => {
    setEditingTask(null);
    setSaveError('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (task: TaskCategory) => {
    setEditingTask(task);
    setSaveError('');
    setDialogOpen(true);
  };

  const handleSave = async (data: AddTaskInput) => {
    try {
      setSaveError('');

      if (editingTask) {
        // Edit existing task
        await editMutation.mutateAsync({
          id: editingTask.id,
          input: data,
        });
      } else {
        // Add new task
        await addMutation.mutateAsync(data);
      }

      // Close dialog on success
      setDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save task category');
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  const handleDelete = async (taskId: string) => {
    await deleteMutation.mutateAsync(taskId);
  };

  const handleToggleRepeatable = async (taskId: string, isRepeatable: boolean) => {
    await editMutation.mutateAsync({
      id: taskId,
      input: {
        isRepeatable,
      },
    });
  };

  const handleErrorClear = () => {
    setSaveError('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleSortChange = (value: TaskCategorySortOption) => {
    setSortOption(value);
    setPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || 'Type & Name';

  return (
    <main className="w-full min-h-screen bg-zinc-50 p-10">
      <div className="mx-auto min-w-250 max-w-400 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#690003]">Task Editor</h1>
          <p className="text-md text-gray-600">Add, Edit, Delete assignable tasks in this page.</p>
        </div>

        {/* Search, Sort, and Add Button */}
        <div className="flex gap-4 items-center justify-end">
          {/* Search Input */}
          <div className="relative flex">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 rounded-xl text-sm bg-white shadow-sm/50 border border-gray-200 focus:outline-none focus:border-[#690003] transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="default"
                className="bg-[#690003] hover:brightness-100 w-35 cursor-pointer rounded-full text-white shadow-sm/25 flex justify-between transition-all duration-500 ease-in-out"
              >
                <span className="truncate">{currentSortLabel}</span>
                <ArrowUpDown size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`cursor-pointer transition-all duration-300 ease-in-out ${
                    sortOption === option.value ? 'bg-red-100' : ''
                  }`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add New Category Button */}
          <Button
            onClick={handleOpenAddDialog}
            className="px-6 py-2 rounded-full bg-[#690003] hover:brightness-100 text-zinc-50 font-semibold text-sm shadow-sm/25 cursor-pointer transition-all duration-500 ease-in-out shrink-0"
          >
            <ChefHat size={18} />
            <span>Add New Category</span>
            <Plus size={18} className='ml-4'/>
          </Button>
        </div>

        <TaskCategoryTable
          tasks={tasks}
          isLoading={isLoading}
          isError={isError}
          onEdit={handleOpenEditDialog}
          onDelete={handleDelete}
          onToggleRepeatable={handleToggleRepeatable}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="my-6">
            <Pagination 
              totalPages={totalPages} 
              currentPage={page} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}

        <AddEditTaskCategoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingTask={editingTask}
          onSave={handleSave}
          saveError={saveError}
          onErrorClear={handleErrorClear}
          existingNames={existingNames}
        />
      </div>
    </main>
  );
}
