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
import {
  TaskRepeatabilityFilterToggle,
  type TaskRepeatabilityFilter,
} from './task-repeatability-filter-toggle';
import { sanitizeSearchInput } from '@/lib/utils/search-normalization';
import { PageHeader } from '../task-verification/page-header';

const SORT_OPTIONS: { value: TaskCategorySortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'recently-created', label: 'Recently Created' },
  { value: 'points-desc', label: 'Points (High to Low)' },
  { value: 'xp-desc', label: 'XP (High to Low)' },
];

export default function TaskEditorPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskCategory | null>(null);
  const [saveError, setSaveError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<TaskCategorySortOption>('name-asc');
  const [repeatabilityFilter, setRepeatabilityFilter] = useState<TaskRepeatabilityFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Debounce search term like current-assigned-tasks (900ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  // Fetch tasks with debounced search and sort
  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useGetTaskCategoriesPaginated(
    page,
    pageSize,
    sortOption,
    debouncedSearchTerm,
    repeatabilityFilter
  );

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
    setSearchTerm(sanitizeSearchInput(e.target.value));
    setPage(1); // Reset to first page when searching
  };

  const handleSortChange = (value: TaskCategorySortOption) => {
    setSortOption(value);
    setPage(1); // Reset to first page when sorting
  };

  const handleRepeatabilityFilterChange = (value: TaskRepeatabilityFilter) => {
    setRepeatabilityFilter(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || 'Name (A-Z)';

  return (
    <main className="w-full min-h-screen bg-zinc-100 px-2 py-3 sm:px-3 sm:py-4 lg:px-6 lg:py-6">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-440 space-y-3 sm:space-y-4 lg:space-y-5">
        {isLoading ? (
          <TaskEditorHeaderSkeleton />
        ) : (
          <>
            <PageHeader
              title="Task Editor"
              subtitle="Add, Edit, Delete assignable tasks in this page."
            />

            {/* Search, Sort, and Add Button - Always visible, stacked on mobile */}
            <section className="flex min-w-0 flex-col gap-3 sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* Category Count Display */}
              <div className="flex shrink-0 self-start gap-2 whitespace-nowrap pl-0.5 text-sm font-bold text-foreground sm:gap-3 sm:pl-1 sm:text-base">
                <h5 className="flex items-center gap-1.5">
                  <ListTodo size={16} className="text-accent" />
                  Categories{' '}
                  <span className="bg-accent/75 text-primary-foreground px-2 py-0.5 rounded-full text-xs ml-1 shadow-sm/25">
                    {totalCount ?? 0}
                  </span>
                </h5>
              </div>

              {/* Search, Sort, and Add Button */}
              <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:gap-3 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
                {/* Search Input */}
                <div className="relative min-w-0 flex-1 xl:max-w-md">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 size-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assignable task"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full min-w-0 rounded-full bg-card py-2 pr-3 pl-9 text-xs shadow-sm/25 transition-colors focus:border focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex min-w-0 flex-wrap gap-2 sm:gap-3 xl:flex-nowrap xl:justify-end">
                  <div className="shrink-0">
                    <TaskRepeatabilityFilterToggle
                      value={repeatabilityFilter}
                      onChange={handleRepeatabilityFilterChange}
                    />
                  </div>

                  {/* Sort and Add Button Row */}
                  <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap">
                    {/* Sort Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="default"
                          size="default"
                          className="h-8 w-full justify-between border border-gray-200 bg-card py-1.5 text-xs text-primary shadow-md shadow-sm/25 transition-all duration-200 ease-in-out cursor-pointer hover:bg-gray-200 sm:w-40"
                        >
                          <span className="truncate">{currentSortLabel}</span>
                          <ArrowUpDown size={14} className="text-accent" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background w-48">
                        {SORT_OPTIONS.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`cursor-pointer transition-all duration-300 ease-in-out text-xs ${
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
                      className="h-8 w-full justify-center rounded-full bg-primary-gradient px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-card shadow-sm/25 transition-all duration-500 ease-in-out cursor-pointer hover:bg-primary-gradient hover:brightness-85 sm:w-auto sm:px-4"
                    >
                      <ChefHat size={14} />
                      <span>Add New Category</span>
                      <Plus size={14} className="ml-1 sm:ml-3" />
                    </Button>
                  </div>
                </div>
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
          <div className="my-4">
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
