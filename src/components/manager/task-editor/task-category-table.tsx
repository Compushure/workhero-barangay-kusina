'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Coins, Pencil, RefreshCw, RefreshCwOff, Trash2 } from 'lucide-react';
import type { TaskCategory } from '@/types/manager/task-editor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import TaskTableSkeleton from './task-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskCategoryTableProps {
  tasks: TaskCategory[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (task: TaskCategory) => void;
  onDelete: (taskId: string) => void;
  onToggleRepeatable: (taskId: string, isRepeatable: boolean) => void;
}

export default function TaskCategoryTable({
  tasks,
  isLoading,
  isError,
  onEdit,
  onDelete,
  onToggleRepeatable,
}: TaskCategoryTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskCategory | null>(null);

  const handleDeleteClick = (task: TaskCategory) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      onDelete(taskToDelete.id);
    }
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const formatCreatedDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl overflow-x-auto overflow-y-hidden shadow-sm/25 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-background border-b border-border hover:bg-background">
              <TableHead className="min-w-48 max-w-48 w-48 sm:min-w-64 sm:max-w-64 sm:w-64 md:min-w-96 md:max-w-96 md:w-96 pl-3 sm:pl-6 py-3 sm:py-4">
                <Skeleton className="h-4 w-16 bg-gray-300" />
              </TableHead>
              <TableHead className="min-w-16 max-w-16 w-16 sm:min-w-20 sm:max-w-20 sm:w-20 text-center hidden lg:table-cell">
                <Skeleton className="h-4 w-12 mx-auto bg-gray-300" />
              </TableHead>
              <TableHead className="min-w-16 max-w-16 w-16 sm:min-w-20 sm:max-w-20 sm:w-20 text-center hidden lg:table-cell">
                <Skeleton className="h-4 w-8 mx-auto bg-gray-300" />
              </TableHead>
              <TableHead className="min-w-24 max-w-24 w-24 sm:min-w-32 sm:max-w-32 sm:w-32 text-center hidden md:table-cell">
                <Skeleton className="h-4 w-18 mx-auto bg-gray-300" />
              </TableHead>
              <TableHead className="min-w-24 max-w-24 w-24 sm:min-w-36 sm:max-w-36 sm:w-36 text-center sticky right-0">
                <Skeleton className="h-4 w-14 mx-auto bg-gray-300" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TaskTableSkeleton />
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl overflow-x-auto overflow-y-hidden shadow-sm/25 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary-gradient">
              <TableHead className="min-w-40 max-w-40 w-40 sm:min-w-56 sm:max-w-56 sm:w-56 md:min-w-80 md:max-w-80 md:w-80 pl-3 sm:pl-5 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-card">
                TASK
              </TableHead>
              <TableHead className="min-w-14 max-w-14 w-14 sm:min-w-16 sm:max-w-16 sm:w-16 text-center text-[10px] sm:text-xs font-bold text-card hidden lg:table-cell">
                POINTS
              </TableHead>
              <TableHead className="min-w-14 max-w-14 w-14 sm:min-w-16 sm:max-w-16 sm:w-16 text-center text-[10px] sm:text-xs font-bold text-card hidden lg:table-cell">
                XP
              </TableHead>
              <TableHead className="min-w-20 max-w-20 w-20 sm:min-w-28 sm:max-w-28 sm:w-28 text-center text-[10px] sm:text-xs font-bold text-card hidden md:table-cell">
                REPEATABLE
              </TableHead>
              <TableHead className="min-w-20 max-w-20 w-20 sm:min-w-32 sm:max-w-32 sm:w-32 text-center text-[10px] sm:text-xs font-bold text-card sticky right-0">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <>
              {tasks.map((task) => (
                <TableRow key={task.id} className="bg-card hover:bg-row-hover transition-colors">
                  <TableCell className="min-w-40 max-w-40 w-40 sm:min-w-56 sm:max-w-56 sm:w-56 md:min-w-80 md:max-w-80 md:w-80 pl-3 sm:pl-5 py-2 sm:py-3 align-middle">
                    <div className="truncate space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                        {task.name}
                      </div>
                      <div className="text-[10px] sm:text-xs text-secondary truncate">
                        {task.description}
                      </div>
                      <div className="text-[10px] sm:text-xs text-primary font-medium px-1 sm:px-1.5 rounded-full bg-accent/15 w-fit mt-2.5 truncate">
                        {task.type}
                      </div>
                      <div className="text-[10px] sm:text-xs text-secondary mt-2 truncate">
                        <span className="font-semibold">Created:</span>{' '}
                        {formatCreatedDate(task.createdAt)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-14 max-w-14 w-14 sm:min-w-16 sm:max-w-16 sm:w-16 text-xs sm:text-sm text-center align-middle font-medium text-foreground hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-0.5">
                      <Coins strokeWidth={1.75} className="size-4 sm:size-5" />
                      {task.points}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-14 max-w-14 w-14 sm:min-w-16 sm:max-w-16 sm:w-16 text-xs sm:text-sm text-center align-middle font-medium text-foreground hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                      <span className="inline-block italic text-xs sm:text-sm leading-none">
                        XP
                      </span>
                      {task.xp}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-20 max-w-20 w-20 sm:min-w-28 sm:max-w-28 sm:w-28 text-center align-middle text-xs sm:text-sm hidden md:table-cell">
                    <div className="flex justify-center items-center">
                      {task.isRepeatable ? (
                        <div className="flex items-center gap-0.5 text-foreground font-medium">
                          <RefreshCw size={14} className="sm:size-4 text-accent" />
                          <span className="text-[10px] sm:text-sm">Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5 sm:gap-1 text-secondary">
                          <RefreshCwOff size={14} className="sm:size-4" />
                          <span className="text-[10px] sm:text-sm">No</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-20 max-w-20 w-20 sm:min-w-32 sm:max-w-32 sm:w-32 text-center align-middle sticky right-0">
                    <div className="flex justify-center items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(task)}
                        className="size-7 sm:size-9 cursor-pointer hover:bg-card hover:text-foreground border hover:border-accent/50 transition-colors"
                        title="Edit task"
                      >
                        <Pencil className="size-3 sm:size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(task)}
                        className="size-7 sm:size-9 cursor-pointer hover:bg-card hover:text-red-600 border hover:border-accent/50 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="size-3 sm:size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </>
          </TableBody>
        </Table>

        {isError && (
          <div className="bg-background p-6 text-center">
            <div className="text-4xl mb-3">🙊</div>
            <p className="text-secondary text-lg">Woops! Kitchen Issue</p>
            <p className="text-muted-foreground text-xs mt-1.5">
              Something wrong happened. Try again
            </p>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="bg-background p-6 text-center">
            <div className="text-4xl mb-3">🥣</div>
            <p className="text-secondary text-lg">No task categories found</p>
            <p className="text-muted-foreground text-xs mt-1.5">
              Click "Add New Category" to create one
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg bg-card p-4 sm:p-5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground text-base">Delete Task Category?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete "{taskToDelete?.name}"? This action cannot be undone
              and will remove this task category from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-700 hover:bg-red-500 text-white cursor-pointer transition-all duration-400 ease-in-out"
            >
              Confirm
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setTaskToDelete(null)}
              className="border-zinc-400 !bg-card !text-foreground hover:!bg-[#fafafa] hover:!text-foreground hover:brightness-90 cursor-pointer transition-all duration-400 ease-in-out"
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
