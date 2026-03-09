'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, ArrowUpDown, ChefHat, ListTodo } from 'lucide-react';
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
  useGetTaskCategoryMetadata,
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
import { TaskEditorHeaderSkeleton } from './task-editor-header-skeleton';

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
  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useGetTaskCategoriesPaginated(page, pageSize, sortOption, debouncedSearchTerm);

  const tasks = paginatedData?.tasks || [];
  const totalPages = paginatedData?.totalPages || 1;
  const totalCount = paginatedData?.count || 0;

  // Fetch names/types only when dialog opens to keep initial page load fast.
  const { data: taskCategoryMeta } = useGetTaskCategoryMetadata({
    enabled: dialogOpen,
  });

  // Mutations
  const addMutation = useAddTaskCategory();
  const editMutation = useEditTaskCategory();
  const deleteMutation = useDeleteTaskCategory();

  // Extract existing names/types for duplicate checks only when dialog is used.
  const existingNames = useMemo(() => taskCategoryMeta?.names ?? [], [taskCategoryMeta?.names]);

  const existingTypes = useMemo(() => taskCategoryMeta?.types ?? [], [taskCategoryMeta?.types]);

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
    <main className="w-full min-h-screen bg-zinc-100 px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-440 space-y-5 sm:space-y-6 lg:space-y-8">
        {isLoading ? (
          <TaskEditorHeaderSkeleton />
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Task Editor</h1>
              <p className="text-sm sm:text-base lg:text-lg text-secondary">Add, Edit, Delete assignable tasks in this page.</p>
            </div>

            {/* Task Categories Count Display */}
            <section className="flex gap-3 sm:gap-4 text-base sm:text-lg font-bold text-foreground pl-1 sm:pl-2">
          <h5 className="flex items-center gap-2">
            <ListTodo size={20} className="text-accent" />
            Categories{' '}
            <span className="bg-accent/75 text-primary-foreground px-2.5 py-0.5 rounded-full text-sm ml-1 shadow-sm/25">
              {totalCount ?? 0}
            </span>
          </h5>
        </section>

        {/* Search, Sort, and Add Button - Always visible, stacked on mobile */}
        <section className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-start sm:justify-end">
          {/* Search Input */}
          <div className="relative flex w-full sm:w-auto sm:min-w-50">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-card shadow-sm/25 focus:outline-none focus:border focus:border-accent transition-colors"
            />
          </div>

          {/* Sort and Add Button Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="default"
                  className="bg-card shadow-sm/25 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer text-primary shadow-md w-full sm:w-48 py-2 justify-between border border-gray-200"
                >
                  <span className="truncate">{currentSortLabel}</span>
                  <ArrowUpDown size={18} className='text-accent'/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background w-56">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`cursor-pointer transition-all duration-300 ease-in-out ${
                      sortOption === option.value ? 'bg-accent/15' : ''
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
              className="bg-primary-gradient hover:bg-primary-gradient hover:brightness-85 text-card cursor-pointer transition-all duration-500 ease-in-out w-full sm:w-auto px-4 sm:px-6 py-2 rounded-full shadow-sm/25 font-semibold text-sm whitespace-nowrap justify-center"
            >
              <ChefHat size={18} />
              <span className="hidden sm:inline">Add New Category</span>
              <span className="sm:hidden">Add New Category</span>
              <Plus size={18} className="ml-1 sm:ml-4" />
            </Button>
          </div>
        </section>
          </>
        )}

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
          existingTypes={existingTypes}
        />
      </div>
    </main>
  );
}
