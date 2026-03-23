'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  ChefHat,
  ClockArrowDown,
  ClockArrowUp,
  Coins,
  ListTodo,
  type LucideIcon,
  Plus,
  Search,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Pagination } from '@/components/shared/pagination';
import type { TaskCategory } from '@/types/manager/task-editor';
import type { AddTaskInput } from '@/zod/schemas/task';
import { TaskEditorHeaderSkeleton } from './task-editor-header-skeleton';
import {
  TaskRepeatabilityFilterToggle,
  type TaskRepeatabilityFilter,
} from './task-repeatability-filter-toggle';
import { sanitizeSearchInput } from '@/lib/utils/search-normalization';
import { PageHeader } from '@/components/shared/page-header';

const DATE_SORT_OPTIONS: { value: TaskCategorySortOption; label: string; icon: LucideIcon }[] = [
  { value: 'recently-created', label: 'Recently Created', icon: ClockArrowDown },
  { value: 'oldest-created', label: 'Oldest Created', icon: ClockArrowUp },
];

const NAME_SORT_OPTIONS: { value: TaskCategorySortOption; label: string; icon: LucideIcon }[] = [
  { value: 'name-asc', label: 'Name (A-Z)', icon: ArrowDownAZ },
  { value: 'name-desc', label: 'Name (Z-A)', icon: ArrowUpAZ },
];

const REWARD_SORT_OPTIONS: { value: TaskCategorySortOption; label: string; icon: LucideIcon }[] = [
  { value: 'points-desc', label: 'Points (High to Low)', icon: Coins },
  { value: 'points-asc', label: 'Points (Low to High)', icon: Coins },
  { value: 'xp-desc', label: 'XP (High to Low)', icon: Trophy },
  { value: 'xp-asc', label: 'XP (Low to High)', icon: Trophy },
];

const SORT_OPTIONS = [...DATE_SORT_OPTIONS, ...NAME_SORT_OPTIONS, ...REWARD_SORT_OPTIONS];

export default function TaskEditorPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskCategory | null>(null);
  const [saveError, setSaveError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<TaskCategorySortOption>('recently-created');
  const [repeatabilityFilter, setRepeatabilityFilter] = useState<TaskRepeatabilityFilter>('all');
  const [page, setPage] = useState(1);
  const [hasLoadedHeaderOnce, setHasLoadedHeaderOnce] = useState(false);
  const pageSize = 10;

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  useEffect(() => {
    if (paginatedData) {
      setHasLoadedHeaderOnce(true);
    }
  }, [paginatedData]);

  const showHeaderSkeleton = !hasLoadedHeaderOnce && isLoading;

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
    SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || 'Recently Created';

  return (
    <main className="w-full min-h-screen px-2 py-3 sm:px-3 sm:py-4 lg:px-6 lg:py-6">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-440 space-y-3 sm:space-y-4 lg:space-y-5">
        {showHeaderSkeleton ? (
          <TaskEditorHeaderSkeleton />
        ) : (
          <>
            <PageHeader
              title="Task Editor"
              subtitle="Add, Edit, Delete assignable tasks in this page."
            />

            {/* Search, Sort, and Add Button - Always visible, stacked on mobile */}
            <section className="manager-sticky-controls rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 flex min-w-0 flex-col gap-3 sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* Category Count Display */}
              <div className="flex shrink-0 self-start xl:self-center gap-2 whitespace-nowrap pl-0.5 text-h2 text-foreground sm:gap-3 sm:pl-1">
                <h5 className="flex items-center gap-1.5">
                  <ListTodo size={16} className="text-accent" />
                  Categories{' '}
                  <span className="bg-accent/75 text-primary-foreground px-2 py-0.5 rounded-md text-[13px] ml-1 shadow-sm/25">
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
                    className="text-meta control-h w-full min-w-0 rounded-md border border-zinc-200 bg-card pr-3 pl-9 shadow-sm/25 transition-colors focus:border-accent focus:outline-none"
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
                          className="text-button control-h bg-card text-foreground shadow-sm/25 hover:bg-card hover:text-foreground hover:brightness-90 transition-all duration-400 ease-in-out cursor-pointer w-full sm:w-44 justify-between px-2 sm:px-3"
                        >
                          <span className="truncate">{currentSortLabel}</span>
                          <ArrowUpDown size={14} className="text-accent" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="manager-dropdown-content w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
                      >
                        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                          Sort by Date
                        </DropdownMenuLabel>
                        {DATE_SORT_OPTIONS.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                              sortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                            }`}
                          >
                            <option.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                          Sort by Name
                        </DropdownMenuLabel>
                        {NAME_SORT_OPTIONS.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                              sortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                            }`}
                          >
                            <option.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                          Sort by Rewards
                        </DropdownMenuLabel>
                        {REWARD_SORT_OPTIONS.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`manager-dropdown-item text-meta cursor-pointer transition-all duration-300 ease-in-out ${
                              sortOption === option.value ? 'bg-accent/15 text-foreground' : ''
                            }`}
                          >
                            <option.icon className="mr-2.5 size-3.5 shrink-0 text-accent" />
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Add New Category Button */}
                    <Button
                      onClick={handleOpenAddDialog}
                      className="text-button control-h w-full justify-center rounded-md bg-primary-gradient px-3 py-1.5 whitespace-nowrap text-card shadow-sm/25 transition-all duration-500 ease-in-out cursor-pointer hover:bg-primary-gradient hover:brightness-85 sm:w-auto sm:px-4"
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
